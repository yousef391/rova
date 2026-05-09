import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Fetch Yalidine API Credentials
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('yalidine_api_id, yalidine_api_token')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.yalidine_api_id || !settings?.yalidine_api_token) {
      return NextResponse.json({ error: 'Yalidine API credentials not configured in settings.' }, { status: 403 });
    }

    // Build the URL for the Yalidine API — forward all supported query params
    const url = new URL('https://api.yalidine.app/v1/parcels/');

    const forwardParams = [
      'page', 'page_size', 'tracking', 'order_id', 'import_id',
      'to_wilaya_id', 'to_commune_name', 'is_stopdesk', 'is_exchange',
      'has_exchange', 'freeshipping', 'date_creation', 'date_last_status',
      'payment_status', 'last_status', 'fields', 'order_by',
    ];

    for (const param of forwardParams) {
      const value = searchParams.get(param);
      if (value) url.searchParams.append(param, value);
    }

    // asc and desc are value-less flags
    if (searchParams.has('asc')) url.searchParams.append('asc', '');
    if (searchParams.has('desc')) url.searchParams.append('desc', '');

    // Fetch from Yalidine
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-ID': settings.yalidine_api_id,
        'X-API-TOKEN': settings.yalidine_api_token,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Yalidine API Error: ${response.statusText}`, details: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();

    // ── Enrich parcels with real (unmasked) client data from local orders ──
    // Yalidine masks firstname, familyname, contact_phone, address in GET responses.
    // Our local orders table stores the original unmasked data + the tracking_id.
    if (data.data && data.data.length > 0) {
      const trackingIds = data.data.map((p: { tracking: string }) => p.tracking);

      const { data: localOrders } = await supabase
        .from('orders')
        .select('tracking_id, name, phone, wilaya, commune')
        .in('tracking_id', trackingIds);

      if (localOrders && localOrders.length > 0) {
        const orderMap = new Map(localOrders.map((o: { tracking_id: string; name: string; phone: string; wilaya: string; commune: string }) => [o.tracking_id, o]));

        for (const parcel of data.data) {
          const local = orderMap.get(parcel.tracking);
          if (local) {
            // Parse name into first/family (same logic used when creating the parcel)
            const nameParts = (local.name || '').trim().split(' ');
            parcel.firstname = nameParts[0] || parcel.firstname;
            parcel.familyname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : parcel.familyname;
            parcel.contact_phone = local.phone || parcel.contact_phone;
          }
        }
      }
    }

    return NextResponse.json(data);

  } catch (err: unknown) {
    console.error('Yalidine Parcels Route Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

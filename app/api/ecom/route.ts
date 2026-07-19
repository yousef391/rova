import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { orderId, overrides } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch the Order from Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.tracking_id && !overrides?.forceRetry) {
      return NextResponse.json({ error: 'Order already has a tracking ID', tracking_id: order.tracking_id }, { status: 400 });
    }

    // 2. Fetch Ecom API Credentials from store_settings
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('ecom_api_key, ecom_api_token, ecom_api_url')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.ecom_api_key || !settings?.ecom_api_token) {
      return NextResponse.json({ error: 'Ecom API credentials not configured in settings.' }, { status: 403 });
    }

    // 3. Format Data for Ecom
    const finalName = overrides?.name || order.name;
    const finalPhone = overrides?.phone || order.phone;
    const finalWilaya = overrides?.wilaya || order.wilaya; // Needs to be the ID as a string e.g., "12"
    const finalCommune = overrides?.commune || order.commune;
    const finalAddress = overrides?.address || order.commune || 'Adresse non spécifiée';
    
    // Parse price
    let priceNumber = 0;
    if (overrides?.price !== undefined) {
      priceNumber = overrides.price;
    } else {
      priceNumber = parseInt(order.total.replace(/[^\d]/g, ''), 10) || 0;
    }

    // Extract Wilaya ID (Assuming string format "12" or "12 - Tebessa")
    let wilayaId = "16"; // Default
    const wilayaIdMatch = finalWilaya.match(/^(\d+)/);
    if (wilayaIdMatch) {
      wilayaId = wilayaIdMatch[1];
    }

    const referenceId = order.order_number ? order.order_number.toString() : order.id.toString();

    const ecomPayload = {
      Colis: [
        {
          Echange: overrides?.has_exchange ? 1 : 0,
          Stopdesk: overrides?.is_stopdesk ? 1 : 0,
          CodeStopdesk: overrides?.is_stopdesk ? (overrides?.stopdesk_id || "") : "",
          NomComplet: finalName,
          Mobile_1: finalPhone,
          Mobile_2: "",
          Adresse: finalAddress,
          Wilaya: wilayaId,
          Commune: finalCommune,
          Article: overrides?.product_list || `${order.item} - ${order.color} - ${order.size}`,
          Ref_Article: order.item || "",
          NoteFournisseur: overrides?.note || "",
          Total: priceNumber.toString(),
          ID_Externe: referenceId,
          Source: "Dashboard"
        }
      ]
    };

    // 4. Send Request to Ecom API
    const baseUrl = settings?.ecom_api_url || 'https://api.ecom.dz/Api_v1/Colis';
    
    const ecomResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Key': settings.ecom_api_key,
        'Token': settings.ecom_api_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ecomPayload)
    });

    const ecomData = await ecomResponse.json();

    // 5. Parse Ecom Response
    // Expecting response with "Colis" array
    if (!ecomData || !ecomData.Colis || ecomData.Colis.length === 0) {
      console.error("Ecom Creation Failed:", ecomData);
      return NextResponse.json({ error: 'Failed to create parcel in Ecom' }, { status: 400 });
    }

    const result = ecomData.Colis[0];

    // Check if the Ecom API returned an error string in the Tracking field or similar (adjust based on Ecom's exact error format)
    if (!result.Tracking) {
       console.error("Ecom Creation Failed, no tracking:", result);
       return NextResponse.json({ error: 'Failed to create parcel in Ecom, no tracking returned' }, { status: 400 });
    }

    // 6. Success! Save tracking_id to our Database
    const trackingId = result.Tracking;
    
    await supabase
      .from('orders')
      .update({ tracking_id: trackingId })
      .eq('id', order.id);

    return NextResponse.json({ success: true, tracking_id: trackingId, label: result.label });

  } catch (err: unknown) {
    console.error("Ecom Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

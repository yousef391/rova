import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract optional query parameters
    const page = searchParams.get('page');
    const page_size = searchParams.get('page_size');
    const tracking = searchParams.get('tracking');
    const status = searchParams.get('status');

    // Fetch Yalidine API Credentials
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('yalidine_api_id, yalidine_api_token')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.yalidine_api_id || !settings?.yalidine_api_token) {
      return NextResponse.json({ error: 'Yalidine API credentials not configured in settings.' }, { status: 403 });
    }

    // Build the URL for the Yalidine API
    const url = new URL('https://api.yalidine.app/v1/histories/');
    if (page) url.searchParams.append('page', page);
    if (page_size) url.searchParams.append('page_size', page_size);
    if (tracking) url.searchParams.append('tracking', tracking);
    if (status) url.searchParams.append('status', status);

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
      return NextResponse.json({ error: `Yalidine API Error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (err: unknown) {
    console.error("Yalidine Histories Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

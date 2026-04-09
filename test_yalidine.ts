import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getWilayas() {
  const { data } = await supabase.from('store_settings').select('yalidine_api_id, yalidine_api_token').eq('id', 1).single();
  const res = await fetch("https://api.yalidine.app/v1/wilayas/?page_size=60", {
    headers: {
      "X-API-ID": data.yalidine_api_id,
      "X-API-TOKEN": data.yalidine_api_token
    }
  });
  const json = await res.json();
  const map: Record<number, string> = {};
  if (json.data) {
    json.data.forEach((w: any) => { map[w.id] = w.name; });
    console.log(JSON.stringify(map, null, 2));
  } else {
    console.log("Error fetching:", json);
  }
}
getWilayas();

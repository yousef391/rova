const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFees() {
  const { data } = await supabase.from('store_settings').select('yalidine_api_id, yalidine_api_token').eq('id', 1).single();
  const headers = { "X-API-ID": data.yalidine_api_id, "X-API-TOKEN": data.yalidine_api_token };

  const testUrls = [
    "https://api.yalidine.app/v1/fees/?from_wilaya_id=31&to_wilaya_id=16",
    "https://api.yalidine.app/v1/fees/?wilaya_id=16",
    "https://api.yalidine.app/v1/fees/?wilaya_id=31"
  ];

  for (let url of testUrls) {
    console.log("Testing:", url);
    const res = await fetch(url, { headers });
    const json = await res.json();
    console.log("Result keys:", Object.keys(json));
    if (json.data && json.data.length > 0) {
      console.log("Data sample:", json.data[0]);
    } else if (json.error) {
      console.log("Error:", json.error.message);
    }
  }
}
testFees();

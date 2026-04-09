const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('store_settings').select('yalidine_api_id, yalidine_api_token').eq('id', 1).single();
  const headers = {
    "X-API-ID": data.yalidine_api_id,
    "X-API-TOKEN": data.yalidine_api_token
  };

  // 1. Fetch Wilayas
  let wilayasRes = await fetch("https://api.yalidine.app/v1/wilayas/?page_size=60", { headers });
  let wilayasData = await wilayasRes.json();
  let wilayas = wilayasData.data || [];
  console.log("Wilayas count:", wilayas.length);

  // 2. Fetch Communes (Paginate up to total)
  let allCommunes = [];
  for (let page = 1; page <= 2; page++) {
    let commRes = await fetch(`https://api.yalidine.app/v1/communes/?page=${page}&page_size=1000`, { headers });
    let commData = await commRes.json();
    if (commData.data) {
      allCommunes = allCommunes.concat(commData.data);
    }
  }
  console.log("Communes count:", allCommunes.length);
  
  // 3. Fetch Fees
  // 3. Fetch Fees from the new endpoint
  // Need to provide proper params: from_wilaya_id=31, weight=1
  // Let's just fetch for one wilaya to see exactly how it looks
  let testWilayaUrl = "https://api.yalidine.app/v1/fees/?wilaya_id=16&weight=1&is_stopdesk=0";
  let feesRes = await fetch(testWilayaUrl, { headers });
  let feesDataRaw = await feesRes.json();
  console.log("Fees result for Oran->Alger:", JSON.stringify(feesDataRaw, null, 2));

  // Write to a local static bundle file if fees are working
  const payload = {
    wilayas: wilayas,
    communes: allCommunes
  };
  fs.writeFileSync('data/yalidine_meta.json', JSON.stringify(payload, null, 2));
  console.log("Written to data/yalidine_meta.json");

}

run().catch(console.error);

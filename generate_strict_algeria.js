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

  console.log("Fetching Wilayas...");
  let wilayasRes = await fetch("https://api.yalidine.app/v1/wilayas/?page_size=60", { headers });
  let wilayas = (await wilayasRes.json()).data || [];

  console.log("Fetching Communes...");
  let communes = [];
  for (let page = 1; page <= 2; page++) {
    let commRes = await fetch(`https://api.yalidine.app/v1/communes/?page=${page}&page_size=1000`, { headers });
    let commData = await commRes.json();
    if (commData.data) communes = communes.concat(commData.data);
  }

  console.log("Fetching Fees for all wilayas...");
  // Get prices from Oran (Wilaya 31) to all others
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (let w of wilayas) {
    let price = 800; // default fallback
    try {
      let feeRes = await fetch(`https://api.yalidine.app/v1/fees/?from_wilaya_id=31&to_wilaya_id=${w.id}`, { headers });
      if (feeRes.ok) {
         let feeData = await feeRes.json();
         if (feeData.data && feeData.data.length > 0) {
            let pc = feeData.data[0].per_commune;
            let firstCommuneKey = Object.keys(pc)[0];
            let expressHome = pc[firstCommuneKey].express_home;
            if (expressHome) price = expressHome;
         }
      }
    } catch (e) {
      console.log(`Failed for Wilaya ${w.id}: ${e.message}`);
    }

    // User requested: Remove 200 DA from standard price
    w.delivery_fee = Math.max(0, price - 200);
    console.log(`Wilaya ${w.id} ${w.name}: fee=${w.delivery_fee}`);
    await sleep(400); // Prevent rate limiting
  }

  const payload = {
    wilayas: wilayas.map(w => ({
      wilaya_id: w.id.toString(),
      wilaya_name_latin: w.name,
      delivery_fee: w.delivery_fee
    })),
    communes: communes.map(c => ({
      commune_id: c.id,
      wilaya_id: c.wilaya_id.toString(),
      commune_name_latin: c.name
    }))
  };

  fs.writeFileSync('data/algeria_yalidine.json', JSON.stringify(payload));
  console.log("Generated data/algeria_yalidine.json successfully!");
}

run().catch(console.error);

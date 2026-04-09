const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function testDelete() {
  console.log("Attempting to delete order...");
  const { data, error } = await supabase.from('orders').delete().eq('id', '47a1ba14-ae29-40a9-aeec-bd58ffa72425');
  if (error) {
    console.error("DELETE FAILED:", error);
  } else {
    console.log("DELETE SUCCESS:", data);
  }
}

testDelete();

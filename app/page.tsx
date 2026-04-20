import JacketShowcase from "@/components/JacketShowcase";
import SizeGuide from "@/components/SizeGuide";
import { supabase } from "@/lib/supabase";

// Cache the homepage at the edge for 1 hour (3600 seconds)
// or until manually revalidated via the dashboard settings save.
export const revalidate = 3600;

export default async function Home() {
  // Fetch prices securely on the server (0 client-side fetches)
  const { data } = await supabase
    .from('store_settings')
    .select('single_price, bundle_price, zone_0_price, zone_1_price, zone_2_price, zone_3_price, zone_4_price, zone_5_price')
    .eq('id', 1)
    .single();

  const initialSinglePrice = data?.single_price ?? 5400;
  const initialBundlePrice = data?.bundle_price ?? 8200;
  const initialZonePrices = {
    0: data?.zone_0_price ?? 590,
    1: data?.zone_1_price ?? 700,
    2: data?.zone_2_price ?? 900,
    3: data?.zone_3_price ?? 950,
    4: data?.zone_4_price ?? 1050,
    5: data?.zone_5_price ?? 1600,
  };

  return (
    <main className="min-h-screen">
      <JacketShowcase 
        initialSinglePrice={initialSinglePrice} 
        initialBundlePrice={initialBundlePrice} 
        initialZonePrices={initialZonePrices} 
      />
      <SizeGuide />
    </main>
  );
}

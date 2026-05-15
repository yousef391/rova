import LinShowcase from "@/components/LinShowcase";
import LinSizeGuide from "@/components/LinSizeGuide";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "Ensemble Lin Premium — NOVA",
  description: "Ensemble en lin naturel, coupe décontractée et élégante. Livraison 58 wilayas.",
};

export default async function EnsembleLinPage() {
  const { data } = await supabase
    .from('store_settings')
    .select('zone_0_price, zone_1_price, zone_2_price, zone_3_price, zone_4_price, zone_5_price')
    .eq('id', 1)
    .single();

  // Hardcoded prices for Ensemble Lin product
  const initialSinglePrice = 4800;
  const initialBundlePrice = 8600;
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
      <LinShowcase
        initialSinglePrice={initialSinglePrice}
        initialBundlePrice={initialBundlePrice}
        initialZonePrices={initialZonePrices}
      />
      <LinSizeGuide />
    </main>
  );
}

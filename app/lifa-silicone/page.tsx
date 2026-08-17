import SiliconeLoofahShowcase from "@/components/SiliconeLoofahShowcase";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "حزام ليفة السيليكون المزدوجة — وداعاً للجلد الميت والبكتيريا",
  description: "ليفة السيليكون الطبي المزدوجة للتقشير والتدليك. تصل لكامل الظهر والجسم بسهولة، مضادة للبكتيريا ومريحة جداً. توصيل متوفر لجميع 58 ولاية والدفع عند الاستلام.",
};

export default async function LifaSiliconePage() {
  const { data } = await supabase
    .from('store_settings')
    .select('zone_0_price, zone_1_price, zone_2_price, zone_3_price, zone_4_price, zone_5_price')
    .eq('id', 1)
    .single();

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
      <SiliconeLoofahShowcase initialZonePrices={initialZonePrices} />
    </main>
  );
}

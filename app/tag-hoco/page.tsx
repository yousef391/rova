import HocoTagShowcase from "@/components/HocoTagShowcase";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "HOCO E101 — جهاز التتبع الذكي وحماية الممتلكات من السرقة",
  description: "جهاز التتبع الذكي HOCO E101 لحماية الموتور، السيارة، المفاتيح والحقائب. متوافق مع هواتف iPhone (Apple Find My) و Android (Google Find Hub). بدون اشتراك شهري. توصيل 58 ولاية والدفع عند الاستلام.",
};

export default async function HocoTagPage() {
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
      <HocoTagShowcase initialZonePrices={initialZonePrices} />
    </main>
  );
}

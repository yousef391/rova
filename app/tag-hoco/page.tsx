import Script from "next/script";
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
      <Script
        id="airtag-dedicated-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1031581459671396');
            fbq('trackSingle', '1031581459671396', 'PageView');
          `,
        }}
      />
      <HocoTagShowcase initialZonePrices={initialZonePrices} />
    </main>
  );
}

import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "NOVA — Premium Streetwear",
  description:
    "Elevate your everyday with premium streetwear and tech-focused utility apparel. Lookbook and shop.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch dynamic settings from Supabase database
  let pixelId = "000000000000";
  try {
    const { data } = await supabase.from('store_settings').select('fb_pixel_id').eq('id', 1).single();
    if (data?.fb_pixel_id) pixelId = data.fb_pixel_id;
  } catch (err) {
    console.error("Error fetching FB Pixel from DB", err);
  }

  return (
    <html lang="en">
      <head>
        <Script
          id="fb-pixel"
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
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${dmSans.variable} antialiased`}>
        {children}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      </body>
    </html>
  );
}

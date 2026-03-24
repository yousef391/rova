import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || "000000000000"}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${dmSans.variable} antialiased`}>
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || '000000000000'}&ev=PageView&noscript=1`}
          />
        </noscript>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const META_PIXEL_ID = "4342291746023127";
const GA_ID = "G-1B7CCZ2YYK";

export const metadata: Metadata = {
  metadataBase: new URL("https://preceptorstudio.com"),
  title: {
    default: "PRECEPTOR! Venture Studio",
    template: "%s · PRECEPTOR!",
  },
  description:
    "Venture Studio brasileiro que constrói produtos digitais e soluções de IA com engenharia humana, em camadas. Faça o diagnóstico técnico e empreendedor grátis.",
  applicationName: "PRECEPTOR! Studio",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06122A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-ink">
        {/* Google Analytics (gtag.js). Carrega afterInteractive em todas as páginas. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        {/* Meta Pixel (Facebook Ads). Carrega afterInteractive em todas as páginas. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

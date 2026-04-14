import type { Metadata } from "next";
import "./globals.css";
import TrackingProvider from "@/providers/TrackingProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "🔴 LIVE",
  description: "Deutscher Arzt enthüllt unterdrücktes japanisches Rezept",
  robots: "noindex, nofollow", // Padrão de VSL pra não indexar
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        {/* UTMify - O script base precisa puxar a raiz da pasta public/js/latest.js copiados */}
        <Script 
          src="/js/latest.js" 
          data-utmify-prevent-xcod-sck="" 
          data-utmify-prevent-subids="" 
          strategy="beforeInteractive" 
        />
        
        {/* TikTok Pixel fornecido injetado exatamente segundo instruções da UTMify */}
        {process.env.NEXT_PUBLIC_UTMIFY_TIKTOK_PIXEL_ID && (
          <Script id="tiktok-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              window.tikTokPixelId = "${process.env.NEXT_PUBLIC_UTMIFY_TIKTOK_PIXEL_ID}";
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel-tiktok.js");
              document.head.appendChild(a);
            `
          }} />
        )}

        {/* Meta Pixel Code herdado do index.html para Tracking Provider */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `
          }} />
        )}

        {/* Script nativo de liberação do botão no timer da VSL */}
        <Script src="/js/gate.js" strategy="lazyOnload" />

        {/* Preloads e Prefetchs da VTurb EXATAMENTE como no HTML original */}
        <link rel="preload" href="https://scripts.converteai.net/5d6139f7-fda9-420e-9424-606d8d603214/players/69c5a58194d36cec11723824/v4/player.js" as="script" />
        <link rel="preload" href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" as="script" />
        <link rel="preload" href="https://cdn.converteai.net/5d6139f7-fda9-420e-9424-606d8d603214/69c5a3fd6983e3eba6d2ce16/main.m3u8" as="fetch" />
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://api.vturb.com.br" />
      </head>
      <body className="antialiased bg-neutral-100">
        <TrackingProvider>
          {children}
        </TrackingProvider>
      </body>
    </html>
  );
}

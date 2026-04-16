"use client";

import { useEffect } from "react";

/**
 * Contexto de Rastreamento (Client Side)
 * Lida com o disparo do PageView e injeta metadados da Meta (_fbp/_fbc) 
 * via chamadas background API sem afetar o carregamento.
 */
export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const trackingApiUrl = process.env.NEXT_PUBLIC_TRACKING_API_URL;
    if (!trackingApiUrl) return;

    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
      return '';
    };

    const sendEvent = async (eventName: string, milestone = '') => {
      try {
        const payload = {
          eventName,
          milestone,
          fbp: getCookie('_fbp'),
          fbc: getCookie('_fbc'),
          utms: window.location.search,
        };''

        await fetch(trackingApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // Mantém vivo caso o usuário feche a página no exato momento
          keepalive: true 
        });
      } catch (err) {
        console.error('[TrackingProvider] Failed to dispatch', err);
      }
    };

    // O disparo de 'PageView' é gerido nativamente pelas tags injetadas no head.
    // A Tracking API CAPI fica focada exclusivamente em eventos restritos/valiosos (IC e Purchase).

    // 2. Intercepta Globalmente Cliques nos botões de Checkout
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && (link.href.includes('checkout-ds24.com') || link.href.includes('digistore24.com'))) {
             sendEvent('InitiateCheckout');
             
             // Disparo híbrido (Browser Side) para melhor otimização
             if (typeof window !== 'undefined') {
                 // TikTok
                (window as any).ttq?.track?.('InitiateCheckout', {
                     contents: [{
                         content_id: 'glucovital_lp',
                         content_type: 'product'
                     }]
                 });
                 // Meta (Facebook)
                (window as any).fbq?.track?.('InitiateCheckout', {
                     content_ids: ['glucovital_lp'],
                     content_type: 'product'
                 });
             }
        }
    };

    document.addEventListener('click', handleClick);

    return () => {
        document.removeEventListener('click', handleClick);
    };
  }, []);

  // 3. Garante que links de checkout levem os parâmetros de rastreio
  useEffect(() => {
    const transformLinks = () => {
      const pageParams = new URLSearchParams(window.location.search);
      const aliases: Record<string, string[]> = {
        campaignkey: ["campaignKey"],
        trackingkey: ["trackingKey"],
        utm_source: ["utmSource"],
        utm_medium: ["utmMedium"],
        utm_campaign: ["utmCampaign"],
        utm_term: ["utmTerm"],
        utm_content: ["utmContent"],
      };
      const passthroughKeys = [
        "campaignkey",
        "trackingkey",
        "sid1",
        "sid2",
        "sid3",
        "sid4",
        "sid5",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
      ];
      const clickId =
        pageParams.get("cid") ||
        pageParams.get("xcod") ||
        pageParams.get("trackingkey") ||
        pageParams.get("trackingKey") ||
        pageParams.get("utm_source") ||
        pageParams.get("utmSource") ||
        "direct";

      const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");
      links.forEach((link) => {
        try {
          const checkoutUrl = new URL(link.href, window.location.origin);
          const isDigistore =
            checkoutUrl.hostname.includes("checkout-ds24.com") ||
            checkoutUrl.hostname.includes("digistore24.com");

          if (!isDigistore) return;

          if (!checkoutUrl.searchParams.get("cid")) {
            checkoutUrl.searchParams.set("cid", clickId);
          }

          passthroughKeys.forEach((key) => {
            if (checkoutUrl.searchParams.get(key)) return;

            const fromPage =
              pageParams.get(key) ||
              aliases[key]?.map((alias) => pageParams.get(alias)).find(Boolean) ||
              "";

            if (fromPage) {
              checkoutUrl.searchParams.set(key, fromPage);
            }
          });

          link.href = checkoutUrl.toString();
        } catch {
          // Ignora links inválidos
        }
      });
    };

    // Roda ao carregar e após um pequeno delay para garantir que scripts externos carregaram
    transformLinks();
    const timer = setTimeout(transformLinks, 2000);
    return () => clearTimeout(timer);
  }, []);

    return <>{children}</>;
}

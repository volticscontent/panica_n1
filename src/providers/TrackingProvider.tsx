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
        };

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
                 (window as any).ttq?.track('InitiateCheckout', {
                     contents: [{
                         content_id: 'glucovital_lp',
                         content_type: 'product'
                     }]
                 });
                 // Meta (Facebook)
                 (window as any).fbq?.track('InitiateCheckout', {
                     content_ids: ['glucovital_lp'],
                     content_type: 'product'
                 });
             }
        }
    };

    // 3. Garante que Links de Checkout tenham o parâmetro ?cid= para Digistore
    useEffect(() => {
        const transformLinks = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const clickId = urlParams.get('xcod') || urlParams.get('utm_source') || 'direct';
            
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                if (link.href.includes('checkout-ds24.com') || link.href.includes('digistore24.com')) {
                    if (!link.href.includes('cid=')) {
                        const separator = link.href.includes('?') ? '&' : '?';
                        link.href += `${separator}cid=${clickId}`;
                    }
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

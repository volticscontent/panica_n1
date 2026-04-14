/**
 * Utilitário de Rastreio (Server Side) para Next.js / Vercel
 */

export interface UtmPayload {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  xcod?: string;
  src?: string;
  sck?: string;
}

export interface AdvancedMatching {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
}

export interface TrackingEvent {
  eventName: 'PageView' | 'VslView' | 'InitiateCheckout' | 'Purchase' | 'Refund';
  milestone?: string;
  value?: number;
  currency?: string;
  productId?: string;
  transactionId?: string;
  utm: UtmPayload;
  user: AdvancedMatching;
  timestamp: string;
}

export class TrackingService {
  /**
   * Extrai UTMs de diversos formatos de entrada
   */
  public static extractUtms(sourceData: any): UtmPayload {
    const data = sourceData || {};
    return {
      utm_source: data.utm_source || data.src || '',
      utm_medium: data.utm_medium || '',
      utm_campaign: data.utm_campaign || '',
      utm_content: data.utm_content || '',
      utm_term: data.utm_term || '',
      xcod: data.xcod || data.utm_source || '',
      src: data.src || data.utm_source || '',
      sck: data.sck || ''
    };
  }

  /**
   * Envia o Postback para a UTMify (S2S) seguindo o padrão PerfumesUK
   */
  public static async dispatchEvent(event: TrackingEvent) {
    try {
      const utmifyEndpoint = process.env.UTMIFY_API_URL || 'https://api.utmify.com.br/api-credentials/orders';
      const apiToken = process.env.UTM_API_TOKEN || process.env.UTMIFY_API_TOKEN;
      const pixelId = process.env.UTMIFY_PIXEL_ID;

      if (!apiToken) {
        console.warn('[TrackingService] UTMIFY_API_TOKEN não configurado.');
        return;
      }

      const now = new Date().toISOString();
      // Converte o valor original para centavos (Como vem em Euro, apenas multiplicamos por 100)
      const priceInCents = Math.round((event.value || 0) * 100);

      const payload = {
        orderId: event.transactionId || `evt_${Date.now()}`,
        platform: 'digistore',
        paymentMethod: 'credit_card',
        status: (event.eventName === 'Purchase' || event.eventName === 'VslView') ? 'approved' : 'pending',
        createdAt: now,
        approvedDate: now,
        currency: event.currency || 'EUR',
        pixelId: pixelId || '',
        pixel_id: pixelId || '',
        customer: {
          name: `${event.user.firstName || 'Comprador'} ${event.user.lastName || 'Teste'}`.trim(),
          email: event.user.email || 'teste@utmify.com.br',
          phone: event.user.phone || '00000000000',
          document: null
        },
        trackingParameters: {
          utm_source: event.utm.utm_source || '',
          utm_medium: event.utm.utm_medium || '',
          utm_campaign: event.utm.utm_campaign || '',
          utm_content: event.utm.utm_content || '',
          utm_term: event.utm.utm_term || '',
          src: event.utm.src || '',
          sck: event.utm.sck || '',
          xcod: event.utm.xcod || ''
        },
        commission: {
          totalPriceInCents: priceInCents,
          gatewayFeeInCents: Math.round(priceInCents * 0.05), // Estimativa 5%
          userCommissionInCents: priceInCents - Math.round(priceInCents * 0.05)
        },
        products: [
          {
            id: event.productId || 'default',
            planId: `plan_${event.productId || 'default'}`,
            planName: 'Product',
            name: 'Nutra Product',
            quantity: 1,
            priceInCents: priceInCents
          }
        ],
        fbp: event.user.fbp || '',
        fbc: event.user.fbc || ''
      };

      console.log(`[TrackingService] Enviando S2S (Padrao PerfumesUK) - Evento: ${event.eventName}`);
      console.log(`[TrackingService] Payload:`, JSON.stringify(payload, null, 2));

      const response = await fetch(utmifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NutraVercel-Tracking/1.0',
          'x-api-token': apiToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[TrackingService] Erro retornado pela UTMify: Status ${response.status}`, errorData);
        return;
      }

      console.log(`[TrackingService] Postback ${event.eventName} marcado com sucesso na UTMify (EUR).`);
      
    } catch (error: any) {
      console.error(`[TrackingService] Erro fatal no Postback S2S:`, error.message);
    }
  }
}

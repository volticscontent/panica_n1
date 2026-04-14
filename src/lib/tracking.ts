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
   * Envia o Postback para a UTMify (S2S)
   */
  public static async dispatchEvent(event: TrackingEvent) {
    try {
      const utmifyEndpoint = process.env.UTMIFY_API_URL || 'https://api.utmify.com.br/api-credentials/orders';
      const apiToken = process.env.UTM_API_TOKEN || process.env.UTMIFY_API_TOKEN;

      if (!apiToken) {
        console.warn('[TrackingService] UTMIFY_API_TOKEN não configurado no servidor.');
        return;
      }

      console.log(`[TrackingService] Iniciando Postback S2S: ${event.eventName}`, { transactionId: event.transactionId });

      const payload = {
        orderId: event.transactionId || `evt_${Date.now()}`,
        customer: {
          email: event.user.email || '',
          phone: event.user.phone || '',
          firstName: event.user.firstName || '',
          lastName: event.user.lastName || '',
          ip: event.user.ip || '',
          userAgent: event.user.userAgent || ''
        },
        products: [
          {
            id: event.productId || 'primary',
            name: 'Product',
            price: event.value || 0
          }
        ],
        trackingParameters: {
          src: event.utm.src || '',
          sck: event.utm.sck || '',
          utm_source: event.utm.utm_source || '',
          utm_medium: event.utm.utm_medium || '',
          utm_campaign: event.utm.utm_campaign || '',
          utm_content: event.utm.utm_content || '',
          utm_term: event.utm.utm_term || '',
          xcod: event.utm.xcod || ''
        },
        fbp: event.user.fbp || '',
        fbc: event.user.fbc || '',
        pixelId: process.env.UTMIFY_PIXEL_ID || '', // Adicionado para identificação correta
        pixel_id: process.env.UTMIFY_PIXEL_ID || '', // Algumas versões usam com underscore
        status: (event.eventName === 'Purchase' || event.eventName === 'VslView') ? 'approved' : 'pending',
        paymentMethod: 'credit_card',
        currency: event.currency || 'BRL'
      };

      const response = await fetch(utmifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[TrackingService] UTMify API Error: Status ${response.status}`, errorData);
        return;
      }

      console.log(`[TrackingService] Postback ${event.eventName} enviado com sucesso.`);
      
    } catch (error: any) {
      console.error(`[TrackingService] Erro fatal no Postback:`, error.message);
    }
  }
}

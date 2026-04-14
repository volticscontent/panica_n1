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
   * Envia o Postback para a UTMify (S2S) seguindo rigorosamente a documentação oficial
   */
  public static async dispatchEvent(event: TrackingEvent) {
    try {
      const utmifyEndpoint = process.env.UTMIFY_API_URL || 'https://api.utmify.com.br/api-credentials/orders';
      const apiToken = process.env.UTM_API_TOKEN || process.env.UTMIFY_API_TOKEN;

      if (!apiToken) {
        console.warn('[TrackingService] UTMIFY_API_TOKEN não configurado.');
        return;
      }

      // Formatando data conforme exigido: YYYY-MM-DD HH:MM:SS
      const formatDate = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0];
      };

      const now = new Date();
      const formattedDate = formatDate(now);
      const priceInCents = Math.round((event.value || 0) * 100);

      const payload = {
        orderId: event.transactionId || `evt_${Date.now()}`,
        platform: 'digistore',
        paymentMethod: 'credit_card',
        status: (event.eventName === 'Purchase' || event.eventName === 'VslView') ? 'paid' : 'waiting_payment',
        createdAt: formattedDate,
        approvedDate: formattedDate,
        customer: {
          name: `${event.user.firstName || ''} ${event.user.lastName || ''}`.trim() || 'Customer',
          email: event.user.email || '',
          phone: event.user.phone || '',
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
          gatewayFeeInCents: 0,
          userCommissionInCents: priceInCents,
          currency: event.currency || 'EUR'
        },
        products: [
          {
            id: event.productId || 'default',
            planId: `plan_${event.productId || 'default'}`,
            planName: 'Nutra Product',
            name: 'Nutra Product',
            quantity: 1,
            priceInCents: priceInCents
          }
        ]
      };

      console.log(`[TrackingService] Enviando S2S Oficial - ID: ${payload.orderId}`);
      console.log(`[TrackingService] Dados:`, JSON.stringify(payload, null, 2));

      const response = await fetch(utmifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NutraVSA-Tracking/1.0',
          'x-api-token': apiToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[TrackingService] API UTMify recusou: ${response.status}`, errorData);
        return;
      }

      console.log(`[TrackingService] Venda em EURO marcada com sucesso!`);
      
    } catch (error: any) {
      console.error(`[TrackingService] Erro fatal S2S:`, error.message);
    }
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { TrackingService, TrackingEvent, AdvancedMatching } from '@/lib/tracking';

export const dynamic = 'force-dynamic';

/**
 * Webhook / Postback Digistore24 para Vercel
 * Suporta POST (IPN padrão) e GET (parâmetros via URL)
 */
export async function POST(req: NextRequest) {
    console.log('[Webhook POST] Verificando Env:', { 
        hasToken: !!process.env.UTMIFY_API_TOKEN,
        hasPixelId: !!process.env.UTMIFY_PIXEL_ID 
    });
    return handleWebhook(req);
}

export async function GET(req: NextRequest) {
    console.log('[Webhook GET] Verificando Env:', { 
        hasToken: !!process.env.UTMIFY_API_TOKEN,
        hasPixelId: !!process.env.UTMIFY_PIXEL_ID 
    });
    return handleWebhook(req);
}

export async function GET(req: NextRequest) {
    return handleWebhook(req);
}

async function handleWebhook(req: NextRequest) {
    try {
        const method = req.method;
        let payload: any = {};

        if (method === 'POST') {
            // Digistore costuma enviar application/x-www-form-urlencoded
            const contentType = req.headers.get('content-type') || '';
            if (contentType.includes('application/x-www-form-urlencoded')) {
                const formData = await req.formData();
                payload = Object.fromEntries(formData.entries());
            } else {
                payload = await req.json();
            }
        } else {
            // Se for GET, pegamos da query string
            const { searchParams } = new URL(req.url);
            payload = Object.fromEntries(searchParams.entries());
        }

        console.log(`[Digistore Webhook] ${method} recebido:`, payload.order_id || payload.click_id || 'Event');

        // Mapeamento de Status
        const digiEvent = payload.event || payload.status || 'payment';
        const transactionId = payload.order_id || payload.transaction_id || `ds_${Date.now()}`;
        
        let eventType: 'Purchase' | 'Refund' | 'InitiateCheckout' = 'Purchase';
        if (digiEvent === 'refund' || digiEvent === 'chargeback') eventType = 'Refund';
        if (digiEvent === 'initiate_checkout') eventType = 'InitiateCheckout';

        const user: AdvancedMatching = {
            ip: req.headers.get('x-forwarded-for') || '',
            userAgent: req.headers.get('user-agent') || '',
            email: payload.buyer_email || payload.email || '',
            firstName: payload.buyer_first_name || payload.first_name || '',
            lastName: payload.buyer_last_name || payload.last_name || '',
            phone: payload.buyer_phone || payload.phone || '',
            country: payload.buyer_country || payload.country || '',
        };

        // Tratamento de UTMs e Identificadores (xcod/cid)
        const utmSourceData = {
            src: payload.click_id || payload.cid || payload.utm_source,
            utm_source: payload.utm_source,
            utm_medium: payload.utm_medium,
            utm_campaign: payload.utm_campaign,
            utm_content: payload.utm_content,
            utm_term: payload.utm_term,
            xcod: payload.click_id || payload.cid || payload.custom_tracking || payload.custom
        };

        const utms = TrackingService.extractUtms(utmSourceData);

        const eventData: TrackingEvent = {
            eventName: eventType,
            value: parseFloat(payload.amount_brutto || payload.revenue || payload.amount || '0'),
            currency: payload.currency || 'USD',
            productId: String(payload.product_id || 'default'),
            transactionId: transactionId,
            utm: utms,
            user,
            timestamp: new Date().toISOString()
        };

        // Dispara assincronamente para a UTMify
        // Não usamos await na resposta final para não travar a Digistore
        TrackingService.dispatchEvent(eventData).catch(e => console.error('[Webhook S2S Error]', e));

        return NextResponse.json({ status: 'success', message: 'Webhook received' }, { status: 200 });

    } catch (error: any) {
        console.error('[Webhook Digistore Error]', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

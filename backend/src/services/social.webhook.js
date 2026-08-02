/**
 * social.webhook.js
 * Sends product events to social.conectaai.cl without blocking the main flow.
 * Fire-and-forget — errors are logged but never thrown to the caller.
 */

const https = require('https');
const http = require('http');

const SOCIAL_URL = process.env.SOCIAL_API_URL || 'https://social.conectaai.cl';
const SOCIAL_SECRET = process.env.INTEGRATION_SECRET || '';
const TENANT_SLUG = process.env.SOCIAL_TENANT_SLUG || 'terrablinds';
const ENABLED = process.env.SOCIAL_WEBHOOK_ENABLED !== 'false';

function postJSON(url, body, secret) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(body);
        const parsed = new URL(url);
        const lib = parsed.protocol === 'https:' ? https : http;

        const req = lib.request({
            hostname: parsed.hostname,
            port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
            path: parsed.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': `Bearer ${secret}`,
            },
            timeout: 8000,
        }, (res) => {
            res.resume(); // drain
            resolve({ status: res.statusCode });
        });

        req.on('error', (e) => resolve({ error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
        req.write(payload);
        req.end();
    });
}

/**
 * Notify social.conectaai.cl about a product event.
 * @param {'product.created'|'product.updated'|'product.on_sale'} event
 * @param {object} product  Sequelize product instance (plain object or model)
 */
async function notifySocial(event, product) {
    if (!ENABLED || !SOCIAL_SECRET) return;

    const p = product.toJSON ? product.toJSON() : product;

    // Only notify for active products
    if (p.is_active === false) return;

    // Only notify on significant changes (new product or price drop)
    if (event === 'product.updated') {
        // Skip if no price-related or visibility change — caller should pass changedFields
        // We still send it; social will decide what to do
    }

    const imageUrl = Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : (typeof p.images === 'string' ? JSON.parse(p.images || '[]')[0] : null);

    const payload = {
        event,
        tenantSlug: TENANT_SLUG,
        generateTypes: ['FEED', 'STORY'],
        product: {
            id: p.id,
            name: p.name,
            description: p.short_description || p.description || '',
            price: p.base_price_m2
                ? `Desde $${p.base_price_m2.toLocaleString('es-CL')} CLP/m²`
                : p.price_unit
                    ? `$${p.price_unit.toLocaleString('es-CL')} CLP`
                    : null,
            category: p.category || '',
            imageUrl: imageUrl || null,
            url: `https://terrablinds.cl/productos/${p.slug || p.id}`,
        },
    };

    const result = await postJSON(
        `${SOCIAL_URL}/api/integrations/terrablinds`,
        payload,
        SOCIAL_SECRET
    );

    if (result.error) {
        console.warn('[social.webhook] Error notifying social:', result.error);
    } else if (result.status && result.status >= 400) {
        console.warn('[social.webhook] Social returned HTTP', result.status);
    } else {
        console.log('[social.webhook] Notified social for event:', event, 'product:', p.name);
    }
}

module.exports = { notifySocial };

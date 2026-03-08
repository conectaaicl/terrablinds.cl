const axios = require('axios');
const { Config, Quote } = require('../models');

const getMPConfig = async () => {
    const tokenConfig = await Config.findOne({ where: { key: 'mercadopago_access_token' } });
    const accessToken = tokenConfig?.value || process.env.MP_ACCESS_TOKEN;
    return { accessToken };
};

exports.createPayment = async (req, res, next) => {
    try {
        const { quoteId } = req.body;

        if (!quoteId) {
            return res.status(400).json({ error: 'quoteId es requerido' });
        }

        const quote = await Quote.findByPk(quoteId);
        if (!quote) {
            return res.status(404).json({ error: 'Cotización no encontrada' });
        }

        if (quote.status === 'accepted' || quote.status === 'completed') {
            return res.status(400).json({ error: 'Esta cotización ya fue pagada.' });
        }

        const { accessToken } = await getMPConfig();

        if (!accessToken) {
            return res.status(500).json({ error: 'Mercado Pago no está configurado. Contacta al administrador.' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://terrablinds.cl';
        const backendUrl = process.env.BASE_URL || 'http://localhost:5000';

        const items = Array.isArray(quote.items) ? quote.items : [];
        const mpItems = items.length > 0
            ? items.map(item => ({
                id: String(item.productId || 'prod'),
                title: String(item.productName || 'Cortina TerraBlinds').substring(0, 255),
                quantity: parseInt(item.quantity) || 1,
                unit_price: Math.round(parseFloat(item.price) / (parseInt(item.quantity) || 1)),
                currency_id: 'CLP'
            }))
            : [{
                id: `quote-${quote.id}`,
                title: `Cotización TerraBlinds #${quote.id}`,
                quantity: 1,
                unit_price: Math.round(parseFloat(quote.total_amount)),
                currency_id: 'CLP'
            }];

        const preference = {
            items: mpItems,
            payer: {
                name: quote.customer_name,
                email: quote.customer_email,
                phone: { number: quote.customer_phone || '' }
            },
            external_reference: `TB-${quote.id}`,
            back_urls: {
                success: `${frontendUrl}/payment/result?method=mp&status=success&quote=${quote.id}`,
                failure: `${frontendUrl}/payment/result?method=mp&status=failure&quote=${quote.id}`,
                pending: `${frontendUrl}/payment/result?method=mp&status=pending&quote=${quote.id}`
            },
            auto_return: 'approved',
            notification_url: `${backendUrl}/api/payment/mercadopago/webhook`,
            statement_descriptor: 'TERRABLINDS',
            metadata: { quote_id: quote.id }
        };

        const mpRes = await axios.post(
            'https://api.mercadopago.com/checkout/preferences',
            preference,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': `TB-${quote.id}-${Date.now()}`
                }
            }
        );

        const isProduction = process.env.NODE_ENV === 'production';
        const redirectUrl = isProduction ? mpRes.data.init_point : mpRes.data.sandbox_init_point;

        res.json({ redirectUrl, preferenceId: mpRes.data.id });
    } catch (error) {
        console.error('MercadoPago payment error:', error.response?.data || error.message);
        next(error);
    }
};

exports.webhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type !== 'payment' || !data?.id) {
            return res.sendStatus(200);
        }

        const { accessToken } = await getMPConfig();
        if (!accessToken) return res.sendStatus(200);

        // Fetch payment details from MP
        const paymentRes = await axios.get(
            `https://api.mercadopago.com/v1/payments/${data.id}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        const payment = paymentRes.data;
        const externalRef = payment.external_reference; // format: TB-{quoteId}

        if (externalRef && externalRef.startsWith('TB-')) {
            const quoteId = parseInt(externalRef.replace('TB-', ''));
            if (quoteId) {
                const quote = await Quote.findByPk(quoteId);
                if (quote) {
                    const newStatus = payment.status === 'approved' ? 'accepted' : 'pending';
                    await quote.update({ status: newStatus });
                    console.log(`[MercadoPago] Quote #${quoteId} updated to: ${newStatus}`);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('[MercadoPago] Webhook error:', error.message);
        res.sendStatus(200); // Always 200 so MP doesn't retry
    }
};

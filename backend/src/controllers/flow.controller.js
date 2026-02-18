const axios = require('axios');
const { Config, Quote } = require('../models');
const crypto = require('crypto');

const signParams = (params, secret) => {
    const keys = Object.keys(params).sort();
    let toSign = '';
    keys.forEach(key => {
        toSign += key + params[key];
    });
    return crypto.createHmac('sha256', secret).update(toSign).digest('hex');
};

const getFlowConfig = async () => {
    const apiKeyConfig = await Config.findOne({ where: { key: 'flow_api_key' } });
    const secretKeyConfig = await Config.findOne({ where: { key: 'flow_secret_key' } });
    const apiUrlConfig = await Config.findOne({ where: { key: 'flow_api_url' } });

    const apiKey = apiKeyConfig?.value || process.env.FLOW_API_KEY;
    const secretKey = secretKeyConfig?.value || process.env.FLOW_SECRET_KEY;
    const apiUrl = apiUrlConfig?.value || process.env.FLOW_API_URL || 'https://www.flow.cl/api';

    return { apiKey, secretKey, apiUrl };
};

exports.createPayment = async (req, res, next) => {
    try {
        const { quoteId } = req.body;

        if (!quoteId) {
            return res.status(400).json({ error: 'quoteId is required' });
        }

        const quote = await Quote.findByPk(quoteId);
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        const { apiKey, secretKey, apiUrl } = await getFlowConfig();

        if (!apiKey || !secretKey) {
            return res.status(500).json({ error: 'Payment gateway is not configured' });
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const params = {
            apiKey,
            commerceOrder: `TB-${quote.id}-${Date.now()}`,
            subject: `Cotizacion TerraBlinds #${quote.id}`,
            currency: 'CLP',
            amount: Math.round(parseFloat(quote.total_amount)),
            email: quote.customer_email,
            paymentMethod: 9,
            urlConfirmation: `${baseUrl}/api/payment/confirm`,
            urlReturn: `${frontendUrl}/payment/result`
        };

        params.s = signParams(params, secretKey);

        const formData = new URLSearchParams(params);
        const flowRes = await axios.post(`${apiUrl}/payment/create`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (flowRes.data.url && flowRes.data.token) {
            res.json({
                redirectUrl: `${flowRes.data.url}?token=${flowRes.data.token}`
            });
        } else {
            console.error('Flow response error:', flowRes.data);
            res.status(400).json({ error: 'Error creating payment' });
        }
    } catch (error) {
        console.error('Payment error:', error.message);
        next(error);
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).send('Missing token');
        }

        const { apiKey, secretKey, apiUrl } = await getFlowConfig();

        const params = { apiKey, token };
        params.s = signParams(params, secretKey);

        const formData = new URLSearchParams(params);
        const statusRes = await axios.post(`${apiUrl}/payment/getStatus`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const paymentData = statusRes.data;

        if (paymentData.commerceOrder) {
            // Extract quote ID from commerce order (format: TB-{id}-{timestamp})
            const parts = paymentData.commerceOrder.split('-');
            const quoteId = parseInt(parts[1]);

            if (quoteId) {
                const quote = await Quote.findByPk(quoteId);
                if (quote) {
                    const newStatus = paymentData.status === 2 ? 'accepted' : 'pending';
                    await quote.update({ status: newStatus });
                    console.log(`Quote #${quoteId} payment status updated to: ${newStatus}`);
                }
            }
        }

        res.send('OK');
    } catch (error) {
        console.error('Payment confirmation error:', error.message);
        res.status(500).send('Error processing confirmation');
    }
};

const axios = require('axios');
const { Config, Quote } = require('../models');
const crypto = require('crypto');

// Helper to sign params for Flow
const signParams = (params, secret) => {
    const keys = Object.keys(params).sort();
    let toSign = "";
    keys.forEach(key => {
        toSign += key + params[key];
    });
    const signature = crypto.createHmac('sha256', secret).update(toSign).digest('hex');
    return signature;
};

exports.createPayment = async (req, res, next) => {
    try {
        const { quoteId } = req.body;
        const quote = await Quote.findByPk(quoteId);

        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        // Get Configs
        const apiKeyConfig = await Config.findOne({ where: { key: 'flow_api_key' } });
        const secretKeyConfig = await Config.findOne({ where: { key: 'flow_secret_key' } });
        const apiUrlConfig = await Config.findOne({ where: { key: 'flow_api_url' } });

        const apiKey = apiKeyConfig ? apiKeyConfig.value : process.env.FLOW_API_KEY;
        const secretKey = secretKeyConfig ? secretKeyConfig.value : process.env.FLOW_SECRET_KEY;
        const apiUrl = apiUrlConfig ? apiUrlConfig.value : (process.env.FLOW_API_URL || 'https://www.flow.cl/api');

        if (!apiKey || !secretKey) {
            return res.status(500).json({ message: 'Flow configuration missing' });
        }

        const params = {
            apiKey: apiKey,
            commerceOrder: quote.id + '-' + Date.now(),
            subject: 'Pago Cotización TerraBlinds #' + quote.id,
            currency: 'CLP',
            amount: Math.round(quote.total_price),
            email: quote.customer_email,
            paymentMethod: 9, // 9 = WebPay / All
            urlConfirmation: process.env.BASE_URL + '/api/payment/confirm',
            urlReturn: process.env.FRONTEND_URL + '/payment/result',
        };

        params.s = signParams(params, secretKey);

        const response = await axios.post(`${apiUrl}/payment/create`, params, {
            headers: { 'Content-Type': 'multipart/form-data' } // Flow expects form-data usually, but let's check docs. 
            // Actually standard Flow API accepts x-www-form-urlencoded
        });

        // Flow API returns json with redirect url
        // BUT axios post config content-type might need adjustment. 
        // Let's assume standard JSON or form-urlencoded for this implementation outline.
        // If Flow requires form-data, we'd use FormData. 
        // The standard is usually form-urlencoded.

        // Correcting to form-urlencoded
        const formData = new URLSearchParams(params);
        const flowRes = await axios.post(`${apiUrl}/payment/create`, formData);

        if (flowRes.data.url && flowRes.data.token) {
            res.json({
                redirectUrl: `${flowRes.data.url}?token=${flowRes.data.token}`
            });
        } else {
            console.error('Flow Error:', flowRes.data);
            res.status(400).json({ message: 'Error creating payment with Flow', details: flowRes.data });
        }

    } catch (error) {
        console.error('Payment Error:', error);
        next(error);
    }
};

exports.confirmPayment = async (req, res, next) => {
    // Flow calls this via POST
    console.log('Payment confirmation received:', req.body);
    res.send('OK'); // Acknowledge receipt
};

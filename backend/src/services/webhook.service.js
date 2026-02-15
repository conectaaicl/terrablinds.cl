const axios = require('axios');

exports.triggerWorkflow = async (quote) => {
    if (!process.env.N8N_WEBHOOK_URL) {
        console.warn('N8N_WEBHOOK_URL not found. Skipping webhook trigger.');
        return;
    }

    try {
        await axios.post(process.env.N8N_WEBHOOK_URL, {
            event: 'new_quote',
            quote: quote
        });
        console.log(`Webhook triggered for quote ${quote.id}`);
    } catch (error) {
        console.error('Error triggering webhook:', error.response?.data || error.message);
    }
};

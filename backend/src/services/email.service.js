const axios = require('axios');

const { Config } = require('../models');

exports.sendQuoteEmail = async (to, quote) => {
    // Fetch dynamic config first, fallback to env
    const config = await Config.findOne({ where: { key: 'resend_api_key' } });
    const apiKey = config ? config.value : process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY not found in Config or Env. Skipping email sending.');
        return;
    }

    try {
        const htmlContent = `
      <h1>Quote Received</h1>
      <p>Dear ${quote.customer_name},</p>
      <p>Thank you for your quote request. Here are the details:</p>
      <ul>
        ${quote.items.map(item => `<li>${item.productName}: ${item.width}x${item.height}cm - $${item.price}</li>`).join('')}
      </ul>
      <p><strong>Total Price: $${quote.total_price}</strong></p>
      <p>We will contact you shortly.</p>
    `;

        await axios.post(
            'https://api.resend.com/emails',
            {
                from: 'TerraBlinds <onboarding@resend.dev>', // Update with verified domain
                to: [to],
                subject: `Your Quote #${quote.id} - TerraBlinds`,
                html: htmlContent
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error.response?.data || error.message);
    }
};

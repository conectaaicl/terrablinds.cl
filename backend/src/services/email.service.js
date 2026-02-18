const axios = require('axios');
const { Config } = require('../models');

exports.sendQuoteEmail = async (to, quote) => {
    const config = await Config.findOne({ where: { key: 'resend_api_key' } });
    const apiKey = config?.value || process.env.RESEND_API_KEY;

    if (!apiKey || apiKey === 'your-resend-api-key') {
        console.warn('RESEND_API_KEY not configured. Skipping email.');
        return;
    }

    const companyEmailConfig = await Config.findOne({ where: { key: 'company_email' } });
    const companyEmail = companyEmailConfig?.value || 'contacto@terrablinds.cl';

    const items = Array.isArray(quote.items) ? quote.items : [];
    const itemsHtml = items.map(item => {
        const detail = item.width && item.height
            ? `${item.width}x${item.height}cm`
            : `${item.quantity || 1} unidad(es)`;
        return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName || item.product || 'Producto'}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${detail}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(item.price || 0).toLocaleString('es-CL')}</td>
        </tr>`;
    }).join('');

    const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1e40af;color:white;padding:24px;text-align:center;">
            <h1 style="margin:0;">TerraBlinds</h1>
            <p style="margin:8px 0 0;">Confirmacion de Cotizacion #${quote.id}</p>
        </div>
        <div style="padding:24px;">
            <p>Estimado/a <strong>${quote.customer_name}</strong>,</p>
            <p>Hemos recibido tu solicitud de cotizacion. A continuacion el detalle:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <thead>
                    <tr style="background:#f3f4f6;">
                        <th style="padding:8px;text-align:left;">Producto</th>
                        <th style="padding:8px;text-align:left;">Detalle</th>
                        <th style="padding:8px;text-align:right;">Precio</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size:18px;font-weight:bold;text-align:right;">
                Total Estimado: $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p>Un ejecutivo comercial te contactara a la brevedad para confirmar los detalles y coordinar la instalacion.</p>
            <p>Si tienes consultas, escribenos a <a href="mailto:${companyEmail}">${companyEmail}</a></p>
        </div>
        <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#666;">
            <p>TerraBlinds - Cortinas y Persianas a Medida</p>
        </div>
    </div>`;

    try {
        await axios.post(
            'https://api.resend.com/emails',
            {
                from: process.env.RESEND_FROM_EMAIL || 'TerraBlinds <noreply@terrablinds.cl>',
                to: [to],
                subject: `Cotizacion #${quote.id} - TerraBlinds`,
                html: htmlContent
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`Quote email sent to ${to}`);
    } catch (error) {
        console.error('Email send error:', error.response?.data || error.message);
        throw error;
    }
};

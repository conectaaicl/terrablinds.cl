const axios = require('axios');
const { Config } = require('../models');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'El nombre es obligatorio (mínimo 2 caracteres).' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Ingrese un email válido.' });
        }
        if (!message || message.trim().length < 10) {
            return res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres.' });
        }

        // Send email notification to company
        const resendConfig = await Config.findOne({ where: { key: 'resend_api_key' } });
        const apiKey = resendConfig?.value || process.env.RESEND_API_KEY;
        const companyEmailConfig = await Config.findOne({ where: { key: 'company_email' } });
        const companyEmail = companyEmailConfig?.value || 'contacto@terrablinds.cl';

        if (apiKey && apiKey !== 'your-resend-api-key') {
            const subjectMap = {
                cotizacion: 'Solicitar Cotización',
                visita: 'Agendar Visita Técnica',
                consulta: 'Consulta General',
                postventa: 'Servicio Post-Venta'
            };

            const htmlContent = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#1e40af;color:white;padding:24px;text-align:center;">
                    <h1 style="margin:0;">TerraBlinds</h1>
                    <p style="margin:8px 0 0;">Nuevo Mensaje de Contacto</p>
                </div>
                <div style="padding:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Nombre:</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email:</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Teléfono:</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone || '-'}</td></tr>
                        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Asunto:</td><td style="padding:8px;border-bottom:1px solid #eee;">${subjectMap[subject] || subject || 'No especificado'}</td></tr>
                    </table>
                    <div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:8px;">
                        <p style="font-weight:bold;margin:0 0 8px;">Mensaje:</p>
                        <p style="margin:0;white-space:pre-wrap;">${message}</p>
                    </div>
                    <p style="margin-top:16px;font-size:12px;color:#999;">Responder directamente a: ${email}</p>
                </div>
            </div>`;

            try {
                await axios.post(
                    'https://api.resend.com/emails',
                    {
                        from: process.env.RESEND_FROM_EMAIL || 'TerraBlinds <noreply@terrablinds.cl>',
                        to: [companyEmail],
                        reply_to: email,
                        subject: `[Contacto Web] ${subjectMap[subject] || 'Mensaje'} - ${name}`,
                        html: htmlContent
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (emailErr) {
                console.error('Contact email send error:', emailErr.response?.data || emailErr.message);
                // Don't fail the request if email fails
            }
        } else {
            console.warn('RESEND_API_KEY not configured. Contact email not sent.');
        }

        res.json({ message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Error al procesar el mensaje.' });
    }
};

const { Contact, Config } = require('../models');
const { sendContactEmail } = require('../services/email.service');
const axios = require('axios');

async function fireContactWebhook(name, email, phone, subject, message) {
    try {
        const cfg = await Config.findOne({ where: { key: 'webhook_url' } });
        const url = cfg?.value;
        if (!url || !url.startsWith('http')) return;
        const waLink = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : null;
        const msgContent = [
            `Asunto: ${subject || 'Sin asunto'}`,
            message.substring(0, 300),
            `Email: ${email}`,
            phone ? `Tel: ${phone}` : null,
            waLink ? `WhatsApp: ${waLink}` : null,
        ].filter(Boolean).join(' | ');
        // Fire-and-forget: don't await, n8n response not needed
        axios.post(url, {
            event: 'new_contact',
            contact: { name, email, phone: phone || null },
            message: { content: msgContent },
            channel: 'contacto',
            phone: phone || null,
            customer_name: name,
            customer_email: email,
        }, { timeout: 5000 });
        console.log(`Contact webhook fired for: ${email}`);
    } catch (err) {
        console.warn(`Contact webhook failed (non-blocking): ${err.message}`);
    }
}

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

        // Guardar en DB primero (nunca perder el lead aunque el email falle)
        const notes = `Asunto: ${subject || 'Sin asunto'}\n\n${message.trim()}`;
        const phoneNorm = phone ? phone.trim().replace(/\s+/g, '') : null;
        await Contact.create({
            name: name.trim().substring(0, 200),
            email: email.trim().toLowerCase().substring(0, 200),
            phone: phoneNorm ? phoneNorm.substring(0, 50) : null,
            notes: notes.substring(0, 2000),
        });

        // Webhook n8n (non-blocking)
        fireContactWebhook(name.trim(), email.trim().toLowerCase(), phoneNorm, subject, message.trim()).catch(() => {});

        // Enviar email (no-blocking — si falla, el lead ya está guardado)
        sendContactEmail({ name: name.trim(), email, phone, subject, message: message.trim() }).catch(err => {
            console.error('Contact email send error (lead ya guardado en DB):', err.message);
        });

        res.json({ message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Error al procesar el mensaje.' });
    }
};

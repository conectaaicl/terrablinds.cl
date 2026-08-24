const { sendContactEmail } = require('../services/email.service');

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

        try {
            await sendContactEmail({ name: name.trim(), email, phone, subject, message: message.trim() });
        } catch (emailErr) {
            console.error('Contact email send error:', emailErr.message);
        }

        res.json({ message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Error al procesar el mensaje.' });
    }
};

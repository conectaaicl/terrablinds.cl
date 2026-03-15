const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const { Booking, BlockedDay, Config } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

const SERVICE_LABELS = {
    visita_medidas:    'Visita técnica toma de medidas',
    tecnico_persianas: 'Servicio técnico persianas',
    tecnico_roller:    'Servicio técnico cortinas roller',
    tecnico_otros:     'Servicio técnico otros',
};

const AMOUNT = 15000;
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const signParams = (params, secret) => {
    const keys = Object.keys(params).sort();
    let toSign = '';
    keys.forEach(k => { toSign += k + params[k]; });
    return crypto.createHmac('sha256', secret).update(toSign).digest('hex');
};

const getFlowConfig = async () => {
    const [a, s, u] = await Promise.all([
        Config.findOne({ where: { key: 'flow_api_key' } }),
        Config.findOne({ where: { key: 'flow_secret_key' } }),
        Config.findOne({ where: { key: 'flow_api_url' } }),
    ]);
    return {
        apiKey:    a?.value || process.env.FLOW_API_KEY,
        secretKey: s?.value || process.env.FLOW_SECRET_KEY,
        apiUrl:    u?.value || process.env.FLOW_API_URL || 'https://www.flow.cl/api',
    };
};

// GET /api/bookings/availability?date=YYYY-MM-DD
exports.getAvailability = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Fecha inválida' });
        }

        const blocked = await BlockedDay.findOne({ where: { date } });
        if (blocked) {
            return res.json({ available: false, blocked: true, reason: blocked.reason, slots: [] });
        }

        const bookings = await Booking.findAll({
            where: { date, status: { [Op.in]: ['pending_payment', 'confirmed'] } },
            attributes: ['time_slot'],
        });
        const taken = new Set(bookings.map(b => b.time_slot));
        const slots = TIME_SLOTS.map(slot => ({ slot, available: !taken.has(slot) }));

        res.json({ available: true, blocked: false, slots });
    } catch (err) { next(err); }
};

// GET /api/bookings/blocked-days?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getBlockedDays = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const where = {};
        if (from && to) where.date = { [Op.between]: [from, to] };
        const days = await BlockedDay.findAll({ where, order: [['date', 'ASC']] });
        res.json(days);
    } catch (err) { next(err); }
};

// POST /api/bookings — public
exports.createBooking = async (req, res, next) => {
    try {
        const { service_type, date, time_slot, client_name, client_email, client_phone, client_address, notes } = req.body;

        if (!service_type || !date || !time_slot || !client_name || !client_email) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        if (!SERVICE_LABELS[service_type]) {
            return res.status(400).json({ error: 'Tipo de servicio inválido' });
        }
        if (!TIME_SLOTS.includes(time_slot)) {
            return res.status(400).json({ error: 'Horario inválido' });
        }

        const blocked = await BlockedDay.findOne({ where: { date } });
        if (blocked) return res.status(409).json({ error: 'Este día no está disponible' });

        const existing = await Booking.findOne({
            where: { date, time_slot, status: { [Op.in]: ['pending_payment', 'confirmed'] } },
        });
        if (existing) return res.status(409).json({ error: 'Este horario ya está reservado. Elige otro.' });

        const booking = await Booking.create({
            service_type, date, time_slot,
            client_name, client_email,
            client_phone: client_phone || null,
            client_address: client_address || null,
            notes: notes || null,
            amount: AMOUNT,
            status: 'pending_payment',
        });

        const { apiKey, secretKey, apiUrl } = await getFlowConfig();
        if (!apiKey || !secretKey) {
            await booking.destroy();
            return res.status(500).json({ error: 'El sistema de pago no está configurado. Contacta al administrador.' });
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const commerceOrder = `TB-B${booking.id}-${Date.now()}`;

        const params = {
            apiKey,
            commerceOrder,
            subject: `Reserva TerraBlinds — ${SERVICE_LABELS[service_type]}`,
            currency: 'CLP',
            amount: AMOUNT,
            email: client_email,
            paymentMethod: 9,
            urlConfirmation: `${baseUrl}/api/bookings/payment/confirm`,
            urlReturn: `${frontendUrl}/reserva/resultado`,
        };
        params.s = signParams(params, secretKey);

        const formData = new URLSearchParams(params);
        const flowRes = await axios.post(`${apiUrl}/payment/create`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (flowRes.data.url && flowRes.data.token) {
            await booking.update({ flow_commerce_order: commerceOrder, flow_token: flowRes.data.token });
            return res.json({
                bookingId: booking.id,
                redirectUrl: `${flowRes.data.url}?token=${flowRes.data.token}`,
            });
        } else {
            await booking.destroy();
            return res.status(400).json({ error: 'Error al crear el pago en Flow' });
        }
    } catch (err) { next(err); }
};

// POST /api/bookings/payment/confirm — Flow webhook
exports.confirmPayment = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).send('Missing token');

        const { apiKey, secretKey, apiUrl } = await getFlowConfig();
        const params = { apiKey, token };
        params.s = signParams(params, secretKey);

        const formData = new URLSearchParams(params);
        const statusRes = await axios.post(`${apiUrl}/payment/getStatus`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const paymentData = statusRes.data;
        if (paymentData.commerceOrder) {
            const parts = paymentData.commerceOrder.split('-');
            // Format: TB-B{id}-{timestamp}
            const bookingId = parseInt((parts[1] || '').replace('B', ''));
            if (bookingId) {
                const booking = await Booking.findByPk(bookingId);
                if (booking && booking.status === 'pending_payment') {
                    if (paymentData.status === 2) {
                        await booking.update({ status: 'confirmed', paid_at: new Date() });
                        emailService.sendBookingConfirmation(booking).catch(e => {
                            console.error('Booking email error:', e.message);
                        });
                    }
                }
            }
        }

        res.send('OK');
    } catch (err) {
        console.error('Booking payment confirm error:', err.message);
        res.send('OK'); // Always 200 so Flow doesn't retry
    }
};

// GET /api/bookings/resultado?token=FLOW_TOKEN
exports.getPaymentResult = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token requerido' });

        const booking = await Booking.findOne({ where: { flow_token: token } });
        if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

        res.json({
            status: booking.status,
            service_type: booking.service_type,
            service_label: SERVICE_LABELS[booking.service_type],
            date: booking.date,
            time_slot: booking.time_slot,
            client_name: booking.client_name,
            client_email: booking.client_email,
            amount: booking.amount,
        });
    } catch (err) { next(err); }
};

// POST /api/bookings/suggest — Groq AI
exports.suggestService = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

        const groqKeyConfig = await Config.findOne({ where: { key: 'groq_api_key' } });
        const groqKey = groqKeyConfig?.value || process.env.GROQ_API_KEY;
        if (!groqKey) return res.json({ suggestion: null, explanation: 'Asistente IA no disponible.' });

        const systemPrompt = `Eres un asistente de TerraBlinds, empresa chilena de cortinas y persianas. Identifica qué tipo de servicio técnico necesita el cliente.
Responde SOLO en JSON con este formato exacto:
{"service_type":"visita_medidas","explanation":"frase breve"}

Opciones de service_type:
- visita_medidas: instalar productos nuevos o medir ventanas
- tecnico_persianas: reparar persianas (venecianas, romanas, enrollables) ya instaladas
- tecnico_roller: reparar cortinas roller ya instaladas
- tecnico_otros: cualquier otro servicio técnico`;

        const body = JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
            temperature: 0.1,
            max_tokens: 150,
        });

        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.groq.com',
                path: '/openai/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            };
            const reqHttp = https.request(options, resp => {
                let data = '';
                resp.on('data', chunk => { data += chunk; });
                resp.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
                });
            });
            reqHttp.on('error', reject);
            reqHttp.write(body);
            reqHttp.end();
        });

        const content = result.choices?.[0]?.message?.content || '{}';
        let parsed = {};
        try { parsed = JSON.parse(content); } catch { /* ignore */ }

        res.json({
            suggestion: SERVICE_LABELS[parsed.service_type] ? parsed.service_type : null,
            explanation: parsed.explanation || 'No se pudo determinar el servicio.',
        });
    } catch (err) {
        console.error('Groq suggest error:', err.message);
        res.json({ suggestion: null, explanation: 'Asistente IA no disponible en este momento.' });
    }
};

// ── Admin endpoints (require auth) ────────────────────────────────────────────

// GET /api/bookings/admin
exports.listBookings = async (req, res, next) => {
    try {
        const { status, date, from, to } = req.query;
        const where = {};
        if (status) where.status = status;
        if (date) where.date = date;
        else if (from && to) where.date = { [Op.between]: [from, to] };

        const bookings = await Booking.findAll({
            where,
            order: [['date', 'ASC'], ['time_slot', 'ASC']],
        });
        res.json(bookings);
    } catch (err) { next(err); }
};

// GET /api/bookings/stats
exports.getStats = async (req, res, next) => {
    try {
        const all = await Booking.findAll();
        const confirmed  = all.filter(b => b.status === 'confirmed').length;
        const pending    = all.filter(b => b.status === 'pending_payment').length;
        const completed  = all.filter(b => b.status === 'completed').length;
        const cancelled  = all.filter(b => b.status === 'cancelled').length;
        const revenue    = all.filter(b => ['confirmed', 'completed'].includes(b.status))
                              .reduce((s, b) => s + (b.amount || 0), 0);
        res.json({ total: all.length, confirmed, pending, completed, cancelled, revenue });
    } catch (err) { next(err); }
};

// PATCH /api/bookings/:id
exports.updateBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });
        const { status, notes } = req.body;
        const updates = {};
        if (status) updates.status = status;
        if (notes !== undefined) updates.notes = notes;
        await booking.update(updates);
        res.json(booking);
    } catch (err) { next(err); }
};

// POST /api/bookings/blocked-days
exports.blockDay = async (req, res, next) => {
    try {
        const { date, reason } = req.body;
        if (!date) return res.status(400).json({ error: 'Fecha requerida' });
        const [day, created] = await BlockedDay.findOrCreate({
            where: { date },
            defaults: { reason: reason || null },
        });
        if (!created) await day.update({ reason: reason || null });
        res.status(created ? 201 : 200).json(day);
    } catch (err) { next(err); }
};

// DELETE /api/bookings/blocked-days/:id
exports.unblockDay = async (req, res, next) => {
    try {
        const day = await BlockedDay.findByPk(req.params.id);
        if (!day) return res.status(404).json({ error: 'Día no encontrado' });
        await day.destroy();
        res.status(204).send();
    } catch (err) { next(err); }
};

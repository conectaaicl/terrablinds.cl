'use strict';
const axios = require('axios');

const OSW_URL = process.env.OSW_URL || 'https://osw.conectaai.cl';
const OSW_EMAIL = process.env.OSW_EMAIL || 'corp.conectaai@gmail.com';
const OSW_PASSWORD = process.env.OSW_PASSWORD || 'OmniFlow2026!';

let _token = null;
let _tokenExpiry = 0;

async function getToken() {
    if (_token && Date.now() < _tokenExpiry) return _token;
    const r = await axios.post(`${OSW_URL}/api/v1/auth/login`, {
        email: OSW_EMAIL,
        password: OSW_PASSWORD,
    }, { timeout: 8000 });
    _token = r.data.access_token;
    _tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 min
    return _token;
}

async function pushQuoteToOmniFlow(quote) {
    try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Upsert contact
        await axios.post(`${OSW_URL}/api/v1/crm/contacts`, {
            name: quote.customer_name,
            email: quote.customer_email,
            phone: quote.customer_phone || null,
            source: 'terrablinds_web',
            notes: `Cotización #${quote.id} — Total: $${Number(quote.total_amount || 0).toLocaleString('es-CL')} CLP`,
        }, { headers, timeout: 8000 });

        console.log(`[OmniFlow] Contact synced for quote #${quote.id}`);
    } catch (err) {
        // Non-blocking — just log
        console.warn(`[OmniFlow] sync failed (non-blocking): ${err.message}`);
    }
}

async function pushBookingToOmniFlow(booking) {
    try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        await axios.post(`${OSW_URL}/api/v1/crm/contacts`, {
            name: booking.client_name,
            email: booking.client_email,
            phone: booking.client_phone || null,
            source: 'terrablinds_booking',
            notes: `Reserva servicio: ${booking.service_type} el ${booking.date} ${booking.time_slot}`,
        }, { headers, timeout: 8000 });

        console.log(`[OmniFlow] Booking contact synced`);
    } catch (err) {
        console.warn(`[OmniFlow] booking sync failed (non-blocking): ${err.message}`);
    }
}

module.exports = { pushQuoteToOmniFlow, pushBookingToOmniFlow };

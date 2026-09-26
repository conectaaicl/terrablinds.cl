const axios = require('axios');

const OSW_URL = process.env.OSW_URL || 'https://osw.conectaai.cl';

exports.sendBookingWhatsApp = async ({ phone, clientName, serviceLabel, dateStr, timeSlot, address, gcalLink }) => {
    const secret = process.env.INTEGRATION_SECRET;
    if (!secret) {
        console.warn('[WA] INTEGRATION_SECRET not set, skipping WhatsApp');
        return;
    }
    const num = phone.replace(/\D/g, '');
    const fullPhone = num.startsWith('56') ? `+${num}` : `+56${num}`;

    const lines = [
        `Hola *${clientName}*! Soy TerraBlinds.`,
        '',
        'Tu visita quedo agendada y confirmada:',
        '',
        `Servicio: *${serviceLabel}*`,
        `Fecha: *${dateStr}*`,
        `Hora: *${timeSlot} hrs*`,
    ];
    if (address) lines.push(`Direccion: ${address}`);
    lines.push('');
    lines.push('Agrega la visita a tu Google Calendar:');
    lines.push(gcalLink);
    lines.push('');
    lines.push('Para reagendar escribe al +56998101891');

    const msgContent = lines.join('\n');

    await axios.post(
        `${OSW_URL}/api/v1/internal/whatsapp/send-followup`,
        { subdomain: 'osw', phone: fullPhone, content: msgContent },
        {
            headers: { 'Content-Type': 'application/json', 'x-api-secret': secret },
            timeout: 8000,
        }
    );
    console.log(`[WA] Booking confirmation sent to ${fullPhone}`);
};

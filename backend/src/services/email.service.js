const axios = require('axios');
const { Config } = require('../models');

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function getResendConfig() {
    const config = await Config.findOne({ where: { key: 'resend_api_key' } });
    const apiKey = config?.value || process.env.RESEND_API_KEY;

    const companyEmailConfig = await Config.findOne({ where: { key: 'company_email' } });
    const companyEmail = companyEmailConfig?.value || 'contacto@terrablinds.cl';

    const adminEmailConfig = await Config.findOne({ where: { key: 'admin_notification_email' } });
    const adminEmail = adminEmailConfig?.value || companyEmail;

    return { apiKey, companyEmail, adminEmail };
}

async function sendEmail({ apiKey, from, to, subject, html }) {
    if (!apiKey || apiKey === 'your-resend-api-key' || apiKey.startsWith('••••••••')) {
        console.warn('RESEND_API_KEY not configured. Skipping email.');
        return;
    }

    await axios.post(
        'https://api.resend.com/emails',
        { from, to, subject, html },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );
}

function buildQuoteItemsHtml(items) {
    return items.map(item => {
        const detail = item.width && item.height
            ? `${escapeHtml(String(item.width))}x${escapeHtml(String(item.height))} cm`
            : `${parseInt(item.quantity) || 1} unidad(es)`;
        const color = item.color ? ` — Color: ${escapeHtml(item.color)}` : '';
        return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(item.productName || item.product || 'Producto')}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${detail}${color}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${parseInt(item.quantity) || 1}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(parseFloat(item.price) || 0).toLocaleString('es-CL')}</td>
        </tr>`;
    }).join('');
}

function headerHtml(title) {
    return `<div style="background:#1e40af;color:white;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:24px;">TerraBlinds</h1>
        <p style="margin:8px 0 0;font-size:14px;">${escapeHtml(title)}</p>
    </div>`;
}

function footerHtml(companyEmail) {
    return `<div style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#666;">
        <p>TerraBlinds - Cortinas y Persianas a Medida | <a href="mailto:${escapeHtml(companyEmail)}">${escapeHtml(companyEmail)}</a></p>
        <p style="margin:0;">terrablinds.cl</p>
    </div>`;
}

// Confirmación al cliente cuando crea una cotización
exports.sendQuoteEmail = async (to, quote) => {
    const { apiKey, companyEmail } = await getResendConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const itemsHtml = buildQuoteItemsHtml(items);

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        ${headerHtml(`Confirmación de Cotización #${quote.id}`)}
        <div style="padding:24px;">
            <p>Estimado/a <strong>${escapeHtml(quote.customer_name)}</strong>,</p>
            <p>Hemos recibido tu solicitud de cotización. A continuación el detalle:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <thead>
                    <tr style="background:#f3f4f6;">
                        <th style="padding:8px;text-align:left;">Producto</th>
                        <th style="padding:8px;text-align:left;">Detalle</th>
                        <th style="padding:8px;text-align:center;">Cant.</th>
                        <th style="padding:8px;text-align:right;">Precio</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size:18px;font-weight:bold;text-align:right;">
                Total Estimado: $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p>Un ejecutivo comercial te contactará a la brevedad para confirmar los detalles y coordinar la instalación.</p>
            <p>Si tienes consultas, escríbenos a <a href="mailto:${escapeHtml(companyEmail)}">${escapeHtml(companyEmail)}</a></p>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    try {
        await sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || `TerraBlinds <noreply@terrablinds.cl>`,
            to: [to],
            subject: `Cotización #${quote.id} recibida - TerraBlinds`,
            html
        });
        console.log(`Quote confirmation email sent to ${to}`);
    } catch (error) {
        console.error('Email send error:', error.response?.data || error.message);
        throw error;
    }
};

// Notificación al admin cuando llega una cotización nueva
exports.sendAdminQuoteNotification = async (quote) => {
    const { apiKey, companyEmail, adminEmail } = await getResendConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const itemsHtml = buildQuoteItemsHtml(items);

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        ${headerHtml(`Nueva Cotización Recibida #${quote.id}`)}
        <div style="padding:24px;">
            <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin-bottom:24px;">
                <h2 style="margin:0 0 8px;color:#1e40af;">Nueva solicitud de cotización</h2>
                <p style="margin:0;color:#374151;">Acaba de llegar una nueva solicitud. Responde a la brevedad.</p>
            </div>
            <h3>Datos del cliente</h3>
            <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Nombre:</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(quote.customer_name)}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Email:</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(quote.customer_email)}">${escapeHtml(quote.customer_email)}</a></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Teléfono:</td><td style="padding:6px 0;">${escapeHtml(quote.customer_phone || 'No indicado')}</td></tr>
                ${quote.notes ? `<tr><td style="padding:6px 0;color:#6b7280;">Notas:</td><td style="padding:6px 0;">${escapeHtml(quote.notes)}</td></tr>` : ''}
            </table>
            <h3 style="margin-top:24px;">Productos solicitados</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <thead>
                    <tr style="background:#f3f4f6;">
                        <th style="padding:8px;text-align:left;">Producto</th>
                        <th style="padding:8px;text-align:left;">Detalle</th>
                        <th style="padding:8px;text-align:center;">Cant.</th>
                        <th style="padding:8px;text-align:right;">Precio</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size:20px;font-weight:bold;text-align:right;color:#1e40af;">
                Total: $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}
            </p>
            <div style="text-align:center;margin-top:24px;">
                <a href="${process.env.FRONTEND_URL || 'https://terrablinds.cl'}/admin/quotes"
                   style="background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                    Ver en el Panel Admin
                </a>
            </div>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    try {
        await sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || `TerraBlinds Sistema <noreply@terrablinds.cl>`,
            to: [adminEmail],
            subject: `[NUEVA COTIZACIÓN #${quote.id}] ${quote.customer_name} - $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}`,
            html
        });
        console.log(`Admin notification sent to ${adminEmail}`);
    } catch (error) {
        console.error('Admin notification email error:', error.response?.data || error.message);
        // Non-fatal — don't throw
    }
};

// Notificación al cliente cuando cambia el estado de su cotización
exports.sendStatusUpdateEmail = async (quote, newStatus) => {
    const { apiKey, companyEmail } = await getResendConfig();

    const statusMessages = {
        contacted: { label: 'En Revisión', msg: 'Nuestro equipo está revisando tu solicitud y se pondrá en contacto contigo pronto.' },
        sent: { label: 'Presupuesto Enviado', msg: 'Hemos preparado tu presupuesto formal. Por favor revisa tu correo o comunícate con nosotros.' },
        accepted: { label: 'Cotización Aceptada', msg: '¡Excelente! Tu cotización ha sido aceptada. Nos comunicaremos para coordinar la fabricación e instalación.' },
        rejected: { label: 'Cotización No Disponible', msg: 'Lamentablemente no podemos procesar esta solicitud. Contáctanos para buscar alternativas.' },
        completed: { label: 'Trabajo Completado', msg: '¡Tu pedido ha sido entregado e instalado! Esperamos que estés muy satisfecho/a.' }
    };

    const info = statusMessages[newStatus];
    if (!info) return; // No enviar email para estados sin mensaje definido

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        ${headerHtml(`Actualización de Cotización #${quote.id}: ${info.label}`)}
        <div style="padding:24px;">
            <p>Estimado/a <strong>${escapeHtml(quote.customer_name)}</strong>,</p>
            <p>${info.msg}</p>
            <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
                <p style="margin:0;color:#374151;"><strong>Cotización #${quote.id}</strong> — Estado: <strong>${info.label}</strong></p>
                <p style="margin:8px 0 0;color:#374151;">Total: <strong>$${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}</strong></p>
            </div>
            <p>Para consultas, contáctanos a <a href="mailto:${escapeHtml(companyEmail)}">${escapeHtml(companyEmail)}</a></p>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    try {
        await sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || `TerraBlinds <noreply@terrablinds.cl>`,
            to: [quote.customer_email],
            subject: `Cotización #${quote.id}: ${info.label} - TerraBlinds`,
            html
        });
        console.log(`Status update email sent to ${quote.customer_email} (${newStatus})`);
    } catch (error) {
        console.error('Status update email error:', error.response?.data || error.message);
        // Non-fatal
    }
};

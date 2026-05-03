const axios = require('axios');
const { Config } = require('../models');

const MAILSAAS_API_KEY = process.env.MAILSAAS_API_KEY || 'sk_live_6pplo4eac1j6m26z2j9np';
const MAILSAAS_URL     = 'https://mail.conectaai.cl/api/send';
const MAIL_FROM        = 'TerraBlinds <terrablinds@gmail.com>';

async function getConfig() {
    const companyEmailConfig = await Config.findOne({ where: { key: 'company_email' } });
    const companyEmail = companyEmailConfig?.value || 'contacto@terrablinds.cl';
    const adminEmailConfig = await Config.findOne({ where: { key: 'admin_notification_email' } });
    const adminEmail = adminEmailConfig?.value || companyEmail;
    return { companyEmail, adminEmail };
}

async function sendEmail({ to, subject, html, template_name, variables }) {
    const toArr = Array.isArray(to) ? to : [to];
    const body = { from: MAIL_FROM, to: toArr };
    if (template_name) {
        body.template_name = template_name;
        if (variables) body.variables = variables;
        if (subject) body.subject = subject;
    } else {
        body.subject = subject;
        body.html = html;
    }
    await axios.post(MAILSAAS_URL, body, {
        headers: {
            'Authorization': `Bearer ${MAILSAAS_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildItemsHtml(items) {
    if (!items || !items.length) return '<p style="color:#64748b;font-size:13px;">Sin productos detallados</p>';
    return `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#eff6ff;">
            <th style="padding:8px 12px;text-align:left;color:#1d4ed8;">Producto</th>
            <th style="padding:8px 12px;text-align:left;color:#1d4ed8;">Detalle</th>
            <th style="padding:8px 12px;text-align:right;color:#1d4ed8;">Precio</th>
        </tr></thead>
        <tbody>${items.map(item => {
            const detail = item.width && item.height
                ? `${item.width}x${item.height} cm${item.color ? ' — ' + item.color : ''}`
                : `${parseInt(item.quantity) || 1} un.`;
            return `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:8px 12px;">${escapeHtml(item.productName || item.product || 'Producto')}</td>
                <td style="padding:8px 12px;color:#64748b;">${escapeHtml(detail)}</td>
                <td style="padding:8px 12px;text-align:right;font-weight:700;">$${(parseFloat(item.price) || 0).toLocaleString('es-CL')}</td>
            </tr>`;
        }).join('')}</tbody>
    </table>`;
}

const SERVICE_LABELS = {
    visita_medidas:    'Visita tecnica toma de medidas',
    tecnico_persianas: 'Servicio tecnico persianas',
    tecnico_roller:    'Servicio tecnico cortinas roller',
    tecnico_otros:     'Servicio tecnico otros',
    instalacion:       'Instalacion de cortinas',
    automatizacion:    'Instalacion de motor / automatizacion',
};

// ── Confirmación de reserva al cliente + aviso al admin ───────────────────────

exports.sendBookingConfirmation = async (booking) => {
    const { companyEmail, adminEmail } = await getConfig();
    const serviceLabel = SERVICE_LABELS[booking.service_type] || booking.service_type;
    const dateStr = new Date(booking.date + 'T12:00:00').toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const amount = booking.amount || 0;
    const amountStr = amount > 0
        ? `$${amount.toLocaleString('es-CL')} CLP — Descontable si realizas la instalacion con nosotros`
        : 'Sin costo de visita';
    const bloquePago = amount > 0
        ? `Monto pagado: ${amountStr}`
        : 'Sin costo de visita — Nuestro equipo coordinara contigo los detalles.';

    await Promise.allSettled([
        sendEmail({
            to: [booking.client_email],
            template_name: 'confirmacion_reserva',
            variables: {
                nombre:       booking.client_name,
                servicio:     serviceLabel,
                fecha:        dateStr,
                hora:         booking.time_slot,
                direccion:    booking.client_address || 'No especificada',
                bloque_pago:  bloquePago,
                email_empresa: companyEmail,
            },
        }),
        sendEmail({
            to: [adminEmail],
            template_name: 'aviso_reserva_admin',
            variables: {
                id_reserva:   String(booking.id),
                nombre:       booking.client_name,
                email_cliente: booking.client_email,
                telefono:     booking.client_phone || 'No indicado',
                servicio:     serviceLabel,
                fecha:        dateStr,
                hora:         booking.time_slot,
                direccion:    booking.client_address || 'No especificada',
                monto:        amountStr,
            },
        }),
    ]);
    console.log(`Booking confirmation emails sent for booking #${booking.id}`);
};

// ── Cotización al cliente ─────────────────────────────────────────────────────

exports.sendQuoteEmail = async (to, quote) => {
    const { companyEmail } = await getConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const total = parseFloat(quote.total_amount || 0);
    const totalStr = total > 0 ? `$${total.toLocaleString('es-CL')}` : 'Requiere visita tecnica';

    await sendEmail({
        to: [to],
        template_name: 'confirmacion_cotizacion',
        variables: {
            nombre:         quote.customer_name,
            id_cotizacion:  String(quote.id),
            items_tabla:    buildItemsHtml(items),
            total:          totalStr,
            email_empresa:  companyEmail,
        },
    });
    console.log(`Quote confirmation email sent to ${to}`);
};

// ── Notificación admin cotización nueva ───────────────────────────────────────

exports.sendAdminQuoteNotification = async (quote) => {
    const { companyEmail, adminEmail } = await getConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const total = parseFloat(quote.total_amount || 0);

    // Simple inline for admin (no template needed — admin-only)
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1d4ed8;">Nueva Cotizacion #${quote.id}</h2>
        <p><strong>Cliente:</strong> ${escapeHtml(quote.customer_name)} — ${escapeHtml(quote.customer_email)}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(quote.customer_phone || 'No indicado')}</p>
        ${buildItemsHtml(items)}
        <p style="font-size:20px;font-weight:bold;color:#1d4ed8;">Total: $${total.toLocaleString('es-CL')}</p>
        <a href="${process.env.FRONTEND_URL || 'https://terrablinds.cl'}/admin/quotes"
           style="background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
           Ver en Panel Admin
        </a>
    </div>`;

    await sendEmail({
        to: [adminEmail],
        subject: `[NUEVA COTIZACION #${quote.id}] ${quote.customer_name} — $${total.toLocaleString('es-CL')}`,
        html,
    });
    console.log(`Admin quote notification sent to ${adminEmail}`);
};

// ── Recuperación de contraseña ────────────────────────────────────────────────

exports.sendPasswordResetEmail = async (toEmail, resetUrl) => {
    await sendEmail({
        to: [toEmail],
        template_name: 'reset_password',
        variables: { reset_url: resetUrl },
    });
    console.log(`Password reset email sent to ${toEmail}`);
};

// ── Actualización de estado de cotización ─────────────────────────────────────

exports.sendStatusUpdateEmail = async (quote, newStatus) => {
    const { companyEmail } = await getConfig();

    const statusMessages = {
        contacted: { label: 'En Revision',           msg: 'Nuestro equipo esta revisando tu solicitud y se pondra en contacto pronto.' },
        sent:      { label: 'Presupuesto Enviado',    msg: 'Hemos preparado tu presupuesto formal. Revisa tu correo o contactanos.' },
        accepted:  { label: 'Cotizacion Aceptada',    msg: 'Tu cotizacion ha sido aceptada. Coordinaremos fabricacion e instalacion.' },
        rejected:  { label: 'No Disponible',          msg: 'No podemos procesar esta solicitud. Contactanos para buscar alternativas.' },
        completed: { label: 'Trabajo Completado',     msg: 'Tu pedido ha sido entregado e instalado. Gracias por elegirnos.' },
    };

    const info = statusMessages[newStatus];
    if (!info) return;

    await sendEmail({
        to: [quote.customer_email],
        template_name: 'actualizacion_cotizacion',
        variables: {
            nombre:         quote.customer_name,
            id_cotizacion:  String(quote.id),
            estado:         info.label,
            mensaje:        info.msg,
            total:          `$${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}`,
            email_empresa:  companyEmail,
        },
    });
    console.log(`Status update email sent to ${quote.customer_email} (${newStatus})`);
};

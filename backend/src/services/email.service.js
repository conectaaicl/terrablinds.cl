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

const LOGO_URL = 'https://terrablinds.cl/uploads/image-1773550576065-529383678.jpeg';

function headerHtml(title) {
    return `<div style="background:#0d3a8a;color:white;padding:28px 24px 20px;text-align:center;">
        <img src="${LOGO_URL}" alt="TerraBlinds" style="height:64px;width:auto;object-fit:contain;border-radius:10px;margin-bottom:14px;display:inline-block;" />
        <p style="margin:0;font-size:15px;color:#bfdbfe;font-family:Arial,sans-serif;">${escapeHtml(title)}</p>
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
    const total = parseFloat(quote.total_amount || 0);
    const hasPrice = total > 0;
    const dateStr = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        ${headerHtml(`Cotización #${quote.id}`)}

        <div style="padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fecha de emisión: ${dateStr}</p>
            <p style="margin:0 0 24px;font-size:15px;color:#111827;">Estimado/a <strong>${escapeHtml(quote.customer_name)}</strong>, aquí está tu cotización:</p>

            <!-- Products table -->
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:8px;">
                <thead>
                    <tr style="background:#f3f4f6;">
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Producto</th>
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Medidas / Detalle</th>
                        <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;">Cant.</th>
                        <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Precio</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>

            ${hasPrice ? `
            <div style="text-align:right;padding:16px 12px 8px;border-top:2px solid #e5e7eb;margin-top:0;">
                <span style="font-size:13px;color:#6b7280;">Total estimado: </span>
                <span style="font-size:22px;font-weight:800;color:#1e40af;">$${total.toLocaleString('es-CL')}</span>
            </div>
            <p style="font-size:12px;color:#9ca3af;text-align:right;margin:4px 12px 24px;">* Precios referenciales, sujetos a confirmación en visita técnica.</p>
            ` : `
            <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px;margin:16px 0 24px;">
                <p style="margin:0;font-size:13px;color:#92400e;">⚠️ Algunos productos requieren visita técnica para calcular el precio final. Te contactaremos a la brevedad para agendar.</p>
            </div>
            `}

            <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-weight:700;color:#1e40af;font-size:14px;">¿Qué sigue?</p>
                <ol style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:1.8;">
                    <li>Revisa los productos y medidas indicados arriba</li>
                    <li>Nuestro equipo confirmará disponibilidad y te enviará el presupuesto formal</li>
                    <li>Coordinamos visita técnica e instalación en tu domicilio</li>
                </ol>
            </div>

            <p style="font-size:14px;color:#374151;margin:0 0 8px;">¿Tienes dudas o quieres modificar algo? Escríbenos:</p>
            <p style="margin:0;font-size:14px;">📧 <a href="mailto:${escapeHtml(companyEmail)}" style="color:#2563eb;">${escapeHtml(companyEmail)}</a></p>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    try {
        await sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || `TerraBlinds <noreply@terrablinds.cl>`,
            to: [to],
            subject: `Tu cotización #${quote.id} de TerraBlinds — ${parseFloat(quote.total_amount || 0) > 0 ? '$' + parseFloat(quote.total_amount || 0).toLocaleString('es-CL') : 'Requiere visita técnica'}`,
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

// Email de recuperación de contraseña
exports.sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const { apiKey, companyEmail } = await getResendConfig();

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        ${headerHtml('Recuperación de Contraseña')}
        <div style="padding:24px;">
            <p>Recibimos una solicitud para restablecer la contraseña del administrador de TerraBlinds.</p>
            <p>Haz clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${escapeHtml(resetUrl)}"
                   style="background:#2563eb;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                    Restablecer Contraseña
                </a>
            </div>
            <p style="color:#6b7280;font-size:13px;">Si no solicitaste este cambio, ignora este correo. Tu contraseña no cambiará.</p>
            <p style="color:#6b7280;font-size:13px;">Si el botón no funciona, copia este enlace en tu navegador:<br>
                <a href="${escapeHtml(resetUrl)}" style="color:#2563eb;word-break:break-all;">${escapeHtml(resetUrl)}</a>
            </p>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    await sendEmail({
        apiKey,
        from: process.env.RESEND_FROM_EMAIL || `TerraBlinds <noreply@terrablinds.cl>`,
        to: [toEmail],
        subject: 'Recuperación de contraseña - TerraBlinds Admin',
        html
    });
    console.log(`Password reset email sent to ${toEmail}`);
};

// Confirmación de reserva al cliente (y aviso al admin)
exports.sendBookingConfirmation = async (booking) => {
    const { apiKey, companyEmail, adminEmail } = await getResendConfig();

    const SERVICE_LABELS = {
        visita_medidas:    'Visita técnica toma de medidas',
        tecnico_persianas: 'Servicio técnico persianas',
        tecnico_roller:    'Servicio técnico cortinas roller',
        tecnico_otros:     'Servicio técnico otros',
    };
    const serviceLabel = SERVICE_LABELS[booking.service_type] || booking.service_type;
    const dateStr = new Date(booking.date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const amount = (booking.amount || 15000).toLocaleString('es-CL');

    const clientHtml = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        ${headerHtml('Reserva Confirmada')}
        <div style="padding:28px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#111827;">Hola <strong>${escapeHtml(booking.client_name)}</strong>,</p>
            <p style="margin:0 0 24px;color:#374151;">Tu reserva ha sido confirmada. Te esperamos en la fecha indicada.</p>
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <div style="margin-bottom:10px;"><span style="color:#6b7280;font-size:13px;">Servicio:</span><br><strong style="font-size:15px;color:#111827;">${escapeHtml(serviceLabel)}</strong></div>
                <div style="margin-bottom:10px;"><span style="color:#6b7280;font-size:13px;">Fecha:</span><br><strong style="color:#111827;">${escapeHtml(dateStr)}</strong></div>
                <div style="margin-bottom:10px;"><span style="color:#6b7280;font-size:13px;">Hora:</span><br><strong style="color:#111827;">${escapeHtml(booking.time_slot)} hrs</strong></div>
                ${booking.client_address ? `<div><span style="color:#6b7280;font-size:13px;">Dirección:</span><br><strong style="color:#111827;">${escapeHtml(booking.client_address)}</strong></div>` : ''}
            </div>
            <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#1e40af;"><strong>Monto pagado:</strong> $${amount} CLP — Visita técnica incluida (descontable si realizas la instalación con nosotros)</p>
            </div>
            <p style="font-size:13px;color:#6b7280;margin:0;">¿Necesitas reagendar? Escríbenos a <a href="mailto:${escapeHtml(companyEmail)}" style="color:#2563eb;">${escapeHtml(companyEmail)}</a></p>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    const adminHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        ${headerHtml('Nueva Reserva Confirmada')}
        <div style="padding:24px;">
            <h3 style="margin:0 0 16px;">Reserva #${booking.id}</h3>
            <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Servicio:</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(serviceLabel)}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Fecha:</td><td style="padding:6px 0;">${escapeHtml(dateStr)} — ${escapeHtml(booking.time_slot)} hrs</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Cliente:</td><td style="padding:6px 0;">${escapeHtml(booking.client_name)}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Email:</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(booking.client_email)}">${escapeHtml(booking.client_email)}</a></td></tr>
                ${booking.client_phone ? `<tr><td style="padding:6px 0;color:#6b7280;">Teléfono:</td><td style="padding:6px 0;">${escapeHtml(booking.client_phone)}</td></tr>` : ''}
                ${booking.client_address ? `<tr><td style="padding:6px 0;color:#6b7280;">Dirección:</td><td style="padding:6px 0;">${escapeHtml(booking.client_address)}</td></tr>` : ''}
                ${booking.notes ? `<tr><td style="padding:6px 0;color:#6b7280;">Notas:</td><td style="padding:6px 0;">${escapeHtml(booking.notes)}</td></tr>` : ''}
                <tr><td style="padding:6px 0;color:#6b7280;">Monto:</td><td style="padding:6px 0;font-weight:bold;">$${amount} CLP</td></tr>
            </table>
            <div style="text-align:center;margin-top:24px;">
                <a href="${process.env.FRONTEND_URL || 'https://terrablinds.cl'}/admin/bookings"
                   style="background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                    Ver en el Panel Admin
                </a>
            </div>
        </div>
        ${footerHtml(companyEmail)}
    </div>`;

    await Promise.allSettled([
        sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || 'TerraBlinds <noreply@terrablinds.cl>',
            to: [booking.client_email],
            subject: `Reserva confirmada — ${serviceLabel} el ${dateStr}`,
            html: clientHtml,
        }),
        sendEmail({
            apiKey,
            from: process.env.RESEND_FROM_EMAIL || 'TerraBlinds Sistema <noreply@terrablinds.cl>',
            to: [adminEmail],
            subject: `[NUEVA RESERVA #${booking.id}] ${booking.client_name} — ${serviceLabel}`,
            html: adminHtml,
        }),
    ]);
    console.log(`Booking confirmation emails sent for booking #${booking.id}`);
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

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
    // mail.conectaai.cl expects `to` as a single string (first recipient)
    const toStr = Array.isArray(to) ? to[0] : to;
    const body = { from: MAIL_FROM, to: toStr, subject, html };
    if (template_name) {
        body.template_name = template_name;
        if (variables) body.variables = variables;
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

function buildQuoteItemsHtml(items) {
    if (!items || !items.length) return '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">Sin productos detallados</td></tr>';
    return items.map((item, idx) => {
        const detail = item.width && item.height
            ? `${item.width} × ${item.height} cm${item.color ? ' &mdash; ' + escapeHtml(item.color) : ''}`
            : `${parseInt(item.quantity) || 1} unidad(es)`;
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `<tr style="background:${bg};">
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600;color:#1e293b;">${escapeHtml(item.productName || item.product || 'Producto')}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">${detail}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;color:#334155;">${qty}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:700;color:#1e3a5f;">$${(price * qty).toLocaleString('es-CL')}</td>
        </tr>`;
    }).join('');
}

function buildCustomerQuoteHtml(quote, items, companyEmail, frontendUrl) {
    const total = parseFloat(quote.total_amount || 0);
    const totalStr = total > 0 ? `$${total.toLocaleString('es-CL')}` : 'Precio a confirmar';
    const dateStr = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    const itemCount = items.length;

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Cotizacion TerraBlinds #${quote.id}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#0d2a5e 0%,#1e3a8a 60%,#1d4ed8 100%);padding:36px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td><img src="https://terrablinds.cl/logoterrablinds.png" alt="TerraBlinds" height="52" style="border-radius:8px;display:block;" /></td>
        <td align="right" style="vertical-align:middle;">
          <div style="color:#93c5fd;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Cotizacion</div>
          <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">#${quote.id}</div>
          <div style="color:#bfdbfe;font-size:12px;margin-top:2px;">${dateStr}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO MESSAGE -->
  <tr><td style="background:#1e3a8a;padding:20px 40px 28px;">
    <p style="margin:0;color:#dbeafe;font-size:15px;line-height:1.6;">Hola <strong style="color:#ffffff;">${escapeHtml(quote.customer_name)}</strong>,<br>
    hemos recibido tu solicitud de cotizacion con <strong style="color:#fbbf24;">${itemCount} producto${itemCount !== 1 ? 's' : ''}</strong>. A continuacion encontraras el detalle.</p>
  </td></tr>

  <!-- BODY -->
  <tr><td style="padding:32px 40px;">

    <!-- CUSTOMER INFO -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:0 0 12px;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Datos del cliente</span>
        </td>
      </tr>
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-size:12px;color:#64748b;font-weight:600;width:30%;">Nombre</td>
              <td style="padding:12px 16px;font-size:13px;color:#1e293b;font-weight:600;">${escapeHtml(quote.customer_name)}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;">Email</td>
              <td style="padding:12px 16px;font-size:13px;color:#1e293b;border-top:1px solid #e2e8f0;">${escapeHtml(quote.customer_email)}</td>
            </tr>
            ${quote.customer_phone ? `<tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-size:12px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;">Telefono</td>
              <td style="padding:12px 16px;font-size:13px;color:#1e293b;border-top:1px solid #e2e8f0;">${escapeHtml(quote.customer_phone)}</td>
            </tr>` : ''}
            ${quote.notes ? `<tr>
              <td style="padding:12px 16px;font-size:12px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;vertical-align:top;">Notas</td>
              <td style="padding:12px 16px;font-size:13px;color:#1e293b;border-top:1px solid #e2e8f0;">${escapeHtml(quote.notes)}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- PRODUCTS TABLE -->
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Productos solicitados</span>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#1e3a8a;">
          <th style="padding:11px 16px;text-align:left;font-size:11px;font-weight:700;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.05em;">Producto</th>
          <th style="padding:11px 16px;text-align:left;font-size:11px;font-weight:700;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.05em;">Detalle</th>
          <th style="padding:11px 16px;text-align:center;font-size:11px;font-weight:700;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.05em;">Cant.</th>
          <th style="padding:11px 16px;text-align:right;font-size:11px;font-weight:700;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.05em;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${buildQuoteItemsHtml(items)}
      </tbody>
    </table>

    <!-- TOTAL -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:0;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;">
      <tr style="background:linear-gradient(90deg,#0d2a5e,#1e3a8a);">
        <td colspan="3" style="padding:16px 16px;font-size:13px;font-weight:700;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.05em;">Total estimado</td>
        <td style="padding:16px 16px;text-align:right;font-size:22px;font-weight:900;color:#fbbf24;white-space:nowrap;">${totalStr}</td>
      </tr>
    </table>

    ${total === 0 ? `<p style="margin:12px 0 0;font-size:12px;color:#94a3b8;font-style:italic;">* El precio final se confirmara tras revision tecnica y medicion en terreno.</p>` : ''}

    <!-- PAYMENT METHODS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:16px 20px 8px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Medios de pago aceptados</span>
      </td></tr>
      <tr><td style="padding:8px 20px 16px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 12px 4px 0;font-size:12px;color:#475569;font-weight:600;">&#128970; Transferencia bancaria</td>
            <td style="padding:4px 12px;font-size:12px;color:#475569;font-weight:600;">&#128179; WebPay (Visa / MC)</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;font-size:12px;color:#475569;font-weight:600;">&#9889; Flow (tarjetas / debito)</td>
            <td style="padding:4px 12px;font-size:12px;color:#475569;font-weight:600;">&#127482; MercadoPago</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr><td align="center">
        <a href="${frontendUrl}/quote" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#1e3a8a);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:-0.01em;">
          Ver cotizacion online &rarr;
        </a>
      </td></tr>
      <tr><td align="center" style="padding-top:12px;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">Nuestro equipo revisara tu solicitud y se pondra en contacto a la brevedad.</p>
      </td></tr>
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0d2a5e;padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="margin:0;color:#93c5fd;font-size:13px;font-weight:700;">TerraBlinds</p>
          <p style="margin:4px 0 0;color:#60a5fa;font-size:12px;">Diseno y Proteccion a Tu Medida</p>
        </td>
        <td align="right">
          <p style="margin:0;color:#60a5fa;font-size:12px;">${escapeHtml(companyEmail)}</p>
          <p style="margin:4px 0 0;"><a href="https://terrablinds.cl" style="color:#93c5fd;font-size:12px;text-decoration:none;">terrablinds.cl</a></p>
        </td>
      </tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

exports.sendQuoteEmail = async (to, quote) => {
    const { companyEmail, adminEmail } = await getConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const frontendUrl = process.env.FRONTEND_URL || 'https://terrablinds.cl';
    const total = parseFloat(quote.total_amount || 0);
    const totalStr = total > 0 ? `$${total.toLocaleString('es-CL')}` : 'Precio a confirmar';

    await sendEmail({
        to: [to],
        subject: `Tu cotizacion TerraBlinds #${quote.id} esta lista`,
        html: buildCustomerQuoteHtml(quote, items, companyEmail, frontendUrl),
    });
    console.log(`Quote confirmation email sent to ${to}`);
};

// ── Notificación admin cotización nueva ───────────────────────────────────────

exports.sendAdminQuoteNotification = async (quote) => {
    const { companyEmail, adminEmail } = await getConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const total = parseFloat(quote.total_amount || 0);
    const totalStr = total > 0 ? `$${total.toLocaleString('es-CL')}` : 'Sin precio';
    const frontendUrl = process.env.FRONTEND_URL || 'https://terrablinds.cl';
    const dateStr = new Date().toLocaleString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nueva Cotizacion #${quote.id}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <tr><td style="background:linear-gradient(135deg,#0d2a5e,#1d4ed8);padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td><img src="https://terrablinds.cl/logoterrablinds.png" alt="TerraBlinds" height="44" style="border-radius:6px;display:block;" /></td>
        <td align="right" style="vertical-align:middle;">
          <div style="background:rgba(251,191,36,0.2);border:1px solid #fbbf24;border-radius:6px;padding:6px 14px;display:inline-block;">
            <span style="color:#fbbf24;font-size:12px;font-weight:700;">NUEVA COTIZACION #${quote.id}</span>
          </div>
          <div style="color:#bfdbfe;font-size:11px;margin-top:4px;">${dateStr}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 32px;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #bfdbfe;">
          <span style="font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;">Cliente</span><br>
          <span style="font-size:15px;font-weight:700;color:#1e293b;">${escapeHtml(quote.customer_name)}</span>
        </td>
        <td style="padding:14px 18px;border-bottom:1px solid #bfdbfe;border-left:1px solid #bfdbfe;">
          <span style="font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;">Email</span><br>
          <span style="font-size:13px;color:#1e293b;">${escapeHtml(quote.customer_email)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;">
          <span style="font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;">Telefono</span><br>
          <span style="font-size:13px;color:#1e293b;">${escapeHtml(quote.customer_phone || 'No indicado')}</span>
        </td>
        <td style="padding:14px 18px;border-left:1px solid #bfdbfe;">
          <span style="font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;">Total estimado</span><br>
          <span style="font-size:18px;font-weight:900;color:#1e3a8a;">${totalStr}</span>
        </td>
      </tr>
      ${quote.notes ? `<tr><td colspan="2" style="padding:14px 18px;border-top:1px solid #bfdbfe;">
        <span style="font-size:11px;color:#3b82f6;font-weight:700;text-transform:uppercase;">Notas</span><br>
        <span style="font-size:13px;color:#374151;">${escapeHtml(quote.notes)}</span>
      </td></tr>` : ''}
    </table>

    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Productos solicitados</span>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#1e3a8a;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#bfdbfe;font-weight:700;">Producto</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#bfdbfe;font-weight:700;">Detalle</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;color:#bfdbfe;font-weight:700;">Cant.</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;color:#bfdbfe;font-weight:700;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${buildQuoteItemsHtml(items)}
      </tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:0;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;">
      <tr style="background:linear-gradient(90deg,#0d2a5e,#1e3a8a);">
        <td colspan="3" style="padding:14px 14px;font-size:13px;font-weight:700;color:#bfdbfe;">Total estimado</td>
        <td style="padding:14px 14px;text-align:right;font-size:20px;font-weight:900;color:#fbbf24;">${totalStr}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center">
        <a href="${frontendUrl}/admin/quotes" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0d2a5e);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:9px;">
          Ver en Panel Admin &rarr;
        </a>
      </td></tr>
    </table>

  </td></tr>

  <tr><td style="background:#0d2a5e;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#60a5fa;font-size:12px;">TerraBlinds Admin &mdash; Notificacion automatica &mdash; <a href="https://terrablinds.cl" style="color:#93c5fd;">terrablinds.cl</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    await sendEmail({
        to: [adminEmail],
        subject: `[NUEVA COTIZACION #${quote.id}] ${quote.customer_name} — ${totalStr}`,
        html,
    });
    console.log(`Admin quote notification sent to ${adminEmail}`);
};

// ── Reenvío de cotización (admin) ─────────────────────────────────────────────

exports.resendQuoteEmail = async (quote) => {
    const { companyEmail, adminEmail } = await getConfig();
    const items = Array.isArray(quote.items) ? quote.items : [];
    const frontendUrl = process.env.FRONTEND_URL || 'https://terrablinds.cl';

    await sendEmail({
        to: [quote.customer_email],
        subject: `[Reenvio] Tu cotizacion TerraBlinds #${quote.id}`,
        html: buildCustomerQuoteHtml(quote, items, companyEmail, frontendUrl),
    });
    console.log(`Quote email resent to ${quote.customer_email} for quote #${quote.id}`);
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

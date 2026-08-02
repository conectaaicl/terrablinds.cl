const axios = require('axios');
const { Config } = require('../models');

const MAILSAAS_API_KEY = process.env.MAILSAAS_API_KEY || 'sk_live_6pplo4eac1j6m26z2j9np';
const MAILSAAS_URL     = 'https://mail.conectaai.cl/api/send';
const MAIL_FROM        = process.env.MAIL_FROM || 'TerraBlinds <contacto@terrablinds.cl>';

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
    const d = new Date();
    const pad2 = n => String(n).padStart(2, "0");
    const fmt = n => Math.round(parseFloat(n||0)).toLocaleString("es-CL");
    const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const qNum = quote.quote_number || ("TB-" + String(quote.id).padStart(4,"0"));
    const total = parseFloat(quote.total_amount||0);
    const subtotal = total > 0 ? total / 1.19 : 0;
    const iva = total > 0 ? total - subtotal : 0;

    const rows = [...items];
    while (rows.length < 8) rows.push(null);
    const rowsHtml = rows.map((it,i) => {
      if (!it) return `<tr style="height:18px"><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
      const bg = i%2===0?"#ffffff":"#f9f9f9";
      const qty = parseInt(it.quantity)||1;
      const price = parseFloat(it.price)||0;
      const sub = price*qty;
      return `<tr style="background:${bg}">
        <td style="text-align:center;padding:4px 5px;border:1px solid #ebebeb">${qty}</td>
        <td style="text-align:center;padding:4px 5px;border:1px solid #ebebeb;font-size:9px">${it.sku||""}</td>
        <td style="padding:4px 5px;border:1px solid #ebebeb"><b>${esc(it.productName)}</b>${it.color?` <span style="font-size:9px;color:#666">${esc(it.color)}</span>`:""}</td>
        <td style="text-align:center;padding:4px 5px;border:1px solid #ebebeb">${it.width||""}</td>
        <td style="text-align:center;padding:4px 5px;border:1px solid #ebebeb">${it.height||""}</td>
        <td style="text-align:right;padding:4px 5px;border:1px solid #ebebeb">${price>0?fmt(price):""}</td>
        <td style="text-align:right;padding:4px 5px;border:1px solid #ebebeb;font-weight:700">${sub>0?fmt(sub):"A confirmar"}</td>
      </tr>`;
    }).join("");

    const totalStr = total > 0 ? fmt(total) : "A confirmar tras medicion";

    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cotizacion ${qNum}</title></head>
<body style="margin:0;padding:20px;background:#e5e7eb;font-family:Arial,sans-serif;font-size:11px;color:#000">
<div style="width:680px;margin:0 auto;background:#fff;padding:20px">

<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #000"><tr>
  <td style="width:140px;padding:8px;text-align:center;border-right:1px solid #ccc"><img src="https://terrablinds.cl/logoterrablinds.png" style="max-height:48px;max-width:120px" /></td>
  <td style="padding:8px 12px;text-align:center"><div style="font-size:13px;font-weight:900">TERRABLINDS SpA</div><div style="font-size:9px;color:#444;margin-top:2px">Fabricacion de Cortinas Roller a Medida, Toldos Verticales y Proyectantes, Persianas Interiores y Exteriores<br>Camaras de Seguridad, Alarmas e Iluminacion Solar</div></td>
  <td style="width:140px;padding:8px;text-align:center;border-left:1px solid #ccc"><img src="https://terrablinds.cl/logoterrablinds.png" style="max-height:48px;max-width:120px" /></td>
</tr></table>

<div style="background:#e0e0e0;text-align:center;font-size:13px;font-weight:900;padding:5px;border:1.5px solid #000;border-top:none;letter-spacing:1px">COTIZACION N&deg; ${qNum}</div>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #000;border-top:none"><tr>
  <td style="width:68%"><table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-weight:900;font-style:italic;font-size:10px;padding:3px 6px;border-right:1px solid #eee;border-bottom:1px solid #eee;width:70px">NOMBRE:</td><td style="padding:3px 8px;font-size:10px;border-bottom:1px solid #eee">${esc(quote.customer_name)}</td></tr>
    <tr><td style="font-weight:900;font-style:italic;font-size:10px;padding:3px 6px;border-right:1px solid #eee;border-bottom:1px solid #eee">DIRECCION:</td><td style="padding:3px 8px;font-size:10px;border-bottom:1px solid #eee">${esc(quote.customer_address||"")}</td></tr>
    <tr><td style="font-weight:900;font-style:italic;font-size:10px;padding:3px 6px;border-right:1px solid #eee;border-bottom:1px solid #eee">CORREO:</td><td style="padding:3px 8px;font-size:10px;border-bottom:1px solid #eee">${esc(quote.customer_email)}</td></tr>
    <tr><td style="font-weight:900;font-style:italic;font-size:10px;padding:3px 6px;border-right:1px solid #eee;border-bottom:1px solid #eee">TELEFONO:</td><td style="padding:3px 8px;font-size:10px;border-bottom:1px solid #eee">${esc(quote.customer_phone||"")}</td></tr>
    <tr><td style="font-weight:900;font-style:italic;font-size:10px;padding:3px 6px;border-right:1px solid #eee">COMUNA:</td><td style="padding:3px 8px;font-size:10px">${esc(quote.customer_commune||"")}</td></tr>
  </table></td>
  <td style="border-left:1px solid #ccc;text-align:center;vertical-align:top">
    <div style="background:#e0e0e0;font-weight:900;font-style:italic;font-size:10px;text-align:right;padding:3px 6px;border-bottom:1px solid #ccc">FECHA COTIZACION</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;font-size:9px;font-weight:900;padding:2px;border-right:1px solid #ccc;border-bottom:1px solid #ccc">DIA</td><td style="text-align:center;font-size:9px;font-weight:900;padding:2px;border-right:1px solid #ccc;border-bottom:1px solid #ccc">MES</td><td style="text-align:center;font-size:9px;font-weight:900;padding:2px;border-bottom:1px solid #ccc">ANO</td></tr>
      <tr><td style="text-align:center;padding:3px;border-right:1px solid #ccc">${pad2(d.getDate())}</td><td style="text-align:center;padding:3px;border-right:1px solid #ccc">${pad2(d.getMonth()+1)}</td><td style="text-align:center;padding:3px">${d.getFullYear()}</td></tr>
    </table>
    <div style="font-weight:900;font-style:italic;font-size:10px;text-align:center;padding:4px">VALIDO POR 7 DIAS</div>
  </td>
</tr></table>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #000;border-top:none;font-size:10px">
<thead><tr style="background:#e0e0e0">
  <th style="padding:4px 5px;border:1px solid #ccc;width:40px">CANTIDAD</th>
  <th style="padding:4px 5px;border:1px solid #ccc;width:50px">COD</th>
  <th style="padding:4px 5px;border:1px solid #ccc">PRODUCTO</th>
  <th style="padding:4px 5px;border:1px solid #ccc;width:42px">(ANCHO)</th>
  <th style="padding:4px 5px;border:1px solid #ccc;width:42px">MEDIDAS<br>(ALTO)</th>
  <th style="padding:4px 5px;border:1px solid #ccc;width:78px">VALOR UNIT. M2</th>
  <th style="padding:4px 5px;border:1px solid #ccc;width:70px">TOTAL</th>
</tr></thead>
<tbody>${rowsHtml}</tbody>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #000;border-top:none;font-size:10px">
<tr>
  <td style="width:55%;padding:8px 10px;vertical-align:top">
    <b style="font-size:11px">Metodos de Pago</b><br><br>
    <span style="background:#f5f5f5;border:1px solid #bbb;padding:2px 8px;font-size:9.5px;font-weight:700;margin:2px;display:inline-block">Efectivo</span>
    <span style="background:#e3f2fd;border:1px solid #90caf9;color:#1565c0;padding:2px 8px;font-size:9.5px;font-weight:700;margin:2px;display:inline-block">Transferencia</span>
    <span style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:2px 8px;font-size:9.5px;font-weight:700;margin:2px;display:inline-block">Tarjeta Debito</span>
    <span style="background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32;padding:2px 8px;font-size:9.5px;font-weight:700;margin:2px;display:inline-block">Tarjeta Credito</span>
  </td>
  <td style="border-left:1px solid #ccc;padding:0;vertical-align:top">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#f5f5f5;padding:4px 10px;font-weight:600">SUB-TOTAL</td><td style="background:#f5f5f5;padding:4px 10px;text-align:right;font-weight:600">${total>0?fmt(subtotal):"A confirmar"}</td></tr>
      <tr><td style="background:#f5f5f5;padding:4px 10px;font-weight:600">IVA (19%)</td><td style="background:#f5f5f5;padding:4px 10px;text-align:right;font-weight:600">${total>0?fmt(iva):"-"}</td></tr>
      <tr><td style="background:#1d4ed8;color:#fff;padding:6px 10px;font-weight:900;font-size:13px">TOTAL</td><td style="background:#1d4ed8;color:#fff;padding:6px 10px;text-align:right;font-weight:900;font-size:13px">${totalStr}</td></tr>
    </table>
  </td>
</tr>
<tr><td colspan="2" style="background:#c8e6c9;font-weight:900;font-size:11px;text-align:center;padding:5px;letter-spacing:.5px">TERMINOS Y CONDICIONES GENERALES</td></tr>
<tr><td colspan="2" style="padding:8px 12px;font-size:10px;line-height:1.8">
  1.- Garantia de 3 anos en Mecanismos y Cadenas.<br>
  2.- Los valores pueden variar una vez rectificadas las medidas en terreno.<br>
  3.- Contamos con todo metodo de pago: efectivo, transferencia, tarjeta de debito y credito.<br>
  4.- Productos fabricados a medida; una vez confeccionados no se realiza devolucion del dinero.<br>
  5.- Instalacion gratis en la Region Metropolitana. Otras regiones consultar costo de traslado.
</td></tr>
<tr><td colspan="2" style="background:#ffe0b2;font-weight:900;font-size:11px;text-align:center;padding:5px">CONDICIONES DE PAGO</td></tr>
<tr><td colspan="2" style="padding:8px 12px;font-size:10px;line-height:1.8">50% de adelanto para iniciar la confeccion.<br>50% el dia de la instalacion.</td></tr>
<tr><td colspan="2" style="text-align:center;padding:10px;background:#f9f9f9">
  <div style="font-weight:900;font-size:11px;margin-bottom:3px">Quedaste con dudas?</div>
  <div style="font-size:10px;font-style:italic">Escribenos indicandonos tu nombre y apellido y te brindaremos asistencia.</div>
  <div style="font-size:15px;font-weight:900;margin-top:3px">+56 9 9810 1891</div>
  <div style="font-size:10px;color:#555;margin-top:2px">${esc(companyEmail)}</div>
  <div style="font-size:10px;color:#1d4ed8;margin-top:2px">https://terrablinds.cl</div>
</td></tr>
</table>

</div></body></html>`;
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

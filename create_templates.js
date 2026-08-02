const { PrismaClient } = require("/app/node_modules/.prisma/client");
const prisma = new PrismaClient();
const workspaceId = "cmmz7si6q0002thiwc2rkj1iu";

const LOGO = "https://terrablinds.cl/uploads/image-1773550576065-529383678.jpeg";

function header(title) {
  return `
<div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);padding:32px 24px 24px;text-align:center;">
  <img src="${LOGO}" alt="TerraBlinds" style="height:70px;width:auto;border-radius:12px;margin-bottom:16px;display:inline-block;"/>
  <h1 style="margin:0;color:white;font-size:22px;font-family:Arial,sans-serif;font-weight:700;">${title}</h1>
</div>`;
}

function footer(email) {
  return `
<div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px;text-align:center;font-size:12px;color:#94a3b8;font-family:Arial,sans-serif;">
  <p style="margin:0 0 4px;"><strong style="color:#475569;">TerraBlinds</strong> — Cortinas y Persianas a Medida</p>
  <p style="margin:0;"><a href="mailto:${email}" style="color:#3b82f6;">${email}</a> | <a href="https://terrablinds.cl" style="color:#3b82f6;">terrablinds.cl</a></p>
</div>`;
}

function wrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;padding:20px;background:#f1f5f9;"><div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">${content}</div></body></html>`;
}

const templates = [
  {
    name: "confirmacion_reserva",
    subject: "Reserva confirmada — {{ servicio }} | TerraBlinds",
    htmlContent: wrap(
      header("Reserva Confirmada") +
      `<div style="padding:32px;">
  <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hola <strong>{{ nombre }}</strong>,</p>
  <p style="margin:0 0 24px;color:#475569;font-size:15px;">Tu reserva ha sido confirmada. Te esperamos en la fecha indicada.</p>

  <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px;margin-bottom:24px;">
    <h3 style="margin:0 0 16px;color:#15803d;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Detalle de tu reserva</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px;">Servicio</td><td style="padding:8px 0;font-weight:700;color:#1e293b;font-size:14px;">{{ servicio }}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Fecha</td><td style="padding:8px 0;font-weight:700;color:#1e293b;font-size:14px;">{{ fecha }}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Hora</td><td style="padding:8px 0;font-weight:700;color:#1e293b;font-size:14px;">{{ hora }} hrs</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Direccion</td><td style="padding:8px 0;color:#1e293b;font-size:14px;">{{ direccion }}</td></tr>
    </table>
  </div>

  <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:16px;">
    <p style="margin:0;font-size:14px;color:#1e40af;">{{ bloque_pago }}</p>
  </div>

  <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0 0 8px;font-weight:700;color:#1e293b;font-size:14px;">Que sigue?</p>
    <ol style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:2;">
      <li>Nuestro equipo confirmara el horario contigo</li>
      <li>El tecnico llegara puntual en el horario acordado</li>
      <li>Disfrutaras de tus cortinas instaladas profesionalmente</li>
    </ol>
  </div>

  <p style="font-size:13px;color:#94a3b8;text-align:center;">Para reagendar escribenos a <a href="mailto:{{ email_empresa }}" style="color:#3b82f6;">{{ email_empresa }}</a></p>
</div>` +
      footer("{{ email_empresa }}")
    )
  },
  {
    name: "aviso_reserva_admin",
    subject: "Nueva Reserva #{{ id_reserva }} — {{ nombre }} | {{ servicio }}",
    htmlContent: wrap(
      header("Nueva Reserva") +
      `<div style="padding:32px;">
  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
    <p style="margin:0;font-size:26px;font-weight:800;color:#92400e;">Reserva #{{ id_reserva }}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden;margin-bottom:24px;">
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;width:130px;">Cliente</td><td style="padding:12px 16px;font-weight:700;color:#1e293b;">{{ nombre }}</td></tr>
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;">Email</td><td style="padding:12px 16px;"><a href="mailto:{{ email_cliente }}" style="color:#3b82f6;">{{ email_cliente }}</a></td></tr>
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;">Telefono</td><td style="padding:12px 16px;color:#1e293b;">{{ telefono }}</td></tr>
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;">Servicio</td><td style="padding:12px 16px;font-weight:700;color:#1e293b;">{{ servicio }}</td></tr>
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;">Fecha y hora</td><td style="padding:12px 16px;color:#1e293b;">{{ fecha }} a las {{ hora }} hrs</td></tr>
    <tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:12px 16px;color:#64748b;font-size:13px;">Direccion</td><td style="padding:12px 16px;color:#1e293b;">{{ direccion }}</td></tr>
    <tr><td style="padding:12px 16px;color:#64748b;font-size:13px;">Monto</td><td style="padding:12px 16px;font-weight:800;color:#1d4ed8;font-size:18px;">{{ monto }}</td></tr>
  </table>

  <div style="text-align:center;">
    <a href="https://terrablinds.cl/admin/bookings" style="background:#1d4ed8;color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">Ver en Panel Admin</a>
  </div>
</div>` +
      footer("terrablinds@gmail.com")
    )
  },
  {
    name: "confirmacion_cotizacion",
    subject: "Tu cotizacion #{{ id_cotizacion }} — TerraBlinds",
    htmlContent: wrap(
      header("Cotizacion Recibida") +
      `<div style="padding:32px;">
  <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">Hola <strong>{{ nombre }}</strong>,</p>
  <p style="margin:0 0 24px;color:#475569;font-size:15px;">Recibimos tu solicitud. Aqui esta el resumen de tu cotizacion:</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="margin:0 0 12px;color:#64748b;font-size:13px;">N Cotizacion: <strong style="color:#1e293b;font-size:18px;">#{{ id_cotizacion }}</strong></p>
    {{ items_tabla }}
    <div style="border-top:2px solid #1d4ed8;margin-top:16px;padding-top:12px;text-align:right;">
      <span style="color:#64748b;font-size:13px;">Total estimado: </span>
      <strong style="font-size:26px;color:#1d4ed8;">{{ total }}</strong>
    </div>
  </div>

  <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0 0 8px;font-weight:700;color:#1d4ed8;font-size:14px;">Proximos pasos</p>
    <ol style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:2;">
      <li>Nuestro equipo revisara tu solicitud</li>
      <li>Te enviaremos el presupuesto formal con precios finales</li>
      <li>Coordinamos visita tecnica e instalacion profesional</li>
    </ol>
  </div>

  <p style="font-size:13px;color:#94a3b8;text-align:center;">Dudas? <a href="mailto:{{ email_empresa }}" style="color:#3b82f6;">{{ email_empresa }}</a></p>
</div>` +
      footer("{{ email_empresa }}")
    )
  },
  {
    name: "reset_password",
    subject: "Restablecer contrasena — TerraBlinds Admin",
    htmlContent: wrap(
      header("Recuperacion de Contrasena") +
      `<div style="padding:32px;text-align:center;">
  <p style="font-size:15px;color:#475569;margin:0 0 8px;">Recibimos una solicitud para restablecer tu contrasena.</p>
  <p style="font-size:13px;color:#94a3b8;margin:0 0 32px;">Este enlace expira en <strong>1 hora</strong>.</p>

  <a href="{{ reset_url }}" style="background:#1d4ed8;color:white;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;margin-bottom:32px;">Restablecer Contrasena</a>

  <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;">Si el boton no funciona, copia este enlace:</p>
  <p style="font-size:11px;color:#3b82f6;word-break:break-all;margin:0 0 24px;">{{ reset_url }}</p>

  <p style="font-size:12px;color:#cbd5e1;border-top:1px solid #f1f5f9;padding-top:16px;margin:0;">Si no solicitaste este cambio, ignora este correo.</p>
</div>` +
      footer("terrablinds@gmail.com")
    )
  },
  {
    name: "actualizacion_cotizacion",
    subject: "Cotizacion #{{ id_cotizacion }}: {{ estado }} — TerraBlinds",
    htmlContent: wrap(
      header("Actualizacion de Cotizacion") +
      `<div style="padding:32px;">
  <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Estimado/a <strong>{{ nombre }}</strong>,</p>
  <p style="margin:0 0 24px;color:#475569;font-size:15px;">{{ mensaje }}</p>

  <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px;">
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Cotizacion <strong style="color:#1e293b;">#{{ id_cotizacion }}</strong></p>
    <p style="margin:0 0 4px;font-size:14px;color:#475569;">Estado: <strong style="color:#1d4ed8;">{{ estado }}</strong></p>
    <p style="margin:0;font-size:14px;color:#475569;">Total: <strong>{{ total }}</strong></p>
  </div>

  <p style="font-size:13px;color:#94a3b8;text-align:center;">Para consultas escribenos a <a href="mailto:{{ email_empresa }}" style="color:#3b82f6;">{{ email_empresa }}</a></p>
</div>` +
      footer("{{ email_empresa }}")
    )
  }
];

async function main() {
  for (const t of templates) {
    const existing = await prisma.template.findFirst({ where: { name: t.name, workspaceId } });
    if (existing) {
      await prisma.template.update({ where: { id: existing.id }, data: { subject: t.subject, htmlContent: t.htmlContent } });
      console.log("Updated:", t.name);
    } else {
      await prisma.template.create({ data: { ...t, workspaceId } });
      console.log("Created:", t.name);
    }
  }
  await prisma.$disconnect();
  console.log("Done!");
}
main().catch(e => { console.error(e.message); process.exit(1); });

// Run: node seed-blog-2.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('./src/config/database');
const Blog = require('./src/models/blog');

const posts = [
  {
    title: 'Cortinas Blackout para Dormitorios: Guía Completa 2025',
    slug: 'cortinas-blackout-dormitorios-guia-2025',
    meta_title: 'Cortinas Blackout para Dormitorios 2025 | Guía Completa | TerraBlinds',
    meta_description: 'Todo lo que necesitas saber antes de comprar cortinas blackout para tu dormitorio: tipos, materiales, precios y cómo elegir la mejor opción en Chile.',
    keywords: 'cortinas blackout dormitorio, cortinas blackout Chile, cortinas oscurecedoras dormitorio, cortinas blackout precio Chile, cortinas roller blackout a medida',
    excerpt: 'Las cortinas blackout son la solución definitiva para dormir de día, trabajar desde casa sin reflejos o dar privacidad total a tu dormitorio. Te explicamos todo lo que debes saber antes de comprar.',
    author: 'TerraBlinds',
    is_published: true,
    published_at: new Date('2025-03-20'),
    read_time: 8,
    content: `<p>Si estás buscando cortinas blackout para tu dormitorio, ya vas por buen camino. Las cortinas blackout son la opción más efectiva para controlar la entrada de luz, mejorar la calidad del sueño y dar privacidad total a cualquier habitación. Pero no todas las "blackout" son iguales, y en este artículo te explicamos exactamente qué buscar.</p>

<h2>¿Qué son las cortinas blackout y cómo funcionan?</h2>
<p>El término "blackout" se refiere a telas que bloquean el paso de la luz solar. Una cortina blackout real puede bloquear entre el 95% y el 100% de la luz dependiendo del tipo de tela y la forma de instalación. El principio es simple: la tela tiene una capa opacizante (generalmente acrílico o espuma de poliuretano) que impide que la luz la atraviese.</p>
<p>Lo que <strong>muchas tiendas no te dicen</strong> es que aunque la tela sea 100% blackout, si la cortina no cubre bien el marco de la ventana, la luz se cuela por los laterales y la parte superior. Por eso la instalación importa tanto como la tela.</p>

<h2>Tipos de cortinas blackout disponibles en Chile</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd;text-align:left">Tipo</th><th style="padding:8px;border:1px solid #ddd">Bloqueo de luz</th><th style="padding:8px;border:1px solid #ddd">Precio aprox.</th><th style="padding:8px;border:1px solid #ddd">Ideal para</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Blackout básico</td><td style="padding:8px;border:1px solid #ddd;text-align:center">85-92%</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$30.000 - $75.000</td><td style="padding:8px;border:1px solid #ddd">Dormitorios adultos, living</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Blackout premium</td><td style="padding:8px;border:1px solid #ddd;text-align:center">97-100%</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$60.000 - $130.000</td><td style="padding:8px;border:1px solid #ddd">Piezas de bebés, turno noche</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Duo (día/noche)</td><td style="padding:8px;border:1px solid #ddd;text-align:center">0% a 100% ajustable</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$70.000 - $160.000</td><td style="padding:8px;border:1px solid #ddd">Dormitorio + oficina en casa</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Cortina tela blackout con cenefa</td><td style="padding:8px;border:1px solid #ddd;text-align:center">90-95%</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$45.000 - $120.000</td><td style="padding:8px;border:1px solid #ddd">Estética clásica, habitaciones grandes</td></tr>
  </tbody>
</table>

<h2>Blackout básico vs. blackout premium: ¿vale la pena la diferencia?</h2>
<p>La diferencia está en la densidad y el acabado de la tela. El blackout básico tiene una capa opacizante delgada que puede dejar pasar algo de luz por los bordes o en zonas de pliegue. El blackout premium usa telas más densas, a veces con triple capa, y tiene costuras selladas que eliminan los puntos de fuga de luz.</p>
<p>Para una habitación normal de adultos, el blackout básico es suficiente. Para piezas de bebés, personas que trabajan en turno de noche, o habitaciones con ventanas muy grandes orientadas al poniente, el premium vale cada peso extra.</p>

<h2>¿Cómo elegir el blackout correcto para tu dormitorio?</h2>
<ul>
  <li><strong>Orientación de la ventana:</strong> las ventanas al poniente reciben el sol más fuerte de la tarde. Para estas, es preferible el blackout premium o la instalación exterior con solape lateral.</li>
  <li><strong>Pieza de bebé o niño pequeño:</strong> el oscurecimiento total ayuda a regular el ciclo de sueño. Siempre blackout premium con instalación exterior.</li>
  <li><strong>Trabajo desde casa:</strong> si necesitas control variable de luz (oscuro para dormir, difuso para trabajar), el Roller Duo es la mejor opción.</li>
  <li><strong>Presupuesto ajustado:</strong> un blackout básico bien instalado en exterior con 5-10 cm de solape en cada lado da un resultado muy bueno a menor costo.</li>
</ul>

<h2>El error más común: instalar en interior sin solape</h2>
<p>La instalación interior (dentro del marco) es la más elegante visualmente, pero tiene una limitación: si el mecanismo queda a ras del marco, la luz se cuela por los 2-3 mm de espacio entre el tubo y la pared. La instalación exterior con solapar el marco al menos 5 cm por cada lado elimina este problema completamente.</p>
<p>En dormitorios donde el oscurecimiento total es prioritario, siempre recomendamos instalación exterior aunque no se vea tan "limpia" visualmente. La diferencia en el sueño lo justifica.</p>

<h2>¿Cuánto cuesta equipar un dormitorio completo con blackout?</h2>
<p>Para un dormitorio estándar con una ventana de 120x150 cm:</p>
<ul>
  <li><strong>Blackout básico instalado:</strong> $45.000 - $80.000</li>
  <li><strong>Blackout premium instalado:</strong> $80.000 - $150.000</li>
  <li><strong>Roller Duo instalado:</strong> $100.000 - $180.000</li>
</ul>
<p>Para una pieza principal con dos ventanas o una ventana grande de 180x200 cm, multiplica por 1.5 a 2 veces esos valores.</p>
<p style="margin-top:24px"><strong>¿Ya sabes qué quieres?</strong> En TerraBlinds fabricamos cortinas blackout a medida con instalación incluida. <a href="/quote">Cotiza gratis aquí</a> y recibe precio exacto para tu dormitorio en 24 horas.</p>`,
  },
  {
    title: 'Persianas de Exterior para Terraza y Balcón: Guía 2025',
    slug: 'persianas-exterior-terraza-balcon-chile-2025',
    meta_title: 'Persianas de Exterior para Terraza y Balcón Chile 2025 | TerraBlinds',
    meta_description: 'Guía completa para elegir persianas de exterior en Chile: tipos, materiales, precios y cómo proteger tu terraza del sol y la lluvia. Fabricación a medida.',
    keywords: 'persianas exterior terraza Chile, persianas balcón Santiago, toldos verticales terraza, cierre de terraza cortina, persianas exterior precio Chile',
    excerpt: 'Las persianas de exterior transforman una terraza o balcón expuesto en un espacio habitable todo el año. Guía completa para elegir la solución correcta según tu tipo de terraza, clima y presupuesto.',
    author: 'TerraBlinds',
    is_published: true,
    published_at: new Date('2025-04-01'),
    read_time: 7,
    content: `<p>Una terraza o balcón sin protección solar es casi inutilizable en verano. Y en invierno, el viento y la lluvia reducen aún más el tiempo que puedes disfrutarla. Las persianas de exterior resuelven ambos problemas y pueden transformar ese espacio en una extensión real de tu hogar, habitable los 365 días del año.</p>

<h2>¿Qué tipos de persianas de exterior existen?</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd;text-align:left">Tipo</th><th style="padding:8px;border:1px solid #ddd">Protección</th><th style="padding:8px;border:1px solid #ddd">Precio aprox.</th><th style="padding:8px;border:1px solid #ddd">Mejor para</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #ddd">Toldo vertical (screen)</td><td style="padding:8px;border:1px solid #ddd">Sol + privacidad</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$80.000 - $200.000</td><td style="padding:8px;border:1px solid #ddd">Terrazas abiertas, logias</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Cierre de terraza PVC</td><td style="padding:8px;border:1px solid #ddd">Sol + lluvia + viento</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$150.000 - $500.000+</td><td style="padding:8px;border:1px solid #ddd">Departamentos, terrazas todo clima</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Persiana enrollable exterior</td><td style="padding:8px;border:1px solid #ddd">Sol + oscurecimiento</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$90.000 - $250.000</td><td style="padding:8px;border:1px solid #ddd">Ventanas grandes, fachadas</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Toldo retráctil</td><td style="padding:8px;border:1px solid #ddd">Sol en techo</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$200.000 - $800.000</td><td style="padding:8px;border:1px solid #ddd">Patios, jardines, terrazas sin techo</td></tr>
  </tbody>
</table>

<h2>Toldo vertical vs. cierre de terraza: ¿cuál necesito?</h2>
<p><strong>El toldo vertical</strong> (también llamado persiana de exterior o screen exterior) es una lona enrollable que baja desde una caja en el techo o en el dintel. Protege del sol y da privacidad, pero no sella la terraza: el aire y eventualmente la lluvia de costado pueden pasar. Es la opción más económica y la más común en logias y terrazas de departamentos en Santiago.</p>
<p><strong>El cierre de terraza con PVC</strong> es una cortina de lamas transparentes (PVC cristal) que cierra completamente el espacio. Transforma la terraza en una habitación semi-exterior. Protege del viento, la lluvia y el frío. Ideal para departamentos con terraza expuesta o casas en zonas con mucho viento. Es más cara pero la inversión se amortiza al ganar metros habitables.</p>

<h2>¿Qué tela elegir para el toldo vertical?</h2>
<ul>
  <li><strong>Screen 5%:</strong> transmite poca luz, bloquea el 95% de rayos UV. Se puede ver hacia afuera pero no desde afuera. Ideal para terrazas con buena vista.</li>
  <li><strong>Screen 3%:</strong> mayor privacidad y bloqueo solar. Adecuado para terrazas muy expuestas al sol poniente.</li>
  <li><strong>Acrílico opaco:</strong> oscurecimiento total. Para terrazas usadas como sala exterior donde se necesita sombra completa.</li>
  <li><strong>PVC cristal:</strong> transparencia total, protección contra viento y lluvia. Ideal para aprovechar la vista sin perder la protección.</li>
</ul>

<h2>Consideraciones importantes antes de instalar</h2>
<ul>
  <li><strong>Permiso de la administración:</strong> en departamentos, siempre consulta si el reglamento del edificio permite instalar elementos en la fachada. Los toldos verticales enrollables que se instalan en el interior de la terraza generalmente no requieren permiso.</li>
  <li><strong>Viento:</strong> en pisos altos (desde el 5° piso en adelante), las telas screen estándar pueden vibrar o dañarse con viento fuerte. Pide telas con refuerzo perimetral o sistemas con tensores.</li>
  <li><strong>Orientación:</strong> terrazas al poniente reciben el sol más agresivo entre 15:00 y 20:00 hrs. Para estas, screen 3% o acrílico es más efectivo.</li>
  <li><strong>Medidas grandes:</strong> toldos verticales de más de 4 metros de ancho requieren sistemas especiales con guías laterales para evitar que la tela vuele con el viento.</li>
</ul>

<h2>¿Cuánto cuesta cerrar una terraza en Santiago?</h2>
<p>Para una terraza típica de departamento (3m de ancho × 2,5m de alto):</p>
<ul>
  <li><strong>Toldo vertical screen:</strong> $120.000 - $200.000 instalado</li>
  <li><strong>Toldo vertical acrílico opaco:</strong> $100.000 - $180.000 instalado</li>
  <li><strong>Cierre PVC cristal (3 paños):</strong> $280.000 - $500.000 instalado</li>
</ul>
<p>Terraza más grande (5m de ancho o con múltiples caras) puede subir 1.5 a 2 veces estos valores.</p>
<p style="margin-top:24px"><strong>¿Tienes una terraza que quieres aprovechar?</strong> En TerraBlinds fabricamos e instalamos soluciones de exterior a medida en todo Chile. <a href="/quote">Cotiza tu proyecto gratis aquí</a>.</p>`,
  },
  {
    title: 'Cortinas Roller Motorizadas: Todo lo que Debes Saber Antes de Comprar',
    slug: 'cortinas-roller-motorizadas-chile-2025',
    meta_title: 'Cortinas Roller Motorizadas Chile 2025 | Guía Completa | TerraBlinds',
    meta_description: 'Guía completa de cortinas roller motorizadas en Chile: tipos de motor, compatibilidad con domótica, precios y cuándo realmente vale la pena motorizar.',
    keywords: 'cortinas motorizadas Chile, cortinas roller motorizadas precio, motor cortinas roller, cortinas automatizadas Santiago, domótica cortinas Chile',
    excerpt: 'Las cortinas motorizadas ya no son solo para edificios corporativos o casas de lujo. Con motores desde $40.000 y compatibilidad con Alexa, Google y Apple HomeKit, la automatización de cortinas está al alcance de cualquier hogar en Chile.',
    author: 'TerraBlinds',
    is_published: true,
    published_at: new Date('2025-04-10'),
    read_time: 9,
    content: `<p>Hace cinco años, motorizar las cortinas de una casa era un lujo reservado para proyectos de alto presupuesto. Hoy, con motores compactos, baterías recargables y compatibilidad nativa con los asistentes de voz más populares, motorizar una cortina roller es una decisión que cada vez más personas en Chile están tomando. En esta guía te explicamos cuándo vale la pena y cómo elegir correctamente.</p>

<h2>¿Cómo funciona una cortina roller motorizada?</h2>
<p>Una cortina roller motorizada es idéntica a una cortina roller manual, con la diferencia de que el tubo interior tiene un motor tubular que sube y baja la cortina mediante un mando a distancia, un interruptor de pared, o una app del teléfono. El motor va dentro del tubo de aluminio, por lo que visualmente la cortina se ve igual que una manual.</p>

<h2>Tipos de motor disponibles en Chile</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd;text-align:left">Tipo de motor</th><th style="padding:8px;border:1px solid #ddd">Alimentación</th><th style="padding:8px;border:1px solid #ddd">Control</th><th style="padding:8px;border:1px solid #ddd">Precio aprox.</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #ddd">Motor con cable 220V</td><td style="padding:8px;border:1px solid #ddd">Corriente eléctrica</td><td style="padding:8px;border:1px solid #ddd">Control remoto RF / interruptor</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$40.000 - $80.000</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Motor batería recargable</td><td style="padding:8px;border:1px solid #ddd">Batería interna (USB-C)</td><td style="padding:8px;border:1px solid #ddd">Control remoto RF / app</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$60.000 - $120.000</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Motor WiFi / Zigbee</td><td style="padding:8px;border:1px solid #ddd">Cable o batería</td><td style="padding:8px;border:1px solid #ddd">App + Alexa / Google / HomeKit</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$80.000 - $150.000</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Motor solar</td><td style="padding:8px;border:1px solid #ddd">Panel solar externo</td><td style="padding:8px;border:1px solid #ddd">Control remoto RF / app</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$100.000 - $180.000</td></tr>
  </tbody>
</table>

<h2>Motor con cable vs. motor batería: ¿cuál elegir?</h2>
<p><strong>Motor con cable 220V:</strong> requiere que haya un punto de electricidad cerca de la ventana (o que se instale uno). Es la opción más económica a largo plazo porque no necesitas cargar nada. Ideal para construcciones nuevas o remodelaciones donde se puede llevar cableado.</p>
<p><strong>Motor con batería recargable:</strong> no necesita instalación eléctrica. Se carga con cable USB-C cada 3-6 meses dependiendo del uso. Perfecto para departamentos o ventanas donde no hay corriente cerca. La comodidad de no cablear compensa el costo adicional.</p>

<h2>¿Vale la pena la compatibilidad con domótica?</h2>
<p>Si ya tienes o planeas tener dispositivos inteligentes en tu casa (Alexa, Google Home, Apple HomeKit), la respuesta es sí. Las ventajas concretas son:</p>
<ul>
  <li><strong>Rutinas automáticas:</strong> las cortinas suben solas a las 7am y bajan al atardecer, sin que tengas que hacer nada.</li>
  <li><strong>Control por voz:</strong> "Alexa, sube las cortinas del dormitorio" desde la cama.</li>
  <li><strong>Control remoto desde el teléfono:</strong> estás de vacaciones y quieres que parezca que hay alguien en casa.</li>
  <li><strong>Integración con termostatos:</strong> las cortinas bajan automáticamente cuando hace calor para mantener la temperatura interior.</li>
</ul>
<p>Si no tienes ningún dispositivo de domótica, un motor RF estándar (control remoto simple) es suficiente y más económico.</p>

<h2>¿En qué ventanas tiene más sentido motorizar?</h2>
<ul>
  <li><strong>Ventanas altas o de difícil acceso:</strong> ventanales sobre 2.5m de altura donde subir y bajar a mano es incómodo.</li>
  <li><strong>Dormitorios:</strong> no tener que levantarse para bajar la cortina antes de dormir es una comodidad real.</li>
  <li><strong>Oficinas en casa:</strong> ajustar la luz del monitor sin interrumpir el trabajo.</li>
  <li><strong>Múltiples ventanas en el mismo ambiente:</strong> motorizar 3-4 cortinas del living y controlarlas todas con un botón.</li>
  <li><strong>Adultos mayores o personas con movilidad reducida:</strong> elimina el esfuerzo físico de la cadena.</li>
</ul>

<h2>¿Cuánto cuesta motorizar las cortinas de un departamento?</h2>
<p>Para un departamento de 2 dormitorios con 6-8 ventanas, considera:</p>
<ul>
  <li><strong>Solo cortinas roller sin motorización:</strong> $300.000 - $600.000</li>
  <li><strong>Con motores RF batería:</strong> $500.000 - $900.000</li>
  <li><strong>Con motores WiFi (control app + Alexa):</strong> $700.000 - $1.200.000</li>
</ul>
<p>La diferencia entre manual y motorizado es de aproximadamente $60.000 - $100.000 por ventana. Para muchas personas, esa diferencia vale la pena en las ventanas más usadas (dormitorio principal, living), aunque el resto se deje manual.</p>

<h2>¿Puedo motorizar mis cortinas actuales?</h2>
<p>En muchos casos sí, si el mecanismo es roller estándar. Depende del diámetro del tubo y del peso de la tela. Si tienes cortinas roller de una marca reconocida, consulta con nosotros trayendo las medidas del tubo y te diremos si es compatible con nuestros motores.</p>
<p style="margin-top:24px"><strong>¿Te interesa motorizar?</strong> En TerraBlinds instalamos cortinas roller motorizadas con compatibilidad para Alexa, Google Home y Apple HomeKit. <a href="/quote">Cotiza tu proyecto aquí</a> y te asesoramos sin costo.</p>`,
  },
];

async function seed() {
    try {
        await sequelize.authenticate();
        await Blog.sync({ alter: true });
        console.log('Blog table ready');

        for (const post of posts) {
            const [, created] = await Blog.findOrCreate({ where: { slug: post.slug }, defaults: post });
            console.log(created ? `✅ Created: ${post.title}` : `⏭  Already exists: ${post.title}`);
        }
        console.log('✅ Blog seed 2 complete');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();

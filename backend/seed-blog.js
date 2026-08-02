// Run: node seed-blog.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('./src/config/database');
const Blog = require('./src/models/blog');

const posts = [
  {
    title: 'Precio de Cortinas Roller en Chile 2025: Guía Completa',
    slug: 'precio-cortinas-roller-chile-2025',
    meta_title: 'Precio Cortinas Roller Chile 2025 | Guía Completa | TerraBlinds',
    meta_description: '¿Cuánto cuestan las cortinas roller en Chile? Descubre los precios reales por tipo, material y medida. Guía actualizada 2025 con consejos para comprar bien.',
    keywords: 'precio cortinas roller Chile, cortinas roller blackout precio, cortinas roller a medida Santiago, cotizar cortinas roller, cortinas roller económicas Chile',
    excerpt: 'Si estás buscando cortinas roller en Chile y no sabes cuánto presupuestar, esta guía te explica los precios reales por tipo, factores que los afectan y cómo no pagar de más.',
    author: 'TerraBlinds',
    is_published: true,
    published_at: new Date('2025-03-01'),
    read_time: 7,
    content: `<h2>¿Cuánto cuesta una cortina roller en Chile? Rangos reales</h2>
<p>Si estás buscando cortinas roller en Chile y no sabes cuánto presupuestar, estás en el lugar indicado. Los precios varían bastante dependiendo del tipo de tela, el tamaño, la calidad y si las compras a medida o en medidas estándar.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd;text-align:left">Tipo de cortina</th><th style="padding:8px;border:1px solid #ddd">Precio aprox.</th><th style="padding:8px;border:1px solid #ddd">Ideal para</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Sunscreen</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$25.000 - $60.000</td><td style="padding:8px;border:1px solid #ddd">Oficinas, living con vista</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Blackout básico</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$30.000 - $75.000</td><td style="padding:8px;border:1px solid #ddd">Dormitorios, piezas de niños</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Blackout premium</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$60.000 - $130.000</td><td style="padding:8px;border:1px solid #ddd">Habitaciones, oscurecimiento total</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller Duo / Doble</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$70.000 - $160.000</td><td style="padding:8px;border:1px solid #ddd">Control de luz flexible</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd">Roller exterior</td><td style="padding:8px;border:1px solid #ddd;text-align:center">$80.000 - $200.000+</td><td style="padding:8px;border:1px solid #ddd">Terrazas, patios, balcones</td></tr>
  </tbody>
</table>
<p><em>Precios aproximados mercado chileno 2025, sin instalación.</em></p>

<h2>¿Qué factores afectan el precio de una cortina roller?</h2>
<p>No todas las cortinas roller cuestan lo mismo, aunque sean del mismo tipo. Estas son las variables que más impactan el precio:</p>
<ul>
  <li><strong>Tamaño:</strong> una cortina de 2 metros de ancho puede costar el doble que una de 1 metro, porque usa más tela y mecanismo más robusto.</li>
  <li><strong>Tipo de tela:</strong> las telas técnicas (blackout real, sunscreen de alta calidad) cuestan más que las telas básicas. La diferencia se nota en el resultado y la durabilidad.</li>
  <li><strong>Sistema de operación:</strong> manivela, cadena plástica, cadena de acero, motorizado. Un motor puede agregar desde $40.000 a $150.000 al precio.</li>
  <li><strong>A medida vs estándar:</strong> las cortinas en medidas estándar son más baratas porque se producen en escala. Las cortinas a medida son más caras pero quedan perfectas en cualquier ventana.</li>
  <li><strong>Instalación:</strong> muchas tiendas cobran aparte la instalación, que puede ir de $10.000 a $30.000 por ventana.</li>
</ul>

<h2>Cortinas roller estándar vs. a medida: ¿cuál conviene?</h2>
<p>Las cortinas en medidas estándar son ideales si tus ventanas tienen medidas comunes (100x200, 120x200, 160x200 cm). Las encuentras en tiendas de retail y son más económicas. El problema es que si tu ventana mide 137x215 cm, tendrás espacios sin cubrir o tendrás que doblar la cortina.</p>
<p>Las <strong>cortinas a medida</strong> se fabrican exactamente para tu ventana. El precio es algo mayor, pero el resultado es profesional, sin holguras ni espacio desperdiciado. Para departamentos en Santiago donde las ventanas varían mucho, la opción a medida casi siempre vale la pena.</p>

<h2>¿Dónde comprar cortinas roller en Chile?</h2>
<ul>
  <li><strong>Grandes tiendas (Easy, Sodimac):</strong> ofrecen medidas estándar a precios competitivos. Poca variedad de telas y no hacen a medida.</li>
  <li><strong>Tiendas especializadas online:</strong> mayor variedad, posibilidad de cotizar a medida, asesoría personalizada.</li>
  <li><strong>Fabricantes directos como TerraBlinds:</strong> hacen las cortinas ellos mismos, por lo que el precio es mejor y la calidad está controlada desde el origen.</li>
  <li><strong>MercadoLibre:</strong> opciones muy económicas, pero la calidad es variable. Ideal para piezas secundarias o si el presupuesto es muy ajustado.</li>
</ul>

<h2>Errores comunes al comprar cortinas roller</h2>
<ul>
  <li>Comprar sin medir la ventana exactamente. Un centímetro de diferencia puede arruinar el resultado.</li>
  <li>Elegir la más barata sin verificar el tipo de tela. Una tela "blackout" de mala calidad deja pasar luz por los bordes.</li>
  <li>Olvidar preguntar si el precio incluye instalación.</li>
  <li>No pedir muestra de tela antes de comprar. Los colores en pantalla y en persona pueden diferir bastante.</li>
  <li>Confundir cortina blackout con oscurecedora total. El blackout real bloquea casi toda la luz; el básico deja pasar algo.</li>
</ul>

<h2>¿Cuánto presupuestar para un departamento completo?</h2>
<p>Si quieres equipar un departamento estándar de 2 dormitorios, living y cocina (aprox. 6-8 ventanas), considera este presupuesto orientativo:</p>
<ul>
  <li><strong>Opción económica</strong> (estándar, calidad básica): $150.000 - $250.000</li>
  <li><strong>Opción intermedia</strong> (a medida, buena calidad): $300.000 - $500.000</li>
  <li><strong>Opción premium</strong> (a medida, telas premium + motorización): $600.000 - $1.200.000</li>
</ul>
<p>Estos valores incluyen cortinas pero no siempre la instalación. Siempre pide cotización con todo incluido para evitar sorpresas.</p>
<p style="margin-top:24px"><strong>¿Listo para cotizar?</strong> En TerraBlinds fabricamos cortinas roller a medida con instalación profesional. <a href="/quote">Cotiza gratis aquí</a> y recibe precio exacto en 24 horas.</p>`,
  },
  {
    title: 'Cómo Medir Ventanas para Cortinas Roller: Guía Paso a Paso',
    slug: 'como-medir-ventanas-cortinas-roller',
    meta_title: 'Cómo Medir Ventanas para Cortinas Roller | Guía Paso a Paso | TerraBlinds',
    meta_description: 'Aprende a medir tus ventanas correctamente antes de comprar cortinas roller. Evita errores comunes con esta guía práctica. Instalación interior y exterior.',
    keywords: 'cómo medir ventanas para cortinas roller, medir ventanas cortinas, medidas cortinas roller, cortinas roller a medida, instalar cortinas roller Chile',
    excerpt: 'Uno de los errores más frecuentes al comprar cortinas roller es que lleguen con medidas incorrectas. Aprende a medirlas correctamente con esta guía paso a paso.',
    author: 'TerraBlinds',
    is_published: true,
    published_at: new Date('2025-03-10'),
    read_time: 6,
    content: `<p>Uno de los errores más frustrantes al comprar cortinas roller es que lleguen con medidas incorrectas. Ya sea que queden muy cortas, muy largas, o no cubran bien la ventana, el resultado es el mismo: plata perdida y una ventana mal cubierta. La buena noticia es que medir bien es simple si sabes qué hacer.</p>

<h2>¿Qué necesitas antes de empezar?</h2>
<ul>
  <li>Huincha de medir <strong>metálica</strong> (no de tela, porque puede deformarse)</li>
  <li>Lápiz y papel, o tu celular para anotar</li>
  <li>Escalera si tus ventanas son altas</li>
  <li>La decisión tomada: ¿instalación interior o exterior?</li>
</ul>

<h2>Instalación interior vs. exterior: la diferencia clave</h2>
<p><strong>Instalación INTERIOR</strong> (dentro del marco): la cortina queda dentro del vano de la ventana. Se ve más limpia y moderna, pero requiere que el vano tenga profundidad suficiente (mínimo 5-7 cm). Las medidas que tomas son las del interior del marco.</p>
<p><strong>Instalación EXTERIOR</strong> (sobre el muro): el mecanismo se fija sobre el muro, encima de la ventana. Cubre mejor la luz porque tapa también el marco. Es la opción más usada en Chile para mayor oscurecimiento.</p>

<h2>Cómo medir para instalación INTERIOR (paso a paso)</h2>
<ol>
  <li><strong>Mide el ANCHO del vano:</strong> coloca la huincha de un extremo interior del marco al otro. Anota el valor exacto.</li>
  <li><strong>Descuenta entre 1 y 1,5 cm de cada lado:</strong> esto es necesario para que la cortina entre sin rozar. Ejemplo: vano de 120 cm → pide cortina de 117-118 cm.</li>
  <li><strong>Mide la ALTURA del vano:</strong> desde la parte interior superior hasta el alféizar (repisa inferior).</li>
  <li><strong>Descuenta 1 cm abajo</strong> si quieres que la cortina no toque el alféizar.</li>
</ol>
<p><strong>Regla de oro instalación interior:</strong> pide siempre 2-3 cm menos de ancho que el vano real.</p>

<h2>Cómo medir para instalación EXTERIOR (paso a paso)</h2>
<ol>
  <li><strong>Mide el ANCHO</strong> de la ventana incluyendo el marco completo.</li>
  <li><strong>Agrega entre 5 y 10 cm de cada lado:</strong> esto mejora el oscurecimiento. Ejemplo: ventana de 100 cm → pide cortina de 110-120 cm.</li>
  <li><strong>Mide la ALTURA</strong> desde donde se va a fijar el soporte (normalmente 5-10 cm sobre el marco superior) hasta donde quieres que llegue la cortina.</li>
  <li><strong>Agrega 5-10 cm abajo</strong> del alféizar si quieres tapar mejor la luz por los bordes inferiores.</li>
</ol>
<p><strong>Regla de oro instalación exterior:</strong> siempre es mejor pedir un poco más ancho que justo.</p>

<h2>Medidas estándar disponibles en Chile</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead><tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd">Ancho estándar</th><th style="padding:8px;border:1px solid #ddd">Alto estándar</th><th style="padding:8px;border:1px solid #ddd">Uso típico</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #ddd;text-align:center">80 cm</td><td style="padding:8px;border:1px solid #ddd;text-align:center">150 cm</td><td style="padding:8px;border:1px solid #ddd">Baños, ventanas pequeñas</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;text-align:center">100 cm</td><td style="padding:8px;border:1px solid #ddd;text-align:center">180 cm</td><td style="padding:8px;border:1px solid #ddd">Dormitorios estándar</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;text-align:center">120 cm</td><td style="padding:8px;border:1px solid #ddd;text-align:center">200 cm</td><td style="padding:8px;border:1px solid #ddd">Living, comedores</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;text-align:center">140 cm</td><td style="padding:8px;border:1px solid #ddd;text-align:center">220 cm</td><td style="padding:8px;border:1px solid #ddd">Ventanas grandes</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;text-align:center">160 cm</td><td style="padding:8px;border:1px solid #ddd;text-align:center">240 cm</td><td style="padding:8px;border:1px solid #ddd">Ventanales, puertas-ventana</td></tr>
  </tbody>
</table>

<h2>Errores más comunes al medir (y cómo evitarlos)</h2>
<ul>
  <li><strong>Medir solo una vez:</strong> siempre mide dos veces el ancho y dos veces el alto. Las ventanas no siempre son perfectamente rectangulares.</li>
  <li><strong>Confundir el ancho del vidrio con el ancho del vano:</strong> el vano es el hueco completo incluyendo el marco.</li>
  <li><strong>Olvidar preguntar si hay obstáculos:</strong> manillas, pestillos o instalaciones cerca de la ventana pueden limitar dónde va el mecanismo.</li>
  <li><strong>Medir con cinta de tela:</strong> da medidas imprecisas. Siempre usa huincha metálica rígida.</li>
</ul>

<h2>¿Tienes ventanas con formas especiales?</h2>
<p>Las ventanas triangulares, en arco o con esquinas irregulares no admiten cortinas roller estándar. Si tienes dudas sobre tu tipo de ventana, lo mejor es enviarnos una foto para asesorarte antes de pedir medidas.</p>
<p style="margin-top:24px"><strong>¿Ya tienes tus medidas?</strong> <a href="/quote">Cotiza tu cortina roller a medida en TerraBlinds</a> y recibe precio exacto en 24 horas, con instalación incluida.</p>`,
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
        console.log('✅ Blog seed complete');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();

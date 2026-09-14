const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Blog = require('../models/blog');
const { Config } = require('../models');
const { COMUNAS, getComunaBySlug, displayName, findComunas } = require('../data/comunas');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const SITE_NAME = 'TerraBlinds';
const BASE_URL = process.env.SITE_URL || 'https://terrablinds.cl';

// Static page meta definitions
// Servicios secundarios (no-cortinas): se dejan accesibles a humanos pero fuera
// del índice, para que Google concentre autoridad en cortinas/persianas/toldos.
const NOINDEX_PATHS = new Set([
    '/cortinas-metalicas', '/camaras', '/control-acceso', '/automatizacion', '/paneles-solares',
]);

const STATIC_PAGES = {
    '/': {
        title: 'Cortinas Roller a Medida con Instalación en Santiago | TerraBlinds',
        description: 'Cortinas roller blackout, screen, duo y motorizadas a la medida en Santiago. Visita técnica gratuita, fabricación a medida e instalación incluida. Cotiza online.',
        priority: '1.0',
        changefreq: 'weekly'
    },
    '/catalog': {
        title: 'Cortinas Roller, Persianas y Toldos a Medida | Catálogo TerraBlinds',
        description: 'Catálogo completo de cortinas roller blackout, screen, duo, motorizadas, persianas y toldos. Fabricación a medida con instalación profesional en Santiago.',
        priority: '0.9',
        changefreq: 'weekly'
    },
    '/quote': {
        title: 'Cotiza tus Cortinas Roller Online | Precio Inmediato | TerraBlinds',
        description: 'Cotiza cortinas roller blackout, screen, duo y motorizadas a medida. Precio inmediato en línea. Instalación en Santiago incluida. Respuesta en menos de 24 hrs.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/about': {
        title: `Sobre Nosotros | ${SITE_NAME}`,
        description: 'Conoce a TerraBlinds: expertos en cortinas y persianas a medida con años de experiencia en Santiago y todo Chile.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/contact': {
        title: 'Contacto | TerraBlinds - Cortinas Roller Santiago',
        description: 'Contáctanos para cotizar cortinas roller, persianas y toldos. Atención personalizada. WhatsApp disponible. Servicio en Santiago y toda la Región Metropolitana.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/agendar': {
        title: 'Agendar Visita Técnica | TerraBlinds',
        description: 'Agenda una visita técnica gratuita para medir y cotizar cortinas roller, persianas o toldos en tu domicilio. Santiago y RM.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/domotica': {
        title: 'Cortinas Motorizadas y Domótica en Santiago | TerraBlinds',
        description: 'Cortinas roller motorizadas con control por app, voz o smartphone. Integración con Alexa, Google Home y Apple HomeKit. Instalación incluida en Santiago y RM.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/cortinas-metalicas': {
        title: 'Cortinas Metálicas para Locales Comerciales | TerraBlinds Santiago',
        description: 'Cortinas metálicas y enrollables de seguridad para locales comerciales y bodegas. Fabricación a medida e instalación profesional en Santiago y Región Metropolitana.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/cortinas/las-condes': { title: 'Cortinas Roller en Las Condes — TerraBlinds', description: 'Instalación de cortinas roller, persianas y toldos en Las Condes. Fabricación a medida con visita técnica gratuita.', priority: '0.8', changefreq: 'monthly' },
    '/cortinas/providencia': { title: 'Cortinas Roller en Providencia — TerraBlinds', description: 'Cortinas roller y persianas en Providencia. Instalación profesional en departamentos y oficinas.', priority: '0.8', changefreq: 'monthly' },
    '/cortinas/vitacura': { title: 'Cortinas Roller en Vitacura — TerraBlinds', description: 'Cortinas premium, persianas y toldos en Vitacura. Materiales importados e instalación garantizada.', priority: '0.8', changefreq: 'monthly' },
    '/cortinas/lo-barnechea': { title: 'Cortinas Roller en Lo Barnechea — TerraBlinds', description: 'Cortinas roller, persianas y toldos en Lo Barnechea. Cobertura en condominios y casas de la precordillera.', priority: '0.7', changefreq: 'monthly' },
    '/cortinas/nunoa': { title: 'Cortinas Roller en Ñuñoa — TerraBlinds', description: 'Cortinas roller y persianas en Ñuñoa. Instalación en departamentos, casas y locales de la comuna.', priority: '0.8', changefreq: 'monthly' },
    '/cortinas/la-reina': { title: 'Cortinas Roller en La Reina — TerraBlinds', description: 'Cortinas roller y persianas en La Reina. Visita técnica a domicilio y presupuesto sin compromiso.', priority: '0.7', changefreq: 'monthly' },
    '/cortinas/maipu': { title: 'Cortinas Roller en Maipú — TerraBlinds', description: 'Cortinas roller, persianas y toldos en Maipú. Instalación a domicilio con los mejores precios.', priority: '0.8', changefreq: 'monthly' },
    '/cortinas/la-florida': { title: 'Cortinas Roller en La Florida — TerraBlinds', description: 'Cortinas roller y persianas en La Florida. Fabricación a medida e instalación profesional garantizada.', priority: '0.7', changefreq: 'monthly' },
    '/cortinas/san-miguel': { title: 'Cortinas Roller en San Miguel — TerraBlinds', description: 'Cortinas roller, persianas y toldos en San Miguel. Instalación en hogares y locales comerciales.', priority: '0.7', changefreq: 'monthly' },
    '/cortinas/penalolen': { title: 'Cortinas Roller en Peñalolén — TerraBlinds', description: 'Cortinas roller, persianas y toldos en Peñalolén. Visita técnica gratuita y presupuesto personalizado.', priority: '0.7', changefreq: 'monthly' },
    '/cortinas/colina': { title: 'Cortinas Roller en Colina y Chicureo — TerraBlinds', description: 'Cortinas roller, persianas exteriores y toldos en Colina y Chicureo. Instalación en casas y condominios de la zona norte de Santiago.', priority: '0.8', changefreq: 'monthly' },
    '/automatizacion': {
        title: 'Automatización de Persianas y Toldos | TerraBlinds',
        description: 'Automatización inteligente para persianas, toldos y cortinas. Integración con Alexa, Google Home y sistemas domóticos. Santiago.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/servicio-tecnico': {
        title: 'Servicio Tecnico de Cortinas y Persianas | TerraBlinds',
        description: 'Servicio tecnico y reparacion de cortinas roller, persianas y toldos en Santiago. Revision a domicilio con garantia.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/camaras': {
        title: 'Camaras de Seguridad para el Hogar | TerraBlinds',
        description: 'Instalacion de camaras de seguridad para hogares y negocios en Santiago. Asesoria e instalacion profesional incluida.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/paneles-solares': {
        title: 'Paneles Solares Residenciales | TerraBlinds',
        description: 'Instalacion de paneles solares para hogares en Santiago y Region Metropolitana. Ahorra en tu cuenta de luz.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/control-acceso': {
        title: 'Control de Acceso para el Hogar y Empresa | TerraBlinds',
        description: 'Sistemas de control de acceso, cerraduras inteligentes e intercomunicadores para hogares y empresas en Santiago.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/software': {
        title: 'Software de Gestion para Talleres | TerraBlinds',
        description: 'Software especializado para gestion de talleres de cortinas y persianas. Cotizaciones, inventario y mas.',
        priority: '0.5',
        changefreq: 'monthly'
    },
    '/blog': {
        title: 'Blog de Cortinas y Decoracion | TerraBlinds',
        description: 'Consejos, tendencias y guias sobre cortinas roller, persianas y decoracion de interiores en Chile.',
        priority: '0.6',
        changefreq: 'weekly'
    },
    '/faq': {
        title: 'Preguntas Frecuentes | TerraBlinds',
        description: 'Respuestas a las dudas mas comunes sobre cortinas roller, persianas, instalacion, garantia y precios en TerraBlinds.',
        priority: '0.5',
        changefreq: 'monthly'
    },
    '/projects': {
        title: 'Proyectos Realizados | TerraBlinds',
        description: 'Galeria de proyectos de cortinas roller, persianas y toldos instalados en hogares y empresas de Santiago.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/la-serena': {
        title: 'Cortinas Roller en La Serena | TerraBlinds',
        description: 'Cortinas roller, blackout, screen y persianas exteriores a medida para La Serena y Coquimbo. Proteccion solar real para el clima del Norte Chico. Cotiza sin compromiso.',
        priority: '0.9',
        changefreq: 'monthly',
        lastmod: '2026-09-09'
    },
};

// Pages for which admin can customize SEO meta
const SEO_PAGES = [
    { key: 'home',             path: '/',                    label: 'Inicio' },
    { key: 'catalog',          path: '/catalog',             label: 'Catálogo' },
    { key: 'quote',            path: '/quote',               label: 'Cotizar Online' },
    { key: 'about',            path: '/about',               label: 'Nosotros' },
    { key: 'contact',          path: '/contact',             label: 'Contacto' },
    { key: 'software',         path: '/software',            label: 'Software' },
    { key: 'domotica',         path: '/domotica',            label: 'Domótica' },
    { key: 'cortinas',         path: '/cortinas-metalicas',  label: 'Cortinas Metálicas' },
    { key: 'automatizacion',   path: '/automatizacion',      label: 'Automatización' },
    { key: 'servicio_tecnico', path: '/servicio-tecnico',    label: 'Servicio Técnico' },
    { key: 'camaras',          path: '/camaras',             label: 'Cámaras' },
    { key: 'paneles_solares',  path: '/paneles-solares',     label: 'Paneles Solares' },
    { key: 'control_acceso',   path: '/control-acceso',      label: 'Control de Acceso' },
];

// GET /api/seo/pages — return all per-page SEO meta (admin only)
router.get('/seo/pages', protect, restrictTo('admin'), async (req, res) => {
    try {
        const keys = SEO_PAGES.flatMap(p => [`seo_title_${p.key}`, `seo_desc_${p.key}`, `seo_og_image_${p.key}`]);
        const rows = await Config.findAll({ where: { key: keys } });
        const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
        const result = SEO_PAGES.map(p => ({
            key: p.key,
            path: p.path,
            label: p.label,
            title: map[`seo_title_${p.key}`] || STATIC_PAGES[p.path]?.title || '',
            description: map[`seo_desc_${p.key}`] || STATIC_PAGES[p.path]?.description || '',
            og_image: map[`seo_og_image_${p.key}`] || '',
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching SEO pages' });
    }
});

// PUT /api/seo/pages — bulk update SEO meta (admin only)
router.put('/seo/pages', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { pages } = req.body;
        if (!Array.isArray(pages)) return res.status(400).json({ error: 'pages must be an array' });
        for (const page of pages) {
            const pageConf = SEO_PAGES.find(p => p.key === page.key);
            if (!pageConf) continue;
            if (page.title != null) {
                await Config.upsert({ key: `seo_title_${page.key}`, value: String(page.title).substring(0, 200), type: 'string' });
            }
            if (page.description != null) {
                await Config.upsert({ key: `seo_desc_${page.key}`, value: String(page.description).substring(0, 500), type: 'string' });
            }
            if (page.og_image != null) {
                await Config.upsert({ key: `seo_og_image_${page.key}`, value: String(page.og_image).substring(0, 500), type: 'string' });
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error saving SEO pages' });
    }
});

// GET /api/sitemap.xml — Dynamic sitemap with products
router.get('/sitemap.xml', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { is_active: true },
            attributes: ['id', 'slug', 'updated_at'],
            order: [['id', 'ASC']]
        });

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        for (const [path, meta] of Object.entries(STATIC_PAGES)) {
            if (NOINDEX_PATHS.has(path)) continue;
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}${path}</loc>\n`;
            if (meta.lastmod) xml += `    <lastmod>${meta.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${meta.changefreq}</changefreq>\n`;
            xml += `    <priority>${meta.priority}</priority>\n`;
            xml += '  </url>\n';
        }

        // Blog posts
        const blogs = await Blog.findAll({
            where: { is_published: true },
            attributes: ['slug', 'title', 'updated_at', 'published_at'],
            order: [['published_at', 'DESC']]
        });
        for (const blog of blogs) {
            // No listar posts que canonicalizan a una landing de comuna:
            // Search Console marca las URLs no-canonicas incluidas en sitemap.
            if (findComunas(blog.title).length) continue;
            const lastmod = blog.updated_at
                ? new Date(blog.updated_at).toISOString().split('T')[0]
                : (blog.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/blog/${blog.slug}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        }

        // Product pages
        for (const product of products) {
            const lastmod = product.updated_at
                ? new Date(product.updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/product/${product.id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err.message);
        res.status(500).set('Content-Type', 'application/xml').send(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
        );
    }
});

// GET /api/prerender?path= — Server-rendered HTML with real content for bot crawlers
const SERVICES = [
    'Cortinas Roller Blackout', 'Cortinas Roller Screen', 'Cortinas Roller Duo',
    'Cortinas Motorizadas', 'Persianas de Exterior', 'Toldos a Medida',
];

function renderProductList(products) {
    if (!products || !products.length) return '';
    const items = products.map(p => {
        const desc = (p.short_description || p.description || '').substring(0, 200);
        return `<li style="margin-bottom:18px;">
            <a href="${BASE_URL}/product/${p.id}" style="font-size:18px;font-weight:700;color:#1d4ed8;text-decoration:none;">${escapeHtml(p.name)}</a>
            <p style="margin:4px 0 0;font-size:15px;color:#475569;line-height:1.55;">${escapeHtml(desc)}</p>
        </li>`;
    }).join('\n');
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Nuestros productos</h2>
        <ul style="list-style:none;padding:0;margin:16px 0 0;">${items}</ul>
    </section>`;
}

function renderFaqList(faqs) {
    if (!faqs || !faqs.length) return '';
    const items = faqs.map(f => `<div style="margin-bottom:20px;">
        <h3 style="font-size:17px;color:#1e293b;margin:0 0 6px;">${escapeHtml(f.question)}</h3>
        <p style="margin:0;font-size:15px;color:#475569;line-height:1.55;">${escapeHtml((f.answer || '').substring(0, 400))}</p>
    </div>`).join('\n');
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Preguntas frecuentes</h2>
        ${items}
    </section>`;
}

function renderServices() {
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Servicios</h2>
        <ul style="font-size:15px;color:#475569;line-height:1.9;margin:12px 0 0;padding-left:22px;">
            ${SERVICES.map(s => `<li>${s}</li>`).join('')}
        </ul>
    </section>`;
}

function renderContactBlock() {
    return `<section style="margin-top:36px;padding-top:24px;border-top:1px solid #e2e8f0;">
        <h2 style="font-size:22px;color:#1e293b;">Contacto</h2>
        <p style="font-size:15px;color:#475569;line-height:1.7;margin:10px 0 0;">
            TerraBlinds fabrica e instala cortinas y persianas a medida en Santiago, La Serena y Coquimbo.
            Visita tecnica gratuita para tomar medidas, fabricacion a medida e instalacion incluida.
        </p>
        <p style="font-size:15px;color:#475569;margin:10px 0 0;">
            WhatsApp: <a href="https://wa.me/56998101891" style="color:#1d4ed8;">+56 9 9810 1891</a>
        </p>
    </section>`;
}




// Enlaza la PRIMERA mención de cada comuna dentro del cuerpo de un post.
// Case-sensitive a propósito: "la reina de las cortinas" o "subir la colina"
// no deben convertirse en enlaces. Solo una vez por comuna: más sería spam.
function linkFirstMentions(escapedText) {
    let out = escapedText;
    for (const com of COMUNAS) {
        const names = [com.nombreDisplay, com.nombre].filter(Boolean);
        if (com.slug === 'colina') names.push('Chicureo');
        for (const n of [...new Set(names)]) {
            const idx = out.indexOf(n);
            if (idx === -1) continue;
            const before = out.slice(0, idx);
            const opens = (before.match(/<a /g) || []).length;
            const closes = (before.match(/<\/a>/g) || []).length;
            if (opens > closes) continue;
            out = before
                + `<a href="${BASE_URL}/cortinas/${com.slug}" style="color:#1d4ed8;font-weight:600;">${n}</a>`
                + out.slice(idx + n.length);
            break;
        }
    }
    return out;
}

function renderPostComunaLinks(title) {
    let found = findComunas(title);
    if (!found.length) found = COMUNAS.filter(x => ['las-condes', 'providencia', 'vitacura', 'nunoa'].includes(x.slug));
    return `<section style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <h2 style="font-size:20px;color:#1e293b;">Instalamos en tu comuna</h2>
        <p style="font-size:15px;color:#475569;line-height:1.9;margin:8px 0 0;">
            ${found.map(x => `<a href="${BASE_URL}/cortinas/${x.slug}" style="color:#1d4ed8;text-decoration:none;">Cortinas en ${escapeHtml(displayName(x))}</a>`).join(' · ')}
            · <a href="${BASE_URL}/la-serena" style="color:#1d4ed8;text-decoration:none;">La Serena y Coquimbo</a>
        </p>
    </section>`;
}

function renderComunaGuides(posts) {
    if (!posts || !posts.length) return '';
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Guías y consejos</h2>
        <ul style="list-style:none;padding:0;margin:12px 0 0;">
            ${posts.map(p => `<li style="margin-bottom:10px;"><a href="${BASE_URL}/blog/${escapeHtml(p.slug)}" style="font-size:16px;color:#1d4ed8;text-decoration:none;font-weight:600;">${escapeHtml(p.title)}</a></li>`).join('')}
        </ul>
    </section>`;
}


const INSTALACIONES = [
    { src: '/uploads/roller-duo-zebra.webp',       alt: 'Cortina roller duo zebra instalada en living',      label: 'Roller duo zebra' },
    { src: '/uploads/cierre-terraza-cristal.webp', alt: 'Cierre de terraza en cristal con vista panoramica', label: 'Cierre de terraza en cristal' },
    { src: '/uploads/persianas-interior.webp',     alt: 'Minipersiana de aluminio en cocina',                label: 'Minipersiana de aluminio' },
    { src: '/uploads/toldo-terraza.webp',          alt: 'Toldo retractil sobre terraza de madera',           label: 'Toldo retractil' },
    { src: '/uploads/persiana-exterior-real.png',  alt: 'Persiana exterior de aluminio instalada',           label: 'Persiana exterior' },
    { src: '/uploads/malla-seguridad-balcon.webp', alt: 'Malla de seguridad transparente en balcon',         label: 'Malla de seguridad' },
];

function renderInstalaciones(nombre) {
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Asi quedan nuestras instalaciones</h2>
        <p style="font-size:15px;color:#475569;margin:6px 0 16px;">Fotos de proyectos terminados. Lo mismo que instalamos en ${escapeHtml(nombre)}.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
            ${INSTALACIONES.map(f => `<figure style="margin:0;">
                <img src="${BASE_URL}${f.src}" alt="${escapeHtml(f.alt)}" loading="lazy" width="400" height="300" style="width:100%;height:auto;border-radius:10px;display:block;" />
                <figcaption style="font-size:13px;color:#475569;margin-top:6px;">${escapeHtml(f.label)}</figcaption>
            </figure>`).join('')}
        </div>
    </section>`;
}

function renderComunaFaq(nombre) {
    const faqs = [
        { q: `¿Hacen visita técnica en ${nombre}?`, a: `Sí. Un técnico va a tu domicilio en ${nombre} a tomar las medidas exactas de cada ventana, sin costo y sin compromiso. Con esas medidas te entregamos el presupuesto final en el momento.` },
        { q: `¿Cuánto demora la instalación en ${nombre}?`, a: `Fabricamos a medida en 5 a 7 días hábiles. La instalación en ${nombre} se coordina a tu horario y un proyecto estándar de casa o departamento queda listo en una sola jornada.` },
        { q: `¿Qué cortina conviene para ${nombre}?`, a: `Depende de la orientación y el uso de cada espacio. En dormitorios recomendamos blackout; en living y oficinas, screen o duo para controlar la luz sin perder la vista. En la visita técnica te asesoramos ventana por ventana.` },
        { q: `¿Instalan en edificios y condominios de ${nombre}?`, a: `Sí. Trabajamos en departamentos, casas, condominios cerrados y locales comerciales. Coordinamos el ingreso con la administración cuando el edificio lo requiere.` },
    ];
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">Preguntas frecuentes sobre cortinas en ${escapeHtml(nombre)}</h2>
        ${faqs.map(f => `<div style="margin-bottom:18px;">
            <h3 style="font-size:17px;color:#1e293b;margin:0 0 6px;">${escapeHtml(f.q)}</h3>
            <p style="margin:0;font-size:15px;color:#475569;line-height:1.55;">${escapeHtml(f.a)}</p>
        </div>`).join('')}
    </section>`;
}

function renderOtrasComunas(currentSlug) {
    const otras = COMUNAS.filter(x => x.slug !== currentSlug);
    return `<section style="margin-top:36px;">
        <h2 style="font-size:22px;color:#1e293b;">También instalamos en</h2>
        <p style="font-size:15px;color:#475569;line-height:1.9;margin:10px 0 0;">
            ${otras.map(x => `<a href="${BASE_URL}/cortinas/${x.slug}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(displayName(x))}</a>`).join(' · ')}
            · <a href="${BASE_URL}/la-serena" style="color:#1d4ed8;text-decoration:none;">La Serena y Coquimbo</a>
        </p>
    </section>`;
}


// In-memory prerender cache. A crawler fetching the whole sitemap in a burst
// would otherwise hit PostgreSQL 3-6 times per URL; content changes rarely.
// 404s are never cached so a freshly published product is visible at once.
const PRERENDER_TTL_MS = 10 * 60 * 1000;
const PRERENDER_MAX_ENTRIES = 500;
const prerenderCache = new Map();

function cacheGet(key) {
    const hit = prerenderCache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expires) { prerenderCache.delete(key); return null; }
    return hit.html;
}

function cacheSet(key, html) {
    if (prerenderCache.size >= PRERENDER_MAX_ENTRIES) {
        const oldest = prerenderCache.keys().next().value;
        prerenderCache.delete(oldest);
    }
    prerenderCache.set(key, { html, expires: Date.now() + PRERENDER_TTL_MS });
}

router.get('/prerender', async (req, res) => {
    const requestedPath = req.query.path || '/';
    let canonicalOverride = null;

    const cached = cacheGet(requestedPath);
    if (cached) {
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('X-Prerender-Cache', 'HIT');
        return res.send(cached);
    }

    let title, description, ogImage, jsonLd, bodyContent = '';
    let notFound = false;

    const productMatch = requestedPath.match(/^\/product\/(\d+)$/);
    const blogMatch = requestedPath.match(/^\/blog\/([^/]+)$/);
    const comunaMatch = requestedPath.match(/^\/cortinas\/([^/]+)$/);

    if (productMatch) {
        try {
            const product = await Product.findByPk(productMatch[1]);
            if (product && product.is_active) {
                title = `${product.name} | ${SITE_NAME}`;
                const fullDesc = product.description || product.short_description || '';
                description = (product.short_description || product.description || `${product.name} - Cortinas y persianas a medida en TerraBlinds.`);
                if (description.length > 160) description = description.substring(0, 157) + '...';
                const images = Array.isArray(product.images) ? product.images : [];
                ogImage = images.length > 0
                    ? (images[0].startsWith('http') ? images[0] : `${BASE_URL}${images[0]}`)
                    : null;
                bodyContent = `<section style="margin-top:28px;">
                    <p style="font-size:16px;color:#334155;line-height:1.7;">${escapeHtml(fullDesc)}</p>
                </section>` + renderServices() + renderContactBlock();
                jsonLd = {
                    '@context': 'https://schema.org', '@type': 'Product',
                    name: product.name, description: description, image: ogImage || undefined,
                    brand: { '@type': 'Brand', name: SITE_NAME },
                    offers: { '@type': 'Offer', priceCurrency: 'CLP', availability: 'https://schema.org/InStock', url: `${BASE_URL}/product/${product.id}` }
                };
            } else {
                notFound = true;
            }
        } catch (err) {
            console.error('Prerender product error:', err.message);
            notFound = true;
        }
    } else if (blogMatch) {
        try {
            const post = await Blog.findOne({ where: { slug: blogMatch[1] } });
            if (post && post.is_published) {
                title = `${post.title} | ${SITE_NAME}`;
                description = (post.excerpt || post.title || '').substring(0, 160);
                // Anti-canibalización: si el post nombra una comuna, su versión
                // comercial es la landing /cortinas/<slug>. Canonicalizamos hacia
                // ella para consolidar señales en la página que sí convierte.
                const _comuna = findComunas(post.title)[0];
                if (_comuna) canonicalOverride = `${BASE_URL}/cortinas/${_comuna.slug}`;
                if (!ogImage) ogImage = `${BASE_URL}/uploads/roller-duo-zebra.webp`;
                const raw = String(post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                bodyContent = `<article style="margin-top:28px;">
                    <p style="font-size:16px;color:#334155;line-height:1.75;">${linkFirstMentions(escapeHtml(raw.substring(0, 3000)))}</p>
                </article>` + renderPostComunaLinks(post.title) + renderContactBlock();
                jsonLd = {
                    '@context': 'https://schema.org', '@type': 'Article',
                    headline: post.title, description: description,
                    datePublished: post.published_at, dateModified: post.updated_at,
                    author: { '@type': 'Organization', name: SITE_NAME },
                };
            } else {
                notFound = true;
            }
        } catch (err) {
            console.error('Prerender blog error:', err.message);
            notFound = true;
        }
    } else if (STATIC_PAGES[requestedPath]) {
        const pageConf = SEO_PAGES.find(p => p.path === requestedPath);
        const fallback = STATIC_PAGES[requestedPath];
        title = fallback.title;
        description = fallback.description;
        if (pageConf) {
            try {
                const [titleRow, descRow] = await Promise.all([
                    Config.findOne({ where: { key: `seo_title_${pageConf.key}` } }),
                    Config.findOne({ where: { key: `seo_desc_${pageConf.key}` } }),
                ]);
                title = titleRow?.value || fallback.title;
                description = descRow?.value || fallback.description;
            } catch (_) { /* keep fallback */ }
        }

        if (requestedPath === '/' || requestedPath === '/catalog') {
            try {
                const products = await Product.findAll({
                    where: { is_active: true },
                    attributes: ['id', 'name', 'short_description', 'description'],
                    order: [['id', 'ASC']], limit: 18,
                });
                bodyContent = renderProductList(products) + renderServices() + renderContactBlock();
            } catch (_) {
                bodyContent = renderServices() + renderContactBlock();
            }
        } else if (requestedPath === '/faq') {
            try {
                const [faqs] = await Product.sequelize.query(
                    'SELECT question, answer FROM faqs WHERE is_active = true ORDER BY sort_order ASC, id ASC LIMIT 20'
                );
                bodyContent = renderFaqList(faqs) + renderContactBlock();
            } catch (_) {
                bodyContent = renderContactBlock();
            }
        } else if (comunaMatch && getComunaBySlug(comunaMatch[1])) {
            const comuna = getComunaBySlug(comunaMatch[1]);
            const nombre = displayName(comuna);
            let products = [];
            try {
                products = await Product.findAll({
                    where: { is_active: true },
                    attributes: ['id', 'name', 'short_description', 'description'],
                    order: [['id', 'ASC']], limit: 12,
                });
            } catch (_) { /* sin productos, la página igual sale */ }

            const intro = comuna ? comuna.intro : `Instalamos cortinas roller, blackout, screen, duo y persianas a medida en ${nombre}.`;
            const contexto = comuna && comuna.contexto ? `<p style="font-size:16px;color:#334155;line-height:1.7;margin-top:14px;">${escapeHtml(comuna.contexto)}</p>` : '';
            const destacados = comuna && comuna.destacados && comuna.destacados.length
                ? `<ul style="font-size:15px;color:#475569;line-height:1.9;margin:16px 0 0;padding-left:22px;">${comuna.destacados.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
                : '';

            let guias = [];
            try {
                const all = await Blog.findAll({ where: { is_published: true }, attributes: ['slug', 'title'], order: [['published_at', 'DESC']] });
                const mine = all.filter(p => findComunas(p.title).some(x => x.slug === comunaMatch[1]));
                // Sin guía propia: las 3 más generales para no dejar la sección vacía
                guias = mine.length ? mine : all.filter(p => !findComunas(p.title).length).slice(0, 3);
            } catch (_) { /* opcional */ }

            if (!ogImage) ogImage = `${BASE_URL}/uploads/roller-duo-zebra.webp`;
            bodyContent = `<section style="margin-top:28px;">
                <p style="font-size:16px;color:#334155;line-height:1.7;">${escapeHtml(intro)}</p>
                ${contexto}
                <h2 style="font-size:22px;color:#1e293b;margin-top:28px;">Por qué elegirnos en ${escapeHtml(nombre)}</h2>
                ${destacados}
            </section>` + renderProductList(products) + renderInstalaciones(nombre) + renderComunaGuides(guias) + renderComunaFaq(nombre) + renderOtrasComunas(comunaMatch[1]) + renderContactBlock();

            jsonLd = [
                {
                    "@context": "https://schema.org", "@type": "LocalBusiness",
                    name: "TerraBlinds", url: `${BASE_URL}${requestedPath}`, telephone: "+56998101891", priceRange: "$$",
                    description: comuna ? comuna.descripcion : description,
                    address: { "@type": "PostalAddress", addressLocality: "Santiago", addressRegion: "Region Metropolitana", addressCountry: "CL" },
                    areaServed: { "@type": "City", name: nombre, containedInPlace: { "@type": "AdministrativeArea", name: "Region Metropolitana" } },
                    hasOfferCatalog: {
                        "@type": "OfferCatalog", name: `Cortinas y Persianas a Medida en ${nombre}`,
                        itemListElement: SERVICES.map(s => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s, areaServed: nombre } }))
                    }
                },
                {
                    "@context": "https://schema.org", "@type": "BreadcrumbList",
                    itemListElement: [
                        { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
                        { "@type": "ListItem", position: 2, name: `Cortinas en ${nombre}`, item: `${BASE_URL}${requestedPath}` },
                    ]
                }
            ];
        } else if (requestedPath === '/la-serena') {
            try {
                const products = await Product.findAll({
                    where: { is_active: true },
                    attributes: ['id', 'name', 'short_description', 'description'],
                    order: [['id', 'ASC']], limit: 10,
                });
                bodyContent = `<section style="margin-top:28px;">
                    <p style="font-size:16px;color:#334155;line-height:1.7;">
                        TerraBlinds fabrica e instala cortinas roller, blackout, screen, duo y persianas exteriores
                        a medida en La Serena y Coquimbo. El clima del Norte Chico exige proteccion solar real:
                        radiacion alta durante gran parte del ano, brisa marina y amplitud termica entre el dia y la noche.
                    </p>
                    <p style="font-size:16px;color:#334155;line-height:1.7;margin-top:14px;">
                        Coordinamos una visita tecnica gratuita en tu domicilio de La Serena o Coquimbo para tomar
                        las medidas exactas de cada ventana. Fabricamos a medida y realizamos la instalacion completa,
                        sin costos ocultos.
                    </p>
                </section>` + renderProductList(products) + renderServices() + renderContactBlock();
            } catch (_) {
                bodyContent = renderServices() + renderContactBlock();
            }
        } else {
            bodyContent = renderServices() + renderContactBlock();
        }
    } else {
        notFound = true;
    }

    if (notFound) {
        title = `Pagina no encontrada | ${SITE_NAME}`;
        description = 'La pagina que buscas no existe o fue movida.';
        bodyContent = `<section style="margin-top:28px;">
            <p style="font-size:16px;color:#334155;line-height:1.7;">
                La direccion solicitada no corresponde a ninguna pagina de TerraBlinds.
                Puedes volver al <a href="${BASE_URL}/" style="color:#1d4ed8;">inicio</a> o revisar el
                <a href="${BASE_URL}/catalog" style="color:#1d4ed8;">catalogo</a>.
            </p>
        </section>`;
        jsonLd = null;
    }

    // Fallback global de imagen para compartir (WhatsApp/Facebook no ejecutan JS,
    // leen esto del prerender). Antes casi todas las páginas se compartían sin foto.
    if (!ogImage) ogImage = `${BASE_URL}/assets/la-serena/hero.webp`;
    const canonicalUrl = canonicalOverride || `${BASE_URL}${requestedPath}`;
    const ogImageTag = ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : '';

    if (!jsonLd && !notFound) {
        if (requestedPath === '/') {
            jsonLd = [
                {
                    "@context": "https://schema.org", "@type": "LocalBusiness",
                    name: "TerraBlinds", url: BASE_URL, telephone: "+56998101891", priceRange: "$$",
                    description: "Cortinas roller blackout, screen, duo y motorizadas a la medida en Santiago. Visita tecnica gratuita e instalacion incluida.",
                    address: { "@type": "PostalAddress", streetAddress: "Av. Providencia 1234, Oficina 501", addressLocality: "Santiago", addressRegion: "Region Metropolitana", addressCountry: "CL" },
                    areaServed: [{ "@type": "City", name: "Santiago" }, { "@type": "City", name: "La Serena" }, { "@type": "City", name: "Coquimbo" }],
                    hasOfferCatalog: {
                        "@type": "OfferCatalog", name: "Cortinas y Persianas a Medida",
                        itemListElement: SERVICES.map(s => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } }))
                    }
                },
                {
                    "@context": "https://schema.org", "@type": "WebSite",
                    name: "TerraBlinds", url: BASE_URL,
                    potentialAction: { "@type": "SearchAction", target: `${BASE_URL}/catalog?q={search_term_string}`, "query-input": "required name=search_term_string" }
                }
            ];
        } else {
            jsonLd = {
                "@context": "https://schema.org", "@type": "Organization",
                name: "TerraBlinds", url: BASE_URL, telephone: "+56998101891",
                address: { "@type": "PostalAddress", addressLocality: "Santiago", addressCountry: "CL" }
            };
        }
    }
    const jsonLdTag = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';
    const robotsTag = (notFound || NOINDEX_PATHS.has(requestedPath)) ? '<meta name="robots" content="noindex, follow" />' : '';

    const html = `<!doctype html>
<html lang="es-CL">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${robotsTag}
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    ${ogImageTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${jsonLdTag}
</head>
<body>
    <header style="padding:16px;background:#0d2a5e;">
        <a href="${BASE_URL}"><img src="${BASE_URL}/logoterrablinds.png" alt="${SITE_NAME}" height="44" style="display:block;" /></a>
    </header>
    <main style="max-width:800px;margin:0 auto;padding:32px 16px;font-family:Arial,sans-serif;">
        <h1 style="font-size:28px;color:#1e293b;">${escapeHtml(title)}</h1>
        <p style="font-size:16px;color:#475569;line-height:1.6;">${escapeHtml(description)}</p>
        <p style="margin-top:24px;">
            <a href="https://wa.me/56998101891" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
                Cotizar por WhatsApp
            </a>
        </p>
        ${bodyContent}
    </main>
    <nav style="padding:16px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,sans-serif;">
        <a href="${BASE_URL}/" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">Inicio</a> |
        <a href="${BASE_URL}/catalog" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">Catalogo</a> |
        <a href="${BASE_URL}/quote" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">Cotizar</a> |
        <a href="${BASE_URL}/agendar" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">Agendar Visita</a> |
        <a href="${BASE_URL}/contact" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">Contacto</a> |
        <a href="${BASE_URL}/la-serena" style="margin:0 8px;color:#1d4ed8;text-decoration:none;">La Serena</a>
    </nav>
</body>
</html>`;

    if (!notFound) cacheSet(requestedPath, html);
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', notFound ? 'no-store' : 'public, max-age=3600');
    res.set('X-Prerender-Cache', 'MISS');
    res.status(notFound ? 404 : 200).send(html);
});


function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

module.exports = router;

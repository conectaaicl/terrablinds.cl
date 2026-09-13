const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Blog = require('../models/blog');
const { Config } = require('../models');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const SITE_NAME = 'TerraBlinds';
const BASE_URL = process.env.SITE_URL || 'https://terrablinds.cl';

// Static page meta definitions
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
            attributes: ['slug', 'updated_at', 'published_at'],
            order: [['published_at', 'DESC']]
        });
        for (const blog of blogs) {
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

router.get('/prerender', async (req, res) => {
    const requestedPath = req.query.path || '/';

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
                const raw = String(post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                bodyContent = `<article style="margin-top:28px;">
                    <p style="font-size:16px;color:#334155;line-height:1.75;">${escapeHtml(raw.substring(0, 3000))}</p>
                </article>` + renderContactBlock();
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
        } else if (comunaMatch) {
            const comunaName = comunaMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            bodyContent = `<section style="margin-top:28px;">
                <p style="font-size:16px;color:#334155;line-height:1.7;">
                    Instalamos cortinas roller, blackout, screen, duo y persianas a medida en ${escapeHtml(comunaName)}.
                    Coordinamos una visita tecnica gratuita en ${escapeHtml(comunaName)} para tomar las medidas exactas de
                    cada ventana, fabricamos a medida y realizamos la instalacion completa.
                </p>
            </section>` + renderServices() + renderContactBlock();
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

    const canonicalUrl = `${BASE_URL}${requestedPath}`;
    const ogImageTag = ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />\n    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : '';

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
    const robotsTag = notFound ? '<meta name="robots" content="noindex" />' : '';

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

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', notFound ? 'no-store' : 'public, max-age=3600');
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

const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Blog = require('../models/blog');

const SITE_NAME = 'TerraBlinds';
const BASE_URL = process.env.SITE_URL || 'https://terrablinds.cl';

// Static page meta definitions
const STATIC_PAGES = {
    '/': {
        title: `${SITE_NAME} - Cortinas y Persianas a Medida | Santiago, Chile`,
        description: 'Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis.',
        priority: '1.0',
        changefreq: 'weekly'
    },
    '/catalog': {
        title: `Catálogo de Productos | ${SITE_NAME}`,
        description: 'Explora nuestro catálogo completo de cortinas roller, persianas y toldos. Productos premium con instalación profesional.',
        priority: '0.9',
        changefreq: 'weekly'
    },
    '/quote': {
        title: `Cotizar Online | ${SITE_NAME}`,
        description: 'Solicita una cotización gratuita para cortinas roller, persianas o toldos a medida. Respuesta en 24 horas.',
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
        title: `Contacto | ${SITE_NAME}`,
        description: 'Contáctanos para consultas sobre cortinas roller, persianas y toldos. Atención personalizada en Santiago y todo Chile.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/projects': {
        title: `Proyectos Realizados | ${SITE_NAME}`,
        description: 'Galería de proyectos de cortinas roller, persianas, toldos y cierres de terraza instalados por TerraBlinds en Santiago y Chile.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/agendar': {
        title: `Agendar Visita | ${SITE_NAME}`,
        description: 'Agenda una visita sin costo para medición y asesoría de cortinas roller, persianas y toldos en tu hogar u oficina.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/faq': {
        title: `Preguntas Frecuentes | ${SITE_NAME}`,
        description: 'Respuestas a las preguntas más comunes sobre cortinas roller, persianas, instalación, garantías y precios en TerraBlinds.',
        priority: '0.6',
        changefreq: 'monthly'
    },
    '/cortinas-blackout': {
        title: 'Cortinas Blackout a Medida en Chile | TerraBlinds',
        description: 'Cortinas blackout de alta calidad fabricadas a medida. Bloqueo total de luz, aislacion termica y acustica. Instalacion en Santiago y todo Chile.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/cortinas-screen': {
        title: 'Cortinas Screen Solar a Medida en Chile | TerraBlinds',
        description: 'Cortinas roller screen que filtran el sol sin perder visibilidad. Diferentes porcentajes de apertura. Fabricadas a medida con instalacion en Chile.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/cortinas-roller-duo': {
        title: 'Cortinas Roller Duo a Medida en Chile | TerraBlinds',
        description: 'Cortinas Roller Duo: combina tela screen y blackout en un mismo tubo. Control total de la luz con un solo mecanismo. Fabricadas a medida.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/cortinas-motorizadas': {
        title: 'Cortinas Motorizadas en Chile | Automatizacion - TerraBlinds',
        description: 'Cortinas roller motorizadas con control remoto, app movil o Alexa/Google Home. Instalacion profesional en Chile.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/instalacion-cortinas-santiago': {
        title: 'Instalacion de Cortinas Roller en Santiago - TerraBlinds',
        description: 'Instalacion profesional de cortinas roller en Santiago. Medicion gratis a domicilio, fabricacion a medida y garantia de 2 anos.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/domotica': {
        title: `Domotica y Control Inteligente | ${SITE_NAME}`,
        description: 'Automatiza tus cortinas y hogar con domotica inteligente. Control WiFi, Alexa y Google Home. Instalacion profesional en Chile.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/automatizacion': {
        title: `Automatizacion de Cortinas y Puertas | ${SITE_NAME}`,
        description: 'Sistemas de automatizacion para cortinas roller, puertas y terrazas. Motores y controles de ultima generacion en Chile.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/cortinas-metalicas': {
        title: `Cortinas Metalicas para Negocio | ${SITE_NAME}`,
        description: 'Fabricacion e instalacion de cortinas metalicas enrollables para locales, bodegas y estacionamientos. Cotiza en Santiago.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/camaras': {
        title: `Camaras de Seguridad | ${SITE_NAME}`,
        description: 'Instalacion de camaras de seguridad IP para hogar y empresa. Vigilancia 24/7 con acceso remoto desde tu celular.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/paneles-solares': {
        title: `Paneles Solares para Hogar | ${SITE_NAME}`,
        description: 'Instalacion de paneles solares fotovoltaicos para hogares y empresas en Chile. Ahorra energia y cuida el medio ambiente.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/control-acceso': {
        title: `Control de Acceso y Cerraduras Inteligentes | ${SITE_NAME}`,
        description: 'Sistemas de control de acceso biometrico y por tarjeta para empresas y condominios. Instalacion profesional en Santiago.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/servicio-tecnico': {
        title: `Servicio Tecnico de Cortinas y Persianas | ${SITE_NAME}`,
        description: 'Reparacion y mantencion de cortinas roller, persianas y toldos. Tecnicos certificados con garantia en todo Santiago.',
        priority: '0.7',
        changefreq: 'monthly'
    },
    '/software': {
        title: `Software de Gestion para Negocios | ${SITE_NAME}`,
        description: 'Software especializado para negocios de cortinas, persianas y servicios del hogar. Gestion de cotizaciones, clientes y mas.',
        priority: '0.6',
        changefreq: 'monthly'
    },

    '/cortinas-roller-santiago': {
        title: 'Cortinas Roller Santiago | TerraBlinds',
        description: 'Instalación y fabricación de cortinas roller en Santiago. Medición sin costo, técnicos propios, garantía incluida. Cotiza gratis.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-providencia': {
        title: 'Cortinas Roller Providencia | TerraBlinds',
        description: 'Cortinas roller y persianas a medida en Providencia. Instalación profesional con garantía. Visita de medición sin costo.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-las-condes': {
        title: 'Cortinas Roller Las Condes | TerraBlinds',
        description: 'Cortinas roller premium en Las Condes. Fabricación propia, amplia gama de telas, instalación por técnicos certificados.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-maipu': {
        title: 'Cortinas Roller Maipú | TerraBlinds',
        description: 'Cortinas roller y persianas en Maipú. Atención rápida, precios competitivos, garantía de instalación. Cotiza sin costo.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-colina': {
        title: 'Cortinas Roller Colina | TerraBlinds',
        description: 'Instalación de cortinas roller en Colina y Chicureo. Medición a domicilio sin costo, fabricación propia y garantía.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-vitacura': {
        title: 'Cortinas Roller Vitacura | TerraBlinds',
        description: 'Cortinas roller de diseño en Vitacura. Telas importadas, motorización, instalación premium con garantía extendida.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-vina-del-mar': {
        title: 'Cortinas Roller Viña del Mar | TerraBlinds',
        description: 'Cortinas roller y persianas en Viña del Mar y Valparaíso. Instalación profesional, materiales resistentes al ambiente marino.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/cortinas-roller-concon': {
        title: 'Cortinas Roller Concón | TerraBlinds',
        description: 'Cortinas roller en Concón. Materiales resistentes a la humedad y sal marina. Instalación con garantía, visita sin costo.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/blog': {
        title: `Blog de Cortinas, Persianas y Hogar | ${SITE_NAME}`,
        description: 'Artículos, guías y consejos sobre cortinas roller, persianas, toldos y decoración del hogar. Expertos de TerraBlinds.',
        priority: '0.8',
        changefreq: 'weekly'
    },
    '/cierres-terraza': {
        title: 'Cierres de Terraza en Santiago | Cristal y PVC | TerraBlinds',
        description: 'Cierres de terraza con cristal templado o PVC. Convierte tu terraza en un espacio habitable todo el año. Instalación en Santiago.',
        priority: '0.9',
        changefreq: 'monthly'
    },
    '/toldos': {
        title: 'Toldos Retráctiles y Verticales en Chile | TerraBlinds',
        description: 'Toldos retráctiles y verticales a medida para terrazas y fachadas. Instalación profesional en Santiago y todo Chile.',
        priority: '0.8',
        changefreq: 'monthly'
    },
    '/persianas': {
        title: 'Persianas a Medida en Chile | Madera, Aluminio y Exterior | TerraBlinds',
        description: 'Persianas de madera, aluminio y exterior a medida. Amplia gama de modelos con instalación incluida en todo Chile.',
        priority: '0.8',
        changefreq: 'monthly'
    }
};

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
            xml += `    <changefreq>${meta.changefreq}</changefreq>\n`;
            xml += `    <priority>${meta.priority}</priority>\n`;
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

        // Blog pages
        const blogs = await Blog.findAll({
            where: { is_published: true },
            attributes: ['slug', 'updated_at'],
            order: [['published_at', 'DESC']]
        });
        for (const post of blogs) {
            const lastmod = post.updated_at
                ? new Date(post.updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
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

// GET /api/prerender?path= — Full HTML for bot crawlers (Google, Bing, etc.)
router.get('/prerender', async (req, res) => {
    const requestedPath = req.query.path || '/';
    const canonicalUrl = `${BASE_URL}${requestedPath}`;

    let title, description, ogImage, bodyHtml, jsonLd;

    // ── PRODUCT PAGE ──────────────────────────────────────────────────────────
    const productMatch = requestedPath.match(/^\/product\/(\d+)$/);
    const blogMatch    = requestedPath.match(/^\/blog\/(.+)$/);

    if (productMatch) {
        try {
            const product = await Product.findByPk(productMatch[1]);
            if (product && product.is_active) {
                title = `${product.name} | ${SITE_NAME}`;
                const desc = product.short_description || product.description || '';
                description = desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
                const images = Array.isArray(product.images) ? product.images : [];
                ogImage = images.length > 0
                    ? (images[0].startsWith('http') ? images[0] : `${BASE_URL}${images[0]}`)
                    : `${BASE_URL}/og-terrablinds.jpg`;

                const priceStr = product.base_price ? `Desde $${Number(product.base_price).toLocaleString('es-CL')}` : 'Consultar precio';
                const cats = Array.isArray(product.categories) ? product.categories.join(', ') : '';

                bodyHtml = `
<nav style="background:#0a0a0a;padding:14px 24px;border-bottom:1px solid #222">
  <a href="/" style="color:#d4af37;font-weight:700;text-decoration:none;font-size:18px">TerraBlinds</a>
  <span style="color:#555;margin:0 12px">›</span>
  <a href="/catalog" style="color:#aaa;font-size:14px;text-decoration:none">Catálogo</a>
  <span style="color:#555;margin:0 12px">›</span>
  <span style="color:#eee;font-size:14px">${escapeHtml(product.name)}</span>
</nav>
<main style="max-width:1000px;margin:40px auto;padding:0 24px;font-family:sans-serif;color:#e2e8f0;background:#0a0a0a">
  <h1 style="font-size:32px;font-weight:900;color:#fff;margin-bottom:12px">${escapeHtml(product.name)}</h1>
  ${cats ? `<p style="color:#d4af37;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px">${escapeHtml(cats)}</p>` : ''}
  <p style="font-size:18px;color:#d4af37;font-weight:700;margin-bottom:24px">${priceStr}</p>
  <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin-bottom:24px">${escapeHtml(desc)}</p>
  ${product.features ? `<ul style="color:#94a3b8;line-height:2;padding-left:20px">${(Array.isArray(product.features) ? product.features : []).map(f => `<li>${escapeHtml(String(f))}</li>`).join('')}</ul>` : ''}
  <div style="margin-top:32px;display:flex;gap:16px;flex-wrap:wrap">
    <a href="/quote" style="background:#d4af37;color:#0a0a0a;padding:14px 28px;border-radius:9px;font-weight:700;text-decoration:none">Cotizar gratis</a>
    <a href="https://wa.me/56998101891" style="background:#25d366;color:#fff;padding:14px 28px;border-radius:9px;font-weight:700;text-decoration:none">WhatsApp</a>
  </div>
  <hr style="border:none;border-top:1px solid #222;margin:40px 0">
  <h2 style="color:#fff;font-size:20px;margin-bottom:20px">Más productos</h2>
  <ul style="color:#94a3b8;line-height:2.2">
    <li><a href="/cortinas-blackout" style="color:#d4af37;text-decoration:none">Cortinas Blackout a medida</a></li>
    <li><a href="/cortinas-screen" style="color:#d4af37;text-decoration:none">Cortinas Screen solar</a></li>
    <li><a href="/cortinas-roller-duo" style="color:#d4af37;text-decoration:none">Cortinas Roller Duo (Day &amp; Night)</a></li>
    <li><a href="/cortinas-motorizadas" style="color:#d4af37;text-decoration:none">Cortinas Motorizadas</a></li>
    <li><a href="/catalog" style="color:#d4af37;text-decoration:none">Ver catálogo completo</a></li>
  </ul>
</main>`;

                jsonLd = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: product.name,
                    description: desc,
                    image: ogImage,
                    brand: { '@type': 'Brand', name: 'TerraBlinds' },
                    offers: { '@type': 'Offer', priceCurrency: 'CLP', availability: 'https://schema.org/InStock', url: canonicalUrl }
                };
            }
        } catch (e) { console.error('prerender product error:', e.message); }

    // ── BLOG PAGE ─────────────────────────────────────────────────────────────
    } else if (blogMatch) {
        try {
            const post = await Blog.findOne({ where: { slug: blogMatch[1], is_published: true } });
            if (post) {
                title = `${post.title} | ${SITE_NAME}`;
                const rawDesc = post.excerpt || post.content || '';
                description = rawDesc.replace(/<[^>]+>/g, '').substring(0, 157) + '...';
                ogImage = post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : `${BASE_URL}${post.featured_image}`) : `${BASE_URL}/og-terrablinds.jpg`;

                // Strip HTML tags from content for plain-text rendering, keep structure
                const safeContent = (post.content || '')
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

                bodyHtml = `
<nav style="background:#0a0a0a;padding:14px 24px;border-bottom:1px solid #222">
  <a href="/" style="color:#d4af37;font-weight:700;text-decoration:none;font-size:18px">TerraBlinds</a>
  <span style="color:#555;margin:0 12px">›</span>
  <a href="/blog" style="color:#aaa;font-size:14px;text-decoration:none">Blog</a>
  <span style="color:#555;margin:0 12px">›</span>
  <span style="color:#eee;font-size:14px">${escapeHtml(post.title)}</span>
</nav>
<main style="max-width:780px;margin:40px auto;padding:0 24px;font-family:sans-serif;color:#e2e8f0;background:#0a0a0a">
  <h1 style="font-size:clamp(24px,4vw,36px);font-weight:900;color:#fff;line-height:1.2;margin-bottom:20px">${escapeHtml(post.title)}</h1>
  <p style="color:#64748b;font-size:13px;margin-bottom:32px">${post.published_at ? new Date(post.published_at).toLocaleDateString('es-CL') : ''} · TerraBlinds</p>
  <div style="color:#94a3b8;font-size:16px;line-height:1.8">${safeContent}</div>
  <hr style="border:none;border-top:1px solid #222;margin:40px 0">
  <div style="display:flex;gap:16px;flex-wrap:wrap">
    <a href="/quote" style="background:#d4af37;color:#0a0a0a;padding:14px 28px;border-radius:9px;font-weight:700;text-decoration:none">Cotizar gratis</a>
    <a href="/blog" style="color:#d4af37;padding:14px;text-decoration:none;font-weight:600">← Ver más artículos</a>
  </div>
  <hr style="border:none;border-top:1px solid #222;margin:40px 0">
  <h2 style="color:#fff;font-size:18px;margin-bottom:16px">Páginas relacionadas</h2>
  <ul style="color:#94a3b8;line-height:2.2">
    <li><a href="/cortinas-blackout" style="color:#d4af37;text-decoration:none">Cortinas Blackout a medida en Chile</a></li>
    <li><a href="/cortinas-screen" style="color:#d4af37;text-decoration:none">Cortinas Screen solar a medida</a></li>
    <li><a href="/cortinas-roller-duo" style="color:#d4af37;text-decoration:none">Cortinas Roller Duo</a></li>
    <li><a href="/cortinas-motorizadas" style="color:#d4af37;text-decoration:none">Cortinas Motorizadas Chile</a></li>
    <li><a href="/instalacion-cortinas-santiago" style="color:#d4af37;text-decoration:none">Instalación de cortinas en Santiago</a></li>
  </ul>
</main>`;

                const absImg = post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : `${BASE_URL}${post.featured_image}`) : `${BASE_URL}/og-terrablinds.jpg`;
                jsonLd = {
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: post.title,
                    description: description,
                    url: canonicalUrl,
                    image: absImg,
                    datePublished: post.published_at,
                    dateModified: post.updated_at || post.published_at,
                    author: { '@type': 'Organization', name: 'TerraBlinds', url: BASE_URL },
                    publisher: { '@type': 'Organization', name: 'TerraBlinds', logo: { '@type': 'ImageObject', url: `${BASE_URL}/logoterrablinds.png` } },
                    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
                };
            }
        } catch (e) { console.error('prerender blog error:', e.message); }

    // ── STATIC PAGES ─────────────────────────────────────────────────────────
    } else {
        const pageMeta = STATIC_PAGES[requestedPath] || STATIC_PAGES['/'];
        title = pageMeta.title;
        description = pageMeta.description;
        ogImage = `${BASE_URL}/og-terrablinds.jpg`;
    }

    // ── FALLBACK HTML for home and other static pages ─────────────────────────
    if (!bodyHtml) {
        const isHome = requestedPath === '/';
        bodyHtml = `
<nav style="background:#0a0a0a;padding:14px 24px;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between">
  <a href="/" style="color:#d4af37;font-weight:700;text-decoration:none;font-size:18px">TerraBlinds</a>
  <div style="display:flex;gap:20px">
    <a href="/catalog" style="color:#aaa;font-size:14px;text-decoration:none">Catálogo</a>
    <a href="/cortinas-blackout" style="color:#aaa;font-size:14px;text-decoration:none">Blackout</a>
    <a href="/cortinas-screen" style="color:#aaa;font-size:14px;text-decoration:none">Screen</a>
    <a href="/cortinas-motorizadas" style="color:#aaa;font-size:14px;text-decoration:none">Motorizadas</a>
    <a href="/quote" style="background:#d4af37;color:#0a0a0a;padding:8px 18px;border-radius:7px;font-weight:700;text-decoration:none;font-size:14px">Cotizar</a>
  </div>
</nav>
<main style="font-family:sans-serif;color:#e2e8f0;background:#0a0a0a">
  ${isHome ? `
  <section style="max-width:1000px;margin:0 auto;padding:80px 24px 60px;text-align:center">
    <h1 style="font-size:clamp(28px,5vw,52px);font-weight:900;color:#fff;line-height:1.15;margin-bottom:20px">Cortinas Roller a Medida<br><span style="color:#d4af37">en Chile</span></h1>
    <p style="font-size:18px;color:#94a3b8;max-width:600px;margin:0 auto 32px;line-height:1.7">Fabricamos cortinas roller, persianas y toldos a medida exacta de tu ventana. Instalación profesional en Santiago y todo Chile. Cotiza gratis hoy.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:60px">
      <a href="/quote" style="background:#d4af37;color:#0a0a0a;padding:16px 36px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none">Cotizar gratis</a>
      <a href="https://wa.me/56998101891" style="background:#25d366;color:#fff;padding:16px 36px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none">WhatsApp</a>
    </div>
  </section>
  <section style="max-width:1000px;margin:0 auto;padding:0 24px 60px">
    <h2 style="font-size:28px;font-weight:800;color:#fff;text-align:center;margin-bottom:36px">Nuestros productos</h2>
    <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;list-style:none;padding:0">
      <li style="background:#111;border:1px solid #222;border-radius:12px;padding:24px">
        <h3 style="color:#d4af37;font-size:16px;margin-bottom:8px"><a href="/cortinas-blackout" style="color:#d4af37;text-decoration:none">Cortinas Blackout</a></h3>
        <p style="color:#64748b;font-size:14px;margin:0">Bloqueo total de luz. Ideal para dormitorios, home cinema y habitaciones de bebé.</p>
      </li>
      <li style="background:#111;border:1px solid #222;border-radius:12px;padding:24px">
        <h3 style="color:#d4af37;font-size:16px;margin-bottom:8px"><a href="/cortinas-screen" style="color:#d4af37;text-decoration:none">Cortinas Screen</a></h3>
        <p style="color:#64748b;font-size:14px;margin:0">Filtro solar con visibilidad al exterior. Para living, oficinas y locales.</p>
      </li>
      <li style="background:#111;border:1px solid #222;border-radius:12px;padding:24px">
        <h3 style="color:#d4af37;font-size:16px;margin-bottom:8px"><a href="/cortinas-roller-duo" style="color:#d4af37;text-decoration:none">Cortinas Roller Duo</a></h3>
        <p style="color:#64748b;font-size:14px;margin:0">Screen + Blackout en un solo mecanismo. La solución más completa.</p>
      </li>
      <li style="background:#111;border:1px solid #222;border-radius:12px;padding:24px">
        <h3 style="color:#d4af37;font-size:16px;margin-bottom:8px"><a href="/cortinas-motorizadas" style="color:#d4af37;text-decoration:none">Cortinas Motorizadas</a></h3>
        <p style="color:#64748b;font-size:14px;margin:0">Control remoto, app móvil, Alexa y Google Home. Automatización premium.</p>
      </li>
    </ul>
  </section>
  <section style="max-width:1000px;margin:0 auto;padding:0 24px 60px">
    <h2 style="font-size:24px;font-weight:800;color:#fff;margin-bottom:20px">¿Por qué elegir TerraBlinds?</h2>
    <ul style="color:#94a3b8;font-size:15px;line-height:2.2;padding-left:20px">
      <li>Fabricación a medida exacta — sin huecos, sin desperdicios</li>
      <li>Instalación profesional en Santiago y regiones</li>
      <li>Más de 40 colores y texturas disponibles</li>
      <li>Garantía de 2 años en mecanismos y tela</li>
      <li>Medición gratis a domicilio en el área metropolitana</li>
      <li>Plazo de entrega: 5 a 10 días hábiles</li>
      <li>Compatibles con Alexa, Google Home y Apple HomeKit</li>
    </ul>
  </section>
  <section style="max-width:1000px;margin:0 auto;padding:0 24px 60px">
    <h2 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:16px">Instalación en Santiago</h2>
    <p style="color:#94a3b8;font-size:15px;line-height:1.8;margin-bottom:12px">Cubrimos toda el área metropolitana: Las Condes, Vitacura, Providencia, Ñuñoa, Maipú, La Florida, San Miguel y más. <a href="/instalacion-cortinas-santiago" style="color:#d4af37;text-decoration:none">Ver zonas de cobertura →</a></p>
  </section>` : `
  <section style="max-width:1000px;margin:0 auto;padding:80px 24px">
    <h1 style="font-size:32px;font-weight:900;color:#fff;margin-bottom:16px">${escapeHtml(title)}</h1>
    <p style="color:#94a3b8;font-size:16px;line-height:1.7;margin-bottom:32px">${escapeHtml(description)}</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <a href="/quote" style="background:#d4af37;color:#0a0a0a;padding:14px 28px;border-radius:9px;font-weight:700;text-decoration:none">Cotizar gratis</a>
      <a href="/" style="color:#d4af37;padding:14px;text-decoration:none;font-weight:600">← Volver al inicio</a>
    </div>
    <hr style="border:none;border-top:1px solid #222;margin:40px 0">
    <h2 style="color:#fff;font-size:20px;margin-bottom:16px">Nuestros productos</h2>
    <ul style="color:#94a3b8;line-height:2.5;padding-left:20px">
      <li><a href="/cortinas-blackout" style="color:#d4af37;text-decoration:none">Cortinas Blackout a medida</a></li>
      <li><a href="/cortinas-screen" style="color:#d4af37;text-decoration:none">Cortinas Screen solar</a></li>
      <li><a href="/cortinas-roller-duo" style="color:#d4af37;text-decoration:none">Cortinas Roller Duo</a></li>
      <li><a href="/cortinas-motorizadas" style="color:#d4af37;text-decoration:none">Cortinas Motorizadas</a></li>
      <li><a href="/instalacion-cortinas-santiago" style="color:#d4af37;text-decoration:none">Instalación en Santiago</a></li>
    </ul>
  </section>`}
  <footer style="background:#080808;border-top:1px solid #1a1a1a;padding:32px 24px;text-align:center">
    <p style="color:#475569;font-size:13px;margin:0">© 2026 TerraBlinds · Cortinas Roller a Medida en Chile · Tel: +56 9 9810 1891 · terrablinds@gmail.com</p>
    <p style="margin:10px 0 0"><a href="/cortinas-blackout" style="color:#475569;font-size:12px;text-decoration:none;margin:0 8px">Blackout</a><a href="/cortinas-screen" style="color:#475569;font-size:12px;text-decoration:none;margin:0 8px">Screen</a><a href="/cortinas-roller-duo" style="color:#475569;font-size:12px;text-decoration:none;margin:0 8px">Roller Duo</a><a href="/cortinas-motorizadas" style="color:#475569;font-size:12px;text-decoration:none;margin:0 8px">Motorizadas</a><a href="/instalacion-cortinas-santiago" style="color:#475569;font-size:12px;text-decoration:none;margin:0 8px">Instalación Santiago</a></p>
  </footer>
</main>`;

        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'TerraBlinds',
            description: description,
            url: BASE_URL,
            telephone: '+56998101891',
            email: 'terrablinds@gmail.com',
            address: { '@type': 'PostalAddress', addressLocality: 'Santiago', addressCountry: 'CL' },
            areaServed: 'Chile',
            priceRange: '$$',
            image: `${BASE_URL}/og-terrablinds.jpg`
        };
    }

    const jsonLdTag = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';
    const safeTitle = escapeHtml(title || SITE_NAME);
    const safeDesc  = escapeHtml(description || '');
    const safeUrl   = escapeHtml(canonicalUrl);
    const safeImg   = escapeHtml(ogImage || `${BASE_URL}/og-terrablinds.jpg`);

    const html = `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}">
<link rel="canonical" href="${safeUrl}">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDesc}">
<meta property="og:url" content="${safeUrl}">
<meta property="og:type" content="website">
<meta property="og:image" content="${safeImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index,follow">
${jsonLdTag}
</head>
<body style="margin:0;background:#0a0a0a">
${bodyHtml}
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=1800');
    res.send(html);
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

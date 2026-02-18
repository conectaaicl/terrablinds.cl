const express = require('express');
const router = express.Router();
const Product = require('../models/product');

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

// GET /api/prerender?path= — Minimal HTML with meta tags for bot crawlers
router.get('/prerender', async (req, res) => {
    const requestedPath = req.query.path || '/';

    let title, description, ogImage, jsonLd;

    // Check if it's a product page
    const productMatch = requestedPath.match(/^\/product\/(\d+)$/);

    if (productMatch) {
        try {
            const product = await Product.findByPk(productMatch[1]);
            if (product && product.is_active) {
                title = `${product.name} | ${SITE_NAME}`;
                description = product.short_description || product.description || `${product.name} - Cortinas y persianas a medida en TerraBlinds.`;
                // Truncate description for meta tag
                if (description.length > 160) {
                    description = description.substring(0, 157) + '...';
                }
                const images = Array.isArray(product.images) ? product.images : [];
                ogImage = images.length > 0
                    ? (images[0].startsWith('http') ? images[0] : `${BASE_URL}${images[0]}`)
                    : null;
                jsonLd = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: product.name,
                    description: description,
                    image: ogImage || undefined,
                    brand: { '@type': 'Brand', name: SITE_NAME },
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'CLP',
                        availability: 'https://schema.org/InStock',
                        url: `${BASE_URL}/product/${product.id}`
                    }
                };
            } else {
                title = `Producto no encontrado | ${SITE_NAME}`;
                description = 'El producto solicitado no está disponible.';
            }
        } catch (err) {
            console.error('Prerender product error:', err.message);
            title = `${SITE_NAME} - Cortinas y Persianas a Medida`;
            description = STATIC_PAGES['/'].description;
        }
    } else {
        // Static page
        const pageMeta = STATIC_PAGES[requestedPath] || STATIC_PAGES['/'];
        title = pageMeta.title;
        description = pageMeta.description;
    }

    const canonicalUrl = `${BASE_URL}${requestedPath}`;
    const ogImageTag = ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />\n    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : '';
    const jsonLdTag = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';

    const html = `<!doctype html>
<html lang="es-CL">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
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
    <noscript>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <p><a href="${escapeHtml(canonicalUrl)}">Visitar ${SITE_NAME}</a></p>
    </noscript>
    <script>window.location="${escapeHtml(canonicalUrl)}";</script>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=3600');
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

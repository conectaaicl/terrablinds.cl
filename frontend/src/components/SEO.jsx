const SITE_NAME = 'TerraBlinds';
const BASE_URL = 'https://terrablinds.cl';
const DEFAULT_DESCRIPTION = 'Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis.';

const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/la-serena/hero.webp`;

const SEO = ({ title, description = DEFAULT_DESCRIPTION, path = '/', image, type = 'website', jsonLd, canonical }) => {
    const fullTitle = title
        ? (title.toLowerCase().includes('terrablinds') ? title : `${title} | ${SITE_NAME}`)
        : `${SITE_NAME} - Cortinas y Persianas a Medida | Santiago, Chile`;
    const canonicalUrl = canonical || `${BASE_URL}${path}`;
    const ogImage = image || DEFAULT_OG_IMAGE;

    return (
        <>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD */}
            {jsonLd && (Array.isArray(jsonLd)
                ? jsonLd.map((ld, i) => (
                    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
                ))
                : <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            )}
        </>
    );
};

export default SEO;

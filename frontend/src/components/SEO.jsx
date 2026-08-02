const SITE_NAME = 'TerraBlinds';
const BASE_URL = 'https://terrablinds.cl';
const DEFAULT_OG_IMAGE = 'https://terrablinds.cl/og-terrablinds.jpg';
const DEFAULT_DESCRIPTION = 'Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis.';

const SEO = ({ title, description = DEFAULT_DESCRIPTION, path = '/', image, type = 'website', jsonLd }) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Cortinas y Persianas a Medida | Santiago, Chile`;
    const canonicalUrl = `${BASE_URL}${path}`;
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
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="es_CL" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

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

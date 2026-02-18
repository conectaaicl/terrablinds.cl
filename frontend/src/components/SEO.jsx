const SITE_NAME = 'TerraBlinds';
const BASE_URL = 'https://terrablinds.cl';
const DEFAULT_DESCRIPTION = 'Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis.';

const SEO = ({ title, description = DEFAULT_DESCRIPTION, path = '/', image, type = 'website', jsonLd }) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Cortinas y Persianas a Medida | Santiago, Chile`;
    const canonicalUrl = `${BASE_URL}${path}`;

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
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

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

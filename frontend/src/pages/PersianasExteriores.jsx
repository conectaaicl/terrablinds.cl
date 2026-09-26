import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, Wind, Shield, ChevronDown, ArrowRight, CheckCircle,
    Phone, MapPin, Zap, Home, Eye, Droplets, Thermometer, Settings
} from 'lucide-react';
import SEO from '../components/SEO';
import Layout from '../components/Layout';

const WA_NUMBER = '56998101891';
const WA_MSG_COTIZAR = encodeURIComponent('Hola, me interesa cotizar una persiana exterior a medida para mi terraza/fachada en Santiago. ¿Pueden asesorarme?');
const WA_MSG_ASESORIA = encodeURIComponent('Hola, necesito asesoría para elegir persianas exteriores. ¿Pueden ayudarme?');
const WA_MSG_VISITA = encodeURIComponent('Hola, quisiera solicitar una visita técnica para cotizar persianas exteriores a medida en mi domicilio.');
const WA_URL_COTIZAR = `https://wa.me/${WA_NUMBER}?text=${WA_MSG_COTIZAR}`;
const WA_URL_ASESORIA = `https://wa.me/${WA_NUMBER}?text=${WA_MSG_ASESORIA}`;
const WA_URL_VISITA = `https://wa.me/${WA_NUMBER}?text=${WA_MSG_VISITA}`;

const track = (event, params = {}) => {
    if (window.gtag) window.gtag('event', event, { ...params, page: '/persianas-exteriores-santiago' });
};

const PROBLEMS = [
    { icon: Sun, title: 'El sol destruye tus muebles', desc: 'Los rayos UV decoloran tapizados, maderas y pisos en meses. Las persianas exteriores bloquean el calor antes de que entre al vidrio.' },
    { icon: Thermometer, title: 'Calor insoportable en verano', desc: 'Una terraza o sala con orientación poniente puede superar 35°C. El control solar exterior baja la temperatura real del ambiente.' },
    { icon: Eye, title: 'Sin privacidad en tu terraza', desc: 'Terrazas y balcones expuestos a vecinos o calles se convierten en espacios inutilizados. Las persianas exteriores recuperan ese espacio.' },
    { icon: Droplets, title: 'Lluvia y viento en tu balcón', desc: 'Una terraza sin protección es inútil en invierno. Con el sistema adecuado puedes usar ese espacio casi todo el año.' },
];

const SOLUTIONS = [
    {
        name: 'Persiana de Exterior',
        desc: 'Fabricada a medida para terrazas, balcones y fachadas. Protección UV, lluvia y viento. Disponible en versión manual y motorizada.',
        img: '/uploads/persiana-exterior-1.jpg',
        href: '/product/11',
        badge: 'Más elegida',
    },
    {
        name: 'Toldo Retráctil',
        desc: 'Se extiende sobre tu terraza para dar sombra cuando lo necesitas. Motorizable y compatible con Alexa y Google Home.',
        img: '/uploads/toldos-retractil-real.jpg',
        href: '/product/14',
        badge: 'Motorizable',
    },
    {
        name: 'Toldo Vertical',
        desc: 'Protección lateral y frontal para terrazas y pérgolas. Manual o motorizado, ideal para espacios amplios.',
        img: '/uploads/toldos-verticales.jpg',
        href: '/product/15',
        badge: null,
    },
];

const COMPARISON = [
    { aspecto: 'Bloqueo de calor', exterior: 'Antes de que entre al vidrio — hasta 70% más eficiente', interior: 'El calor ya entró; solo atenúa luz' },
    { aspecto: 'Temperatura del ambiente', exterior: 'Baja la temperatura real del espacio', interior: 'No reduce temperatura, solo percepción visual' },
    { aspecto: 'Protección UV muebles', exterior: 'Alta: bloquea los rayos en la fachada', interior: 'Parcial: depende del material del tejido' },
    { aspecto: 'Privacidad terraza', exterior: 'Total desde el exterior', interior: 'Solo desde adentro hacia afuera' },
    { aspecto: 'Protección lluvia/viento', exterior: 'Sí, en modelos especiales para exteriores', interior: 'No aplica' },
    { aspecto: 'Instalación', exterior: 'En fachada o techo; requiere fijación estructural', interior: 'Sobre el marco de la ventana' },
];

const PROCESO = [
    { n: '01', title: 'Consulta sin compromiso', desc: 'Cuéntanos tu proyecto por WhatsApp o el formulario. Respondemos en menos de 1 hora.' },
    { n: '02', title: 'Visita técnica', desc: 'Un especialista va a tu domicilio en Santiago a medir, evaluar el espacio y recomendar el sistema.' },
    { n: '03', title: 'Cotización a medida', desc: 'Recibes un presupuesto detallado con opciones de tejido, sistema y motorización. Sin letras chicas.' },
    { n: '04', title: 'Fabricación en Chile', desc: 'Fabricamos según tus medidas exactas.' },
    { n: '05', title: 'Instalación profesional', desc: 'Nuestro equipo instala y ajusta tu persiana exterior. Garantía en mano de obra incluida.' },
];

const GALLERY = [
    { src: '/uploads/persiana-exterior-1.jpg', alt: 'Persiana de exterior instalada en terraza' },
    { src: '/uploads/persiana-exterior-2.jpg', alt: 'Persiana exterior de terraza a medida' },
    { src: '/assets/la-serena/persiana-ext1.webp', alt: 'Persiana exterior en departamento' },
    { src: '/assets/la-serena/persiana-ext2.webp', alt: 'Toldo retráctil en terraza' },
    { src: '/assets/la-serena/persiana-ext3.webp', alt: 'Protección solar exterior' },
    { src: '/uploads/toldos-retractil-real.jpg', alt: 'Toldo retráctil motorizado en terraza' },
];

const COMUNAS_COBERTURA = [
    'Las Condes', 'Vitacura', 'Providencia', 'Lo Barnechea', 'Ñuñoa',
    'La Reina', 'Maipú', 'La Florida', 'San Miguel', 'Peñalolén',
    'Colina y Chicureo', 'Macul', 'La Cisterna', 'Santiago Centro', 'Puente Alto',
];

const FAQS = [
    { q: '¿Qué es una persiana de exterior?', a: 'Es un sistema de enrollado o plegado montado en la fachada o techo de un balcón o terraza, que bloquea el sol, la lluvia y el viento antes de que lleguen al vidrio o al interior. A diferencia de una cortina interior, actúa sobre el espacio exterior, lo que la hace mucho más eficiente en control solar.' },
    { q: '¿Cuál es la diferencia entre persiana exterior y cortina interior?', a: 'La persiana exterior bloquea el calor solar antes de que atraviese el vidrio, reduciendo la temperatura del ambiente hasta en varios grados. La cortina interior actúa después: el calor ya entró y solo atenúa la luz. Para control térmico real, la persiana exterior es significativamente más eficiente.' },
    { q: '¿Se pueden motorizar las persianas exteriores?', a: 'Sí. Ofrecemos versiones motorizadas compatibles con Hub de Domótica TerraBlinds, que a su vez se integra con Alexa, Google Home y Apple HomeKit. También disponemos de controladores WiFi para motores tubulares existentes.' },
    { q: '¿Las persianas exteriores resisten el viento?', a: 'Los sistemas de exterior están diseñados para soportar viento, especialmente los modelos con guías laterales que mantienen el tejido tensado. En condiciones de viento fuerte, recomendamos recogerlas.' },
    { q: '¿Cuánto dura la instalación de una persiana exterior?', a: 'La instalación típica de una persiana exterior individual toma entre 1 y 2 horas. Proyectos de múltiples unidades se planifican por jornada.' },
    { q: '¿Qué materiales se usan en las persianas de exterior?', a: 'Los tejidos técnicos para exterior están diseñados para resistir la intemperie, los rayos UV y la humedad. Los mecanismos son en aluminio.' },
    { q: '¿Sirven para terrazas de departamentos?', a: 'Sí, es una de las aplicaciones más frecuentes. El sistema se fija al techo o a la losa de la terraza. Es importante verificar que el reglamento del edificio permita instalaciones en fachada; nuestros especialistas pueden orientarte en la visita.' },
    { q: '¿Cuáles son las medidas máximas disponibles?', a: 'Fabricamos a medida según las dimensiones de tu espacio. En la visita técnica medimos y evaluamos la factibilidad según el sistema elegido.' },
    { q: '¿Tienen garantía las persianas exteriores?', a: 'Todas nuestras instalaciones incluyen garantía en mano de obra. Los mecanismos y tejidos tienen garantía del fabricante. Consulta los detalles al momento de cotizar.' },
    { q: '¿Dónde instalan en Santiago?', a: 'Cubrimos toda la Región Metropolitana: Las Condes, Vitacura, Providencia, Lo Barnechea, Ñuñoa, La Reina, Maipú, La Florida, San Miguel, Peñalolén, Colina, Chicureo, Macul, La Cisterna, Santiago Centro, Puente Alto y más comunas. Consulta disponibilidad para tu zona.' },
    { q: '¿También instalan en La Serena?', a: 'Sí, atendemos La Serena y Coquimbo. Consulta el detalle de cobertura y tiempos en nuestra página de La Serena.' },
    { q: '¿Cuánto cuestan las persianas exteriores?', a: 'El precio depende del tipo de sistema, las medidas exactas, el material del tejido y si incluye motorización. No publicamos precios estándar porque todo es a medida. Solicita cotización sin compromiso por WhatsApp o agenda una visita técnica (sin costo en la mayoría de las comunas).' },
    { q: '¿Se pueden instalar en casas con pergolado o pérgola?', a: 'Sí, los toldos verticales son especialmente adecuados para pérgolas y estructuras de madera o aluminio. En la visita técnica evaluamos el punto de fijación y recomendamos el sistema más adecuado.' },
    { q: '¿Qué pasa si llueve y la persiana está extendida?', a: 'Algunos modelos están diseñados para resistir lluvia leve. En lluvia intensa o viento fuerte, recomendamos recoger la persiana. Los modelos motorizados pueden incluir sensores de lluvia y viento opcionales.' },
    { q: '¿Puedo ver ejemplos de proyectos realizados?', a: 'Sí, puedes revisar nuestra galería de proyectos en el sitio. En la visita técnica también mostramos catálogos con instalaciones reales.' },
];

const JSONLD_SCHEMAS = [
    {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'TerraBlinds',
        description: 'Fabricación e instalación de persianas exteriores a medida en Santiago. Control solar, privacidad y motorización.',
        url: 'https://terrablinds.cl',
        telephone: '+56998101891',
        address: { '@type': 'PostalAddress', addressLocality: 'Santiago', addressRegion: 'Región Metropolitana', addressCountry: 'CL' },
        areaServed: [
            { '@type': 'City', name: 'Santiago' },
            { '@type': 'City', name: 'La Serena' },
        ],
        priceRange: '$$',
        openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' }],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '1', bestRating: '5', worstRating: '1' },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Persianas Exteriores a Medida en Santiago',
        serviceType: 'Fabricación e instalación de persianas de exterior',
        provider: { '@type': 'LocalBusiness', name: 'TerraBlinds', url: 'https://terrablinds.cl', telephone: '+56998101891' },
        areaServed: { '@type': 'State', name: 'Región Metropolitana', addressCountry: 'CL' },
        description: 'Persianas exteriores a medida para terrazas, balcones y fachadas en Santiago. Control solar, privacidad, motorización y visita técnica sin costo en la mayoría de las comunas.',
        url: 'https://terrablinds.cl/persianas-exteriores-santiago',
    },
    {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Persiana de Exterior TerraBlinds',
        description: 'Cortina para terraza, balcón y exterior en Chile. Protección UV, lluvia y viento. Fabricación a medida.',
        brand: { '@type': 'Brand', name: 'TerraBlinds' },
        category: 'Persianas',
        url: 'https://terrablinds.cl/product/11',
        image: 'https://terrablinds.cl/uploads/persiana-exterior-1.jpg',
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'CLP', seller: { '@type': 'Organization', name: 'TerraBlinds' } },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    },
    {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://terrablinds.cl' },
            { '@type': 'ListItem', position: 2, name: 'Persianas Exteriores Santiago', item: 'https://terrablinds.cl/persianas-exteriores-santiago' },
        ],
    },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            onClick={() => setOpen(o => !o)}
            style={{ borderBottom: '1px solid #e2e8f0', padding: '18px 0', cursor: 'pointer' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>{q}</h3>
                <ChevronDown size={20} color="#64748b" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{ margin: '12px 0 0', fontSize: '0.93rem', color: '#475569', lineHeight: 1.75 }}>{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SolutionCard({ sol }) {
    const [hov, setHov] = useState(false);
    return (
        <Link
            to={sol.href}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={() => track('solution_card_click', { product: sol.name })}
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', boxShadow: hov ? '0 8px 32px rgba(13,42,94,0.13)' : '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s, transform 0.2s', transform: hov ? 'translateY(-4px)' : 'none' }}
        >
            <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img src={sol.img} alt={sol.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
                {sol.badge && (
                    <span style={{ position: 'absolute', top: 12, left: 12, background: '#0d2a5e', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{sol.badge}</span>
                )}
            </div>
            <div style={{ padding: '20px', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{sol.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.65 }}>{sol.desc}</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0d2a5e', fontWeight: 600, fontSize: '0.9rem' }}>
                    Ver producto <ArrowRight size={16} />
                </span>
            </div>
        </Link>
    );
}

export default function PersianasExteriores() {
    return (
        <Layout>
            <SEO
                title="Persianas Exteriores en Santiago | A Medida | TerraBlinds"
                description="Persianas exteriores a medida en Santiago. Control solar, privacidad, confort y opciones de motorización. Asesoría, fabricación e instalación TerraBlinds."
                path="/persianas-exteriores-santiago"
                image="/uploads/persiana-exterior-1.jpg"
                type="website"
                canonical="https://terrablinds.cl/persianas-exteriores-santiago"
                jsonLd={JSONLD_SCHEMAS}
            />

            {/* ── HERO ── */}
            <section style={{ background: 'linear-gradient(135deg, #0d2a5e 0%, #1e4080 60%, #2563a8 100%)', color: '#fff', padding: '72px 24px 64px', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', fontSize: '0.85rem', marginBottom: 20, fontWeight: 500 }}>
                        <MapPin size={14} /> Santiago y La Serena
                    </div>
                    <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                        Persianas Exteriores<br />a Medida en Santiago
                    </h1>
                    <p style={{ margin: '0 0 36px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', opacity: 0.88, lineHeight: 1.7, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                        Control solar real, privacidad en tu terraza y protección para todo el año. Fabricamos e instalamos a medida con visita técnica sin costo en la mayoría de las comunas.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href={WA_URL_COTIZAR}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('hero_cta_cotizar')}
                            style={{ background: '#fff', color: '#0d2a5e', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                        >
                            COTIZAR MI PERSIANA EXTERIOR
                        </a>
                        <Link
                            to="/agendar"
                            onClick={() => track('hero_cta_visita')}
                            style={{ background: 'transparent', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.6)' }}
                        >
                            SOLICITAR VISITA
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── PROBLEM-SOLVING CARDS ── */}
            <section style={{ background: '#f8fafc', padding: '64px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
                        ¿Por qué necesitas protección solar exterior?
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', margin: '0 0 48px', lineHeight: 1.7 }}>
                        Las cortinas interiores bloquean la luz, pero el calor ya entró. Las persianas exteriores actúan antes.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                        {PROBLEMS.map((p, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                                style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <p.icon size={32} color="#0d2a5e" style={{ marginBottom: 16 }} />
                                <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{p.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.65 }}>{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── QUÉ ES UNA PERSIANA EXTERIOR ── */}
            <section style={{ padding: '64px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 20px' }}>
                        ¿Qué es una persiana exterior?
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, margin: '0 0 20px' }}>
                        Una persiana exterior es un sistema de enrollado o plegado que se monta en la fachada o en el techo de una terraza, balcón o pergolado, <strong>por fuera del vidrio</strong>. A diferencia de una cortina interior, intercepta la radiación solar antes de que atraviese el acristalamiento, lo que la hace significativamente más eficiente para controlar el calor.
                    </p>
                    <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, margin: '0 0 20px' }}>
                        Se fabrican con tejidos técnicos resistentes a la intemperie, en marcos de aluminio, y pueden ser <strong>manuales o motorizadas</strong>. En TerraBlinds las fabricamos a medida según las dimensiones exactas de tu espacio.
                    </p>
                    <div style={{ background: '#f0f4ff', borderLeft: '4px solid #0d2a5e', borderRadius: '0 8px 8px 0', padding: '18px 22px', margin: '28px 0 0' }}>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.7 }}>
                            <strong>Aplicaciones frecuentes:</strong> terrazas de departamentos, balcones, pérgolas, casas con orientación poniente o norte, jardines de invierno, fachadas de oficinas.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── COMPARACIÓN EXTERIOR VS INTERIOR ── */}
            <section style={{ background: '#f8fafc', padding: '64px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
                        Persiana exterior vs cortina interior
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', margin: '0 0 40px', lineHeight: 1.7 }}>
                        Ambas bloquean la luz, pero no el calor. Esta es la diferencia real.
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.93rem', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                            <thead>
                                <tr style={{ background: '#0d2a5e', color: '#fff' }}>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600 }}>Aspecto</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>Persiana Exterior</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>Cortina Interior</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>{row.aspecto}</td>
                                        <td style={{ padding: '14px 18px', color: '#16a34a', borderLeft: '1px solid #e2e8f0' }}>
                                            <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{row.exterior}
                                        </td>
                                        <td style={{ padding: '14px 18px', color: '#64748b', borderLeft: '1px solid #e2e8f0' }}>{row.interior}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── SOLUCIONES ── */}
            <section style={{ padding: '64px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
                        Soluciones de protección solar exterior
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', margin: '0 0 48px', lineHeight: 1.7 }}>
                        Fabricamos a medida según tu espacio, orientación y necesidades.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
                        {SOLUTIONS.map((s, i) => <SolutionCard key={i} sol={s} />)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link
                            to="/catalog"
                            onClick={() => track('view_catalog_click')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0d2a5e', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid #0d2a5e', padding: '12px 28px', borderRadius: 10 }}
                        >
                            Ver catálogo completo <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── DETALLE PERSIANA EXTERIOR ── */}
            <section style={{ background: '#f8fafc', padding: '64px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 20px' }}>
                            Persiana de Exterior: el sistema más completo
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, margin: '0 0 16px' }}>
                            Nuestra <strong>Persiana de Exterior</strong> es el sistema más demandado para terrazas y balcones en Santiago. Combina protección UV, control de lluvia leve y privacidad en un solo elemento.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, margin: '0 0 24px' }}>
                            El tejido técnico exterior es resistente a la intemperie y fabricado en Chile según las medidas exactas de tu espacio. Disponible en versión manual con sistema de cadena y versión motorizada.
                        </p>
                        <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {['Fabricación a medida exacta', 'Tejido técnico resistente a UV e intemperie', 'Marco de aluminio', 'Versión manual o motorizada', 'Colores y opacidades a elección', 'Visita técnica sin costo en la mayoría de las comunas'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.95rem', color: '#1e293b' }}>
                                    <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <a
                            href={WA_URL_COTIZAR}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('cta_persiana_detail')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2a5e', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}
                        >
                            HABLAR POR WHATSAPP <ArrowRight size={16} />
                        </a>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <img src="/uploads/persiana-exterior-1.jpg" alt="Persiana exterior a medida en Santiago" loading="lazy" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '3/4' }} />
                        <img src="/uploads/persiana-exterior-2.jpg" alt="Persiana de exterior instalada en terraza" loading="lazy" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '3/4', marginTop: 28 }} />
                    </div>
                </div>
            </section>

            {/* ── MOTORIZACIÓN ── */}
            <section style={{ padding: '64px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 10 }}>
                            <Zap size={28} color="#0d2a5e" />
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                            Motorización y domótica
                        </h2>
                    </div>
                    <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, margin: '0 0 24px' }}>
                        Las persianas exteriores motorizadas se controlan con mando, app o tu asistente de voz favorito. No más salir al balcón con calor para recoger la persiana.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, margin: '0 0 32px' }}>
                        {[
                            { icon: Settings, title: 'Control por app', desc: 'Maneja todas las persianas desde tu teléfono, desde cualquier lugar.' },
                            { icon: Home, title: 'Alexa, Google Home, Apple HomeKit', desc: 'Compatible con los principales ecosistemas de domótica. Datos confirmados de Hub TerraBlinds.' },
                            { icon: Zap, title: 'Automatización', desc: 'Programa horarios o conecta con sensores de luz y temperatura.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '24px 20px', border: '1px solid #e2e8f0' }}>
                                <item.icon size={24} color="#0d2a5e" style={{ marginBottom: 12 }} />
                                <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{item.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.65 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Link
                        to="/domotica"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0d2a5e', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}
                    >
                        Ver sistema de domótica completo <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* ── PROCESO ── */}
            <section style={{ background: '#0d2a5e', padding: '64px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
                        Cómo trabajamos
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', margin: '0 0 48px', lineHeight: 1.7 }}>
                        Desde la primera consulta hasta la instalación con garantía.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
                        {PROCESO.map((paso, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                                style={{ textAlign: 'center', padding: '24px 16px' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.18)', marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>{paso.n}</div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{paso.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.87rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{paso.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                        <a
                            href={WA_URL_VISITA}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('proceso_cta_visita')}
                            style={{ background: '#fff', color: '#0d2a5e', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}
                        >
                            SOLICITAR VISITA TÉCNICA
                        </a>
                    </div>
                </div>
            </section>

            {/* ── GALERÍA ── */}
            <section style={{ padding: '64px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
                        Proyectos reales
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', margin: '0 0 40px', lineHeight: 1.7 }}>
                        Instalaciones de persianas exteriores y toldos en Santiago y La Serena.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                        {GALLERY.map((img, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                                style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#f1f5f9' }}>
                                <img src={img.src} alt={img.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 36 }}>
                        <Link
                            to="/projects"
                            onClick={() => track('view_projects_click')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0d2a5e', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '2px solid #0d2a5e', padding: '12px 24px', borderRadius: 10 }}
                        >
                            Ver más proyectos <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA CENTRAL ── */}
            <section style={{ background: '#f0f4ff', padding: '56px 24px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 16px' }}>
                        ¿Listo para proteger tu terraza?
                    </h2>
                    <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 36px' }}>
                        Agenda una visita técnica (sin costo en la mayoría de las comunas de Santiago). Un especialista va a tu domicilio a medir y cotizar sin compromiso.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href={WA_URL_COTIZAR}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('mid_cta_cotizar')}
                            style={{ background: '#0d2a5e', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}
                        >
                            HABLAR POR WHATSAPP
                        </a>
                        <Link
                            to="/quote"
                            onClick={() => track('mid_cta_quote_form')}
                            style={{ background: '#fff', color: '#0d2a5e', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', border: '2px solid #0d2a5e' }}
                        >
                            QUIERO ASESORÍA
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── COBERTURA ── */}
            <section style={{ padding: '64px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <MapPin size={28} color="#0d2a5e" />
                        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                            Cobertura en Santiago
                        </h2>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, margin: '0 0 28px' }}>
                        Instalamos persianas exteriores en toda la Región Metropolitana. También cubrimos <Link to="/la-serena" style={{ color: '#0d2a5e', fontWeight: 600 }}>La Serena y Coquimbo</Link>.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {COMUNAS_COBERTURA.map((c, i) => (
                            <Link
                                key={i}
                                to={`/cortinas/${c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                                style={{ background: '#f0f4ff', color: '#0d2a5e', padding: '7px 16px', borderRadius: 20, fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', border: '1px solid #dbeafe' }}
                            >
                                {c}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section style={{ background: '#f8fafc', padding: '64px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
                        Preguntas frecuentes
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', margin: '0 0 40px', lineHeight: 1.7 }}>
                        Sobre persianas exteriores, motorización e instalación en Santiago.
                    </p>
                    <div>
                        {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link
                            to="/faq"
                            style={{ color: '#0d2a5e', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}
                        >
                            Ver más preguntas frecuentes →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── ENLACES INTERNOS ── */}
            <section style={{ padding: '56px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
                        También puede interesarte
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                        {[
                            { label: 'Control Solar en Santiago', href: '/control-solar' },
                            { label: 'Cortinas Roller', href: '/catalog' },
                            { label: 'Cierres de Terraza', href: '/product/16' },
                            { label: 'Domótica para el Hogar', href: '/domotica' },
                            { label: 'Servicio Técnico', href: '/servicio-tecnico' },
                            { label: 'Proyectos Realizados', href: '/projects' },
                            { label: 'Cortinas en Las Condes', href: '/cortinas/las-condes' },
                            { label: 'Cortinas en Vitacura', href: '/cortinas/vitacura' },
                            { label: 'La Serena y Coquimbo', href: '/la-serena' },
                        ].map((l, i) => (
                            <Link
                                key={i}
                                to={l.href}
                                style={{ color: '#0d2a5e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, border: '1px solid #dbeafe', background: '#f0f4ff' }}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section style={{ background: '#0d2a5e', padding: '64px 24px', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 640, margin: '0 auto' }}>
                    <Phone size={36} color="rgba(255,255,255,0.6)" style={{ marginBottom: 20 }} />
                    <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
                        Haz tu consulta ahora
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.75, margin: '0 0 36px' }}>
                        Respondemos por WhatsApp en menos de 1 hora en horario hábil. Visita técnica sin costo en la mayoría de las comunas de Santiago.
                    </p>
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href={WA_URL_COTIZAR}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('footer_cta_cotizar')}
                            style={{ background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}
                        >
                            COTIZAR MI PERSIANA EXTERIOR
                        </a>
                        <Link
                            to="/agendar"
                            onClick={() => track('footer_cta_agendar')}
                            style={{ background: 'transparent', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' }}
                        >
                            SOLICITAR VISITA
                        </Link>
                    </div>
                </motion.div>
            </section>
        </Layout>
    );
}

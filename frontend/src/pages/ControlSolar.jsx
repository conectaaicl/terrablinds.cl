import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, ShieldCheck, Zap, ChevronDown, ChevronUp, ArrowRight, MessageCircle, ThermometerSun } from 'lucide-react';
import SEO from '../components/SEO';
import Layout from '../components/Layout';

const WA_NUMBER = '56998101891';
const WA_URL_COTIZAR = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, quiero cotizar una solución de control solar para mi espacio.')}`;
const WA_URL_ASESORIA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, quisiera una asesoría sobre qué sistema de control solar me conviene.')}`;
const WA_URL_VISITA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, quisiera solicitar una visita técnica gratuita para evaluar mi espacio.')}`;

const track = (event, params = {}) => {
  if (window.gtag) window.gtag('event', event, { ...params, page: '/control-solar' });
};

const INTERIOR_PRODUCTS = [
  { id: 10, slug: 'roller-screen', name: 'Cortina Roller Screen', tag: 'Interior',
    benefit: 'Luz filtrada + vista al exterior',
    desc: 'Filtra la luz directa manteniendo tu vista al exterior. Reduce el deslumbramiento en pantallas hasta un 80%. Ideal para oficinas, livings y espacios con pantallas.',
    image: '/uploads/roller-screen-1.jpg' },
  { id: 8, slug: 'roller-blackout', name: 'Cortina Roller Blackout', tag: 'Interior',
    benefit: 'Bloqueo hasta un 99% de luz solar',
    desc: 'Bloquea hasta el 99% de la luz solar. Disponible en más de 20 colores. Ideal para dormitorios, cines en casa y espacios donde necesitas oscurecimiento total.',
    image: '/uploads/roller-blackout-1.jpg' },
  { id: 5, slug: 'roller-dual-doble', name: 'Cortina Roller Dual / Doble', tag: 'Interior',
    benefit: 'Oscurecimiento + luz suave en un sistema',
    desc: 'Dos capas en un sistema: una opaca y una translúcida. Alterna entre privacidad total y luz suave sin desmontar nada. La favorita para livings y dormitorios.',
    image: '/uploads/roller-dual-1.jpg' },
  { id: 6, slug: 'roller-duo-blackout', name: 'Cortina Roller Duo Blackout', tag: 'Interior',
    benefit: 'Día y noche en un solo movimiento',
    desc: 'Sistema doble con tela blackout y screen. Pasa del día a la noche con un solo movimiento. Perfecto para dormitorios y home theater.',
    image: '/uploads/roller-duo-blackout-1.jpg' },
];

const EXTERIOR_PRODUCTS = [
  { id: 11, slug: 'persiana-exterior', name: 'Persiana de Exterior', tag: 'Exterior',
    benefit: 'Bloquea el calor antes del vidrio',
    desc: 'Telas técnicas con protección UV, resistencia al agua y al viento. Bloquea el calor antes de que entre al vidrio. Para terrazas, balcones y pérgolas.',
    image: '/uploads/persiana-exterior-1.jpg' },
  { id: 14, slug: 'toldo-retractil', name: 'Toldo Retráctil', tag: 'Exterior',
    benefit: 'Sombra automática · Alexa + Google Home',
    desc: 'Lona técnica UV + motor tubular. Compatible con Alexa y Google Home. Sensor de viento opcional. Estructura de aluminio anodizado.',
    image: '/uploads/toldos-retractil-real.jpg' },
  { id: 15, slug: 'toldos-verticales', name: 'Toldo Vertical', tag: 'Exterior',
    benefit: 'Protección lateral completa',
    desc: 'Protección lateral y frontal para terrazas y pérgolas. Manual o motorizado. Ideal para restaurantes, terrazas de departamentos y espacios comerciales.',
    image: '/uploads/toldos-verticales.jpg' },
];

const FAQS = [
  { q: '¿Qué es el control solar y por qué importa?',
    a: 'El control solar regula cuánta luz y calor del sol entra a tu espacio. Mejora el confort, reduce el consumo de climatización y protege tus muebles y pantallas del deterioro. Una buena gestión del sol es especialmente importante en Santiago por la intensidad solar en verano.' },
  { q: '¿Qué diferencia hay entre una solución de control solar interior y exterior?',
    a: 'Una solución interior (cortina roller) actúa sobre la luz después de que entró al espacio. Una exterior (persiana, toldo) intercepta el calor antes de que cruce el vidrio, siendo hasta un 70% más eficiente para reducir la temperatura interior. Para ventanas, una roller screen o blackout; para terrazas y balcones, una persiana de exterior o toldo.' },
  { q: '¿Qué tela elijo: screen, blackout o dual?',
    a: 'Screen si quieres filtrar el sol y reducir el calor manteniendo visibilidad al exterior (oficinas y livings con vista). Blackout si necesitas oscurecimiento total (dormitorios, cines). Dual o Duo si quieres ambas funciones en el mismo sistema.' },
  { q: '¿Se pueden motorizar todas las soluciones de control solar?',
    a: 'Sí. Todas las cortinas roller y persianas exteriores tienen versión motorizada. Los toldos retráctiles incluyen motor. Con el Hub de Domótica TerraBlinds son compatibles con Alexa, Google Home y Apple HomeKit.' },
  { q: '¿Cuánto demora la fabricación e instalación?',
    a: 'La visita técnica es gratuita y dura 30-60 minutos. La fabricación tarda 5 a 7 días hábiles tras confirmar la cotización. La instalación de cortinas roller es de 1 a 2 horas por ventana; persianas de exterior y toldos pueden tomar una mañana completa.' },
  { q: '¿Fabrican a medida o trabajan con tamaños estándar?',
    a: 'Fabricamos 100% a medida. No manejamos tamaños estándar: cada sistema se fabrica según las medidas exactas de tu ventana, terraza o balcón en Santiago.' },
  { q: '¿En qué comunas instalan?',
    a: 'Cubrimos toda la Región Metropolitana: Las Condes, Vitacura, Providencia, Lo Barnechea, Ñuñoa, La Reina, Maipú, La Florida, San Miguel, Peñalolén, Colina y más. También operamos en La Serena y Coquimbo.' },
];

const PROCESO = [
  { n: '01', title: 'Consulta', desc: 'Por WhatsApp o formulario, sin compromiso.' },
  { n: '02', title: 'Visita técnica', desc: 'Gratuita. Medimos y evaluamos tu espacio.' },
  { n: '03', title: 'Cotización', desc: 'Opciones de material, color y motorización.' },
  { n: '04', title: 'Fabricación', desc: '5 a 7 días hábiles en Chile, a medida.' },
  { n: '05', title: 'Instalación', desc: 'Profesional, con garantía de mano de obra.' },
];

const JSONLD_SCHEMAS = [
  { "@context": "https://schema.org", "@type": "LocalBusiness",
    name: "TerraBlinds",
    description: "Fabricación e instalación de soluciones de control solar a medida en Santiago.",
    url: "https://terrablinds.cl", telephone: "+56998101891",
    address: { "@type": "PostalAddress", addressLocality: "Santiago", addressRegion: "Región Metropolitana", addressCountry: "CL" },
    areaServed: [{ "@type": "City", name: "Santiago" }, { "@type": "City", name: "La Serena" }],
    priceRange: "$$", image: "https://terrablinds.cl/uploads/roller-blackout-1.jpg", aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "1", bestRating: "5", worstRating: "1" } },
  { "@context": "https://schema.org", "@type": "Service",
    name: "Control Solar Santiago — Cortinas, Persianas y Toldos a Medida",
    serviceType: "Control Solar y Protección Solar",
    provider: { "@type": "LocalBusiness", name: "TerraBlinds", url: "https://terrablinds.cl", telephone: "+56998101891" },
    areaServed: { "@type": "State", name: "Región Metropolitana", addressCountry: "CL" },
    description: "Diseño, fabricación e instalación de soluciones de control solar interior y exterior a medida en Santiago.",
    url: "https://terrablinds.cl/control-solar" },
  { "@context": "https://schema.org", "@type": "ItemList",
    name: "Soluciones de Control Solar TerraBlinds",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Cortina Roller Screen", url: "https://terrablinds.cl/product/10" },
      { "@type": "ListItem", position: 2, name: "Cortina Roller Blackout", url: "https://terrablinds.cl/product/8" },
      { "@type": "ListItem", position: 3, name: "Cortina Roller Dual", url: "https://terrablinds.cl/product/5" },
      { "@type": "ListItem", position: 4, name: "Cortina Roller Duo Blackout", url: "https://terrablinds.cl/product/6" },
      { "@type": "ListItem", position: 5, name: "Persiana de Exterior", url: "https://terrablinds.cl/product/11" },
      { "@type": "ListItem", position: 6, name: "Toldo Retráctil", url: "https://terrablinds.cl/product/14" },
      { "@type": "ListItem", position: 7, name: "Toldos Verticales", url: "https://terrablinds.cl/product/15" },
      { "@type": "ListItem", position: 8, name: "Hub de Domótica", url: "https://terrablinds.cl/product/2" },
    ] },
  { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "¿Qué es el control solar?",
        acceptedAnswer: { "@type": "Answer", text: "El control solar regula cuánta luz y calor del sol entra a tu espacio. Mejora el confort, reduce el consumo de climatización y protege muebles y pantallas del deterioro." } },
      { "@type": "Question", name: "¿Qué diferencia hay entre control solar interior y exterior?",
        acceptedAnswer: { "@type": "Answer", text: "Una solución interior actúa sobre la luz después de que entró al espacio. Una exterior intercepta el calor antes de que cruce el vidrio, siendo hasta un 70% más eficiente para reducir la temperatura." } },
      { "@type": "Question", name: "¿Se pueden motorizar las cortinas y persianas?",
        acceptedAnswer: { "@type": "Answer", text: "Sí. Todas las cortinas roller y persianas exteriores tienen versión motorizada. Con el Hub de Domótica TerraBlinds son compatibles con Alexa, Google Home y Apple HomeKit." } },
    ] },
  { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://terrablinds.cl" },
      { "@type": "ListItem", position: 2, name: "Control Solar", item: "https://terrablinds.cl/control-solar" },
    ] },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button onClick={onToggle} style={{
        width: '100%', textAlign: 'left', padding: '18px 0',
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.4 }}>{faq.q}</span>
        {isOpen ? <ChevronUp size={18} color="#0d2a5e" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#94a3b8" style={{ flexShrink: 0 }} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.75, paddingBottom: '18px', margin: 0 }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div whileHover={{ y: -4 }}
      onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)}
      style={{ background: '#fff', borderRadius: '12px',
        border: `1px solid ${hover ? '#0d2a5e' : '#e2e8f0'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#f1f5f9' }}>
        <img src={product.image} alt={product.name} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          background: product.tag === 'Exterior' ? '#0d2a5e' : '#1e40af',
          color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px'
        }}>{product.tag}</span>
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>{product.name}</h3>
        <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 10px' }}>{product.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <ShieldCheck size={14} color="#166534" />
          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>{product.benefit}</span>
        </div>
        <Link to={`/product/${product.id}`}
          onClick={() => track('control_solar_product_click', { product: product.slug })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '0.82rem', fontWeight: 600, color: '#0d2a5e', textDecoration: 'none' }}>
          Ver detalles <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ControlSolar() {
  const [openFaq, setOpenFaq] = useState(null);
  const [tab, setTab] = useState('interior');

  return (
    <Layout>
      <SEO
        title="Control Solar Santiago | Cortinas, Persianas y Toldos | TerraBlinds"
        description="Soluciones de control solar a medida en Santiago: cortinas roller screen, blackout, duo, persianas exteriores y toldos. Interior y exterior. Fabricación e instalación TerraBlinds."
        canonical="/control-solar"
        jsonLd={JSONLD_SCHEMAS}
      />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0d2a5e 0%, #1e40af 100%)',
        color: '#fff', padding: '72px 24px 56px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.12)', borderRadius: '20px', padding: '6px 14px',
            fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '20px', color: '#bfdbfe' }}>
            <Sun size={14} /> Santiago &amp; La Serena
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
            Control Solar en Santiago:<br />Cortinas, Persianas y Toldos a Medida
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', opacity: 0.85, lineHeight: 1.7,
            margin: '0 0 32px', maxWidth: '600px', marginInline: 'auto' }}>
            Del roller screen que filtra el deslumbramiento en tu pantalla, a la persiana exterior que bloquea el calor
            antes de que entre a tu terraza. Fabricamos y montamos a medida.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WA_URL_COTIZAR} target="_blank" rel="noopener noreferrer"
              onClick={() => track('hero_cta_cotizar')}
              style={{ background: '#25D366', color: '#fff', fontWeight: 700,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} /> COTIZAR MI SOLUCIÓN
            </a>
            <a href={WA_URL_ASESORIA} target="_blank" rel="noopener noreferrer"
              onClick={() => track('hero_cta_asesoria')}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              QUIERO ASESORÍA
            </a>
          </div>
        </motion.div>
      </section>

      {/* QUÉ ES EL CONTROL SOLAR */}
      <section style={{ padding: '56px 24px', maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>
          ¿Qué es el control solar?
        </h2>
        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, margin: '0 auto 32px', maxWidth: '640px' }}>
          El control solar es gestionar cuánta luz y calor del sol entra a tu espacio.
          Un espacio sin control solar es más caliente en verano, más difícil de climatizar,
          y sus muebles y pantallas se deterioran más rápido. Con los sistemas adecuados,
          tu entorno es confortable en cualquier época del año.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { icon: <ThermometerSun size={26} color="#0d2a5e" />, label: 'Menos calor', desc: 'Reduce temperatura interior' },
            { icon: <Sun size={26} color="#0d2a5e" />, label: 'Menos deslumbramiento', desc: 'Protege pantallas del glare' },
            { icon: <ShieldCheck size={26} color="#0d2a5e" />, label: 'Más privacidad', desc: 'Sin sacrificar luz natural' },
            { icon: <Zap size={26} color="#0d2a5e" />, label: 'Ahorro energético', desc: 'Menos climatización' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px 14px', textAlign: 'center' }}>
              <div style={{ marginBottom: '10px' }}>{item.icon}</div>
              <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', margin: '0 0 4px' }}>{item.label}</p>
              <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS CON TABS */}
      <section style={{ padding: '0 24px 56px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
          Soluciones a medida
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 28px', fontSize: '0.95rem' }}>
          Interior o exterior — cada espacio tiene su solución óptima
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[{ key: 'interior', label: 'Interior — Cortinas Roller' }, { key: 'exterior', label: 'Exterior — Persianas y Toldos' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem',
              background: tab === t.key ? '#0d2a5e' : '#f1f5f9',
              color: tab === t.key ? '#fff' : '#475569', transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {(tab === 'interior' ? INTERIOR_PRODUCTS : EXTERIOR_PRODUCTS).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* INTERIOR VS EXTERIOR */}
      <section style={{ padding: '48px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 20px', textAlign: 'center' }}>
            Interior vs. exterior: ¿qué solución te conviene?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { color: '#1e40af', title: 'Cortinas Roller (Interior)',
                items: ['Ideal para ventanas interiores', 'Filtra o bloquea la luz solar entrante',
                  'Screen: mantiene visión al exterior', 'Blackout: oscurecimiento total 99%',
                  'Dual/Duo: dos funciones en un sistema', 'Fabricación a medida, instalación limpia'] },
              { color: '#0d2a5e', title: 'Persianas y Toldos (Exterior)',
                items: ['Actúan antes de que el calor cruce el vidrio', 'Hasta un 70% más eficiente que interior',
                  'Ideal para terrazas, balcones y pérgolas', 'Persiana: UV + lluvia + viento',
                  'Toldo retráctil: sombra motorizada', 'Compatibles con Alexa y Google Home'] },
            ].map((col, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: col.color, margin: '0 0 12px' }}>{col.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '0.85rem', color: '#475569' }}>
                      <span style={{ color: col.color, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOTORIZACIÓN */}
      <section style={{ padding: '56px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <img src="/uploads/hub-domotica-1.webp" alt="Hub de Domótica TerraBlinds" loading="lazy"
              style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '280px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 14px' }}>
              Motorización y automatización
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.75, margin: '0 0 16px' }}>
              Con el <strong>Hub de Domótica TerraBlinds</strong>, todas tus cortinas y persianas motorizadas
              se controlan por app, por voz o por horarios automáticos.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
              {[
                { label: 'Compatible con Alexa', desc: 'Control por voz' },
                { label: 'Compatible con Google Home', desc: 'Rutinas automáticas' },
                { label: 'Compatible con Apple HomeKit', desc: 'Integración iOS' },
                { label: 'Horarios automáticos', desc: 'Abre al amanecer, cierra al atardecer' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <Zap size={14} color="#0d2a5e" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>
                    <strong style={{ fontSize: '0.87rem', color: '#1e293b' }}>{item.label}</strong>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}> — {item.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/domotica" style={{ color: '#0d2a5e', fontWeight: 600, fontSize: '0.88rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              Ver todas las opciones de motorización <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section style={{ padding: '48px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', textAlign: 'center' }}>
            Nuestro proceso
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 32px', fontSize: '0.9rem' }}>
            De la consulta a la instalación, sin sorpresas
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {PROCESO.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center', padding: '20px 12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0d2a5e',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', margin: '0 auto 12px' }}>{step.n}</div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', margin: '0 0 4px' }}>{step.title}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CENTRAL */}
      <section style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>
            ¿No sabes qué sistema necesitas?
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 28px', lineHeight: 1.7 }}>
            Cuéntanos tu espacio y te decimos qué tipo de control solar te conviene. Sin compromiso.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WA_URL_ASESORIA} target="_blank" rel="noopener noreferrer"
              onClick={() => track('mid_cta_asesoria')}
              style={{ background: '#0d2a5e', color: '#fff', fontWeight: 700,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem' }}>
              QUIERO ASESORÍA GRATUITA
            </a>
            <a href={WA_URL_VISITA} target="_blank" rel="noopener noreferrer"
              onClick={() => track('mid_cta_visita')}
              style={{ background: '#f1f5f9', color: '#0d2a5e', fontWeight: 600,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem' }}>
              SOLICITAR VISITA TÉCNICA
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '48px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1e293b', margin: '0 0 28px', textAlign: 'center' }}>
            Preguntas frecuentes sobre control solar
          </h2>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} faq={faq} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* ENLACES INTERNOS */}
      <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>
          También puede interesarte
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { to: '/persianas-exteriores-santiago', label: 'Persianas Exteriores en Santiago', desc: 'Protección UV, lluvia y viento para tu terraza' },
            { to: '/domotica', label: 'Domótica y Motorización', desc: 'Alexa, Google Home y Apple HomeKit' },
            { to: '/catalog', label: 'Catálogo completo', desc: 'Todos nuestros productos a medida' },
            { to: '/blog/diferencia-cortinas-blackout-screen', label: 'Blackout vs. Screen', desc: '¿Cuál te conviene? Guía completa' },
          ].map((link, i) => (
            <Link key={i} to={link.to} style={{ display: 'block', padding: '16px 18px',
              background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0d2a5e', margin: '0 0 4px' }}>{link.label}</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '56px 24px',
        background: 'linear-gradient(135deg, #0d2a5e 0%, #1e40af 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            Solución de control solar a medida en Santiago
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: '0 0 28px', lineHeight: 1.7 }}>
            Visita técnica gratuita. Fabricamos en Chile. Instalamos en toda la Región Metropolitana.
            Respondemos en menos de 1 hora.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WA_URL_COTIZAR} target="_blank" rel="noopener noreferrer"
              onClick={() => track('final_cta_cotizar')}
              style={{ background: '#25D366', color: '#fff', fontWeight: 700,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} /> COTIZAR MI SOLUCIÓN
            </a>
            <a href={WA_URL_VISITA} target="_blank" rel="noopener noreferrer"
              onClick={() => track('final_cta_visita')}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600,
                padding: '14px 28px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              SOLICITAR VISITA
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

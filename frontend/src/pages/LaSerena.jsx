import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, MapPin, Sun, Shield, Zap, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const WA_NUMBER  = '56998101891';
const WA_MSG     = encodeURIComponent('Hola, vi TerraBlinds para La Serena y quiero solicitar una cotización.');
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

const track = (event, params = {}) => { if (window.gtag) window.gtag('event', event, params); };

// FAQs reales y verdaderas — el mismo set va en el prerender (schema FAQPage).
const FAQS = [
    { q: '¿Atienden en La Serena y Coquimbo?', a: 'Sí. Coordinamos una visita a domicilio en La Serena y Coquimbo para tomar las medidas y cotizar, sin costo ni compromiso.' },
    { q: '¿Las cortinas son realmente a medida?', a: 'Sí. Cada cortina se confecciona según las medidas exactas de tu ventana; no trabajamos con medidas estándar que después no calzan.' },
    { q: '¿Qué cortina conviene para el sol fuerte del norte?', a: 'Para living y espacios con vista, el roller screen filtra el sol sin oscurecer. Para dormitorios, el blackout entrega oscuridad total. En la visita te recomendamos la tela según la orientación de cada ventana.' },
    { q: '¿Puedo controlar las cortinas desde el celular?', a: 'Sí. Cualquier cortina roller puede motorizarse y controlarse por app o por voz con un controlador WiFi.' },
    { q: '¿Cómo pido una cotización?', a: 'Por WhatsApp o con el formulario del sitio. Coordinamos la visita a domicilio y te entregamos el presupuesto con las medidas reales.' },
];

// Cada producto enlaza a su página real del catálogo (URLs verificadas).
const PRODUCTS = [
    { name: 'Roller Screen', desc: 'Filtra el sol sin perder la vista al exterior.', img: '/assets/la-serena/roller-screen.webp', href: '/product/10' },
    { name: 'Roller Blackout', desc: 'Oscurecimiento total para dormitorios.', img: '/assets/la-serena/roller-blackout.webp', href: '/product/8' },
    { name: 'Roller Duo / Dual', desc: 'Regula luz y privacidad con un solo movimiento.', img: '/assets/la-serena/roller-duo.webp', href: '/product/5' },
    { name: 'Persiana de Exterior', desc: 'Bloquea el calor antes de que entre al interior.', img: '/assets/la-serena/persiana-ext1.webp', href: '/product/11' },
    { name: 'Toldos', desc: 'Retráctiles y verticales para terrazas y balcones.', img: '/assets/la-serena/roller-dobles.webp', href: '/catalog?category=Toldos' },
    { name: 'Motorización', desc: 'Control por app o voz con un controlador WiFi.', img: '/assets/la-serena/roller-duo1.webp', href: '/product/4' },
];

const GALLERY = [
    '/assets/la-serena/roller-screen1.webp',
    '/assets/la-serena/roller-blackout2.webp',
    '/assets/la-serena/roller-dobles1.webp',
    '/assets/la-serena/persiana-ext2.webp',
    '/assets/la-serena/roller-dobles2.webp',
    '/assets/la-serena/persiana-ext3.webp',
];

const PROCESS = [
    { n: '01', title: 'Cuéntanos qué necesitas', desc: 'Por WhatsApp o formulario. No necesitas medidas exactas.' },
    { n: '02', title: 'Visita a domicilio', desc: 'Vamos a medir cada ventana en La Serena o Coquimbo.' },
    { n: '03', title: 'Presupuesto claro', desc: 'Con las medidas reales, sin costos ocultos.' },
    { n: '04', title: 'Instalación', desc: 'Coordinamos la fabricación a medida y realizamos la instalación.' },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
                <span className="font-semibold text-gray-900 text-[15px] leading-snug">{q}</span>
                <span className="shrink-0 text-amber-500">{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-gray-500 text-sm leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProductCard({ name, desc, img, href }) {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={href}
            className="relative overflow-hidden rounded-2xl group block"
            style={{ aspectRatio: '3/4' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => track('product_click', { product: name, page: 'la-serena' })}
        >
            <img src={img} alt={`${name} a medida en La Serena`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg">{name}</h3>
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.18 }}
                        >
                            <p className="text-white/75 text-sm mt-1 leading-snug">{desc}</p>
                            <span className="inline-flex items-center gap-1 mt-3 text-amber-400 text-sm font-semibold">
                                Ver detalle <ArrowRight size={14} />
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </a>
    );
}

export default function LaSerena() {
    const trackedDepths = useRef(new Set());

    useEffect(() => {
        const onScroll = () => {
            const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            [25, 50, 75, 90].forEach(d => {
                if (pct >= d && !trackedDepths.current.has(d)) {
                    trackedDepths.current.add(d);
                    track('scroll', { depth_threshold: d, page: 'la-serena' });
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Datos estructurados: LocalBusiness con areaServed real (La Serena + Coquimbo),
    // Service, FAQPage (refleja las FAQ visibles) y BreadcrumbList. Sin AggregateRating.
    const schemaLD = [
        {
            '@context': 'https://schema.org', '@type': 'LocalBusiness',
            name: 'TerraBlinds', url: 'https://terrablinds.cl/la-serena',
            telephone: '+56998101891', image: 'https://terrablinds.cl/logoterrablinds.webp', priceRange: '$$',
            description: 'Cortinas roller, persianas y toldos a medida en La Serena y Coquimbo. Visita a domicilio para medir y cotizar.',
            address: { '@type': 'PostalAddress', addressRegion: 'Región de Coquimbo', addressCountry: 'CL' },
            areaServed: [
                { '@type': 'City', name: 'La Serena' },
                { '@type': 'City', name: 'Coquimbo' },
            ],
        },
        {
            '@context': 'https://schema.org', '@type': 'Service',
            serviceType: 'Cortinas roller, persianas y toldos a medida',
            provider: { '@type': 'LocalBusiness', name: 'TerraBlinds', url: 'https://terrablinds.cl' },
            areaServed: [
                { '@type': 'City', name: 'La Serena' },
                { '@type': 'City', name: 'Coquimbo' },
            ],
        },
        {
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
        {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://terrablinds.cl/' },
                { '@type': 'ListItem', position: 2, name: 'La Serena y Coquimbo', item: 'https://terrablinds.cl/la-serena' },
            ],
        },
    ];

    return (
        <Layout>
            <SEO
                title="Cortinas Roller, Persianas y Toldos en La Serena y Coquimbo"
                description="Cortinas roller, blackout, screen, duo, persianas y toldos a medida en La Serena y Coquimbo. Visita a domicilio para medir y cotizar. Protección solar real para el Norte Chico."
                path="/la-serena"
                image="https://terrablinds.cl/assets/la-serena/hero.webp"
                jsonLd={schemaLD}
            />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative flex overflow-hidden" style={{ minHeight: '82vh' }}>
                <div className="relative z-10 flex flex-col justify-center w-full lg:w-[48%] bg-[#0d0b08] px-8 sm:px-12 lg:px-16 py-24 lg:py-28">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
                            <MapPin size={12} /> La Serena · Coquimbo · Región de Coquimbo
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.08] mb-6">
                            Cortinas Roller, Persianas y Toldos en <span className="text-amber-400">La Serena y Coquimbo</span>
                        </h1>
                        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-md">
                            Ofrecemos cortinas roller, persianas y toldos a medida para el clima del Norte Chico. Coordinamos una visita a domicilio para medir y cotizar.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={WA_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('whatsapp_click', { position: 'hero', page: 'la-serena' })}
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-green-500 text-white font-bold px-7 py-4 rounded-xl transition-colors"
                            >
                                <MessageCircle size={20} /> Cotizar por WhatsApp
                            </a>
                            <a href="/catalog" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-4 rounded-xl transition-colors border border-white/15">
                                Ver catálogo
                            </a>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%]">
                    <img src="/assets/la-serena/hero.webp" alt="Cortinas roller a medida en La Serena" width="1672" height="941" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b08] via-[#0d0b08]/20 to-transparent" />
                </div>

                <div
                    className="lg:hidden absolute inset-0"
                    style={{ backgroundImage: 'url(/assets/la-serena/hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="absolute inset-0 bg-[#0d0b08]/85" />
                </div>
            </section>

            {/* ── INTRO ────────────────────────────────────────────── */}
            <section className="bg-white py-16 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-5">Protección solar a medida para el Norte Chico</h2>
                    <p className="text-gray-500 leading-relaxed">
                        La Serena y Coquimbo tienen uno de los climas más luminosos de Chile: sol durante gran parte del año,
                        radiación intensa y la brisa marina característica de la costa. Esa combinación exige más que una cortina
                        decorativa. Una buena protección solar reduce el ingreso de luz directa, ayuda a proteger muebles y pisos de
                        la decoloración por rayos UV y puede ayudar a reducir la carga térmica y el uso de climatización en
                        determinadas condiciones. Elegir la tela y el nivel de apertura correctos para cada orientación de ventana
                        hace una diferencia real en confort.
                    </p>
                </div>
            </section>

            {/* ── PRODUCTOS ────────────────────────────────────────── */}
            <section className="bg-white pb-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-3">Catálogo</p>
                        <h2 className="text-4xl font-black text-gray-900 mb-3">Tipos de cortinas que ofrecemos</h2>
                        <p className="text-gray-400 max-w-lg mx-auto">No todas las ventanas necesitan lo mismo. Estas son las opciones más pedidas y para qué sirve cada una.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {PRODUCTS.map(p => <ProductCard key={p.name} {...p} />)}
                    </div>
                    <div className="mt-10 max-w-3xl mx-auto text-gray-500 text-sm leading-relaxed space-y-3">
                        <p><strong className="text-gray-700">Roller Screen:</strong> la tela screen bloquea buena parte de la radiación y el deslumbramiento, pero deja pasar luz natural y mantiene la vista al exterior. La favorita para living, comedores y oficinas.</p>
                        <p><strong className="text-gray-700">Roller Blackout:</strong> no deja pasar la luz, ideal para dormitorios y salas con TV donde buscas oscuridad completa y mayor privacidad.</p>
                        <p><strong className="text-gray-700">Roller Duo / Dual:</strong> combina franjas traslúcidas y opacas que se deslizan entre sí, para regular luz y privacidad con un solo movimiento.</p>
                        <p>Para exterior trabajamos <a href="/product/11" className="text-blue-600 hover:underline">persianas de aluminio</a> que bloquean el calor antes de que llegue al vidrio, y <a href="/catalog?category=Toldos" className="text-blue-600 hover:underline">toldos retráctiles y verticales</a> para terrazas y balcones. Si prefieres un acabado más clásico en interior, también hay minipersianas de aluminio y persianas de madera.</p>
                    </div>
                </div>
            </section>

            {/* ── CLIMA ────────────────────────────────────────────── */}
            <section className="bg-[#f8f7f4] py-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-5">Por qué importa</p>
                        <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">Sol la mayor parte del año</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">La radiación en el Norte Chico es intensa gran parte del año. Elegir bien la tela evita que el calor entre sin control y ayuda a proteger los muebles del sol directo.</p>
                        <div className="space-y-4">
                            {[
                                [Sun, 'Telas con filtro UV para reducir el ingreso de radiación'],
                                [Shield, 'Materiales pensados para resistir la exposición solar del norte'],
                                [Zap, 'Puede ayudar a reducir la carga térmica y el uso de climatización en determinadas condiciones'],
                            ].map(([Icon, t]) => (
                                <div key={t} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <Icon size={17} className="text-amber-600" />
                                    </div>
                                    <p className="text-gray-600 text-sm pt-2 leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mt-8">
                            ¿No sabes cuál elegir? Revisa la <a href="/blog/diferencia-cortinas-blackout-screen" className="text-blue-600 hover:underline">diferencia entre blackout y screen</a> o
                            cómo <a href="/blog/persianas-exterior-terraza-balcon-chile-2025" className="text-blue-600 hover:underline">proteger tu terraza del sol</a>.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <img src="/assets/la-serena/roller-screen1.webp" alt="Roller screen instalado, filtra el sol" className="rounded-2xl object-cover w-full h-64" loading="lazy" />
                        <img src="/assets/la-serena/persiana-ext2.webp" alt="Persiana de exterior de aluminio" className="rounded-2xl object-cover w-full h-64 mt-8" loading="lazy" />
                    </div>
                </div>
            </section>

            {/* ── MOTORIZACIÓN ─────────────────────────────────────── */}
            <section className="bg-white py-20 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-5">Motorización y control desde el celular</h2>
                    <p className="text-gray-500 leading-relaxed">
                        Cualquiera de nuestras cortinas roller puede motorizarse. Con un <a href="/product/4" className="text-blue-600 hover:underline">controlador WiFi</a> subes
                        y bajas las cortinas desde el celular o las integras a tu sistema de domótica, algo especialmente cómodo en ventanales
                        grandes o de difícil acceso. Es una mejora que se puede incorporar desde el inicio o dejar preparada para más adelante.
                    </p>
                </div>
            </section>

            {/* ── GALERÍA ──────────────────────────────────────────── */}
            <section className="bg-[#f8f7f4] py-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-3">Nuestros productos</p>
                        <h2 className="text-3xl font-black text-gray-900">Ejemplos de cortinas y persianas</h2>
                    </div>
                    <div className="columns-2 sm:columns-3 gap-3 [column-gap:12px]">
                        {GALLERY.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Cortinas y persianas TerraBlinds ${i + 1}`}
                                className="w-full rounded-2xl object-cover mb-3 break-inside-avoid"
                                loading="lazy"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PROCESO ──────────────────────────────────────────── */}
            <section className="bg-[#0d0b08] py-24 px-4 sm:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-3">Cómo trabajamos</p>
                        <h2 className="text-3xl font-black text-white">Visita, medición e instalación</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {PROCESS.map(s => (
                            <div key={s.n} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
                                <p className="text-5xl font-black text-amber-400/50 mb-5">{s.n}</p>
                                <h3 className="text-white font-bold mb-2">{s.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COBERTURA ────────────────────────────────────────── */}
            <section className="bg-[#f8f7f4] py-16 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-4">Cobertura</p>
                    <h2 className="text-2xl font-black text-gray-900 mb-5">Cobertura en La Serena y Coquimbo</h2>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        Hoy atendemos La Serena y Coquimbo con visita a domicilio para medir, cotizar e instalar. Si estás en otra
                        localidad de la Región de Coquimbo, escríbenos y confirmamos si podemos llegar a tu dirección.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['La Serena', 'Coquimbo'].map(z => (
                            <span key={z} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-gray-700 font-medium text-sm shadow-sm">
                                <MapPin size={12} className="text-amber-500" /> {z}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────── */}
            <section className="bg-white py-24 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-3">FAQ</p>
                        <h2 className="text-3xl font-black text-gray-900">Preguntas frecuentes</h2>
                    </div>
                    <div className="border-t border-gray-100">
                        {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ────────────────────────────────────────── */}
            <section className="bg-amber-500 py-24 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">Cotiza tus cortinas en La Serena</h2>
                    <p className="text-amber-100 text-lg mb-10">Cuéntanos qué ventana quieres resolver y coordinamos tu visita a domicilio en La Serena o Coquimbo.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={WA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('whatsapp_click', { position: 'cta_final', page: 'la-serena' })}
                            className="inline-flex items-center justify-center gap-2 bg-[#0d0b08] hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-xl transition-colors"
                        >
                            <MessageCircle size={20} /> Cotizar por WhatsApp
                        </a>
                        <a
                            href="/quote"
                            onClick={() => track('form_click', { position: 'cta_final', page: 'la-serena' })}
                            className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 transition-colors"
                        >
                            Solicitar cotización
                        </a>
                    </div>
                </div>
            </section>

        </Layout>
    );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, MapPin, Sun, Shield, Zap, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const WA_NUMBER  = '56998101891';
const WA_BOT     = '56943449232';
const WA_MSG     = encodeURIComponent('Hola, vi TerraBlinds para La Serena y quiero solicitar una cotización.');
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const WA_BOT_URL = `https://wa.me/${WA_BOT}?text=${encodeURIComponent('Hola! Quiero saber más sobre cortinas para La Serena')}`;

const track = (event, params = {}) => { if (window.gtag) window.gtag('event', event, params); };

const FAQS = [
    { q: '¿Cuánto cuestan las cortinas roller en La Serena?', a: 'El precio depende del tipo de cortina, las dimensiones y el material elegido. Te enviamos un presupuesto sin compromiso al contactarnos.' },
    { q: '¿Qué diferencia hay entre Screen, Blackout y Duo?', a: 'Screen filtra la radiación solar sin bloquear la vista. Blackout oscurece completamente, ideal para dormitorios. Roller Duo combina ambas telas en un cassette.' },
    { q: '¿Las cortinas roller se fabrican a medida?', a: 'Sí, todas nuestras cortinas se fabrican según las medidas exactas de tu ventana. No manejamos tallas estándar.' },
    { q: '¿Instalan cortinas en La Serena y Coquimbo?', a: 'Sí, instalamos en La Serena y Coquimbo. Contáctanos por WhatsApp para coordinar la visita a tu hogar.' },
    { q: '¿Qué cortina es mejor para el clima soleado de La Serena?', a: 'Recomendamos roller screen con factor de apertura 3% o 5%. Si necesitas privacidad nocturna total, el Roller Duo es la opción más versátil.' },
    { q: '¿Se pueden motorizar las cortinas?', a: 'Sí. Compatible con control remoto, app móvil, Google Home y Alexa. Programas horarios automáticos.' },
    { q: '¿Cómo solicito una cotización?', a: 'Lo más rápido es por WhatsApp. No necesitas medidas exactas: te orientamos paso a paso.' },
];

const PRODUCTS = [
    { name: 'Roller Screen', desc: 'Filtra el sol sin perder la vista al exterior.', img: '/assets/la-serena/roller-screen.webp' },
    { name: 'Roller Blackout', desc: 'Oscurecimiento total para dormitorios.', img: '/assets/la-serena/roller-blackout.webp' },
    { name: 'Roller Duo', desc: 'Filtra de día, oscurece de noche. La más versátil.', img: '/assets/la-serena/roller-duo.webp' },
    { name: 'Roller Dobles', desc: 'Doble sistema en un vano para máximo control.', img: '/assets/la-serena/roller-dobles.webp' },
    { name: 'Persianas Exteriores', desc: 'Bloquea el calor antes de que entre al interior.', img: '/assets/la-serena/persiana-ext1.webp' },
    { name: 'Motorización', desc: 'Control por app, voz o timer automático.', img: '/assets/la-serena/roller-duo1.webp' },
];

const GALLERY = [
    '/assets/la-serena/roller-screen1.webp',
    '/assets/la-serena/roller-blackout2.webp',
    '/assets/la-serena/roller-dobles1.webp',
    '/assets/la-serena/persiana-ext2.webp',
    '/assets/la-serena/roller-dobles2.webp',
    '/assets/la-serena/persiana-ext3.webp',
];

const ZONAS = ['La Serena', 'Coquimbo', 'Ovalle', 'Vicuña', 'Andacollo', 'La Higuera'];

const PROCESS = [
    { n: '01', title: 'Cotiza online', desc: 'WhatsApp o formulario. Sin medidas exactas.' },
    { n: '02', title: 'Recibe propuesta', desc: 'Opciones, telas y precios a tu proyecto.' },
    { n: '03', title: 'Fabricamos', desc: 'A medida con materiales de primera línea.' },
    { n: '04', title: 'Recibe e instala', desc: 'Despacho coordinado a tu región.' },
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

function ProductCard({ name, desc, img }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className="relative overflow-hidden rounded-2xl group cursor-default"
            style={{ aspectRatio: '3/4' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
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
                            <a
                                href={WA_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('whatsapp_click', { position: 'product_card', product: name, page: 'la-serena' })}
                                className="inline-flex items-center gap-1 mt-3 text-amber-400 text-sm font-semibold hover:text-amber-300"
                            >
                                Cotizar <ArrowRight size={14} />
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
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

    const schemaLD = [
        {
            '@context': 'https://schema.org', '@type': 'WebPage',
            name: 'Cortinas Roller en La Serena | TerraBlinds',
            url: 'https://terrablinds.cl/la-serena',
            description: 'Cortinas roller, blackout, screen y persianas a medida para La Serena y Coquimbo.',
            provider: { '@type': 'LocalBusiness', name: 'TerraBlinds', url: 'https://terrablinds.cl', telephone: '+56998101891', image: 'https://terrablinds.cl/logoterrablinds.webp', priceRange: '$$', areaServed: { '@type': 'State', name: 'Chile' } },
        },
        {
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
        {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://terrablinds.cl/' },
                { '@type': 'ListItem', position: 2, name: 'Cortinas Roller en La Serena', item: 'https://terrablinds.cl/la-serena' },
            ],
        },
    ];

    return (
        <Layout>
            <SEO
                title="Cortinas Roller en La Serena"
                description="Cortinas roller, blackout, screen y persianas exteriores a medida para La Serena y Coquimbo. Protección solar real para el clima del Norte Chico. Cotiza sin compromiso."
                path="/la-serena"
                jsonLd={schemaLD}
            />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex overflow-hidden">
                {/* Text panel */}
                <div className="relative z-10 flex flex-col justify-center w-full lg:w-[48%] bg-[#0d0b08] px-8 sm:px-12 lg:px-16 py-24 lg:py-0">
                    <div className="max-w-lg">
                        <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
                            <MapPin size={12} /> La Serena · Coquimbo · Norte Chico
                        </span>
                        <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] mb-6">
                            Cortinas<br />Roller en<br /><span className="text-amber-400">La Serena</span>
                        </h1>
                        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-sm">
                            Fabricación a medida con materiales que resisten la intensa radiación del Norte Chico.
                        </p>
                        <div className="grid grid-cols-4 gap-4 mb-10 pb-10 border-b border-white/10">
                            {[['300+','Proyectos'],['10+','Años'],['100%','A medida'],['4.9★','Rating']].map(([n,l]) => (
                                <div key={l}>
                                    <p className="text-2xl font-black text-amber-400">{n}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{l}</p>
                                </div>
                            ))}
                        </div>
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
                                Ver productos
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desktop photo */}
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%]">
                    <img src="/assets/la-serena/hero.webp" alt="Cortinas roller en La Serena" width="1672" height="941" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b08] via-[#0d0b08]/20 to-transparent" />
                </div>

                {/* Mobile photo background */}
                <div
                    className="lg:hidden absolute inset-0"
                    style={{ backgroundImage: 'url(/assets/la-serena/hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="absolute inset-0 bg-[#0d0b08]/85" />
                </div>
            </section>

            {/* ── PRODUCTOS ────────────────────────────────────────── */}
            <section className="bg-white py-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-3">Catálogo</p>
                        <h2 className="text-4xl font-black text-gray-900 mb-3">Nuestros productos</h2>
                        <p className="text-gray-400 max-w-md mx-auto">Fabricados a medida, despachados a La Serena y toda la región de Coquimbo.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {PRODUCTS.map(p => <ProductCard key={p.name} {...p} />)}
                    </div>
                </div>
            </section>

            {/* ── CLIMA ────────────────────────────────────────────── */}
            <section className="bg-[#f8f7f4] py-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-5">Por qué importa</p>
                        <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">300+ días de sol al año en La Serena</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">La radiación UV en el Norte Chico supera con creces a Santiago. Una cortina mal elegida deja pasar el calor, destiñe los muebles y hace insoportable el interior.</p>
                        <div className="space-y-4">
                            {[
                                [Sun, 'Telas con filtro UV clase 5 — las más efectivas del mercado'],
                                [Shield, 'Resistentes a exposición solar prolongada sin decolorarse'],
                                [Zap, 'Reducen hasta 6°C la temperatura interior'],
                            ].map(([Icon, t]) => (
                                <div key={t} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <Icon size={17} className="text-amber-600" />
                                    </div>
                                    <p className="text-gray-600 text-sm pt-2 leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <img src="/assets/la-serena/roller-screen1.webp" alt="Roller Screen en La Serena" className="rounded-2xl object-cover w-full h-64" loading="lazy" />
                        <img src="/assets/la-serena/persiana-ext2.webp" alt="Persiana exterior" className="rounded-2xl object-cover w-full h-64 mt-8" loading="lazy" />
                    </div>
                </div>
            </section>

            {/* ── GALERÍA ──────────────────────────────────────────── */}
            <section className="bg-white py-24 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-3">Trabajos reales</p>
                        <h2 className="text-3xl font-black text-gray-900">Instalaciones realizadas</h2>
                    </div>
                    <div className="columns-2 sm:columns-3 gap-3 [column-gap:12px]">
                        {GALLERY.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Instalación TerraBlinds La Serena ${i + 1}`}
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
                        <p className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-3">Cómo funciona</p>
                        <h2 className="text-3xl font-black text-white">Simple y sin sorpresas</h2>
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

            {/* ── ZONAS ────────────────────────────────────────────── */}
            <section className="bg-[#f8f7f4] py-16 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-4">Cobertura</p>
                    <h2 className="text-2xl font-black text-gray-900 mb-8">Atendemos toda la región</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {ZONAS.map(z => (
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
                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">¿Estás en La Serena o Coquimbo?</h2>
                    <p className="text-amber-100 text-lg mb-10">Cotiza ahora y recibe tu presupuesto sin compromiso.</p>
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
                            Cotizar online
                        </a>
                    </div>
                </div>
            </section>

        </Layout>
    );
}

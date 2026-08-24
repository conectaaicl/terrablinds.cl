import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { Shield, X, ArrowRight, ExternalLink, Star, Wifi, Smartphone, Sun, ChevronRight, Zap } from 'lucide-react';
import api from '../api';

const fadeUp = {
    initial:     { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true, margin: '-60px' },
    transition:  { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const BENEFITS = [
    { icon: '◌', label: 'A MEDIDA',                sub: 'Fabricación propia' },
    { icon: '☀', label: 'PROTECCIÓN UV',            sub: 'Cuida tu salud' },
    { icon: '⬡', label: 'ALTA DURABILIDAD',         sub: 'Materiales premium' },
    { icon: '⚙', label: 'INSTALACIÓN PROFESIONAL',  sub: 'Equipos especializados' },
    { icon: '◇', label: 'GARANTÍA',                 sub: '2 años en productos' },
];

const SOLUTIONS = [
    { title: 'Cortinas Roller',      desc: 'Control de luz y privacidad con diseño minimalista.',       link: '/catalog?category=Roller',     cfgKey: 'cat1_image', grad: 'from-slate-700 to-slate-900' },
    { title: 'Persianas',            desc: 'Elegancia y control de luz en cada ambiente.',              link: '/catalog?category=Persianas',  cfgKey: 'cat2_image', grad: 'from-neutral-700 to-neutral-900' },
    { title: 'Toldos',               desc: 'Disfruta tus espacios al aire libre todo el año.',          link: '/catalog?category=Toldos',     cfgKey: 'cat3_image', grad: 'from-zinc-700 to-zinc-900' },
    { title: 'Persianas Exteriores', desc: 'Protección solar y térmica. Mayor eficiencia energética.',  link: '/catalog?category=Exteriores', cfgKey: null,         grad: 'from-stone-700 to-stone-900' },
    { title: 'Mallas de Seguridad',  desc: 'Protección confiable para niños, mascotas y terrazas.',    link: '/catalog?category=Mallas',     cfgKey: null,         grad: 'from-gray-800 to-gray-950' },
    { title: 'Cierre de Terrazas',   desc: 'Amplía y protege tus espacios durante todo el año.',       link: '/catalog?category=Terrazas',   cfgKey: null,         grad: 'from-amber-900 to-stone-900' },
];

const DEFAULT_STATS = [
    { value: '+10',    label: 'Años de experiencia' },
    { value: '+5.000', label: 'Proyectos realizados' },
    { value: '+100',   label: 'Comunas cubiertas' },
    { value: '+98%',   label: 'Clientes satisfechos' },
];

const CATEGORY_GRADIENTS = [
    'from-stone-800 to-stone-950',
    'from-neutral-800 to-neutral-950',
    'from-zinc-700 to-zinc-950',
];

const Home = () => {
    const [cfg, setCfg]           = useState({});
    const [projects, setProjects] = useState([]);
    const [reviews, setReviews]   = useState([]);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        api.get('/api/config/public').then(r => setCfg(r.data)).catch(() => {});
        api.get('/api/projects').then(r => setProjects((r.data || []).slice(0, 6))).catch(() => {});
        api.get('/api/reviews/public').then(r => setReviews(Array.isArray(r.data) ? r.data.slice(0, 6) : [])).catch(() => {});
    }, []);

    const stats = DEFAULT_STATS.map((d, i) => ({
        value: cfg[`stat${i + 1}_num`]   || d.value,
        label: cfg[`stat${i + 1}_label`] || d.label,
    }));

    const cats = [1, 2, 3].map(n => ({
        image:    cfg[`cat${n}_image`] || '',
        title:    cfg[`cat${n}_title`] || ['Cortinas Roller', 'Blackout', 'Persianas'][n - 1],
        link:     cfg[`cat${n}_link`]  || `/catalog?category=${['Cortinas Roller', 'Blackout', 'Persianas'][n - 1]}`,
        gradient: CATEGORY_GRADIENTS[n - 1],
    }));

    return (
        <Layout>
            <SEO
                description="Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis."
                path="/"
            />

            {/* ── Hero carousel (intacto) ────────────────────────────────────── */}
            <Hero />

            {/* ── Barra de beneficios ────────────────────────────────────────── */}
            <div className="bg-[#0d0b08] border-t border-white/5 py-5 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                        {BENEFITS.map(b => (
                            <div key={b.label} className="flex items-center gap-2 text-center sm:text-left">
                                <span className="text-[#C8973A] text-lg leading-none">{b.icon}</span>
                                <div>
                                    <div className="text-xs font-bold text-white tracking-wider">{b.label}</div>
                                    <div className="text-xs text-gray-500 leading-tight">{b.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Soluciones ─────────────────────────────────────────────────── */}
            <section className="py-20 bg-[#F7F4EF]">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div {...fadeUp} className="text-center mb-12">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-3 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                            Elige tu solución
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-2 tracking-tight">
                            Soluciones que se adaptan a <em className="not-italic text-[#C8973A]">cada espacio</em>
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {SOLUTIONS.map((s, i) => {
                            const imgSrc = s.cfgKey ? (cfg[s.cfgKey] || null) : null;
                            return (
                            <motion.div
                                key={s.title}
                                initial={fadeUp.initial}
                                whileInView={fadeUp.whileInView}
                                viewport={fadeUp.viewport}
                                transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                            >
                                <Link to={s.link} className="group block relative rounded-2xl overflow-hidden h-60 cursor-pointer">
                                    {imgSrc ? (
                                        <img src={imgSrc} alt={s.title}
                                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} transition-transform duration-700 group-hover:scale-105`} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                                        <h3 className="text-white text-xl font-extrabold tracking-tight mb-1">{s.title}</h3>
                                        <p className="text-gray-300 text-sm leading-snug mb-2">{s.desc}</p>
                                        <span className="inline-flex items-center gap-1.5 text-[#C8973A] text-sm font-semibold group-hover:gap-2.5 transition-all duration-200">
                                            Ver más <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#C8973A]/50 transition-colors duration-300 pointer-events-none" />
                                </Link>
                            </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Automatización inteligente ─────────────────────────────────── */}
            <section style={{ background: '#06101f' }} className="py-20 px-4 text-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeUp}>
                            <span className="text-xs font-semibold tracking-widest text-[#C8973A] uppercase mb-3 block">
                                Automatización inteligente
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                                Controla la luz, el clima y tu privacidad desde tu celular
                            </h2>
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Cortinas y toldos motorizados compatibles con Google Home, Alexa y Tuya Smart. Automatiza tu hogar con un toque.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {['Google Home', 'Alexa', 'Tuya'].map(b => (
                                    <span key={b} className="flex items-center gap-1.5 text-xs font-semibold border border-slate-600 text-slate-300 px-3 py-1.5 rounded-full">
                                        <Wifi className="w-3 h-3 text-[#C8973A]" /> {b}
                                    </span>
                                ))}
                            </div>
                            <Link to="/domotica"
                                className="inline-flex items-center gap-2 bg-[#C8973A] hover:bg-[#A87A2A] text-white font-bold px-6 py-3 rounded-xl transition-colors">
                                Ver soluciones inteligentes <ChevronRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {/* Smart panel card */}
                        <motion.div {...fadeUp} className="flex justify-center md:justify-end">
                            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-xs">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs text-slate-400 font-medium">Living Room</div>
                                    <Smartphone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="text-lg font-bold text-white mb-5">Cortina Roller</div>

                                <div className="mb-2 text-xs text-slate-400 flex justify-between">
                                    <span>Apertura</span><span className="text-[#C8973A] font-bold">75%</span>
                                </div>
                                <div className="relative h-2 bg-slate-700 rounded-full mb-5">
                                    <div className="absolute left-0 top-0 h-full rounded-full bg-[#C8973A]" style={{ width: '75%' }} />
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" style={{ left: 'calc(75% - 8px)' }} />
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    {[
                                        { label: 'Luz', Icon: Sun, on: true },
                                        { label: 'Motor', Icon: Zap, on: true },
                                        { label: 'Auto', Icon: Wifi, on: false },
                                    ].map(({ label, Icon, on }) => (
                                        <div key={label} className={`rounded-xl p-3 text-center border ${on ? 'bg-[#C8973A]/15 border-[#C8973A]/40' : 'bg-slate-700/50 border-slate-600'}`}>
                                            <Icon className={`w-4 h-4 mx-auto mb-1 ${on ? 'text-[#C8973A]' : 'text-slate-400'}`} />
                                            <div className={`text-xs font-medium ${on ? 'text-[#C8973A]' : 'text-slate-400'}`}>{label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-xs text-center text-slate-500">
                                    Compatible · Google Home · Alexa · Tuya
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────────────────────────────── */}
            <section className="py-20 bg-[#0d0b08]">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={fadeUp.initial}
                                whileInView={fadeUp.whileInView}
                                viewport={fadeUp.viewport}
                                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                                className="text-center p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C8973A]/40 hover:bg-[#C8973A]/5 transition-all duration-300"
                            >
                                <p className="text-4xl md:text-5xl font-extrabold text-[#C8973A] mb-2 leading-none">{s.value}</p>
                                <p className="text-white font-semibold text-sm">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Proyectos destacados ───────────────────────────────────────── */}
            {projects.length > 0 && (
                <section className="py-20 bg-[#F7F4EF]">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <motion.div {...fadeUp} className="flex justify-between items-end mb-12">
                            <div>
                                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-3 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                                    Proyectos destacados
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-3 tracking-tight">
                                    {cfg.home_projects_title || 'Espacios reales,'}
                                    <br /><em className="not-italic text-[#C8973A]">resultados extraordinarios</em>
                                </h2>
                            </div>
                            <Link to="/projects" className="hidden md:flex items-center gap-2 text-[#C8973A] hover:text-[#A87A2A] font-semibold text-sm transition-colors">
                                Ver todos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    initial={fadeUp.initial}
                                    whileInView={fadeUp.whileInView}
                                    viewport={fadeUp.viewport}
                                    transition={{ ...fadeUp.transition, delay: idx * 0.07 }}
                                    className="group rounded-2xl overflow-hidden bg-white border border-[#E8E2D8] hover:border-[#C8973A]/50 hover:shadow-2xl hover:shadow-[#C8973A]/10 transition-all duration-300"
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-[#F7F4EF] flex items-center justify-center">
                                                <span className="text-[#7A6F65] text-sm">Sin foto</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        {p.category && (
                                            <p className="text-xs text-[#C8973A] font-bold uppercase tracking-wider mb-1">{p.category}</p>
                                        )}
                                        <h3 className="font-extrabold text-[#1A1614] tracking-tight">{p.title}</h3>
                                        {p.location && <p className="text-sm text-[#7A6F65] mt-0.5">{p.location}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-10 text-center md:hidden">
                            <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8973A] hover:bg-[#A87A2A] text-white rounded-xl font-semibold text-sm transition-colors">
                                Ver todos los proyectos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Reseñas ─────────────────────────────────────────────────────── */}
            {reviews.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <motion.div {...fadeUp} className="text-center mb-12">
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-4 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                                Opiniones
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-2 tracking-tight">
                                Lo que dicen nuestros clientes
                            </h2>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((r, idx) => (
                                <motion.div
                                    key={r.id}
                                    initial={fadeUp.initial}
                                    whileInView={fadeUp.whileInView}
                                    viewport={fadeUp.viewport}
                                    transition={{ ...fadeUp.transition, delay: idx * 0.07 }}
                                    className="bg-[#F7F4EF] rounded-2xl p-7 border border-[#E8E2D8] hover:shadow-xl hover:shadow-[#C8973A]/10 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-0.5 mb-4">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-[#C8973A] fill-[#C8973A]' : 'text-[#D8D0C4]'}`} />
                                        ))}
                                    </div>
                                    <p className="text-[#4A3F35] leading-relaxed text-sm mb-5 line-clamp-4">"{r.content}"</p>
                                    <div className="flex items-center gap-3">
                                        {r.avatar_url ? (
                                            <img src={r.avatar_url} alt={r.author_name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#C8973A]/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[#C8973A] font-bold text-sm">{r.author_name?.[0] || '?'}</span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-[#1A1614] text-sm">{r.author_name}</p>
                                            <p className="text-[#7A6F65] text-xs">{r.author_role || 'Cliente'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ─────────────────────────────────────────────────────────── */}
            <section style={{ background: '#06101f' }} className="py-24 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <motion.div {...fadeUp}>
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-6 px-4 py-1.5 rounded-full border border-[#C8973A]/40 bg-[#C8973A]/10">
                            Asesoría sin compromiso
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight leading-[1.08]">
                            ¿Listo para transformar<br className="hidden sm:block" /> tus espacios?
                        </h2>
                        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
                            Cuéntanos qué necesitas y te ayudamos a elegir la solución correcta. Medición gratis en todo Santiago.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/quote">
                                <button
                                    className="px-10 py-4 font-bold rounded-full text-base transition-all hover:scale-105 text-white shadow-2xl"
                                    style={{ background: 'linear-gradient(135deg, #C8973A 0%, #E8B85A 100%)', boxShadow: '0 8px 40px rgba(200,151,58,0.35)' }}>
                                    COTIZA TU PROYECTO →
                                </button>
                            </Link>
                            <a href="https://wa.me/56998101891?text=Hola%20TerraBlinds%2C%20quiero%20información"
                                target="_blank" rel="noopener noreferrer"
                                className="px-8 py-4 font-semibold rounded-full text-base border border-white/20 hover:border-white/40 text-white transition-all hover:bg-white/5">
                                AGENDAR MEDICIÓN GRATIS
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Lightbox ────────────────────────────────────────────────────── */}
            {lightbox && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-4"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightbox(null)}
                            className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        {lightbox.image ? (
                            <img src={lightbox.image} alt={lightbox.title}
                                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
                        ) : (
                            <div className={`w-full h-72 rounded-xl bg-gradient-to-br ${lightbox.gradient} flex items-center justify-center`}>
                                <span className="text-white text-2xl font-bold">{lightbox.title}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <h3 className="text-white text-xl font-bold">{lightbox.title}</h3>
                            <Link to={lightbox.link} onClick={() => setLightbox(null)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#C8973A] hover:bg-[#A87A2A] text-white font-semibold rounded-xl text-sm transition-colors shadow-lg">
                                Ver categoría <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Home;

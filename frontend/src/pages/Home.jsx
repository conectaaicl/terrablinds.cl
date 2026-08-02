import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { Shield, Clock, Award, PenTool, X, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../api';

// ── Shared animation preset ──────────────────────────────────────────────────
const fadeUp = {
    initial:    { opacity: 0, y: 28 },
    whileInView:{ opacity: 1, y: 0 },
    viewport:   { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

// ── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <motion.div
        initial={fadeUp.initial}
        whileInView={fadeUp.whileInView}
        viewport={fadeUp.viewport}
        transition={{ ...fadeUp.transition, delay }}
        className="bg-white p-8 rounded-2xl border border-[#E8E2D8] hover:shadow-2xl hover:shadow-[#C8973A]/10 hover:-translate-y-1.5 transition-all duration-300 group"
    >
        <div className="w-12 h-12 bg-[#C8973A]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#C8973A]/20 transition-colors duration-300">
            <Icon className="w-6 h-6 text-[#C8973A]" />
        </div>
        <h3 className="text-lg font-extrabold text-[#1A1614] mb-3 tracking-tight">{title}</h3>
        <p className="text-[#7A6F65] leading-relaxed text-sm">{description}</p>
    </motion.div>
);

// ── Category gradient fallbacks ───────────────────────────────────────────────
const CATEGORY_GRADIENTS = [
    'from-stone-800 to-stone-950',
    'from-neutral-800 to-neutral-950',
    'from-zinc-700 to-zinc-950',
];

// ── Feature icons (ordered) ───────────────────────────────────────────────────
const FEATURE_ICONS = [PenTool, Award, Clock, Shield];

// ── Feature defaults ──────────────────────────────────────────────────────────
const FEATURE_DEFAULTS = [
    { title: 'A Medida',        text: 'Fabricamos cada cortina según las dimensiones exactas de tus ventanas para un ajuste perfecto.' },
    { title: 'Calidad Premium', text: 'Utilizamos telas y mecanismos de alta durabilidad, garantizando una larga vida útil.' },
    { title: 'Rapidez',         text: 'Tiempos de entrega optimizados sin sacrificar la calidad de la confección.' },
    { title: 'Garantía',        text: 'Todos nuestros productos cuentan con garantía para tu total tranquilidad.' },
];

// ── Stat defaults ─────────────────────────────────────────────────────────────
const STAT_DEFAULTS = [
    { value: '+500', label: 'Instalaciones', sub: 'proyectos completados' },
    { value: '10',   label: 'Años',          sub: 'de experiencia' },
    { value: 'Stgo', label: 'y Regiones',    sub: 'cobertura nacional' },
    { value: '100%', label: 'Garantía',      sub: 'incluida en todos los productos' },
];

// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {
    const [cfg, setCfg]           = useState({});
    const [projects, setProjects] = useState([]);
    const [lightbox, setLightbox] = useState(null); // { image, title, link, gradient }

    useEffect(() => {
        api.get('/api/config/public').then(r => setCfg(r.data)).catch(() => {});
        api.get('/api/projects').then(r => setProjects((r.data || []).slice(0, 6))).catch(() => {});
    }, []);

    const cats = [1, 2, 3].map(n => ({
        image:    cfg[`cat${n}_image`] || '',
        title:    cfg[`cat${n}_title`] || ['Cortinas Roller', 'Blackout', 'Persianas'][n - 1],
        link:     cfg[`cat${n}_link`]  || `/catalog?category=${['Cortinas Roller', 'Blackout', 'Persianas'][n - 1]}`,
        gradient: CATEGORY_GRADIENTS[n - 1],
    }));

    // ── Dynamic features ──────────────────────────────────────────────────
    const features = FEATURE_DEFAULTS.map((def, i) => ({
        icon:  FEATURE_ICONS[i],
        title: cfg[`feature${i + 1}_title`] || def.title,
        text:  cfg[`feature${i + 1}_text`]  || def.text,
    }));

    // ── Dynamic stats ─────────────────────────────────────────────────────
    const stats = STAT_DEFAULTS.map((def, i) => {
        const n = i + 1;
        if (n <= 3) {
            return {
                value: cfg[`stat${n}_num`]   || def.value,
                label: cfg[`stat${n}_label`] || def.label,
                sub:   cfg[`stat${n}_sub`]   || def.sub,
            };
        }
        return {
            value: cfg.stat4_num   || def.value,
            label: cfg.stat4_label || def.label,
            sub:   cfg.stat4_sub   || def.sub,
        };
    });

    return (
        <Layout>
            <SEO
                description="Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis."
                path="/"
            />
            <Hero />

            {/* ── Benefits ──────────────────────────────────────────────────── */}
            <section className="py-24 bg-[#F7F4EF]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-4 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                            Por qué elegirnos
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-2 tracking-tight">
                            {cfg.section_features_title || 'Calidad que transforma espacios'}
                        </h2>
                        {cfg.section_features_subtitle && (
                            <p className="text-[#7A6F65] mt-3 text-base max-w-md mx-auto">{cfg.section_features_subtitle}</p>
                        )}
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <FeatureCard key={i} delay={i * 0.08} icon={f.icon} title={f.title} description={f.text} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────────────────── */}
            <section className="py-24 bg-[#0d0b08]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {cfg.stats_section_title || 'Por qué TerraBlinds'}
                        </h2>
                        <p className="text-[#7A6F65] mt-3 text-base max-w-md mx-auto">
                            {cfg.stats_section_subtitle || 'Números que respaldan nuestra trayectoria'}
                        </p>
                    </motion.div>
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
                                <p className="text-4xl md:text-5xl font-extrabold text-[#C8973A] mb-1 leading-none">{s.value}</p>
                                <p className="text-white font-bold text-base mt-2">{s.label}</p>
                                <p className="text-[#7A6F65] text-xs mt-1 leading-tight">{s.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Category Cards ────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp} className="flex justify-between items-end mb-14">
                        <div>
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-3 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                                Colecciones
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-3 tracking-tight">Nuestras Categorías</h2>
                            <p className="text-[#7A6F65] mt-2">Encuentra el estilo perfecto para cada ambiente.</p>
                        </div>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cats.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={fadeUp.initial}
                                whileInView={fadeUp.whileInView}
                                viewport={fadeUp.viewport}
                                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl h-96 cursor-pointer"
                                onClick={() => setLightbox(cat)}
                            >
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-transform duration-700 group-hover:scale-105`} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/80 border border-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm bg-black/20">
                                        {cat.title}
                                    </span>
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                                    <h3 className="text-white text-2xl font-extrabold tracking-tight mb-2">{cat.title}</h3>
                                    <span className="inline-flex items-center gap-2 text-[#C8973A] text-sm font-semibold group-hover:gap-3 transition-all duration-200">
                                        Ver categoría <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#C8973A]/50 transition-colors duration-400 pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Projects ─────────────────────────────────────────── */}
            {projects.length > 0 && (
                <section className="py-24 bg-[#F7F4EF]">
                    <div className="container mx-auto px-4">
                        <motion.div {...fadeUp} className="flex justify-between items-end mb-14">
                            <div>
                                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-3 px-4 py-1.5 rounded-full border border-[#C8973A]/30 bg-[#C8973A]/10">
                                    Galería
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] mt-3 tracking-tight">
                                    {cfg.home_projects_title || 'Proyectos Destacados'}
                                </h2>
                                {cfg.home_projects_subtitle && (
                                    <p className="text-[#7A6F65] mt-2">{cfg.home_projects_subtitle}</p>
                                )}
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
                                            <img
                                                src={p.image_url}
                                                alt={p.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
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

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <section className="py-28 text-white text-center bg-[#0d0b08]">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeUp}>
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-6 px-4 py-1.5 rounded-full border border-[#C8973A]/40 bg-[#C8973A]/10">
                            {cfg.cta_badge || 'Comienza hoy'}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-[1.05]">
                            {cfg.cta_title
                                ? cfg.cta_title.split('\n').map((line, i, arr) => (
                                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br className="hidden sm:block" />}</React.Fragment>
                                ))
                                : (<>¿Listo para renovar<br className="hidden sm:block" /> tus espacios?</>)
                            }
                        </h2>
                        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
                            {cfg.cta_subtitle || 'Cotiza online en segundos y recibe asesoría personalizada de nuestros expertos.'}
                        </p>
                        <Link to="/catalog">
                            <button
                                className="px-10 py-4 font-bold rounded-full text-base transition-all hover:scale-105 text-white shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #C8973A 0%, #E8B85A 100%)', boxShadow: '0 8px 40px rgba(200,151,58,0.35)' }}
                            >
                                {cfg.cta_button || 'Solicitar Cotización Gratuita'}
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── Lightbox ──────────────────────────────────────────────────── */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        {lightbox.image ? (
                            <img
                                src={lightbox.image}
                                alt={lightbox.title}
                                className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl"
                            />
                        ) : (
                            <div className={`w-full h-72 rounded-xl bg-gradient-to-br ${lightbox.gradient} flex items-center justify-center`}>
                                <span className="text-white text-2xl font-bold">{lightbox.title}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <h3 className="text-white text-xl font-bold">{lightbox.title}</h3>
                            <Link
                                to={lightbox.link}
                                onClick={() => setLightbox(null)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#C8973A] hover:bg-[#A87A2A] text-white font-semibold rounded-xl text-sm transition-colors shadow-lg"
                            >
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

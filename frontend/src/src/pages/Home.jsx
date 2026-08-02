import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { Shield, Clock, Award, PenTool, X, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../api';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-6 text-primary-600">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const CATEGORY_GRADIENTS = [
    'from-blue-800 to-blue-950',
    'from-gray-800 to-gray-950',
    'from-stone-700 to-stone-950',
];

const Home = () => {
    const [cfg, setCfg] = useState({});
    const [projects, setProjects] = useState([]);
    const [lightbox, setLightbox] = useState(null); // { image, title, link }

    useEffect(() => {
        api.get('/api/config/public').then(r => setCfg(r.data)).catch(() => {});
        api.get('/api/projects').then(r => setProjects((r.data || []).slice(0, 6))).catch(() => {});
    }, []);

    const cats = [1, 2, 3].map(n => ({
        image: cfg[`cat${n}_image`] || '',
        title: cfg[`cat${n}_title`] || ['Cortinas Roller', 'Blackout', 'Persianas'][n - 1],
        link: cfg[`cat${n}_link`] || `/catalog?category=${['Cortinas Roller', 'Blackout', 'Persianas'][n - 1]}`,
        gradient: CATEGORY_GRADIENTS[n - 1],
    }));

    return (
        <Layout>
            <SEO
                description="Cortinas roller, persianas y toldos a medida. Fabricación premium con instalación experta en todo Chile. Cotiza online gratis."
                path="/"
            />
            <Hero />

            {/* Benefits */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">Por qué elegirnos</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Calidad que transforma espacios</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={PenTool} title="A Medida" description="Fabricamos cada cortina según las dimensiones exactas de tus ventanas para un ajuste perfecto." />
                        <FeatureCard icon={Award} title="Calidad Premium" description="Utilizamos telas y mecanismos de alta durabilidad, garantizando una larga vida útil." />
                        <FeatureCard icon={Clock} title="Rapidez" description="Tiempos de entrega optimizados sin sacrificar la calidad de la confección." />
                        <FeatureCard icon={Shield} title="Garantía" description="Todos nuestros productos cuentan con garantía para tu total tranquilidad." />
                    </div>
                </div>
            </section>

            {/* Category Cards */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Nuestras Categorías</h2>
                            <p className="text-gray-600 mt-2">Encuentra el estilo perfecto para cada ambiente.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cats.map((cat, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-2xl h-80 block cursor-pointer"
                                onClick={() => setLightbox(cat)}>
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-transform duration-500 group-hover:scale-105`} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-8">
                                    <h3 className="text-white text-2xl font-bold">{cat.title}</h3>
                                    <span className="mt-2 inline-flex items-center gap-1 text-white/80 text-sm group-hover:text-white transition-colors">
                                        Ver categoría <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            {projects.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">Galería</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                                    {cfg.home_projects_title || 'Proyectos Destacados'}
                                </h2>
                                {cfg.home_projects_subtitle && (
                                    <p className="text-gray-600 mt-2">{cfg.home_projects_subtitle}</p>
                                )}
                            </div>
                            <Link to="/projects" className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors">
                                Ver todos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(p => (
                                <div key={p.id} className="group rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative h-56 overflow-hidden">
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt={p.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">Sin foto</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        {p.category && <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">{p.category}</p>}
                                        <h3 className="font-bold text-gray-900">{p.title}</h3>
                                        {p.location && <p className="text-sm text-gray-500">{p.location}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 text-center md:hidden">
                            <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
                                Ver todos los proyectos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para renovar tus espacios?</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Cotiza online en segundos y recibe asesoría personalizada de nuestros expertos.
                    </p>
                    <Link to="/catalog">
                        <button className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full text-lg transition-transform hover:scale-105 shadow-lg">
                            Solicitar Cotización Gratuita
                        </button>
                    </Link>
                </div>
            </section>

            {/* Lightbox */}
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
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg"
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

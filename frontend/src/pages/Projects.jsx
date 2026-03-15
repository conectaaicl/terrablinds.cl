import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ImageOff } from 'lucide-react';
import api from '../api';

const FALLBACK_COLORS = [
    'from-gray-800 to-gray-950',
    'from-blue-800 to-blue-950',
    'from-stone-700 to-stone-950',
    'from-slate-700 to-slate-950',
    'from-zinc-700 to-zinc-950',
    'from-neutral-700 to-neutral-950',
];

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/projects')
            .then(res => setProjects(res.data))
            .catch(() => setProjects([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <SEO
                title="Proyectos Realizados"
                description="Galería de proyectos de cortinas, persianas y toldos instalados por TerraBlinds en Chile."
                path="/projects"
            />

            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Proyectos Realizados</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Más de 500 proyectos exitosos en hogares y empresas a lo largo de Chile.
                </p>
            </div>

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <ImageOff className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No hay proyectos publicados aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((p, idx) => (
                            <div key={p.id} className="group relative overflow-hidden rounded-2xl h-64 shadow-sm hover:shadow-xl transition-shadow">
                                {p.image_url ? (
                                    <img
                                        src={p.image_url}
                                        alt={p.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_COLORS[idx % FALLBACK_COLORS.length]} transition-transform duration-500 group-hover:scale-105`} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{p.category}</span>
                                    <h3 className="text-white text-xl font-bold mt-1">{p.title}</h3>
                                    <p className="text-white/60 text-sm">{p.location}</p>
                                    {p.description && <p className="text-white/50 text-xs mt-1 line-clamp-2">{p.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center bg-primary-50 border border-primary-100 rounded-2xl p-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Quieres tu proyecto aquí?</h2>
                    <p className="text-gray-600 mb-8">Contáctanos y hacemos realidad tu espacio ideal.</p>
                    <a href="/quote" className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                        Solicitar Cotización
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default Projects;

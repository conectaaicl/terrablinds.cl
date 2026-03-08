import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const projects = [
    { id: 1, title: 'Departamento Providencia', category: 'Roller Blackout', location: 'Santiago', color: 'from-gray-800 to-gray-950' },
    { id: 2, title: 'Casa Las Condes', category: 'Roller Sunscreen', location: 'Santiago', color: 'from-blue-800 to-blue-950' },
    { id: 3, title: 'Oficina Corporativa', category: 'Persianas Exterior', location: 'Santiago Centro', color: 'from-stone-700 to-stone-950' },
    { id: 4, title: 'Hotel Boutique', category: 'Roller Duo Blackout', location: 'Viña del Mar', color: 'from-slate-700 to-slate-950' },
    { id: 5, title: 'Clínica Dental', category: 'Domotica Motor Roller', location: 'Ñuñoa', color: 'from-zinc-700 to-zinc-950' },
    { id: 6, title: 'Restaurante Moderno', category: 'Toldos Exterior', location: 'Vitacura', color: 'from-neutral-700 to-neutral-950' },
];

const Projects = () => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(p => (
                        <div key={p.id} className="group relative overflow-hidden rounded-2xl h-64 shadow-sm hover:shadow-xl transition-shadow">
                            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} transition-transform duration-500 group-hover:scale-105`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6">
                                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{p.category}</span>
                                <h3 className="text-white text-xl font-bold mt-1">{p.title}</h3>
                                <p className="text-white/60 text-sm">{p.location}</p>
                            </div>
                        </div>
                    ))}
                </div>

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

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ExternalLink, CheckCircle, Wrench, Users, ClipboardList, MapPin, BarChart3, MessageSquare } from 'lucide-react';
import api from '../api';

const DEFAULT = {
    software_title: 'WorkShopOS',
    software_subtitle: 'El sistema de gestión para talleres y empresas de instalación',
    software_description: 'Creado por TerraBlinds para la industria que conocemos. Gestiona cotizaciones, producción, instaladores y clientes desde un solo lugar.',
    software_badge: 'Desarrollado por TerraBlinds',
    software_cta_label: 'Comprar ahora',
    software_cta_url: 'https://working.conectaai.cl',
    software_alt_label: 'Ver más en working.conectaai.cl',
    software_alt_url: 'https://working.conectaai.cl',
    software_image_url: '',
    software_enabled: 'true',
};

const FEATURES = [
    { icon: ClipboardList, title: 'Cotizaciones inteligentes', desc: 'Genera cotizaciones profesionales con cálculo automático de medidas y precios.' },
    { icon: Wrench, title: 'Cola de producción', desc: 'Asigna órdenes al equipo de fabricación con seguimiento en tiempo real.' },
    { icon: MapPin, title: 'Mapa GPS de instaladores', desc: 'Visualiza dónde están tus instaladores y agenda instalaciones eficientemente.' },
    { icon: Users, title: 'Gestión de equipos', desc: 'Roles para jefe, vendedor, fabricante, instalador y coordinador.' },
    { icon: MessageSquare, title: 'Chat interno', desc: 'Comunicación directa entre áreas sin salir del sistema.' },
    { icon: BarChart3, title: 'Dashboard en tiempo real', desc: 'Métricas de ventas, producción e instalaciones en un solo panel.' },
];

const Software = () => {
    const [cfg, setCfg] = useState(DEFAULT);

    useEffect(() => {
        api.get('/api/config/public')
            .then(res => {
                const nonEmpty = Object.fromEntries(
                    Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
                );
                setCfg(prev => ({ ...prev, ...nonEmpty }));
            })
            .catch(() => {});
    }, []);

    if (cfg.software_enabled === 'false') {
        return (
            <Layout>
                <SEO title="Software" description="Software de gestión para talleres por TerraBlinds." path="/software" />
                <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
                    Esta sección no está disponible aún.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={`${cfg.software_title} — Software para talleres`}
                description={cfg.software_subtitle}
                path="/software"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-20 w-64 h-64 bg-primary-500 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        {cfg.software_badge && (
                            <span className="inline-block bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                                {cfg.software_badge}
                            </span>
                        )}
                        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                            {cfg.software_title}
                        </h1>
                        <p className="text-xl text-gray-300 mb-4">{cfg.software_subtitle}</p>
                        <p className="text-gray-400 mb-10 max-w-2xl leading-relaxed">{cfg.software_description}</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {cfg.software_cta_url && (
                                <a
                                    href={cfg.software_cta_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/30 text-lg"
                                >
                                    {cfg.software_cta_label || 'Comprar ahora'}
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            )}
                            {cfg.software_alt_url && cfg.software_alt_label && (
                                <a
                                    href={cfg.software_alt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {cfg.software_alt_label}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Screenshot or image */}
            {cfg.software_image_url && (
                <div className="bg-gray-100 py-12">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <img
                            src={cfg.software_image_url}
                            alt={cfg.software_title}
                            className="rounded-2xl shadow-2xl w-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Features */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que necesitas para operar</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Diseñado por quienes trabajan en la industria, para quienes trabajan en la industria.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA final */}
            <div className="bg-gray-900 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">¿Listo para modernizar tu taller?</h2>
                    <p className="text-gray-400 mb-8">Úsalo hoy. Sin instalación, desde cualquier dispositivo.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {cfg.software_cta_url && (
                            <a
                                href={cfg.software_cta_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                            >
                                {cfg.software_cta_label || 'Comprar ahora'}
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                        {cfg.software_alt_url && (
                            <a
                                href={cfg.software_alt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors"
                            >
                                {cfg.software_alt_label || 'Más información'}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Software;

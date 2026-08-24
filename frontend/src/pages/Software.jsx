import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ExternalLink, CheckCircle, Wrench, Users, ClipboardList, MapPin, BarChart3, MessageSquare } from 'lucide-react';
import api from '../api';

const DEFAULT = {
    software_title: 'ConectaWork',
    software_subtitle: 'El SaaS que necesita tu taller a medida',
    software_description: 'ConectaWork es el sistema multi-tenant para talleres de fabricación e instalación. Gestiona cotizaciones, producción, GPS de instaladores y más — desde un solo lugar. Desarrollado por Conecta AI Corporation.',
    software_badge: 'Desarrollado por Conecta AI Corporation',
    software_cta_label: 'Acceder al Sistema',
    software_cta_url: 'https://working.conectaai.cl',
    software_alt_label: '14 días de prueba gratis',
    software_alt_url: 'https://working.conectaai.cl',
    software_image_url: '',
    software_enabled: 'true',
};

const FEATURES = [
    { icon: ClipboardList, title: 'Cotizaciones inteligentes', desc: 'Genera cotizaciones profesionales con cálculo automático de medidas, precios y plazos de entrega.' },
    { icon: Wrench, title: 'Cola de producción', desc: 'Asigna órdenes al fabricante y sigue el estado en tiempo real desde toma de medidas hasta instalación.' },
    { icon: MapPin, title: 'GPS de instaladores', desc: 'Visualiza en el mapa dónde están tus instaladores y agenda instalaciones eficientemente.' },
    { icon: Users, title: '6 Roles de trabajo', desc: 'Jefe, Gerente, Coordinador, Vendedor, Fabricante e Instalador. Cada uno ve solo lo que necesita.' },
    { icon: MessageSquare, title: 'Chat interno', desc: 'Comunicación directa entre áreas del taller sin salir del sistema. Historial completo.' },
    { icon: BarChart3, title: 'Dashboard en tiempo real', desc: 'Métricas de ventas, producción e instalaciones. Decisiones basadas en datos reales.' },
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
                title={`${cfg.software_title} — SaaS para talleres de instalación`}
                description={cfg.software_description || cfg.software_subtitle}
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

            {/* Planes */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Planes y Precios</h2>
                        <p className="text-gray-500">Precios en CLP · IVA incluido · Sin tarjeta de crédito para el trial</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Trial', price: 'Gratis', period: '14 días', badge: null, features: ['Hasta 2 usuarios', 'Cotizaciones ilimitadas', 'Chat interno', 'Soporte por email'], cta: 'Empezar gratis', primary: false },
                            { name: 'Básico', price: '$29.990', period: '/mes', badge: null, features: ['Hasta 5 usuarios', 'Todos los roles', 'GPS de instaladores', 'Dashboard de métricas', 'Soporte prioritario'], cta: 'Elegir Básico', primary: false },
                            { name: 'Pro', price: '$59.990', period: '/mes', badge: 'MÁS POPULAR', features: ['Usuarios ilimitados', 'Multi-sucursal', 'API acceso', 'Firma digital instaladores', 'Onboarding personalizado', 'SLA garantizado'], cta: 'Elegir Pro', primary: true },
                        ].map(plan => (
                            <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col ${plan.primary ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 scale-[1.03]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                                {plan.badge && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {plan.badge}
                                    </span>
                                )}
                                <h3 className={`text-lg font-bold mb-1 ${plan.primary ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                <div className="mb-4">
                                    <span className={`text-3xl font-extrabold ${plan.primary ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                    <span className={`text-sm ml-1 ${plan.primary ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</span>
                                </div>
                                <ul className="space-y-2 flex-1 mb-6">
                                    {plan.features.map(f => (
                                        <li key={f} className={`flex items-start gap-2 text-sm ${plan.primary ? 'text-blue-100' : 'text-gray-600'}`}>
                                            <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.primary ? 'text-blue-200' : 'text-green-500'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href={cfg.software_cta_url || 'https://working.conectaai.cl'}
                                    target="_blank" rel="noopener noreferrer"
                                    className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                                        plan.primary
                                            ? 'bg-white text-blue-700 hover:bg-blue-50'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}>
                                    {plan.cta}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA final */}
            <div className="bg-gray-900 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">¿Listo para modernizar tu taller?</h2>
                    <p className="text-gray-400 mb-8">Sin instalación · Sin tarjeta de crédito · Desde cualquier dispositivo</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {cfg.software_cta_url && (
                            <a
                                href={cfg.software_cta_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                            >
                                {cfg.software_cta_label || 'Acceder al Sistema'}
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
                                {cfg.software_alt_label || '14 días gratis'}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <p className="mt-6 text-xs text-gray-500">Desarrollado por <a href="https://conectaai.cl" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Conecta AI Corporation</a></p>
                </div>
            </div>
        </Layout>
    );
};

export default Software;

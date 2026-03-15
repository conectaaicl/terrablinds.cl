import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Award, Users, PenTool, Smile, Star, Shield, Heart, Zap } from 'lucide-react';
import api from '../api';

const ICONS = [Award, Users, PenTool, Smile, Star, Shield, Heart, Zap];

const DEFAULT = {
    about_title: 'Sobre Nosotros',
    about_subtitle: 'En TerraBlinds nos dedicamos a transformar tus espacios con soluciones de control solar de alta calidad y diseño.',
    about_history_title: 'Expertos en cortinas y persianas desde 2010',
    about_history_text1: 'Nacimos con la misión de ofrecer productos de calidad superior a un precio justo, eliminando intermediarios y entregando un servicio personalizado. Hoy somos líderes en el mercado, reconocidos por nuestra atención al detalle y compromiso con la satisfacción del cliente.',
    about_history_text2: 'Contamos con un equipo de profesionales altamente capacitados que te asesorarán en todo el proceso, desde la elección de la tela perfecta hasta la instalación final.',
    about_image_url: '',
    about_val1_title: 'Calidad', about_val1_text: 'Materiales certificados y duraderos.',
    about_val2_title: 'Equipo', about_val2_text: 'Profesionales expertos a tu servicio.',
    about_val3_title: 'Diseño', about_val3_text: 'Tendencias actuales y funcionales.',
    about_val4_title: 'Servicio', about_val4_text: 'Post-venta y garantía real.',
};

const About = () => {
    const [cfg, setCfg] = useState(DEFAULT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/config/public')
            .then(res => setCfg(prev => ({ ...prev, ...res.data })))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const vals = [
        { title: cfg.about_val1_title, text: cfg.about_val1_text, Icon: ICONS[0] },
        { title: cfg.about_val2_title, text: cfg.about_val2_text, Icon: ICONS[1] },
        { title: cfg.about_val3_title, text: cfg.about_val3_text, Icon: ICONS[2] },
        { title: cfg.about_val4_title, text: cfg.about_val4_text, Icon: ICONS[3] },
    ];

    return (
        <Layout>
            <SEO
                title="Quiénes Somos"
                description="Conoce a TerraBlinds, especialistas en cortinas y persianas a medida en Chile."
                path="/about"
            />
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{cfg.about_title}</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">{cfg.about_subtitle}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {cfg.about_image_url ? (
                        <img src={cfg.about_image_url} alt="Sobre nosotros" className="rounded-xl shadow-lg w-full h-80 object-cover" />
                    ) : (
                        <div className="rounded-xl shadow-lg bg-gradient-to-br from-gray-700 to-gray-900 h-80 flex items-center justify-center">
                            <PenTool className="w-24 h-24 text-white/20" />
                        </div>
                    )}
                    <div>
                        <span className="text-primary-600 font-bold uppercase tracking-wide text-sm">Nuestra Historia</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">{cfg.about_history_title}</h2>
                        {cfg.about_history_text1 && <p className="text-gray-600 mb-6 leading-relaxed">{cfg.about_history_text1}</p>}
                        {cfg.about_history_text2 && <p className="text-gray-600 mb-6 leading-relaxed">{cfg.about_history_text2}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {vals.map(({ title, text, Icon }, i) => title ? (
                            <div key={i} className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition">
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-2">{title}</h3>
                                <p className="text-gray-500">{text}</p>
                            </div>
                        ) : null)}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api';

const Hero = () => {
    const [config, setConfig] = useState({
        hero_title: 'Elegancia y Control para tus Espacios',
        hero_subtitle: 'Cortinas roller, persianas y toldos a medida. Calidad premium con instalación experta.',
        hero_cta_primary: 'Ver Catálogo',
        hero_cta_secondary: 'Cotizar Ahora',
        hero_bg_image: ''
    });

    useEffect(() => {
        api.get('/api/config/public')
            .then(res => {
                const d = res.data;
                setConfig(prev => ({
                    hero_title: d.hero_title || prev.hero_title,
                    hero_subtitle: d.hero_subtitle || prev.hero_subtitle,
                    hero_cta_primary: d.hero_cta_primary || prev.hero_cta_primary,
                    hero_cta_secondary: d.hero_cta_secondary || prev.hero_cta_secondary,
                    hero_bg_image: d.hero_bg_image || ''
                }));
            })
            .catch(() => {}); // fallback to defaults
    }, []);

    const bgStyle = config.hero_bg_image
        ? { backgroundImage: `url(${config.hero_bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <div className="relative bg-gray-900 text-white overflow-hidden" style={bgStyle}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-primary-900/80" />

            <div className="relative container mx-auto px-4 py-32 md:py-48 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    {config.hero_title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl">
                    {config.hero_subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/catalog"
                        className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center transform hover:scale-105 duration-200"
                    >
                        {config.hero_cta_primary}
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link
                        to="/quote"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                    >
                        {config.hero_cta_secondary}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;

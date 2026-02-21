import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative bg-gray-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 opacity-90" />

            <div className="relative container mx-auto px-4 py-32 md:py-48 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
                    Elegancia y Control <br /> para tus Espacios
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl animate-fade-in-up delay-100">
                    Cortinas roller, persianas y toldos a medida. Calidad premium con instalación experta.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
                    <Link
                        to="/catalog"
                        className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center transform hover:scale-105 duration-200"
                    >
                        Ver Catálogo
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link
                        to="/quote"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                    >
                        Cotizar Ahora
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;

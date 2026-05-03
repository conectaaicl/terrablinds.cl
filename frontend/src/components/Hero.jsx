import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../api';

// Product photos — each paired with a product label
const SLIDES = [
    {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
        label: 'Persianas Exteriores',
    },
    {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=85',
        label: 'Cortinas Roller',
    },
    {
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1920&q=85',
        label: 'Roller Blackout',
    },
    {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=85',
        label: 'Cortinas de Tela',
    },
    {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85',
        label: 'Domótica Inteligente',
    },
    {
        url: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=1920&q=85',
        label: 'Toldos Retráctiles',
    },
];

const INTERVAL = 5500;

export default function Hero() {
    const [config, setConfig] = useState({
        hero_title: 'Elegancia y Control para tus Espacios',
        hero_subtitle: 'Cortinas roller, persianas y toldos a medida. Calidad premium con instalación experta.',
        hero_cta_primary: 'Ver Catálogo',
        hero_cta_secondary: 'Cotizar Ahora',
    });
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState(null);
    const [animKey, setAnimKey] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = res.data;
            setConfig(p => ({
                hero_title: d.hero_title || p.hero_title,
                hero_subtitle: d.hero_subtitle || p.hero_subtitle,
                hero_cta_primary: d.hero_cta_primary || p.hero_cta_primary,
                hero_cta_secondary: d.hero_cta_secondary || p.hero_cta_secondary,
            }));
        }).catch(() => {});
    }, []);

    const goTo = useCallback((idx) => {
        setPrev(current);
        setCurrent(idx);
        setAnimKey(k => k + 1);
    }, [current]);

    const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
    const prev_ = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

    useEffect(() => {
        if (paused) return;
        const t = setInterval(next, INTERVAL);
        return () => clearInterval(t);
    }, [next, paused]);

    return (
        <div
            className="relative overflow-hidden text-white"
            style={{ height: 'min(96vh, 780px)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            {SLIDES.map((slide, i) => {
                const isActive = i === current;
                const isPrev = i === prev;
                return (
                    <div
                        key={i}
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
                    >
                        {/* Ken Burns: zoom lento en imagen activa */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.url})`,
                                animation: isActive ? `kenburns ${INTERVAL + 500}ms ease-out forwards` : 'none',
                                transform: isActive ? undefined : 'scale(1.08)',
                            }}
                        />
                        {/* Gradient overlay — más oscuro abajo para leer texto */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/55 to-gray-900/40" />
                        {/* Marca de agua producto */}
                        <div className="absolute top-6 right-8 z-10">
                            <span className="text-xs font-semibold tracking-widest uppercase text-white/40 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                {slide.label}
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Ken Burns keyframe via style tag */}
            <style>{`
                @keyframes kenburns {
                    from { transform: scale(1.08); }
                    to   { transform: scale(1.00); }
                }
            `}</style>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-4 pb-24">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-blue-300/90 mb-4 border border-blue-400/30 px-4 py-1.5 rounded-full backdrop-blur-sm bg-white/5">
                    {config.hero_badge || 'Fabricación a Medida · Santiago, Chile'}
                </span>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 max-w-4xl leading-[1.1] drop-shadow-xl">
                    {config.hero_title}
                </h1>

                <p className="text-lg md:text-xl text-gray-200/90 mb-10 max-w-2xl leading-relaxed drop-shadow">
                    {config.hero_subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/catalog"
                        className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                    >
                        {config.hero_cta_primary}
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/quote"
                        className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center hover:scale-105"
                    >
                        {config.hero_cta_secondary}
                    </Link>
                </div>
            </div>

            {/* Arrow controls */}
            <button onClick={prev_}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-7 left-0 right-0 flex justify-center gap-2 z-20">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-white w-7' : 'bg-white/35 w-3 hover:bg-white/60'}`}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
                {!paused && (
                    <div
                        key={`${current}-${animKey}`}
                        className="h-full bg-blue-400/70"
                        style={{
                            animation: `progress ${INTERVAL}ms linear forwards`,
                        }}
                    />
                )}
            </div>
            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
}

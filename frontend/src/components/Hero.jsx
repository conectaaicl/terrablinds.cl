import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../api';

const INTERVAL = 5500;

export default function Hero() {
    const [config, setConfig] = useState({
        hero_title: 'Elegancia y Control para tus Espacios',
        hero_subtitle: 'Cortinas roller, persianas y toldos a medida. Calidad premium con instalación experta.',
        hero_cta_primary: 'Ver Catálogo',
        hero_cta_secondary: 'Cotizar Ahora',
        hero_badge: 'Fabricación a Medida · Santiago, Chile',
    });
    const [slides, setSlides] = useState(null); // null = loading
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
                hero_badge: d.hero_badge || p.hero_badge,
            }));
            // Load slides from DB keys: slide1_url / slide1_label … slide6_url / slide6_label
            const dbSlides = [];
            for (let i = 1; i <= 6; i++) {
                const url = d[`slide${i}_url`];
                if (url) dbSlides.push({ url, label: d[`slide${i}_label`] || '' });
            }
            setSlides(dbSlides.length > 0 ? dbSlides : null);
        }).catch(() => { setSlides(null); });
    }, []);

    const goTo = useCallback((idx, total) => {
        setPrev(current);
        setCurrent(idx % total);
        setAnimKey(k => k + 1);
    }, [current]);

    const activeSlides = slides || [];
    const count = activeSlides.length;

    const next = useCallback(() => {
        if (count < 2) return;
        goTo((current + 1) % count, count);
    }, [current, count, goTo]);

    const prev_ = useCallback(() => {
        if (count < 2) return;
        goTo((current - 1 + count) % count, count);
    }, [current, count, goTo]);

    useEffect(() => {
        if (paused || count < 2) return;
        const t = setInterval(next, INTERVAL);
        return () => clearInterval(t);
    }, [next, paused, count]);

    const heroHeight = 'min(90vh, 760px)';

    // Loading state — dark placeholder while API call resolves
    if (slides === null) {
        return (
            <div
                className="relative overflow-hidden bg-gray-950 flex items-end justify-center text-white px-4"
                style={{ height: heroHeight }}
            >
                <div className="relative z-10 text-center pb-20 sm:pb-24">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-blue-300/90 mb-4 border border-blue-400/30 px-4 py-1.5 rounded-full bg-white/5">
                        {config.hero_badge}
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 max-w-4xl leading-[1.1] drop-shadow-xl">
                        {config.hero_title}
                    </h1>
                    <p className="text-base sm:text-xl text-gray-200/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow px-2">
                        {config.hero_subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/catalog" className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                            {config.hero_cta_primary} <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/quote" className="px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center">
                            {config.hero_cta_secondary}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // No slides configured — gradient fallback
    if (count === 0) {
        return (
            <div
                className="relative overflow-hidden text-white flex items-end justify-center px-4"
                style={{ height: heroHeight, background: 'linear-gradient(135deg, #0d2a5e 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
            >
                <div className="relative z-10 text-center pb-20 sm:pb-24">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-blue-300/90 mb-4 border border-blue-400/30 px-4 py-1.5 rounded-full bg-white/5">
                        {config.hero_badge}
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 max-w-4xl leading-[1.1] drop-shadow-xl">
                        {config.hero_title}
                    </h1>
                    <p className="text-base sm:text-xl text-gray-200/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow px-2">
                        {config.hero_subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/catalog" className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                            {config.hero_cta_primary} <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/quote" className="px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center">
                            {config.hero_cta_secondary}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative overflow-hidden text-white"
            style={{ height: heroHeight }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
        >
            {/* Slides */}
            {activeSlides.map((slide, i) => {
                const isActive = i === current;
                const isPrev = i === prev;
                return (
                    <div
                        key={i}
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.url})`,
                                animation: isActive ? `kenburns ${INTERVAL + 500}ms ease-out forwards` : 'none',
                                transform: isActive ? undefined : 'scale(1.08)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/50 to-gray-900/35" />
                        {slide.label && (
                            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
                                <span className="text-xs font-semibold tracking-widest uppercase text-white/50 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {slide.label}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

            <style>{`
                @keyframes kenburns {
                    from { transform: scale(1.08); }
                    to   { transform: scale(1.00); }
                }
                @keyframes progress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-4 pb-16 sm:pb-24">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-blue-300/90 mb-3 sm:mb-4 border border-blue-400/30 px-4 py-1.5 rounded-full backdrop-blur-sm bg-white/5">
                    {config.hero_badge}
                </span>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-5 max-w-4xl leading-[1.1] drop-shadow-xl px-2">
                    {config.hero_title}
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-gray-200/90 mb-7 sm:mb-10 max-w-2xl leading-relaxed drop-shadow px-2">
                    {config.hero_subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
                    <Link
                        to="/catalog"
                        className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                    >
                        {config.hero_cta_primary}
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/quote"
                        className="px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center hover:scale-105"
                    >
                        {config.hero_cta_secondary}
                    </Link>
                </div>
            </div>

            {/* Arrow controls — hidden on very small screens */}
            {count > 1 && (
                <>
                    <button onClick={prev_}
                        className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full items-center justify-center transition-all hover:scale-110">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={next}
                        className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full items-center justify-center transition-all hover:scale-110">
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {count > 1 && (
                <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 flex justify-center gap-2 z-20">
                    {activeSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i, count)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-white w-7' : 'bg-white/35 w-3 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar */}
            {count > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
                    {!paused && (
                        <div
                            key={`${current}-${animKey}`}
                            className="h-full bg-blue-400/70"
                            style={{ animation: `progress ${INTERVAL}ms linear forwards` }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

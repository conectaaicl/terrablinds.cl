import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Zap, Wifi, Smartphone, Radio, Settings, Shield, ChevronRight, Phone, ShoppingCart } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FEATURES = [
    { icon: Smartphone, title: 'Control desde tu celular', desc: 'Abre y cierra tu cortina o persiana desde cualquier lugar con la app del motor.' },
    { icon: Radio, title: 'Control remoto incluido', desc: 'Cada motor viene con control remoto de hasta 15 canales. Maneja varias cortinas desde un solo dispositivo.' },
    { icon: Wifi, title: 'Integración inteligente', desc: 'Compatible con nuestro sistema de domótica TerraBlinds — Alexa, Google Home y Apple HomeKit.' },
    { icon: Zap, title: 'Instalación rápida', desc: 'El motor tubular se instala en el tubo existente de tu cortina. En la mayoría de los casos, 1 hora de trabajo.' },
    { icon: Settings, title: 'Límites programables', desc: 'Configura los puntos de apertura y cierre exactos. Memoria de posición y modo de emergencia manual.' },
    { icon: Shield, title: 'Motor silencioso', desc: 'Tecnología DC de baja vibración. No molesta ni en habitaciones ni en locales. Garantía de 2 años.' },
];

const MOTOR_TYPES = [
    {
        name: 'Motor Tubular Residencial',
        desc: 'Ideal para cortinas roller y persianas de hogar. Torque de 10–30 Nm, silencioso y compacto.',
        tags: ['Cortina Roller', 'Persiana Hogar', 'Blackout', 'Sunscreen'],
        color: 'blue',
    },
    {
        name: 'Motor Tubular Comercial',
        desc: 'Para cortinas metálicas de locales y bodegas. Torque de 40–100+ Nm, robusto para uso intensivo.',
        tags: ['Cortina Metálica', 'Bodega', 'Local Comercial', 'Garage'],
        color: 'slate',
    },
    {
        name: 'Motor WiFi / Smart',
        desc: 'Control por app desde cualquier lugar. Programación horaria, integración con asistentes de voz.',
        tags: ['App Control', 'Alexa', 'Google Home', 'Horarios Automáticos'],
        color: 'amber',
    },
];

const fmtCLP = n => n > 0 ? `$${parseInt(n).toLocaleString('es-CL')}` : 'Consultar precio';

const COLOR_MAP = {
    blue: { badge: 'bg-blue-100 text-blue-700', card: 'border-blue-100', icon: 'bg-blue-100', iconText: 'text-blue-600' },
    slate: { badge: 'bg-slate-100 text-slate-700', card: 'border-slate-200', icon: 'bg-slate-100', iconText: 'text-slate-700' },
    amber: { badge: 'bg-amber-100 text-amber-700', card: 'border-amber-200', icon: 'bg-amber-100', iconText: 'text-amber-600' },
};

function ProductCard({ product, onAddToCart }) {
    const baseUrl = import.meta.env.VITE_API_URL;
    const images = Array.isArray(product.images) ? product.images : [];
    const img = images[0]
        ? (images[0].startsWith('http') ? images[0] : `${baseUrl}${images[0]}`)
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <Zap className="w-16 h-16 text-amber-300" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
                <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{product.name}</h3>
                {product.short_description && (
                    <p className="text-sm text-gray-500 mb-3 flex-1 leading-relaxed">{product.short_description}</p>
                )}
                {product.features?.length > 0 && (
                    <ul className="space-y-1 mb-4">
                        {product.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-700 text-lg">
                        {product.is_unit_price ? fmtCLP(product.price_unit) : fmtCLP(product.base_price_m2)}
                    </span>
                    <div className="flex gap-2">
                        <Link to={`/product/${product.id}`}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver más
                        </Link>
                        <button onClick={() => onAddToCart(product)}
                            className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Automatizacion() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/api/products').then(res => {
            const data = res.data
                .filter(p =>
                    p.category === 'Automatización' ||
                    p.category === 'Motor Tubular' ||
                    p.category === 'Control Remoto' ||
                    p.category === 'Domotica Motor Roller'
                )
                .map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch { p.features = []; }
                    return p;
                });
            setProducts(data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (product) => {
        addToCart({
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.is_unit_price ? product.price_unit : 0,
            width: null, height: null, color: null,
        });
    };

    return (
        <Layout>
            <SEO
                title="Automatización de Cortinas y Persianas — Motores y Control Remoto"
                description="Motoriza tus cortinas roller, persianas y cortinas metálicas. Motores tubulares con control remoto, app y compatibilidad con Alexa y Google Home."
                path="/automatizacion"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute top-20 left-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                    <div className="absolute bottom-20 right-20 w-72 h-72 border border-white rounded-full" />
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <Zap className="w-4 h-4" /> Motores + Control Remoto
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Automatización de<br />
                        <span className="text-yellow-200">Cortinas y Persianas</span>
                    </h1>
                    <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
                        Convierte cualquier cortina en inteligente. Motores tubulares silenciosos,
                        control remoto incluido y compatible con tu smartphone y asistentes de voz.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar automatización <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a href="#productos"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            Ver motores
                        </a>
                    </div>
                </div>
            </div>

            {/* Motor types */}
            <section className="py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Solución para cada tipo de cortina</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Tenemos el motor correcto para cada aplicación</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MOTOR_TYPES.map(m => {
                            const c = COLOR_MAP[m.color];
                            return (
                                <div key={m.name} className={`bg-white rounded-2xl border-2 ${c.card} shadow-sm p-6 hover:shadow-md transition-shadow`}>
                                    <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mb-4`}>
                                        <Zap className={`w-6 h-6 ${c.iconText}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{m.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{m.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {m.tags.map(tag => (
                                            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Cómo funciona?</h2>
                    <p className="text-gray-500 text-center mb-10 text-sm">En 3 pasos tienes tu cortina automatizada</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'Cotiza y elige tu motor', desc: 'Cuéntanos qué cortina o persiana tienes y te recomendamos el motor ideal. Respuesta en menos de 24 horas.' },
                            { step: '02', title: 'Instalación profesional', desc: 'Un técnico TerraBlinds instala el motor tubular en tu cortina existente o en la nueva que compraste con nosotros.' },
                            { step: '03', title: '¡Listo! Controla todo', desc: 'Usa el control remoto, la app o simplemente di "Alexa, cierra la cortina". Todo en un solo sistema.' },
                        ].map(s => (
                            <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                                <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                                    <span className="text-white font-black text-lg">{s.step}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Todo lo que incluye tu motor</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Tecnología profesional, precio accesible</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section id="productos" className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Motores y Controles Disponibles</h2>
                    <p className="text-gray-500 mb-8 text-sm">Selección profesional de motors tubulares y controles remotos</p>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">Productos cargando pronto.</p>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                Cotizar automatización <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <Zap className="w-10 h-10 text-yellow-200 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">¿Tienes cortinas que quieres motorizar?</h2>
                    <p className="text-orange-100 mb-8">
                        Podemos motorizar cortinas existentes o nuevas. Cotiza sin compromiso —
                        instalamos en toda la región y te damos garantía por escrito.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar ahora <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/contact"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            <Phone className="w-4 h-4" /> Consultar
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

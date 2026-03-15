import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Wifi, Smartphone, Volume2, Sun, ShieldCheck, Zap, ChevronRight, ShoppingCart, MessageCircle } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FEATURES = [
    { icon: Smartphone, title: 'Control por App', desc: 'Maneja todo desde tu smartphone, en casa o desde cualquier lugar del mundo.' },
    { icon: Volume2, title: 'Control por Voz', desc: 'Compatible con Alexa, Google Home y Apple HomeKit.' },
    { icon: Sun, title: 'Horarios Automáticos', desc: 'Programa aperturas y cierres por hora o según la luz solar.' },
    { icon: Wifi, title: 'Conexión WiFi', desc: 'Sin necesidad de hub adicional. Conecta directo a tu red doméstica.' },
    { icon: ShieldCheck, title: 'Instalación Profesional', desc: 'Nuestros técnicos instalan y configuran todo el sistema.' },
    { icon: Zap, title: 'Escenas Inteligentes', desc: 'Crea rutinas: amanecer, cine, ausencia o llegada a casa.' },
];

const fmtCLP = n => n > 0 ? `$${parseInt(n).toLocaleString('es-CL')}` : 'Consultar precio';

function ProductCard({ product, onAddToCart }) {
    const baseUrl = import.meta.env.VITE_API_URL;
    const images = Array.isArray(product.images) ? product.images : [];
    const img = images[0]
        ? (images[0].startsWith('http') ? images[0] : `${baseUrl}${images[0]}`)
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <Wifi className="w-16 h-16 text-blue-300" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
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
                    <span className="font-bold text-blue-700 text-lg">
                        {product.is_unit_price ? fmtCLP(product.price_unit) : fmtCLP(product.base_price_m2)}
                    </span>
                    <div className="flex gap-2">
                        <Link to={`/product/${product.id}`}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver más
                        </Link>
                        <button onClick={() => onAddToCart(product)}
                            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Domotica() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/api/products').then(res => {
            const data = res.data
                .filter(p => p.category === 'Domótica / Hub' || p.category === 'Domotica Motor Roller')
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
                title="Domótica e Interruptores Inteligentes"
                description="Automatiza tu hogar con cortinas motorizadas, interruptores WiFi y controladores inteligentes. Compatible con Alexa y Google Home."
                path="/domotica"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-800 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute top-20 left-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <Wifi className="w-4 h-4" /> Hogar Inteligente
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Domótica e Interruptores<br />
                        <span className="text-blue-300">Inteligentes</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                        Controla cortinas, persianas, luces y más desde tu smartphone o con tu voz.
                        Compatible con Alexa, Google Home y Apple HomeKit.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                            Cotizar ahora <ChevronRight className="w-4 h-4" />
                        </Link>
                        <a href="#productos"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            Ver productos
                        </a>
                    </div>
                </div>
            </div>

            {/* Features grid */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Por qué automatizar tu hogar?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Un sistema inteligente te da control total con mínimo esfuerzo</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section id="productos" className="py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nuestros Productos de Domótica</h2>
                    <p className="text-gray-500 mb-8 text-sm">Dispositivos compatibles con todas las cortinas y persianas TerraBlinds</p>

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
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                            <Wifi className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Productos cargando pronto.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-3">¿Tienes cortinas motorizadas?</h2>
                    <p className="text-blue-100 mb-6">Podemos integrar tu sistema existente o instalar uno nuevo. Cotiza sin compromiso.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                            Ir al Cotizador <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link to="/contact"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            <MessageCircle className="w-4 h-4" /> Consultar
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

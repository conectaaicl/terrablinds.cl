import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Sun, Zap, DollarSign, BarChart3, Leaf, Shield, ChevronRight, Phone, ShoppingCart } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DEFAULT_FEATURES = [
    { icon: DollarSign, title: 'Ahorro desde el día 1', desc: 'Reduce tu cuenta de luz hasta un 80% desde el primer mes de operación.' },
    { icon: Leaf, title: 'Energía 100% limpia', desc: 'Sin emisiones, sin combustible, sin ruido. Energía solar fotovoltaica para tu hogar o negocio.' },
    { icon: BarChart3, title: 'Monitoreo en tiempo real', desc: 'App para ver cuánto genera tu sistema, cuánto consumes y cuánto ahorras.' },
    { icon: Shield, title: 'Garantía extendida', desc: 'Paneles con garantía de producción de 25 años. Inversores con garantía de 10 años.' },
    { icon: Zap, title: 'Instalación certificada', desc: 'Instaladores SEK certificados. Tramitamos la inyección a la red con la distribuidora.' },
    { icon: Sun, title: 'Sistemas a medida', desc: 'Diseñamos el sistema según tu consumo real. Sin sobredimensionar, sin quedarte corto.' },
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
            <div className="aspect-video bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <Sun className="w-16 h-16 text-yellow-400" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
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
                    <span className="font-bold text-yellow-700 text-lg">
                        {product.is_unit_price ? fmtCLP(product.price_unit) : fmtCLP(product.base_price_m2)}
                    </span>
                    <div className="flex gap-2">
                        <Link to={`/product/${product.id}`}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver más
                        </Link>
                        <button onClick={() => onAddToCart(product)}
                            className="text-xs px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PanelesSolares() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cfg, setCfg] = useState({});
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});
        api.get('/api/products').then(res => {
            const data = res.data
                .filter(p =>
                    p.category === 'Paneles Solares' ||
                    p.category === 'Panel Solar' ||
                    p.category === 'Energía Solar' ||
                    p.category === 'Fotovoltaico'
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

    const features = DEFAULT_FEATURES.map((f, i) => ({
        icon: f.icon,
        title: cfg[`solar_feat${i + 1}_title`] || f.title,
        desc: cfg[`solar_feat${i + 1}_desc`] || f.desc,
    }));
    const heroTitle = cfg.solar_title || 'Paneles Solares — Energía Limpia para tu Hogar';
    const heroSubtitle = cfg.solar_subtitle || 'Instala tu sistema fotovoltaico y deja de depender de la red eléctrica. Ahorra hasta un 80% en tu cuenta de luz con energía solar.';

    return (
        <Layout>
            <SEO
                title="Paneles Solares — Instalación Fotovoltaica"
                description="Instala paneles solares fotovoltaicos para tu hogar o negocio. Ahorra hasta 80% en tu cuenta de luz. Instaladores certificados."
                path="/paneles-solares"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-yellow-500 via-orange-400 to-amber-500 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute top-20 left-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                    <div className="absolute bottom-20 right-20 w-72 h-72 border border-white rounded-full" />
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <Sun className="w-4 h-4" /> Energía Solar Fotovoltaica
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{heroTitle}</h1>
                    <p className="text-lg text-yellow-100 mb-8 max-w-2xl mx-auto">{heroSubtitle}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-yellow-700 font-bold px-8 py-4 rounded-2xl hover:bg-yellow-50 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar sistema solar <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a href="#productos"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            Ver equipos
                        </a>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Por qué instalar energía solar?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">La inversión que se paga sola en menos de 5 años</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {features.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Cómo funciona el proceso?</h2>
                    <p className="text-gray-500 text-center mb-10 text-sm">De la cotización a la inyección de energía en 4 pasos</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Diagnóstico energético', desc: 'Analizamos tu consumo y orientación del techo para diseñar el sistema óptimo.' },
                            { step: '02', title: 'Propuesta técnica', desc: 'Te presentamos el número de paneles, marca, potencia y retorno estimado de inversión.' },
                            { step: '03', title: 'Instalación certificada', desc: 'Nuestro equipo instala los paneles, inversor y sistema de monitoreo.' },
                            { step: '04', title: 'Conexión a la red', desc: 'Tramitamos la conexión neta con tu distribuidora eléctrica para inyectar tu excedente.' },
                        ].map(s => (
                            <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-200">
                                    <span className="text-white font-black text-lg">{s.step}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Photo Gallery */}
            {[1,2,3,4].some(i => cfg[`solar_photo${i}`]) && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Instalaciones Realizadas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1,2,3,4].filter(i => cfg[`solar_photo${i}`]).map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={cfg[`solar_photo${i}`]} alt={`Solar ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products */}
            <section id="productos" className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipos y Kits Solares</h2>
                    <p className="text-gray-500 mb-8 text-sm">Paneles, inversores y accesorios de marcas líderes</p>

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
                            <Sun className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">Equipos cargando pronto.</p>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                Cotizar sistema solar <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <Sun className="w-10 h-10 text-yellow-100 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">¿Listo para generar tu propia energía?</h2>
                    <p className="text-yellow-100 mb-8">
                        Visita técnica gratuita. Diseñamos el sistema ideal para tu techo y consumo.
                        Cotiza sin compromiso hoy mismo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-yellow-700 font-bold px-8 py-4 rounded-2xl hover:bg-yellow-50 transition-all shadow-xl hover:scale-105 text-base">
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

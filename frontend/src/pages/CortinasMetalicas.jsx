import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Shield, Lock, Truck, Wrench, ChevronRight, Phone, ShoppingCart, Zap, Building2, Home } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FEATURES = [
    { icon: Shield, title: 'Seguridad Máxima', desc: 'Láminas de acero galvanizado de alta resistencia. Protege tu local o garage de robos e intrusiones.' },
    { icon: Lock, title: 'Cierre Hermético', desc: 'Sistema de guías laterales y faldón inferior que garantiza cierre sin filtraciones de aire ni polvo.' },
    { icon: Zap, title: 'Automatizable', desc: 'Instala un motor tubular y maneja la cortina con control remoto, app o botón. Sin esfuerzo.' },
    { icon: Building2, title: 'Para Locales y Comercios', desc: 'Ideal para tiendas, bodegas, talleres, estacionamientos y cualquier apertura comercial grande.' },
    { icon: Home, title: 'Para Garage Residencial', desc: 'Solución compacta y elegante para garajes de casas, con acabados modernos y colores a elección.' },
    { icon: Wrench, title: 'Instalación Profesional', desc: 'Nuestros técnicos miden, fabrican e instalan con garantía. No pagas hasta que estás conforme.' },
];

const SPECS = [
    { label: 'Material', value: 'Acero galvanizado / Acero prepintado' },
    { label: 'Espesor lámina', value: '0.5 mm – 1.0 mm según modelo' },
    { label: 'Ancho máximo', value: 'Hasta 6 metros de un solo paño' },
    { label: 'Altura máxima', value: 'Hasta 4 metros (bajo consulta para más)' },
    { label: 'Colores disponibles', value: 'Blanco, Gris, Beige, Grafito y RAL a pedido' },
    { label: 'Automatización', value: 'Opcional — motor tubular + control remoto' },
    { label: 'Garantía', value: '2 años en estructura, 1 año en motor' },
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
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <Shield className="w-16 h-16 text-gray-300" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
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
                    <span className="font-bold text-slate-700 text-lg">
                        {product.is_unit_price ? fmtCLP(product.price_unit) : fmtCLP(product.base_price_m2)}
                    </span>
                    <div className="flex gap-2">
                        <Link to={`/product/${product.id}`}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver más
                        </Link>
                        <button onClick={() => onAddToCart(product)}
                            className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CortinasMetalicas() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/api/products').then(res => {
            const data = res.data
                .filter(p => p.category === 'Cortinas Metálicas' || p.category === 'Cortina Metálica')
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
                title="Cortinas Enrollables Metálicas — Seguridad para Locales y Garage"
                description="Cortinas metálicas enrollables de acero para locales comerciales, bodegas y garajes. Automatizables con motor y control remoto. Instalación profesional en Chile."
                path="/cortinas-metalicas"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-gray-700 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    {/* Decorative lines suggesting metal slats */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 border-b border-white"
                            style={{ top: `${10 + i * 12}%`, opacity: 0.4 }} />
                    ))}
                </div>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                                <Shield className="w-4 h-4" /> Seguridad Industrial
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                Cortinas Enrollables<br />
                                <span className="text-slate-300">Metálicas</span>
                            </h1>
                            <p className="text-lg text-slate-200 mb-8 leading-relaxed">
                                Protección resistente para locales comerciales, bodegas y garajes.
                                Fabricadas en acero galvanizado, con opción de automatización total.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/quote"
                                    className="flex items-center gap-2 bg-white text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg text-base">
                                    Cotizar ahora <ChevronRight className="w-5 h-5" />
                                </Link>
                                <a href="#productos"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                    Ver productos
                                </a>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-center">
                            {/* Visual representation of metallic shutter */}
                            <div className="relative w-64 h-72 bg-gradient-to-b from-slate-400 to-slate-600 rounded-xl shadow-2xl overflow-hidden border-2 border-slate-500">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full border-b-2 border-slate-500/60 bg-gradient-to-r from-slate-300/20 to-slate-400/20"
                                        style={{ height: '22px' }} />
                                ))}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-800 to-transparent flex items-center justify-center">
                                    <div className="w-32 h-3 bg-slate-400 rounded-full" />
                                </div>
                                <div className="absolute top-3 right-3 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shadow-lg">
                                    <Lock className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Por qué elegir una cortina metálica?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Seguridad, durabilidad y diseño en una sola solución</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-slate-700" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Automatización CTA Banner — prominent button */}
            <section className="py-10 px-4 bg-amber-50 border-y border-amber-200">
                <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">¿Quieres automatizar tu cortina metálica?</h3>
                            <p className="text-gray-600 text-sm mt-0.5">
                                Agrega un motor tubular y maneja todo con control remoto o desde tu celular. ¡Sin esfuerzo!
                            </p>
                        </div>
                    </div>
                    <Link to="/quote"
                        className="flex-shrink-0 flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-amber-300/50 hover:scale-105 text-base whitespace-nowrap">
                        Cotiza acá <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Technical specs */}
            <section className="py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-10 items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificaciones Técnicas</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {SPECS.map((s, i) => (
                                    <div key={s.label} className={`flex items-start gap-4 px-5 py-4 ${i < SPECS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <span className="text-sm font-semibold text-gray-500 w-36 flex-shrink-0">{s.label}</span>
                                        <span className="text-sm text-gray-800">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Aplicación</h2>
                            {[
                                { icon: Building2, title: 'Locales Comerciales', desc: 'Tiendas, farmacias, ferreterías, supermercados de barrio — cualquier apertura que necesite cierre nocturno seguro.' },
                                { icon: Truck, title: 'Bodegas y Galpones', desc: 'Para aperturas grandes en ambientes industriales. Estructura reforzada y alta resistencia a impactos.' },
                                { icon: Home, title: 'Garajes Residenciales', desc: 'Cierre moderno y seguro para tu garage. Disponible en versión manual o motorizada.' },
                            ].map(item => (
                                <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Products */}
            <section id="productos" className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nuestras Cortinas Metálicas</h2>
                    <p className="text-gray-500 mb-8 text-sm">Fabricadas a medida para cada apertura</p>

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
                            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">Productos cargando pronto.</p>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                Solicitar cotización personalizada <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-r from-slate-700 to-gray-800 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-3">¿Listo para proteger tu local?</h2>
                    <p className="text-slate-300 mb-8">
                        Cotiza sin compromiso. Medimos, fabricamos e instalamos en toda la región.
                        Respuesta en menos de 24 horas.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-slate-800 font-bold px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar ahora <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/contact"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            <Phone className="w-4 h-4" /> Llamar / Escribir
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

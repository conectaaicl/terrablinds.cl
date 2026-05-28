import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { KeyRound, Fingerprint, Smartphone, Shield, Users, Clock, ChevronRight, Phone, ShoppingCart } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DEFAULT_FEATURES = [
    { icon: Fingerprint, title: 'Huella, tarjeta o PIN', desc: 'Múltiples métodos de autenticación. Sin llaves físicas que perder o copiar.' },
    { icon: Smartphone, title: 'Apertura por app', desc: 'Abre puertas y portones desde tu smartphone, en cualquier lugar del mundo.' },
    { icon: Users, title: 'Gestión de usuarios', desc: 'Agrega, edita y elimina usuarios. Define horarios de acceso por persona.' },
    { icon: Clock, title: 'Registro de accesos', desc: 'Historial completo de quién entró, cuándo y por qué punto de acceso.' },
    { icon: Shield, title: 'Anti-sabotaje', desc: 'Alarma ante intentos forzados. Bloqueo automático tras varios intentos fallidos.' },
    { icon: KeyRound, title: 'Instalación integral', desc: 'Instalamos cerradura, lector, cableado y configuramos el sistema completo.' },
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
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <KeyRound className="w-16 h-16 text-blue-300" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
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
                            className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ControlAcceso() {
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
                    p.category === 'Control de Acceso' ||
                    p.category === 'Acceso' ||
                    p.category === 'Cerradura Electrónica' ||
                    p.category === 'Portero Eléctrico'
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
        title: cfg[`acceso_feat${i + 1}_title`] || f.title,
        desc: cfg[`acceso_feat${i + 1}_desc`] || f.desc,
    }));
    const heroTitle = cfg.acceso_title || 'Control de Acceso — Cerraduras Electrónicas y Biometría';
    const heroSubtitle = cfg.acceso_subtitle || 'Controla quién entra y cuándo. Sistemas de acceso biométrico, tarjetas RFID y apertura por smartphone para hogares y empresas.';

    return (
        <Layout>
            <SEO
                title="Control de Acceso — Cerraduras Electrónicas y Biometría"
                description="Sistemas de control de acceso para hogares y empresas. Huella digital, tarjeta RFID, PIN y apertura por smartphone. Instalación profesional."
                path="/control-acceso"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-slate-700 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute top-20 left-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                    <div className="absolute bottom-20 right-20 w-72 h-72 border border-white rounded-full" />
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <KeyRound className="w-4 h-4" /> Control de Acceso Inteligente
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{heroTitle}</h1>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">{heroSubtitle}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-blue-800 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar sistema <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a href="#productos"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            Ver productos
                        </a>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Por qué modernizar tu acceso?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Más seguridad, más comodidad y control total desde tu teléfono</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {features.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-blue-700" />
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
                    <p className="text-gray-500 text-center mb-10 text-sm">Instalación sin obras, sin cortar paredes</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'Evaluamos tu puerta', desc: 'Visitamos o analizamos fotos de tu puerta para recomendarte la cerradura y lector adecuados.' },
                            { step: '02', title: 'Instalación en 2 horas', desc: 'Montamos la cerradura, configuramos usuarios y credenciales. Sin obra ni perforación mayor.' },
                            { step: '03', title: 'Control total desde el móvil', desc: 'Te entregamos acceso a la app, historial de entradas y las credenciales de cada usuario.' },
                        ].map(s => (
                            <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                                    <span className="text-white font-black text-lg">{s.step}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Photo Gallery */}
            {[1,2,3,4].some(i => cfg[`acceso_photo${i}`]) && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Galería de Instalaciones</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1,2,3,4].filter(i => cfg[`acceso_photo${i}`]).map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={cfg[`acceso_photo${i}`]} alt={`Control Acceso ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products */}
            <section id="productos" className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos de Control de Acceso</h2>
                    <p className="text-gray-500 mb-8 text-sm">Cerraduras, lectores y porteros para hogar y empresa</p>

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
                            <KeyRound className="w-12 h-12 text-blue-200 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">Productos cargando pronto.</p>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                Cotizar sistema de acceso <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-blue-800 to-slate-700 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <Shield className="w-10 h-10 text-blue-300 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">¿Quieres controlar quién entra a tu propiedad?</h2>
                    <p className="text-blue-100 mb-8">
                        Instalamos sistemas de control de acceso para todo tipo de puertas y portones.
                        Sin llaves, sin preocupaciones.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-blue-800 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar ahora <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/contact"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            <Phone className="w-4 h-4" /> Consultar
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Camera, Shield, Wifi, HardDrive, Eye, Smartphone, ChevronRight, Phone, ShoppingCart } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DEFAULT_FEATURES = [
    { icon: Eye, title: 'Visión HD 24/7', desc: 'Cámaras con resolución Full HD o 4K, grabación continua o por movimiento.' },
    { icon: Wifi, title: 'Acceso Remoto', desc: 'Visualiza tu propiedad en tiempo real desde cualquier lugar con tu smartphone.' },
    { icon: Shield, title: 'Detección de Movimiento', desc: 'Alertas instantáneas al detectar movimiento sospechoso en zonas configuradas.' },
    { icon: HardDrive, title: 'Almacenamiento Seguro', desc: 'Grabación en disco local NVR/DVR o en la nube. Historial de días o semanas.' },
    { icon: Camera, title: 'Visión Nocturna', desc: 'Tecnología infrarroja para visión clara incluso en oscuridad total.' },
    { icon: Smartphone, title: 'App Móvil Incluida', desc: 'Maneja múltiples cámaras, descarga clips y recibe notificaciones push.' },
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
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                {img
                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    : <Camera className="w-16 h-16 text-gray-500" />
                }
            </div>
            <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full w-fit mb-2">{product.category}</span>
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
                    <span className="font-bold text-gray-800 text-lg">
                        {product.is_unit_price ? fmtCLP(product.price_unit) : fmtCLP(product.base_price_m2)}
                    </span>
                    <div className="flex gap-2">
                        <Link to={`/product/${product.id}`}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            Ver más
                        </Link>
                        <button onClick={() => onAddToCart(product)}
                            className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> Cotizar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Camaras() {
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
                    p.category === 'Cámaras de Seguridad' ||
                    p.category === 'Camaras' ||
                    p.category === 'CCTV' ||
                    p.category === 'Videovigilancia'
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
        title: cfg[`camaras_feat${i + 1}_title`] || f.title,
        desc: cfg[`camaras_feat${i + 1}_desc`] || f.desc,
    }));
    const heroTitle = cfg.camaras_title || 'Cámaras de Seguridad e Instalación CCTV';
    const heroSubtitle = cfg.camaras_subtitle || 'Protege tu hogar o negocio con sistemas de videovigilancia profesional. Instalación con garantía, acceso remoto y visión nocturna.';

    return (
        <Layout>
            <SEO
                title="Cámaras de Seguridad e Instalación CCTV"
                description="Sistemas de videovigilancia para hogar y empresa. Cámaras HD, visión nocturna, acceso remoto y almacenamiento local o en la nube."
                path="/camaras"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
                    <div className="absolute top-20 left-20 w-60 h-60 border border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
                    <div className="absolute bottom-20 right-20 w-72 h-72 border border-white rounded-full" />
                </div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                        <Camera className="w-4 h-4" /> Seguridad Electrónica
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{heroTitle}</h1>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">{heroSubtitle}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105 text-base">
                            Cotizar instalación <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a href="#productos"
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                            Ver cámaras
                        </a>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="bg-gray-50 py-14 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">¿Por qué elegirnos para tu seguridad?</h2>
                    <p className="text-gray-500 text-center mb-8 text-sm">Instalación profesional, tecnología de punta y soporte técnico incluido</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {features.map(f => (
                            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.icon className="w-5 h-5 text-gray-700" />
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
                    <p className="text-gray-500 text-center mb-10 text-sm">En 3 pasos tienes tu sistema instalado y funcionando</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'Diagnóstico gratuito', desc: 'Evaluamos tu propiedad para recomendarte la cantidad y tipo de cámaras ideales según tus necesidades.' },
                            { step: '02', title: 'Instalación profesional', desc: 'Nuestros técnicos instalan, cablean y configuran todo el sistema. Sin obra, sin desorden.' },
                            { step: '03', title: 'Monitoreo desde tu teléfono', desc: 'Configuramos la app en tu smartphone para que veas tus cámaras en vivo desde cualquier lugar.' },
                        ].map(s => (
                            <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-800/20">
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
            {[1,2,3,4].some(i => cfg[`camaras_photo${i}`]) && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Galería de Instalaciones</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1,2,3,4].filter(i => cfg[`camaras_photo${i}`]).map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={cfg[`camaras_photo${i}`]} alt={`Cámaras ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products */}
            <section id="productos" className="py-14 px-4 bg-gray-50">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cámaras y Sistemas Disponibles</h2>
                    <p className="text-gray-500 mb-8 text-sm">Equipos profesionales para hogar, comercio e industria</p>

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
                            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">Productos cargando pronto.</p>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                Cotizar sistema de cámaras <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-700 py-14 px-4 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <Shield className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">¿Quieres proteger tu propiedad?</h2>
                    <p className="text-gray-300 mb-8">
                        Instalamos sistemas de cámaras profesionales con garantía. Cotiza sin compromiso —
                        visita técnica gratuita en toda la región.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/quote"
                            className="flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105 text-base">
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

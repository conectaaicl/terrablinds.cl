import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Shield, Lock, Wrench, ChevronRight, Phone, ShoppingCart, Zap, Building2, Home, Truck, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SPECS = [
    { label: 'Material', value: 'Acero galvanizado / Acero prepintado' },
    { label: 'Espesor lámina', value: '0.5 mm – 1.0 mm según modelo' },
    { label: 'Ancho máximo', value: 'Hasta 6 metros de un solo paño' },
    { label: 'Altura máxima', value: 'Hasta 4 metros (bajo consulta para más)' },
    { label: 'Colores disponibles', value: 'Blanco, Gris, Beige, Grafito y RAL a pedido' },
    { label: 'Automatización', value: 'Opcional — motor tubular + control remoto' },
    { label: 'Garantía', value: '2 años en estructura, 1 año en motor' },
];

const MOTORS = [
    {
        img: '/assets/metalicas/motor_chain.jpg',
        title: 'Motor lateral con cadena',
        desc: 'Alternativa para cortinas metálicas motorizadas con sistema de transmisión lateral.',
    },
    {
        img: '/assets/metalicas/motor_600.jpg',
        title: 'Motor para trabajo exigente',
        desc: 'Configuración orientada a cortinas de mayor tamaño según cálculo técnico del proyecto.',
    },
    {
        img: '/assets/metalicas/motor_central.jpg',
        title: 'Motor central',
        desc: 'Solución compacta integrada al eje para determinadas configuraciones de cortina enrollable.',
    },
];

const TIPOS = [
    {
        img: '/assets/metalicas/cortina_local.jpg',
        title: 'Locales y accesos',
        desc: 'Protección compacta para comercio, bodegas y accesos de servicio.',
    },
    {
        img: '/assets/metalicas/cortinas_comerciales.jpg',
        title: 'Proyectos comerciales',
        desc: 'Soluciones para múltiples vanos y aperturas de mayor escala.',
    },
];

const AUTO_CHECKS = [
    'Evaluación según peso y dimensiones',
    'Accionamiento eléctrico',
    'Alternativas de control según proyecto',
    'Instalación y puesta en marcha',
    'Servicio técnico y mantenimiento',
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
                        {product.features.slice(0, 3).map((f, i) => (
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
    const [cfg, setCfg] = useState({});
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});
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

    const heroTitle = cfg.metalicas_title || 'Protege tu negocio con cortinas metálicas';
    const heroSubtitle = cfg.metalicas_subtitle || 'Cortinas enrollables de acero para locales comerciales, bodegas, galpones y garajes. Fabricación a medida, instalación profesional y distintas alternativas de motorización.';
    const heroBg = cfg.metalicas_photo1 || '/assets/metalicas/cortinas_comerciales.jpg';
    const whatsapp = cfg.whatsapp_number ? `https://wa.me/${cfg.whatsapp_number}` : 'https://wa.me/56998101891';

    return (
        <Layout>
            <SEO
                title="Cortinas Enrollables Metálicas — Seguridad para Locales y Garage"
                description="Cortinas metálicas enrollables de acero para locales comerciales, bodegas y garajes. Automatizables con motor y control remoto. Instalación profesional en Chile."
                path="/cortinas-metalicas"
            />

            {/* ── Hero con foto real ─────────────────────────────────── */}
            <div
                className="min-h-[580px] flex items-center text-white px-4"
                style={{
                    background: `linear-gradient(90deg,#041126f2 0%,#061630dc 45%,#06163055 75%), url('${heroBg}') center/cover no-repeat`,
                }}
            >
                <div className="container mx-auto max-w-5xl py-20">
                    <div className="max-w-2xl">
                        <span className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-3 block">
                            Seguridad · Comercio · Industria
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                            {heroTitle.split('cortinas metálicas').length > 1 ? (
                                <>
                                    {heroTitle.split('cortinas metálicas')[0]}
                                    <span className="text-blue-400">cortinas metálicas</span>
                                    {heroTitle.split('cortinas metálicas')[1]}
                                </>
                            ) : heroTitle}
                        </h1>
                        <p className="text-lg text-blue-100 mb-8 leading-relaxed">{heroSubtitle}</p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/quote"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg text-sm">
                                Cotiza tu cortina <ChevronRight className="w-4 h-4" />
                            </Link>
                            <a href="#motores"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
                                Ver automatización
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tipos de uso ───────────────────────────────────────── */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Soluciones para cada proyecto</h2>
                    <p className="text-gray-500 text-center mb-10 text-sm">Seguridad, resistencia y operación adaptada al uso de cada espacio.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {TIPOS.map(t => (
                            <div key={t.title}
                                className="relative min-h-[300px] rounded-2xl overflow-hidden group cursor-default"
                                style={{ background: `url('${t.img}') center/cover` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-7 z-10">
                                    <h3 className="text-2xl font-bold text-white mb-2">{t.title}</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Motores ────────────────────────────────────────────── */}
            <section id="motores" className="py-16 px-4 bg-gray-900 text-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-2">Automatización para cortinas metálicas</h2>
                    <p className="text-center text-gray-400 mb-10 text-sm">
                        La motorización se define según dimensiones, peso, frecuencia de uso y configuración de la cortina.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {MOTORS.map(m => (
                            <div key={m.title} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
                                <div className="h-52 bg-gray-800 overflow-hidden">
                                    <img src={m.img} alt={m.title} className="w-full h-full object-contain p-4" />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-white mb-2">{m.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Automatización — foto + checklist ─────────────────── */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="rounded-2xl overflow-hidden bg-gray-100 h-96">
                            <img
                                src="/assets/metalicas/motor_compact.jpg"
                                alt="Motor compacto"
                                className="w-full h-full object-contain p-6"
                            />
                        </div>
                        <div>
                            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3 block">Automatiza tu acceso</span>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                                Más comodidad.<br />
                                <span className="text-blue-600">Más control.</span>
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Podemos evaluar la automatización como parte del proyecto, seleccionando el sistema adecuado para las condiciones reales de instalación.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {AUTO_CHECKS.map(c => (
                                    <li key={c} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{c}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/quote"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm">
                                Solicitar evaluación <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Specs técnicas ─────────────────────────────────────── */}
            <section className="py-14 px-4 bg-gray-50">
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
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Aplicación</h2>
                            <div className="space-y-4">
                                {[
                                    { icon: Building2, title: 'Locales Comerciales', desc: 'Tiendas, farmacias, ferreterías — cualquier apertura que necesite cierre nocturno seguro.' },
                                    { icon: Truck, title: 'Bodegas y Galpones', desc: 'Para aperturas grandes en ambientes industriales. Alta resistencia a impactos.' },
                                    { icon: Home, title: 'Garajes Residenciales', desc: 'Cierre moderno y seguro para tu garage. Manual o motorizado.' },
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
                </div>
            </section>

            {/* ── Galería de admin (si hay fotos configuradas) ───────── */}
            {[2,3,4].some(i => cfg[`metalicas_photo${i}`]) && (
                <section className="py-14 px-4 bg-white">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Galería</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[2,3,4].filter(i => cfg[`metalicas_photo${i}`]).map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={cfg[`metalicas_photo${i}`]} alt={`Cortina Metálica ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Productos del catálogo ─────────────────────────────── */}
            {(loading || products.length > 0) && (
                <section id="productos" className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nuestras Cortinas Metálicas</h2>
                        <p className="text-gray-500 mb-8 text-sm">Fabricadas a medida para cada apertura</p>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── CTA final ─────────────────────────────────────────── */}
            <section className="py-14 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 text-white">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">¿Necesitas proteger un local, bodega o garaje?</h2>
                            <p className="text-blue-200 text-sm">Cuéntanos las medidas y el tipo de uso. TerraBlinds te ayuda a definir la solución.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <Link to="/quote"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
                                Cotizar proyecto <ChevronRight className="w-4 h-4" />
                            </Link>
                            <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
                                <Phone className="w-4 h-4" /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

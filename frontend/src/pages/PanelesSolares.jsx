import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import {
    Sun, Zap, Shield, Battery, Home, Building2, Briefcase, Settings,
    ChevronRight, ShoppingCart, CheckCircle, BarChart3, Leaf, DollarSign,
    Phone, MessageCircle,
} from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';

const DEFAULT_FEATURES = [
    { Icon: DollarSign, title: 'Ahorro desde el día 1', desc: 'Reduce tu cuenta de luz hasta un 80% desde el primer mes de operación.' },
    { Icon: Leaf, title: 'Energía 100% limpia', desc: 'Sin emisiones, sin combustible, sin ruido. Energía solar fotovoltaica para tu hogar o negocio.' },
    { Icon: BarChart3, title: 'Monitoreo en tiempo real', desc: 'Visualiza cuánto genera tu sistema, cuánto consumes y cuánto ahorras.' },
    { Icon: Shield, title: 'Garantía extendida', desc: 'Paneles con garantía de producción de 25 años. Inversores con garantía de 10 años.' },
    { Icon: Zap, title: 'Instalación certificada', desc: 'Instaladores certificados. Tramitamos la conexión con la distribuidora eléctrica.' },
    { Icon: Sun, title: 'Sistemas a medida', desc: 'Diseñamos el sistema según tu consumo real. Sin sobredimensionar, sin quedarte corto.' },
];

const STATIC_COMPONENTS = [
    { img: '/assets/paneles/kit-solar.jpg', tag: 'Sistema completo', title: 'Kit Solar', desc: 'Conjunto de paneles, inversor, almacenamiento y accesorios para una solución integrada.' },
    { img: '/assets/paneles/inversor-felicity.webp', tag: 'Conversión', title: 'Inversores', desc: 'Equipos que gestionan la conversión eléctrica y el funcionamiento del sistema.' },
    { img: '/assets/paneles/inversor-epever.jpg', tag: 'Gestión de energía', title: 'Inversor / Cargador', desc: 'Para sistemas que requieren generación, respaldo y carga de baterías.' },
    { img: '/assets/paneles/bateria-ritar-12v.jpg', tag: 'Almacenamiento', title: 'Baterías de respaldo', desc: 'Almacenamiento para disponer de energía cuando el sistema lo requiera.' },
    { img: '/assets/paneles/bateria-litio-ritar.png', tag: 'Litio', title: 'Baterías de Litio', desc: 'Mayor densidad y gestión energética para proyectos exigentes.' },
    { img: '/assets/paneles/paneles-suelo.jpg', tag: 'Generación', title: 'Paneles Fotovoltaicos', desc: 'Capturan la radiación solar y la convierten en energía eléctrica.' },
];

const USE_CASES = [
    { Icon: Home, title: 'Residencial', desc: 'Generación y respaldo para viviendas, parcelas y casas.', col: 'bg-amber-500' },
    { Icon: Building2, title: 'Comercios', desc: 'Proyectos orientados a reducir dependencia energética y mejorar continuidad.', col: 'bg-orange-500' },
    { Icon: Briefcase, title: 'Oficinas', desc: 'Sistemas para cargas seleccionadas y apoyo energético.', col: 'bg-yellow-500' },
    { Icon: Settings, title: 'Proyectos especiales', desc: 'Soluciones diseñadas según carga, autonomía y condiciones específicas.', col: 'bg-lime-600' },
];

const VALUE_STEPS = [
    { n: '01', title: 'Evaluación técnica', desc: 'Revisamos el consumo, espacio disponible y objetivo del proyecto.' },
    { n: '02', title: 'Diseño del sistema', desc: 'Definimos una arquitectura adecuada para la necesidad real del cliente.' },
    { n: '03', title: 'Equipos compatibles', desc: 'Paneles, inversores, baterías y protecciones trabajando como un solo sistema.' },
    { n: '04', title: 'Instalación profesional', desc: 'Montaje, conexionado, puesta en marcha y pruebas del sistema.' },
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

const EVAL_INIT = { nombre: '', whatsapp: '', comuna: '', tipo: 'Residencial', consumo: '', baterias: 'Quiero asesoría', objetivo: '' };

export default function PanelesSolares() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cfg, setCfg] = useState({});
    const { addToCart } = useCart();
    const [form, setForm] = useState(EVAL_INIT);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});
        api.get('/api/products').then(res => {
            const data = res.data
                .filter(p => ['Paneles Solares', 'Panel Solar', 'Energía Solar', 'Fotovoltaico'].includes(p.category))
                .map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch { p.features = []; }
                    return p;
                });
            setProducts(data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (product) => {
        addToCart({ productId: product.id, productName: product.name, quantity: 1, price: product.is_unit_price ? product.price_unit : 0, width: null, height: null, color: null });
    };

    const handleEval = (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => { setSending(false); navigate('/quote'); }, 600);
    };

    const features = DEFAULT_FEATURES.map((f, i) => ({
        Icon: f.Icon,
        title: cfg[`solar_feat${i + 1}_title`] || f.title,
        desc: cfg[`solar_feat${i + 1}_desc`] || f.desc,
    }));

    const heroTitle = cfg.solar_title || 'Genera tu propia energía.';
    const heroSubtitle = cfg.solar_subtitle || 'Diseñamos soluciones solares para viviendas, comercios y proyectos que necesitan generación fotovoltaica, respaldo energético y mayor autonomía.';

    return (
        <Layout>
            <SEO
                title="Paneles Solares — Instalación Fotovoltaica"
                description="Instala paneles solares fotovoltaicos para tu hogar o negocio. Evaluación técnica, diseño, instalación y respaldo energético."
                path="/paneles-solares"
            />

            {/* ── Hero ── */}
            <section style={{ background: '#06101f' }} className="text-white py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="inline-block text-xs font-semibold tracking-widest text-amber-400 uppercase mb-4">
                                Energía Solar TerraBlinds
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                                {heroTitle}<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                                    Reduce tu dependencia.
                                </span>
                            </h1>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">{heroSubtitle}</p>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <a href="#evaluacion"
                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-colors">
                                    Solicitar evaluación <ChevronRight className="w-4 h-4" />
                                </a>
                                <a href="#componentes"
                                    className="flex items-center gap-2 border border-slate-600 hover:border-amber-500 text-slate-200 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                    Ver componentes
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-400" /> Generación solar</span>
                                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Respaldo energético</span>
                                <span className="flex items-center gap-1.5"><Battery className="w-4 h-4 text-amber-400" /> Baterías</span>
                            </div>
                        </div>

                        {/* Energy card */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">PROYECTO SOLAR</div>
                            <div className="text-lg font-bold text-white mb-5">Solución integrada</div>
                            {[
                                { label: 'Paneles', sub: 'Generación', Icon: Sun },
                                { label: 'Inversor', sub: 'Conversión', Icon: Zap },
                                { label: 'Batería', sub: 'Respaldo', Icon: Battery },
                                { label: 'Protecciones', sub: 'Seguridad', Icon: Shield },
                            ].map(({ label, sub, Icon }) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                                    <span className="flex items-center gap-2 text-slate-300">
                                        <Icon className="w-4 h-4 text-amber-400" /> {label}
                                    </span>
                                    <span className="text-amber-400 font-semibold text-sm">{sub}</span>
                                </div>
                            ))}
                            <Link to="/quote"
                                className="mt-5 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors text-sm">
                                Cotizar tu sistema <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Una solución completa ── */}
            <section className="bg-white py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase">Una solución completa</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-3">Más que paneles: <em className="not-italic text-amber-600">un sistema pensado como conjunto.</em></h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">El proyecto debe considerar generación, conversión, almacenamiento, protecciones y condiciones reales de instalación.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUE_STEPS.map(({ n, title, desc }) => (
                            <div key={n} className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                                <div className="text-3xl font-black text-amber-200 mb-3">{n}</div>
                                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Components ── */}
            <section id="componentes" className="bg-gray-50 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase">Componentes del sistema</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">Tecnología para <em className="not-italic text-amber-600">generar, convertir y almacenar.</em></h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {STATIC_COMPONENTS.map(({ img, tag, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video overflow-hidden bg-gray-100">
                                    <img src={img} alt={title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5">
                                    <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mb-2">{tag}</span>
                                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section style={{ background: '#06101f' }} className="py-16 px-4 text-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3 block">Cómo funciona</span>
                            <h2 className="text-3xl font-bold mb-8">Del sol a tus equipos, paso a paso.</h2>
                            <div className="space-y-4">
                                {[
                                    'Los paneles generan energía.',
                                    'El inversor gestiona la conversión.',
                                    'La energía se utiliza o se almacena.',
                                    'Las baterías entregan respaldo cuando corresponde.',
                                ].map((text, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 font-black text-black text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="text-slate-300 pt-1 leading-snug">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img src="/assets/paneles/paneles-techo.jpg" alt="Paneles solares instalados en techo" className="w-full h-full object-cover" style={{ maxHeight: '320px' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why solar ── */}
            <section className="bg-white py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Por qué instalar energía solar?</h2>
                        <p className="text-gray-500 text-sm">La inversión que se paga sola en menos de 5 años</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {features.map(f => (
                            <div key={f.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                                    <f.Icon className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Use cases ── */}
            <section className="bg-gray-50 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase">Para diferentes necesidades</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">Soluciones solares para <em className="not-italic text-amber-600">hogar, comercio y proyectos.</em></h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {USE_CASES.map(({ Icon, title, desc, col }) => (
                            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                                <div className={`w-12 h-12 ${col} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Photo gallery (admin) ── */}
            {[1,2,3,4].some(i => cfg[`solar_photo${i}`]) && (
                <section className="py-14 px-4 bg-white">
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

            {/* ── Admin products ── */}
            {(loading || products.length > 0) && (
                <section id="productos" className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipos y Kits Solares</h2>
                        <p className="text-gray-500 mb-8 text-sm">Paneles, inversores y accesorios de marcas líderes</p>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Evaluation form ── */}
            <section id="evaluacion" style={{ background: '#06101f' }} className="py-16 px-4 text-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3 block">Evaluación solar</span>
                            <h2 className="text-3xl font-bold mb-4">Cuéntanos qué quieres alimentar y cuánto consumes.</h2>
                            <p className="text-slate-300 mb-6 leading-relaxed">No recomendamos dimensionar un sistema solar solo por cantidad de paneles. El cálculo debe considerar consumo, cargas críticas, autonomía deseada, ubicación y condiciones de instalación.</p>
                            <div className="space-y-2">
                                {['Consumo mensual', 'Cargas críticas', 'Horas de respaldo', 'Espacio disponible'].map(p => (
                                    <div key={p} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" /> {p}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href="https://wa.me/56998101891?text=Hola%20TerraBlinds%2C%20quiero%20información%20sobre%20paneles%20solares"
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp directo
                                </a>
                            </div>
                        </div>

                        <form onSubmit={handleEval} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">Nombre</span>
                                    <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                                        placeholder="Tu nombre"
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">WhatsApp</span>
                                    <input required value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                                        placeholder="+56 9..."
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">Comuna</span>
                                    <input value={form.comuna} onChange={e => setForm(p => ({ ...p, comuna: e.target.value }))}
                                        placeholder="Ej. Maipú"
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">Tipo de proyecto</span>
                                    <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500">
                                        <option>Residencial</option>
                                        <option>Comercial</option>
                                        <option>Oficina</option>
                                        <option>Proyecto especial</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">Consumo mensual aprox.</span>
                                    <input value={form.consumo} onChange={e => setForm(p => ({ ...p, consumo: e.target.value }))}
                                        placeholder="Ej. 350 kWh"
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                                    <span className="text-xs text-slate-400">¿Necesitas baterías?</span>
                                    <select value={form.baterias} onChange={e => setForm(p => ({ ...p, baterias: e.target.value }))}
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500">
                                        <option>Quiero asesoría</option>
                                        <option>Sí</option>
                                        <option>No</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Objetivo del proyecto</span>
                                    <textarea value={form.objetivo} onChange={e => setForm(p => ({ ...p, objetivo: e.target.value }))}
                                        rows={3} placeholder="Ej.: quiero bajar consumo y tener respaldo para refrigerador, iluminación e internet..."
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-amber-500 resize-none" />
                                </label>
                            </div>
                            <button type="submit" disabled={sending}
                                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-colors">
                                {sending ? 'Enviando...' : 'Solicitar evaluación →'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

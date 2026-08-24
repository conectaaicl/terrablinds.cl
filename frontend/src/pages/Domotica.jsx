import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import {
    Wifi, Smartphone, Volume2, Sun, ShieldCheck, Zap, ChevronRight,
    ShoppingCart, MessageCircle, Moon, Wind,
} from 'lucide-react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// WhatsApp icon
const WhatsAppIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TIMELINE = [
    { time: '07:00', icon: Sun,   title: 'Buenos días',       desc: 'Se abren las roller del dormitorio y entra luz natural gradualmente.' },
    { time: '14:00', icon: Sun,   title: 'Protección solar',  desc: 'El screen baja automáticamente en la fachada que recibe más sol.' },
    { time: '18:30', icon: Wind,  title: 'Terraza segura',    desc: 'El toldo se recoge si se detecta viento o al finalizar el horario programado.' },
    { time: '21:00', icon: Moon,  title: 'Modo noche',        desc: 'Blackout y persianas exteriores cierran para privacidad y confort.' },
];

const BENEFITS = [
    { label: 'Instalación profesional', desc: 'Integración y configuración en terreno.' },
    { label: 'Asesoría personalizada',  desc: 'Diseñamos escenas según tu rutina.' },
    { label: 'Soporte técnico',         desc: 'Te ayudamos después de la instalación.' },
    { label: 'Escalable',               desc: 'Empieza con un ambiente y amplía después.' },
];

const USE_CASES = [
    { title: 'Dormitorios', desc: 'Despertar con luz natural y cerrar blackout automáticamente por la noche.', grad: 'from-indigo-900 to-slate-900' },
    { title: 'Living',      desc: 'Escenas para privacidad, televisión, visitas y control solar.',              grad: 'from-blue-900 to-slate-900' },
    { title: 'Terrazas',    desc: 'Control de toldos, sombra y rutinas exteriores con sensor de viento.',       grad: 'from-teal-900 to-slate-900' },
    { title: 'Oficinas',    desc: 'Control de reflejos, luz natural y eficiencia energética durante la jornada.',grad: 'from-slate-800 to-slate-900' },
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
                {img ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                     : <Wifi className="w-16 h-16 text-blue-300" />}
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
    const cfg = useSiteConfig();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Lead form state
    const [lead, setLead] = useState({ nombre: '', whatsapp: '', comuna: '', espacio: 'Dormitorio', descripcion: '' });
    const [leadSent, setLeadSent] = useState(false);

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

    const handleLeadSubmit = (e) => {
        e.preventDefault();
        // Pass data to quote page via state, or just redirect
        navigate('/quote');
    };

    const waNumber = cfg.whatsapp_number || '56998101891';

    return (
        <Layout>
            <SEO
                title="Domótica e Interruptores Inteligentes"
                description="Integra cortinas, persianas, iluminación y escenas inteligentes. Compatible con Alexa, Google Home y Siri. Instalación profesional en Santiago."
                path="/domotica"
            />

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section style={{ background: '#06101f' }} className="py-20 px-4 overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left copy */}
                        <div>
                            <span className="inline-block text-xs font-bold tracking-widest text-blue-400 uppercase mb-4">
                                DOMÓTICA TERRABLINDS
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
                                Tu casa no solo responde.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                    Anticipa lo que necesitas.
                                </span>
                            </h1>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Integra cortinas, persianas, toldos, iluminación y escenas inteligentes para que tus espacios reaccionen a la hora, al sol, a tu voz y a tu rutina.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-8">
                                <Link to="/quote"
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
                                    Diseñar mi proyecto <ChevronRight className="w-4 h-4" />
                                </Link>
                                <a href="#escenas"
                                    className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white/80 font-semibold px-6 py-3 rounded-xl transition-colors">
                                    Ver escenas inteligentes
                                </a>
                            </div>
                            {/* Compatibility chips */}
                            <div className="flex flex-wrap gap-2">
                                {['Google Home', 'Alexa', 'Siri', 'Tuya', 'SmartThings'].map(c => (
                                    <span key={c} className="text-xs font-semibold text-slate-400 border border-white/10 bg-white/5 px-3 py-1.5 rounded-full">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right: animated scene panel */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">ESCENA ACTIVA</p>
                                <h3 className="text-xl font-bold text-white mb-5">Modo Mañana</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Roller dormitorio', value: '70% abierta', dot: 'bg-blue-400' },
                                        { label: 'Luz living',        value: '40%',          dot: 'bg-amber-400' },
                                        { label: 'Persiana exterior', value: 'Abierta',       dot: 'bg-green-400' },
                                        { label: 'Temperatura',       value: '22°',           dot: 'bg-orange-400' },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/8 last:border-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                                                <span className="text-sm text-slate-400">{row.label}</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">
                                    Ejecutar escena
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
            <section id="escenas" className="bg-slate-950 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">INTELIGENCIA APLICADA A TU DÍA</span>
                        <h2 className="text-3xl font-bold text-white mt-2 mb-3">Automatiza rutinas completas,<br className="hidden sm:block" /> no solo motores.</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">La diferencia está en la lógica: sensores, horarios, condiciones y escenas que coordinan varios dispositivos.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TIMELINE.map(({ time, icon: Icon, title, desc }) => (
                            <div key={time} className="bg-slate-800/60 border border-white/8 rounded-2xl p-5 hover:border-blue-500/40 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                        <Icon className="w-4.5 h-4.5 text-blue-400" />
                                    </div>
                                    <span className="text-blue-300 font-bold font-mono text-sm">{time}</span>
                                </div>
                                <h3 className="font-bold text-white mb-1.5">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VOICE ────────────────────────────────────────────────────────── */}
            <section className="py-16 px-4" style={{ background: '#0a0f1e' }}>
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">ESCENAS POR VOZ</span>
                            <h2 className="text-4xl font-extrabold text-white mt-3 mb-4">"Alexa, modo cine."</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Una sola instrucción puede bajar el blackout, ajustar la iluminación y preparar el ambiente. La domótica coordina varios elementos como una sola experiencia.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Blackout ↓', 'Luz 15%', 'Persiana cerrada', 'Escena activa'].map(chip => (
                                    <span key={chip} className="text-sm font-semibold text-blue-300 border border-blue-500/30 bg-blue-600/10 px-4 py-1.5 rounded-full">
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <div className="w-64 bg-gradient-to-br from-blue-900/80 to-slate-900 border border-blue-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-blue-900/40">
                                <div className="text-4xl mb-3 text-blue-300">◖ )))</div>
                                <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-2">ASISTENTE</p>
                                <p className="text-lg font-bold text-white mb-1">Modo cine activado</p>
                                <p className="text-sm text-slate-400">4 dispositivos actualizados</p>
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`w-1 rounded-full bg-blue-400 animate-pulse`} style={{ height: `${8 + i * 5}px`, animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ECOSYSTEM ────────────────────────────────────────────────────── */}
            <section className="bg-slate-950 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">UN ECOSISTEMA CONECTADO</span>
                        <h2 className="text-3xl font-bold text-white mt-2">Del dispositivo físico a la experiencia inteligente.</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Card 1: Hub (foto real) */}
                        <div className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors flex flex-col">
                            <div className="aspect-video overflow-hidden bg-slate-700">
                                <img src="/assets/domotica/hub-domotica.webp" alt="Hub de domótica TerraBlinds" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-white mb-2">Hub de conexión</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">Centraliza dispositivos y permite controlar escenas desde un solo punto.</p>
                                <ul className="space-y-1">
                                    {['WiFi / RF según sistema', 'Control remoto desde app', 'Integración con asistentes'].map(f => (
                                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span className="text-blue-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card 2: Interruptor (foto real) */}
                        <div className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors flex flex-col">
                            <div className="aspect-video overflow-hidden bg-slate-700">
                                <img src="/assets/domotica/interruptor-terrablinds.jpg" alt="Interruptor inteligente TerraBlinds" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-white mb-2">Interruptores inteligentes</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">Control local elegante, integrado con el resto de la instalación.</p>
                                <ul className="space-y-1">
                                    {['Control subir / parar / bajar', 'Instalación fija', 'Integración con automatización'].map(f => (
                                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span className="text-blue-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card 3: Sensores (sintética) */}
                        <div className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors flex flex-col">
                            <div className="aspect-video bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center">
                                <div className="text-5xl text-blue-400 font-mono">◉</div>
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-white mb-2">Sensores y condiciones</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">El sistema reacciona a horario, luz, presencia o condiciones externas.</p>
                                <ul className="space-y-1">
                                    {['Horarios programados', 'Lógica por condiciones', 'Escenas personalizadas'].map(f => (
                                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span className="text-blue-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card 4: App (sintética) */}
                        <div className="bg-slate-800/60 border border-white/8 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors flex flex-col">
                            <div className="aspect-video bg-gradient-to-br from-blue-900 to-slate-800 flex flex-col items-center justify-center p-4">
                                <p className="text-[9px] font-bold tracking-widest text-blue-400 uppercase mb-1">MI HOGAR</p>
                                <p className="text-white font-bold text-sm mb-2">Escenas</p>
                                <div className="space-y-1 w-full">
                                    {['Buenos días', 'Protección solar', 'Modo cine', 'Buenas noches'].map(s => (
                                        <div key={s} className="text-[10px] text-slate-300 bg-white/10 rounded-lg px-2 py-1 text-center">{s}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-white mb-2">App y control central</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3">Gestiona espacios, dispositivos y escenas desde una interfaz común.</p>
                                <ul className="space-y-1">
                                    {['Control desde cualquier lugar', 'Escenas y horarios', 'Historial de actividad'].map(f => (
                                        <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span className="text-blue-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── AUTOMATIZACIÓN vs DOMÓTICA ────────────────────────────────────── */}
            <section className="py-16 px-4" style={{ background: '#06101f' }}>
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">AUTOMATIZACIÓN ≠ DOMÓTICA</span>
                            <h2 className="text-3xl font-bold text-white mt-2 mb-4">Trabajan juntas,<br />pero no son lo mismo.</h2>
                            <p className="text-slate-400 leading-relaxed">
                                En TerraBlinds usamos la automatización como base física y la domótica como capa inteligente que coordina rutinas, asistentes y condiciones.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5">
                                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">AUTOMATIZACIÓN</span>
                                <h3 className="text-lg font-bold text-white mt-2 mb-2">El movimiento</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">Motor, control remoto, interruptor, receptor y accionamiento de cortinas o toldos.</p>
                                <Link to="/automatizacion" className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                                    Ver Automatización <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <div className="bg-blue-600/20 border border-blue-500/40 rounded-2xl p-5 relative">
                                <div className="absolute top-3 right-3 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Esta página</div>
                                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">DOMÓTICA</span>
                                <h3 className="text-lg font-bold text-white mt-2 mb-2">La inteligencia</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">Escenas, sensores, asistentes, horarios y coordinación de varios sistemas del hogar.</p>
                                <a href="#asesoria" className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                                    Diseñar proyecto <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── USE CASES ────────────────────────────────────────────────────── */}
            <section className="bg-slate-950 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">CASOS REALES DE USO</span>
                        <h2 className="text-3xl font-bold text-white mt-2">Domótica para cada espacio.</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {USE_CASES.map(({ title, desc, grad }) => (
                            <div key={title} className={`bg-gradient-to-br ${grad} border border-white/8 rounded-2xl p-5 hover:border-blue-500/30 transition-colors`}>
                                <h3 className="font-bold text-white mb-2">{title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
            <section style={{ background: '#06101f' }} className="py-10 px-4 border-t border-white/5">
                <div className="container mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFITS.map(({ label, desc }) => (
                        <div key={label} className="text-center">
                            <p className="font-bold text-white text-sm mb-1">{label}</p>
                            <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
            {!loading && products.length > 0 && (
                <section id="productos" className="bg-slate-50 py-14 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos de Domótica</h2>
                        <p className="text-gray-500 mb-8 text-sm">Compatibles con todas las cortinas y persianas TerraBlinds</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(p => (
                                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── GALLERY (admin photos) ───────────────────────────────────────── */}
            {[1,2,3,4].some(i => cfg[`domotica_photo${i}`]) && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Galería</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1,2,3,4].filter(i => cfg[`domotica_photo${i}`]).map(i => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                                    <img src={cfg[`domotica_photo${i}`]} alt={`Domótica ${i}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── LEAD FORM / ASESORÍA ─────────────────────────────────────────── */}
            <section id="asesoria" style={{ background: '#06101f' }} className="py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">PROYECTO DOMÓTICO TERRABLINDS</span>
                            <h2 className="text-3xl font-bold text-white mt-3 mb-4">Diseñemos una casa<br />que trabaje contigo.</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Cuéntanos qué espacios quieres automatizar y qué rutinas te gustaría resolver. Te proponemos una solución técnica y comercial.
                            </p>
                            {waNumber && (
                                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola, me interesa un proyecto domótico de TerraBlinds.')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                                    <WhatsAppIcon /> Consultar por WhatsApp
                                </a>
                            )}
                        </div>

                        <form onSubmit={handleLeadSubmit} className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre *</label>
                                    <input required value={lead.nombre} onChange={e => setLead(p=>({...p,nombre:e.target.value}))}
                                        placeholder="Tu nombre"
                                        className="w-full px-3 py-2.5 bg-slate-700/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">WhatsApp *</label>
                                    <input required value={lead.whatsapp} onChange={e => setLead(p=>({...p,whatsapp:e.target.value}))}
                                        placeholder="+56 9..."
                                        className="w-full px-3 py-2.5 bg-slate-700/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Comuna</label>
                                    <input value={lead.comuna} onChange={e => setLead(p=>({...p,comuna:e.target.value}))}
                                        placeholder="Ej. Las Condes"
                                        className="w-full px-3 py-2.5 bg-slate-700/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Espacios</label>
                                    <select value={lead.espacio} onChange={e => setLead(p=>({...p,espacio:e.target.value}))}
                                        className="w-full px-3 py-2.5 bg-slate-700/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                                        {['Dormitorio','Living','Terraza','Oficina','Casa completa'].map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">¿Qué quieres automatizar?</label>
                                <textarea value={lead.descripcion} onChange={e => setLead(p=>({...p,descripcion:e.target.value}))}
                                    rows={3} placeholder="Ej.: abrir roller a las 7:00, cerrar blackout de noche y controlar todo por Alexa..."
                                    className="w-full px-3 py-2.5 bg-slate-700/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                            </div>
                            <button type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                Solicitar asesoría <ChevronRight className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-slate-500 text-center">Te contactaremos en menos de 24 horas.</p>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

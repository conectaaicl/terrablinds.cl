import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import {
    Plus, Trash2, Send, CheckCircle, ChevronRight, ChevronLeft,
    Ruler, ShoppingCart, Info, Package, User, Mail, Phone, FileText,
    CreditCard, Building2, Zap, Globe,
} from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const WhatsAppIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const PRODUCT_TYPES = [
    { id: 'roller_blackout',    label: 'Roller Blackout',        icon: '🌑', desc: 'Oscurecimiento total',                hasMeasure: true },
    { id: 'roller_screen',      label: 'Roller Screen',          icon: '🌐', desc: 'Filtra luz, mantiene vista al ext.', hasMeasure: true },
    { id: 'roller_sunscreen',   label: 'Roller Sunscreen',       icon: '☀️', desc: 'Protección solar con luminosidad',   hasMeasure: true },
    { id: 'roller_duo_trasl',   label: 'Roller Duo Traslúcido',  icon: '🎭', desc: 'Doble capa: screen + traslúcido',    hasMeasure: true },
    { id: 'roller_duo_black',   label: 'Roller Duo Blackout',    icon: '🌓', desc: 'Doble capa: blackout + screen',      hasMeasure: true },
    { id: 'roller_doble_dual',  label: 'Roller Dobles o Dual',   icon: '🔲', desc: 'Sistema doble en un solo bastidor',  hasMeasure: true },
    { id: 'persiana_madera',    label: 'Persiana de Madera',     icon: '🪵', desc: 'Lamas madera natural, elegantes',    hasMeasure: true },
    { id: 'minipersiana',       label: 'Minipersiana',           icon: '🪟', desc: 'Lamas aluminio 25mm regulables',     hasMeasure: true },
    { id: 'persiana_exterior',  label: 'Persiana Exterior',      icon: '🏠', desc: 'Protección y seguridad exterior',    hasMeasure: true },
    { id: 'toldo_retractil',    label: 'Toldo Retráctil',        icon: '⛱️', desc: 'Toldos extensibles para terraza',   hasMeasure: true },
    { id: 'toldo_vertical',     label: 'Toldos Verticales',      icon: '🟦', desc: 'Lonas verticales para fachadas',    hasMeasure: true },
    { id: 'otro',               label: 'Otros / Consulta',       icon: '💬', desc: 'Otro producto o consulta especial', hasMeasure: false },
];

const PAYMENT_METHODS = [
    { icon: <Building2 className="w-5 h-5" />, label: 'Transferencia', desc: 'Banco Estado / Santander' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'WebPay', desc: 'Visa / Mastercard / Amex' },
    { icon: <Zap className="w-5 h-5" />, label: 'Flow', desc: 'Tarjetas y débito' },
    { icon: <Globe className="w-5 h-5" />, label: 'MercadoPago', desc: 'Múltiples métodos' },
];

const STEPS = [
    { num: 1, label: 'Tus datos' },
    { num: 2, label: 'Productos' },
    { num: 3, label: 'Confirmar' },
];

const fmtCLP = n => '$' + Math.round(n).toLocaleString('es-CL');

const MeasureGuide = ({ unit }) => (
    <div className="bg-gradient-to-br from-blue-950/50 to-indigo-900/50 border border-blue-700/40 rounded-xl p-4 flex flex-col items-center">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">Guía de Medición</p>
        <svg viewBox="0 0 160 200" className="w-28 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="10" width="120" height="170" rx="4" stroke="#818cf8" strokeWidth="2.5" fill="#312e81" fillOpacity="0.3" />
            <rect x="20" y="10" width="120" height="100" rx="2" fill="#6366f1" fillOpacity="0.25" />
            {[30,45,60,75,90].map(y => <line key={y} x1="22" y1={y} x2="138" y2={y} stroke="#818cf8" strokeWidth="1.2" />)}
            <line x1="20" y1="196" x2="140" y2="196" stroke="#60a5fa" strokeWidth="1.5" />
            <line x1="20" y1="191" x2="20" y2="201" stroke="#60a5fa" strokeWidth="1.5" />
            <line x1="140" y1="191" x2="140" y2="201" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="80" y="193" textAnchor="middle" fontSize="9" fill="#60a5fa" fontWeight="bold">ANCHO</text>
            <line x1="152" y1="10" x2="152" y2="180" stroke="#60a5fa" strokeWidth="1.5" />
            <line x1="148" y1="10" x2="156" y2="10" stroke="#60a5fa" strokeWidth="1.5" />
            <line x1="148" y1="180" x2="156" y2="180" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="158" y="100" textAnchor="start" fontSize="9" fill="#60a5fa" fontWeight="bold" transform="rotate(90 158 100)">ALTO</text>
        </svg>
        <ul className="text-[11px] text-blue-300 mt-3 space-y-1 w-full">
            <li>→ Mide el <strong className="text-blue-200">hueco</strong> del vano</li>
            <li>→ Toma <strong className="text-blue-200">3 puntos</strong>, usa el menor</li>
            <li>→ Unidad: <strong className="text-blue-200">{unit === 'mm' ? 'Milímetros (mm)' : 'Centímetros (cm)'}</strong></li>
        </ul>
    </div>
);

export default function Quote() {
    const { addToCart } = useCart();

    // Multi-step form state: step 1 = data, step 2 = products, step 3 = confirm
    const [formStep, setFormStep] = useState(1);

    // Step 1 data
    const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
    const [step1Errors, setStep1Errors] = useState({});

    // Step 2: product builder
    const [builderStep, setBuilderStep] = useState(0); // 0=type, 1=measure, 2=color+qty
    const [unit, setUnit] = useState('cm');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [color, setColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [itemNotes, setItemNotes] = useState('');
    const [items, setItems] = useState([]);
    const [builderError, setBuilderError] = useState(null);

    // Submission
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [waNumber, setWaNumber] = useState('');

    useEffect(() => {
        api.get('/api/config/public').then(r => { if (r.data.whatsapp_number) setWaNumber(r.data.whatsapp_number); }).catch(() => {});
        api.get('/api/products').then(r => {
            const data = r.data.map(p => {
                if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch { p.images = []; }
                if (typeof p.colors === 'string') try { p.colors = JSON.parse(p.colors); } catch { p.colors = []; }
                return p;
            });
            setProducts(data);
        }).catch(() => {}).finally(() => setLoadingProducts(false));
    }, []);

    const toCm = (val) => unit === 'mm' ? parseFloat(val) / 10 : parseFloat(val);

    const typeProducts = selectedType
        ? products.filter(p => {
            const cat = (p.category || '').toLowerCase().replace(/\s+/g, '_');
            return cat.includes(selectedType.id.replace(/_/g, '')) ||
                cat.includes(selectedType.label.toLowerCase().substring(0, 6)) ||
                selectedType.id === 'otro';
          })
        : [];

    const calcPrice = () => {
        if (!selectedProduct) return 0;
        if (selectedProduct.is_unit_price) return (parseFloat(selectedProduct.price_unit) || 0) * quantity;
        const wCm = toCm(width), hCm = toCm(height);
        if (!wCm || !hCm) return 0;
        const area = Math.max(1, (wCm / 100) * (hCm / 100));
        return Math.round(area * (parseFloat(selectedProduct.base_price_m2) || 0)) * quantity;
    };

    const handleAddItem = () => {
        if (!selectedType) return;
        const hasMeasure = selectedType.hasMeasure;
        if (hasMeasure && (!width || !height)) { setBuilderError('Ingresa ancho y alto.'); return; }

        const wCm = hasMeasure ? toCm(width) : 0;
        const hCm = hasMeasure ? toCm(height) : 0;
        const price = calcPrice();

        const displayDims = hasMeasure
            ? `${width} × ${height} ${unit}`
            : 'Sin medidas (requiere visita)';

        setItems(prev => [...prev, {
            id: Date.now(),
            typeId: selectedType.id,
            typeLabel: selectedType.label,
            typeIcon: selectedType.icon,
            productId: selectedProduct?.id || null,
            productName: selectedProduct?.name || selectedType.label,
            category: selectedType.label,
            color: color || null,
            width: wCm,
            height: hCm,
            displayDims,
            quantity,
            price,
            notes: itemNotes,
        }]);

        setSelectedType(null);
        setSelectedProduct(null);
        setWidth(''); setHeight('');
        setColor(''); setQuantity(1);
        setItemNotes('');
        setBuilderError(null);
        setBuilderStep(0);
    };

    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
    const total = items.reduce((s, i) => s + i.price, 0);

    // Step 1 validation
    const validateStep1 = () => {
        const errs = {};
        if (!userData.name.trim() || userData.name.trim().length < 2) errs.name = 'Nombre requerido (mínimo 2 caracteres)';
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) errs.email = 'Email válido requerido';
        if (!userData.phone.trim()) errs.phone = 'Teléfono requerido';
        setStep1Errors(errs);
        return Object.keys(errs).length === 0;
    };

    const goToStep2 = () => {
        if (validateStep1()) setFormStep(2);
    };

    const goToStep3 = () => {
        if (items.length === 0) { setBuilderError('Agrega al menos un producto.'); return; }
        setBuilderError(null);
        setFormStep(3);
    };

    const handleSendQuote = async () => {
        if (items.length === 0) { setError('Agrega al menos un producto.'); return; }
        setLoading(true); setError(null);
        try {
            const payload = {
                customer_name: userData.name,
                customer_email: userData.email,
                customer_phone: userData.phone,
                notes: [userData.address ? `Dirección: ${userData.address}` : '', userData.notes].filter(Boolean).join(' | '),
                items: items.map(i => ({
                    productId: i.productId,
                    productName: i.productName,
                    category: i.category,
                    color: i.color,
                    width: i.width,
                    height: i.height,
                    quantity: i.quantity,
                    price: i.price,
                })),
            };
            await api.post('/api/quotes', payload);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar. Intente nuevamente.');
        } finally { setLoading(false); }
    };

    const handleAddToCart = () => {
        items.forEach(item => {
            addToCart({
                cartId: Date.now() + Math.random(),
                productId: item.productId,
                productName: item.productName,
                category: item.category,
                color: item.color,
                width: item.width,
                height: item.height,
                displayDetails: item.displayDims,
                quantity: item.quantity,
                price: item.price,
                images: [],
            });
        });
        window.location.href = '/cart';
    };

    // ── SUCCESS SCREEN ────────────────────────────────────────────────────────────
    if (success) {
        return (
            <Layout>
                <SEO title="Cotización Enviada" description="Tu cotización fue enviada exitosamente." path="/quote" />
                <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-lg">
                        <div className="w-24 h-24 bg-green-400/20 border-2 border-green-400/50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">¡Cotización Enviada!</h1>
                        <p className="text-blue-200 text-lg mb-2 font-medium">
                            Enviamos el detalle a <strong className="text-white">{userData.email}</strong>
                        </p>
                        <p className="text-slate-400 text-sm mb-10">
                            Revisa tu bandeja de entrada (o spam). Nuestro equipo confirmará disponibilidad y coordinará la instalación contigo.
                        </p>

                        {/* Payment methods reminder */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">Aceptamos todos los medios de pago</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {PAYMENT_METHODS.map(m => (
                                    <div key={m.label} className="flex flex-col items-center gap-1.5 p-2 bg-white/5 rounded-xl">
                                        <span className="text-blue-300">{m.icon}</span>
                                        <span className="text-white text-xs font-semibold">{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-colors">
                                Volver al Inicio
                            </Link>
                            {waNumber && (
                                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, acabo de enviar una cotización. Mi nombre es ${userData.name}. ¿Me pueden confirmar?`)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="px-7 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors">
                                    <WhatsAppIcon /> Confirmar por WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── MAIN PAGE ─────────────────────────────────────────────────────────────────
    return (
        <Layout>
            <SEO title="Solicitar Cotización" description="Cotiza tus cortinas, persianas y domótica a medida. Presupuesto personalizado enviado a tu email." path="/quote" />

            {/* HERO */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-14 px-4 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <div className="container mx-auto max-w-5xl relative">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5" /> Cotización personalizada
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                            Solicita tu Presupuesto<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">a Medida</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                            Cortinas, persianas y automatización fabricadas según tus dimensiones exactas. Recibe el detalle en tu email al instante.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-0 max-w-xs mx-auto mb-10">
                        {STEPS.map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                                        formStep > s.num ? 'bg-green-500 border-green-500 text-white' :
                                        formStep === s.num ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' :
                                        'bg-transparent border-white/20 text-white/40'
                                    }`}>
                                        {formStep > s.num ? '✓' : s.num}
                                    </div>
                                    <span className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${
                                        formStep >= s.num ? 'text-blue-300' : 'text-white/30'
                                    }`}>{s.label}</span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`w-16 h-0.5 mb-5 mx-1 transition-colors duration-300 ${formStep > s.num ? 'bg-green-500' : 'bg-white/15'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Payment methods banner */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-center text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">Aceptamos todos los medios de pago</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {PAYMENT_METHODS.map(m => (
                                <div key={m.label} className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl">
                                    <span className="text-blue-400 flex-shrink-0">{m.icon}</span>
                                    <div>
                                        <p className="text-white text-xs font-semibold">{m.label}</p>
                                        <p className="text-slate-400 text-[10px]">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FORM BODY */}
            <div className="bg-slate-50 min-h-screen py-10 px-4">
                <div className="container mx-auto max-w-5xl">

                    {/* ── STEP 1: Personal data ──────────────────────────────── */}
                    {formStep === 1 && (
                        <div className="max-w-xl mx-auto">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-bold text-lg">Tus datos de contacto</h2>
                                            <p className="text-blue-200 text-sm">Para enviarte la cotización personalizada</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Nombre completo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={userData.name}
                                                onChange={e => setUserData(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Ej: María González"
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${step1Errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            />
                                        </div>
                                        {step1Errors.name && <p className="text-red-500 text-xs mt-1">{step1Errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={userData.email}
                                                onChange={e => setUserData(p => ({ ...p, email: e.target.value }))}
                                                placeholder="tu@email.com"
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${step1Errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            />
                                        </div>
                                        {step1Errors.email && <p className="text-red-500 text-xs mt-1">{step1Errors.email}</p>}
                                        <p className="text-xs text-slate-400 mt-1">Te enviaremos la cotización con el detalle de precios.</p>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Teléfono / WhatsApp <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={userData.phone}
                                                onChange={e => setUserData(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="+56 9 XXXX XXXX"
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${step1Errors.phone ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                                            />
                                        </div>
                                        {step1Errors.phone && <p className="text-red-500 text-xs mt-1">{step1Errors.phone}</p>}
                                    </div>

                                    {/* Address (optional) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Dirección / Comuna <span className="text-slate-400 font-normal">(opcional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.address}
                                            onChange={e => setUserData(p => ({ ...p, address: e.target.value }))}
                                            placeholder="Ej: Las Condes, Santiago"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Notes (optional) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Notas adicionales <span className="text-slate-400 font-normal">(opcional)</span>
                                        </label>
                                        <textarea
                                            value={userData.notes}
                                            onChange={e => setUserData(p => ({ ...p, notes: e.target.value }))}
                                            rows={2}
                                            placeholder="Preferencia horaria, tipo de instalación, consultas..."
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={goToStep2}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20">
                                        Continuar — Seleccionar Productos <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info box */}
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span className="font-semibold text-blue-800 text-sm">¿Cómo funciona?</span>
                                </div>
                                <ol className="space-y-2">
                                    {[
                                        'Ingresa tus datos de contacto',
                                        'Agrega los productos con medidas y color',
                                        'Revisa el resumen y envía la cotización',
                                        'Recibes el presupuesto detallado por email',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                                            <span className="text-sm text-blue-700">{t}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Products ──────────────────────────────────────── */}
                    {formStep === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Left: product builder */}
                            <div className="lg:col-span-3 space-y-4">
                                {/* Back button */}
                                <button onClick={() => setFormStep(1)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Volver a mis datos
                                </button>

                                {/* Unit toggle */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600 font-medium">Unidad de medida:</span>
                                    <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                                        {['cm', 'mm'].map(u => (
                                            <button key={u} onClick={() => setUnit(u)}
                                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${unit === u ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                                {u.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Builder sub-steps */}
                                {builderStep < 3 && (
                                    <div className="flex items-center mb-1">
                                        {['Tipo', 'Medidas', 'Color & Cant.'].map((label, i) => (
                                            <React.Fragment key={i}>
                                                <div className={`flex items-center gap-1.5 ${i <= builderStep ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < builderStep ? 'bg-blue-600 border-blue-600 text-white' : i === builderStep ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-300'}`}>
                                                        {i < builderStep ? '✓' : i + 1}
                                                    </div>
                                                    <span className="text-xs font-medium hidden sm:block">{label}</span>
                                                </div>
                                                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${i < builderStep ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}

                                {/* Builder Step 0: Type */}
                                {builderStep === 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-blue-600" /> ¿Qué producto necesitas?
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {PRODUCT_TYPES.map(type => (
                                                <button key={type.id} onClick={() => { setSelectedType(type); setSelectedProduct(null); setBuilderStep(type.hasMeasure ? 1 : 2); setBuilderError(null); }}
                                                    className="group flex flex-col items-center p-3.5 rounded-xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-center">
                                                    <span className="text-2xl mb-1.5">{type.icon}</span>
                                                    <span className="text-sm font-semibold text-slate-800 leading-tight">{type.label}</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{type.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Builder Step 1: Dimensions */}
                                {builderStep === 1 && selectedType && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-2xl">{selectedType.icon}</span>
                                            <div>
                                                <h2 className="font-bold text-slate-900 text-lg">{selectedType.label}</h2>
                                                <p className="text-sm text-slate-500">Medidas del vano (hueco de la ventana)</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'width', label: 'Ancho', val: width, set: setWidth, placeholder: unit === 'mm' ? 'Ej: 1500' : 'Ej: 150' },
                                                    { key: 'height', label: 'Alto', val: height, set: setHeight, placeholder: unit === 'mm' ? 'Ej: 2000' : 'Ej: 200' },
                                                ].map(f => (
                                                    <div key={f.key}>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label} ({unit})</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number" min="1"
                                                                step={unit === 'mm' ? 1 : 0.1}
                                                                value={f.val}
                                                                onChange={e => f.set(e.target.value)}
                                                                placeholder={f.placeholder}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-blue-500 outline-none transition-colors font-mono pr-12"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">{unit}</span>
                                                        </div>
                                                        {f.val && unit === 'mm' && <p className="text-xs text-slate-400 mt-1">= {(parseFloat(f.val) / 10).toFixed(1)} cm</p>}
                                                        {f.val && unit === 'cm' && <p className="text-xs text-slate-400 mt-1">= {(parseFloat(f.val) * 10).toFixed(0)} mm</p>}
                                                    </div>
                                                ))}

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                            className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50">−</button>
                                                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                            className="flex-1 text-center py-2.5 border-2 border-slate-200 rounded-xl text-base font-bold focus:border-blue-500 outline-none" />
                                                        <button type="button" onClick={() => setQuantity(q => q + 1)}
                                                            className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <MeasureGuide unit={unit} />
                                        </div>

                                        {builderError && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{builderError}</div>}

                                        <div className="flex gap-3 mt-5">
                                            <button onClick={() => setBuilderStep(0)} className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                                <ChevronLeft className="w-4 h-4" /> Atrás
                                            </button>
                                            <button onClick={() => { if (!width || !height) { setBuilderError('Ingresa ancho y alto.'); return; } setBuilderError(null); setBuilderStep(2); }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                                                Siguiente <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Builder Step 2: Color, model, notes */}
                                {builderStep === 2 && selectedType && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-2xl">{selectedType.icon}</span>
                                            <div>
                                                <h2 className="font-bold text-slate-900 text-lg">Color & Modelo</h2>
                                                <p className="text-sm text-slate-500">{selectedType.label}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {!selectedType.hasMeasure && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                            className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50">−</button>
                                                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                            className="flex-1 text-center py-2.5 border-2 border-slate-200 rounded-xl text-base font-bold focus:border-blue-500 outline-none" />
                                                        <button type="button" onClick={() => setQuantity(q => q + 1)}
                                                            className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50">+</button>
                                                    </div>
                                                </div>
                                            )}

                                            {!loadingProducts && typeProducts.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Modelo / Tela (opcional)</label>
                                                    <select value={selectedProduct?.id || ''}
                                                        onChange={e => setSelectedProduct(typeProducts.find(p => p.id === parseInt(e.target.value)) || null)}
                                                        className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none">
                                                        <option value="">— Seleccionar modelo —</option>
                                                        {typeProducts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}{p.is_unit_price ? ` ($${parseFloat(p.price_unit).toLocaleString('es-CL')}/u)` : ` ($${parseFloat(p.base_price_m2).toLocaleString('es-CL')}/m²)`}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {selectedProduct?.colors?.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color / Tela</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProduct.colors.filter(Boolean).map(c => (
                                                            <button key={c} type="button" onClick={() => setColor(c)}
                                                                className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${color === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                                                {c}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color / acabado deseado</label>
                                                <input value={color} onChange={e => setColor(e.target.value)}
                                                    placeholder="Ej: Blanco perla, Gris oscuro, Natural..."
                                                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notas de este ítem (opcional)</label>
                                                <textarea value={itemNotes} onChange={e => setItemNotes(e.target.value)} rows={2}
                                                    placeholder="Ej: Para habitación principal, colgado por dentro del vano..."
                                                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none resize-none" />
                                            </div>

                                            {selectedProduct && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                                                    <span className="text-sm text-blue-700 font-medium">Precio estimado:</span>
                                                    <span className="text-xl font-bold text-blue-800">{fmtCLP(calcPrice())}</span>
                                                </div>
                                            )}
                                        </div>

                                        {builderError && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{builderError}</div>}

                                        <div className="flex gap-3 mt-5">
                                            <button onClick={() => setBuilderStep(selectedType.hasMeasure ? 1 : 0)}
                                                className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                                <ChevronLeft className="w-4 h-4" /> Atrás
                                            </button>
                                            <button onClick={handleAddItem}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl transition-colors">
                                                <Plus className="w-4 h-4" /> Agregar a la cotización
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Items list */}
                                {items.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-slate-900">
                                                Productos <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                                            </h3>
                                            <button onClick={() => { setBuilderStep(0); setBuilderError(null); }}
                                                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                <Plus className="w-4 h-4" /> Agregar otro
                                            </button>
                                        </div>
                                        <div className="space-y-2.5">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                                    <span className="text-xl flex-shrink-0 mt-0.5">{item.typeIcon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm">{item.productName}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {item.displayDims}
                                                            {item.color && <span className="ml-2 text-blue-600">· {item.color}</span>}
                                                            {item.quantity > 1 && <span className="ml-2">· ×{item.quantity}</span>}
                                                        </p>
                                                        {item.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {item.price > 0 && <span className="text-sm font-bold text-slate-900">{fmtCLP(item.price)}</span>}
                                                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {total > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Total estimado</span>
                                                <span className="text-xl font-bold text-slate-900">{fmtCLP(total)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {builderError && items.length === 0 && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{builderError}</div>
                                )}

                                {/* Go to step 3 */}
                                {items.length > 0 && (
                                    <button onClick={goToStep3}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20">
                                        Revisar y Enviar Cotización <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Right: sticky info */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Cotización para</p>
                                            <p className="font-semibold text-slate-900 text-sm">{userData.name || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                                        <p>{userData.email}</p>
                                        <p>{userData.phone}</p>
                                        {userData.address && <p>{userData.address}</p>}
                                    </div>
                                    <div className="text-xs text-slate-400 space-y-1.5">
                                        <p className="font-semibold text-slate-600">Medios de pago:</p>
                                        {PAYMENT_METHODS.map(m => (
                                            <div key={m.label} className="flex items-center gap-2">
                                                <span className="text-blue-500 w-3.5 h-3.5">{m.icon}</span>
                                                <span>{m.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Confirmation ──────────────────────────────────── */}
                    {formStep === 3 && (
                        <div className="max-w-2xl mx-auto">
                            <button onClick={() => setFormStep(2)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6">
                                <ChevronLeft className="w-4 h-4" /> Volver a productos
                            </button>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-bold text-lg">Resumen de cotización</h2>
                                            <p className="text-slate-400 text-sm">Revisa los detalles antes de enviar</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Customer summary */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                        <p className="text-xs font-bold uppercase text-blue-400 tracking-wider mb-3">Datos del cliente</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-slate-400 text-xs">Nombre</p>
                                                <p className="font-semibold text-slate-900">{userData.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs">Email</p>
                                                <p className="font-semibold text-slate-900 break-all">{userData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs">Teléfono</p>
                                                <p className="font-semibold text-slate-900">{userData.phone}</p>
                                            </div>
                                            {userData.address && (
                                                <div>
                                                    <p className="text-slate-400 text-xs">Dirección</p>
                                                    <p className="font-semibold text-slate-900">{userData.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items summary */}
                                    <div>
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Productos solicitados</p>
                                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Producto</th>
                                                        <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold hidden sm:table-cell">Detalle</th>
                                                        <th className="px-4 py-3 text-center text-xs text-slate-400 font-semibold">Cant.</th>
                                                        <th className="px-4 py-3 text-right text-xs text-slate-400 font-semibold">Precio</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {items.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                                <span className="mr-1.5">{item.typeIcon}</span>{item.productName}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                                                                {item.displayDims}
                                                                {item.color && <span className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded">{item.color}</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                                {item.price > 0 ? fmtCLP(item.price) : 'A consultar'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-3 flex justify-between items-center px-1">
                                            <span className="text-sm text-slate-500">Total estimado</span>
                                            <span className="text-2xl font-bold text-slate-900">{total > 0 ? fmtCLP(total) : 'Precio a confirmar'}</span>
                                        </div>
                                        {total === 0 && (
                                            <p className="text-xs text-slate-400 mt-1 px-1 italic">El precio final se confirmará tras revisión técnica.</p>
                                        )}
                                    </div>

                                    {/* Payment methods */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Medios de pago aceptados</p>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {PAYMENT_METHODS.map(m => (
                                                <div key={m.label} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-100">
                                                    <span className="text-blue-500">{m.icon}</span>
                                                    <div>
                                                        <p className="text-slate-800 text-xs font-semibold">{m.label}</p>
                                                        <p className="text-slate-400 text-[10px]">{m.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

                                    {/* Action buttons */}
                                    <div className="space-y-3 pt-2">
                                        <button
                                            onClick={handleSendQuote}
                                            disabled={loading}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 text-base">
                                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Send className="w-5 h-5" />}
                                            {loading ? 'Enviando cotización...' : 'Enviar Cotización por Email'}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-grow h-px bg-slate-200" />
                                            <span className="text-xs text-slate-400 font-medium">o también puedes</span>
                                            <div className="flex-grow h-px bg-slate-200" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                                            <ShoppingCart className="w-4 h-4" /> Ir al Carrito y Pagar ahora
                                        </button>

                                        {waNumber && (
                                            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola, quisiera cotizar algunos productos de TerraBlinds.')}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                                                <WhatsAppIcon /> Cotizar por WhatsApp
                                            </a>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-400 text-center">
                                        Al enviar aceptas que TerraBlinds se ponga en contacto contigo para confirmar disponibilidad y coordinar la instalación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}

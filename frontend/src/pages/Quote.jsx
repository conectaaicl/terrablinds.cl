import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import {
    Plus, Trash2, Send, CheckCircle, ChevronRight, ChevronLeft,
    Ruler, Layers, ShoppingCart, Info, RotateCcw, Package,
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
    { id: 'otro',               label: 'Otros',                  icon: '💬', desc: 'Otro producto o consulta especial', hasMeasure: false },
];

const STEP_LABELS = ['Producto', 'Medidas', 'Color & Cant.', 'Resumen'];

const fmtCLP = n => '$' + Math.round(n).toLocaleString('es-CL');

const MeasureGuide = ({ unit }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Guía de Medición</p>
        <svg viewBox="0 0 160 200" className="w-28 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Window frame */}
            <rect x="20" y="10" width="120" height="170" rx="4" stroke="#6366f1" strokeWidth="2.5" fill="#e0e7ff" fillOpacity="0.3" />
            {/* Blind */}
            <rect x="20" y="10" width="120" height="100" rx="2" fill="#818cf8" fillOpacity="0.25" />
            {/* Horizontal lines (slats) */}
            {[30,45,60,75,90].map(y => <line key={y} x1="22" y1={y} x2="138" y2={y} stroke="#818cf8" strokeWidth="1.2" />)}
            {/* Width arrow */}
            <line x1="20" y1="196" x2="140" y2="196" stroke="#2563eb" strokeWidth="1.5" markerStart="url(#arr)" markerEnd="url(#arr)" />
            <text x="80" y="193" textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="bold">ANCHO</text>
            {/* Height arrow */}
            <line x1="152" y1="10" x2="152" y2="180" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="148" y1="10" x2="156" y2="10" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="148" y1="180" x2="156" y2="180" stroke="#2563eb" strokeWidth="1.5" />
            <text x="158" y="100" textAnchor="start" fontSize="9" fill="#2563eb" fontWeight="bold" transform="rotate(90 158 100)">ALTO</text>
            <defs>
                <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb" />
                </marker>
            </defs>
        </svg>
        <ul className="text-[11px] text-blue-700 mt-3 space-y-1 w-full">
            <li>→ Mide el <strong>hueco</strong> del vano</li>
            <li>→ Mide en <strong>3 puntos</strong> y usa el menor</li>
            <li>→ Unidad actual: <strong>{unit === 'mm' ? 'Milímetros (mm)' : 'Centímetros (cm)'}</strong></li>
        </ul>
    </div>
);

export default function Quote() {
    const { addToCart } = useCart();
    const [step, setStep] = useState(0); // 0=type, 1=measure, 2=color+qty, 3=summary+form
    const [unit, setUnit] = useState('cm');
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Current item being built
    const [selectedType, setSelectedType] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [color, setColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [itemNotes, setItemNotes] = useState('');

    // Quote list
    const [items, setItems] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '', notes: '' });
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

    const toDisplay = (valCm) => unit === 'mm' ? Math.round(valCm * 10) : valCm;
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
        if (hasMeasure && (!width || !height)) { setError('Ingresa ancho y alto.'); return; }

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

        // Reset for next item
        setSelectedType(null);
        setSelectedProduct(null);
        setWidth('');
        setHeight('');
        setColor('');
        setQuantity(1);
        setItemNotes('');
        setError(null);
        setStep(0);
    };

    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
    const total = items.reduce((s, i) => s + i.price, 0);

    const handleSendQuote = async (e) => {
        e.preventDefault();
        if (items.length === 0) { setError('Agrega al menos un producto.'); return; }
        setLoading(true); setError(null);
        try {
            const payload = {
                customer_name: userData.name,
                customer_email: userData.email,
                customer_phone: userData.phone,
                notes: userData.notes,
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
        if (items.length === 0) { setError('Agrega al menos un producto.'); return; }
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

    if (success) {
        return (
            <Layout>
                <SEO title="Cotización Enviada" description="Tu cotización fue enviada exitosamente." path="/quote" />
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Cotización Enviada!</h1>
                        <p className="text-gray-500 mb-2">Hemos recibido tu solicitud exitosamente.</p>
                        <p className="text-gray-500 mb-8">Un ejecutivo preparará tu presupuesto y te contactará a la brevedad.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/" className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                Volver al Inicio
                            </Link>
                            {waNumber && (
                                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, acabo de enviar una cotización. Mi nombre es ${userData.name}. ¿Me pueden confirmar?`)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="px-7 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <WhatsAppIcon /> Confirmar por WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO title="Cotizador Express" description="Cotiza tus cortinas, persianas y domótica online. Múltiples productos, precio al instante." path="/quote" />
            <div className="bg-gray-50 min-h-screen py-10">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Cotizador Express</h1>
                        <p className="text-gray-500 mt-2">Selecciona productos, ingresa medidas y recibe tu presupuesto por email.</p>

                        {/* Unit toggle */}
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <span className="text-sm text-gray-600 font-medium">Unidad de medida:</span>
                            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                                {['cm', 'mm'].map(u => (
                                    <button key={u} onClick={() => setUnit(u)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${unit === u ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                        {u.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* LEFT: Product builder */}
                        <div className="lg:col-span-3">
                            {/* Step indicator */}
                            {step < 3 && (
                                <div className="flex items-center mb-5">
                                    {STEP_LABELS.slice(0, 3).map((label, i) => (
                                        <React.Fragment key={i}>
                                            <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-300'}`}>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < step ? 'bg-blue-600 border-blue-600 text-white' : i === step ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-300'}`}>
                                                    {i < step ? '✓' : i + 1}
                                                </div>
                                                <span className="text-sm font-medium hidden sm:block">{label}</span>
                                            </div>
                                            {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}

                            {/* STEP 0: Select product type */}
                            {step === 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h2 className="font-bold text-gray-900 text-lg mb-4">¿Qué producto necesitas?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {PRODUCT_TYPES.map(type => (
                                            <button key={type.id} onClick={() => { setSelectedType(type); setSelectedProduct(null); setStep(type.hasMeasure ? 1 : 2); }}
                                                className="group flex flex-col items-center p-3.5 rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-center">
                                                <span className="text-2xl mb-1.5">{type.icon}</span>
                                                <span className="text-sm font-semibold text-gray-800 leading-tight">{type.label}</span>
                                                <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">{type.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: Dimensions */}
                            {step === 1 && selectedType && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-2xl">{selectedType.icon}</span>
                                        <div>
                                            <h2 className="font-bold text-gray-900 text-lg">{selectedType.label}</h2>
                                            <p className="text-sm text-gray-500">Ingresa las medidas del vano (hueco de la ventana)</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Measure inputs */}
                                        <div className="space-y-4">
                                            {[
                                                { key: 'width', label: 'Ancho', val: width, set: setWidth, placeholder: unit === 'mm' ? 'Ej: 1500' : 'Ej: 150' },
                                                { key: 'height', label: 'Alto', val: height, set: setHeight, placeholder: unit === 'mm' ? 'Ej: 2000' : 'Ej: 200' },
                                            ].map(f => (
                                                <div key={f.key}>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label} ({unit})</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step={unit === 'mm' ? 1 : 0.1}
                                                            value={f.val}
                                                            onChange={e => f.set(e.target.value)}
                                                            placeholder={f.placeholder}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 outline-none transition-colors font-mono"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">{unit}</span>
                                                    </div>
                                                    {f.val && unit === 'mm' && (
                                                        <p className="text-xs text-gray-400 mt-1">= {(parseFloat(f.val) / 10).toFixed(1)} cm</p>
                                                    )}
                                                    {f.val && unit === 'cm' && (
                                                        <p className="text-xs text-gray-400 mt-1">= {(parseFloat(f.val) * 10).toFixed(0)} mm</p>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cantidad (unidades)</label>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                                                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                        className="flex-1 text-center py-2.5 border-2 border-gray-200 rounded-xl text-base font-bold focus:border-blue-500 outline-none" />
                                                    <button type="button" onClick={() => setQuantity(q => q + 1)}
                                                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guide */}
                                        <MeasureGuide unit={unit} />
                                    </div>

                                    <div className="flex gap-3 mt-5">
                                        <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                            <ChevronLeft className="w-4 h-4" /> Atrás
                                        </button>
                                        <button onClick={() => { setError(null); if (!width || !height) { setError('Ingresa ancho y alto.'); return; } setStep(2); }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                                            Siguiente <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Color, product model, notes */}
                            {step === 2 && selectedType && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-2xl">{selectedType.icon}</span>
                                        <div>
                                            <h2 className="font-bold text-gray-900 text-lg">Color & Modelo</h2>
                                            <p className="text-sm text-gray-500">{selectedType.label}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Qty if no measure */}
                                        {!selectedType.hasMeasure && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cantidad</label>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50">−</button>
                                                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                        className="flex-1 text-center py-2.5 border-2 border-gray-200 rounded-xl text-base font-bold focus:border-blue-500 outline-none" />
                                                    <button type="button" onClick={() => setQuantity(q => q + 1)}
                                                        className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50">+</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Product model from DB */}
                                        {!loadingProducts && typeProducts.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modelo / Tela (opcional)</label>
                                                <select value={selectedProduct?.id || ''}
                                                    onChange={e => setSelectedProduct(typeProducts.find(p => p.id === parseInt(e.target.value)) || null)}
                                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none">
                                                    <option value="">— Seleccionar modelo —</option>
                                                    {typeProducts.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}{p.is_unit_price ? ` ($${parseFloat(p.price_unit).toLocaleString('es-CL')}/u)` : ` ($${parseFloat(p.base_price_m2).toLocaleString('es-CL')}/m²)`}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Colors */}
                                        {selectedProduct?.colors?.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color / Tela</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProduct.colors.filter(Boolean).map(c => (
                                                        <button key={c} type="button" onClick={() => setColor(c)}
                                                            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${color === c ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                            {c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Free color input */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color / acabado (escríbelo si no está en la lista)</label>
                                            <input value={color} onChange={e => setColor(e.target.value)}
                                                placeholder="Ej: Blanco perla, Gris oscuro, Natural..."
                                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas de este ítem (opcional)</label>
                                            <textarea value={itemNotes} onChange={e => setItemNotes(e.target.value)} rows={2}
                                                placeholder="Ej: Para habitación principal, colgado por dentro del vano..."
                                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none resize-none" />
                                        </div>

                                        {/* Price preview */}
                                        {selectedProduct && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-blue-700 font-medium">Precio estimado este ítem:</span>
                                                    <span className="text-xl font-bold text-blue-800">{fmtCLP(calcPrice())}</span>
                                                </div>
                                                {!selectedType.hasMeasure && (
                                                    <p className="text-xs text-blue-500 mt-1">Precio referencial. Se cotiza en visita.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

                                    <div className="flex gap-3 mt-5">
                                        <button onClick={() => setStep(selectedType.hasMeasure ? 1 : 0)}
                                            className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                            <ChevronLeft className="w-4 h-4" /> Atrás
                                        </button>
                                        <button onClick={handleAddItem}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-colors">
                                            <Plus className="w-4 h-4" /> Agregar a la cotización
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Items list (always visible below builder) */}
                            {items.length > 0 && (
                                <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900">Productos en la cotización <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span></h3>
                                        <button onClick={() => { setStep(0); setError(null); }}
                                            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                            <Plus className="w-4 h-4" /> Agregar otro
                                        </button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <span className="text-xl flex-shrink-0 mt-0.5">{item.typeIcon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{item.productName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {item.displayDims}
                                                        {item.color && <span className="ml-2 text-blue-600">· {item.color}</span>}
                                                        {item.quantity > 1 && <span className="ml-2">· ×{item.quantity}</span>}
                                                    </p>
                                                    {item.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{item.notes}</p>}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {item.price > 0 && <span className="text-sm font-bold text-gray-900">{fmtCLP(item.price)}</span>}
                                                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {total > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Total estimado</span>
                                            <span className="text-xl font-bold text-gray-900">{fmtCLP(total)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Contact form + actions */}
                        <div className="lg:col-span-2">
                            {/* Info box (when no items yet) */}
                            {items.length === 0 && step === 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-gray-900">¿Cómo funciona?</h3>
                                    </div>
                                    <ol className="space-y-3">
                                        {[
                                            ['1', 'Elige el tipo de producto que necesitas'],
                                            ['2', 'Ingresa las medidas del vano (ancho × alto)'],
                                            ['3', 'Selecciona color o tela deseada'],
                                            ['4', 'Agrega tus datos y envía la cotización'],
                                        ].map(([n, t]) => (
                                            <li key={n} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{n}</span>
                                                <span className="text-sm text-gray-600">{t}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-400 flex items-start gap-1.5">
                                            <Ruler className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                            Puedes ingresar medidas en <strong>cm o mm</strong>. Usa el toggle arriba para cambiar de unidad.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Contact form (when items exist) */}
                            {items.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                                    <h3 className="font-bold text-gray-900 text-base mb-4">Tus datos de contacto</h3>

                                    {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

                                    <form onSubmit={handleSendQuote} className="space-y-3">
                                        {[
                                            { name: 'name', label: 'Nombre completo', type: 'text', required: true },
                                            { name: 'email', label: 'Email', type: 'email', required: true },
                                            { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: true },
                                        ].map(f => (
                                            <div key={f.name}>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                                                <input type={f.type} required={f.required}
                                                    value={userData[f.name]} onChange={e => setUserData(p => ({ ...p, [f.name]: e.target.value }))}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Notas adicionales</label>
                                            <textarea rows={2} value={userData.notes} onChange={e => setUserData(p => ({ ...p, notes: e.target.value }))}
                                                placeholder="Dirección, piso, preferencia horaria..."
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none resize-none" />
                                        </div>

                                        <div className="pt-2 space-y-2.5">
                                            <button type="submit" disabled={loading}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Send className="w-4 h-4" />}
                                                {loading ? 'Enviando...' : 'Enviar Cotización por Email'}
                                            </button>

                                            <div className="relative flex items-center">
                                                <div className="flex-grow border-t border-gray-200" />
                                                <span className="mx-3 text-xs text-gray-400 font-medium flex-shrink-0">o también puedes</span>
                                                <div className="flex-grow border-t border-gray-200" />
                                            </div>

                                            <button type="button" onClick={handleAddToCart}
                                                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                                <ShoppingCart className="w-4 h-4" /> Ir al Carrito y Pagar
                                            </button>

                                            {waNumber && (
                                                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola, quisiera cotizar algunos productos de TerraBlinds.')}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                                                    <WhatsAppIcon /> Cotizar por WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

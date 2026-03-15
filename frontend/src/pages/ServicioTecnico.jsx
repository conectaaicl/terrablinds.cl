import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { Wrench, CheckCircle, ShoppingCart, ChevronRight, Phone, Star, AlertCircle } from 'lucide-react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_INCLUDES = [
    'Lavado y limpieza de lamas con producto especializado',
    'Limpieza completa del cajón y mecanismos internos',
    'Lubricación de resortes y engranajes con aceite multiusos WD-40',
    'Lubricación de guías y correderas con grasa silicona',
    'Ajuste y regulación de tensión del resorte',
    'Revisión de funcionamiento y diagnóstico completo',
];

const DEFAULT_PARTS = [
    { name: 'Testeros', desc: 'Soportes laterales de la persiana' },
    { name: 'Embudos', desc: 'Guías de entrada de la lama' },
    { name: 'Tapas de contención', desc: 'Cierres laterales del cajón' },
    { name: 'Conteras', desc: 'Terminaciones inferiores de las guías' },
    { name: 'Lamas', desc: 'Tablillas de aluminio de la persiana' },
    { name: 'Motores', desc: 'Motores eléctricos para persianas motorizadas' },
];

export default function ServicioTecnico() {
    const [config, setConfig] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/config/public').then(r => setConfig(r.data)).catch(() => {});
    }, []);

    const pricePerUnit = parseInt(config.stech_price || '60000', 10);
    const total = pricePerUnit * quantity;
    const formatCLP = n => `$${n.toLocaleString('es-CL')}`;

    const photos = [
        config.stech_photo1,
        config.stech_photo2,
        config.stech_photo3,
        config.stech_photo4,
    ].filter(Boolean);

    const includes = config.stech_include1
        ? [
            config.stech_include1,
            config.stech_include2,
            config.stech_include3,
            config.stech_include4,
            config.stech_include5,
            config.stech_include6,
        ].filter(Boolean)
        : DEFAULT_INCLUDES;

    const parts = DEFAULT_PARTS;

    const handleAddToCart = () => {
        addToCart({
            productId: 'servicio-tecnico-mantencion',
            productName: config.stech_title || 'Servicio Técnico — Mantención Persiana Exterior',
            quantity,
            price: total,
            notes: `${quantity} persiana${quantity > 1 ? 's' : ''}`,
            width: null,
            height: null,
            color: null,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 3000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const title = config.stech_title || 'Servicio Técnico para Persianas';
    const subtitle = config.stech_subtitle || 'Mantención profesional de persianas exteriores';
    const description = config.stech_description ||
        'Nuestro servicio de mantención prolonga la vida útil de tus persianas exteriores. Realizamos limpieza profunda, lubricación de mecanismos y revisión completa. Además ofrecemos revisión y cambio de piezas desgastadas para dejar tus persianas como nuevas.';

    return (
        <Layout>
            <SEO title={title} description={subtitle} path="/servicio-tecnico" />

            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-600/50 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                        <Wrench className="w-4 h-4" /> Servicio Técnico Profesional
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                    <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">{subtitle}</p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        {['Técnicos certificados', 'Garantía de trabajo', 'Piezas originales'].map(f => (
                            <div key={f} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-4 py-12 space-y-12">

                {/* Photos */}
                {photos.length > 0 && (
                    <section>
                        <div className={`grid gap-4 ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : photos.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                            {photos.map((src, i) => (
                                <div key={i} className="aspect-video rounded-xl overflow-hidden shadow-md">
                                    <img src={src} alt={`Servicio técnico ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Description + Price card */}
                <div className="grid md:grid-cols-5 gap-8">

                    {/* Left: description */}
                    <div className="md:col-span-3 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Qué incluye la mantención?</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
                            <ul className="space-y-2.5">
                                {includes.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Parts */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Revisión y cambio de piezas</h3>
                            <p className="text-sm text-gray-500 mb-3">Diagnosticamos y cotizamos el cambio de piezas desgastadas:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {parts.map(p => (
                                    <div key={p.name} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">* Las piezas tienen costo adicional según diagnóstico.</p>
                        </div>
                    </div>

                    {/* Right: price + buy */}
                    <div className="md:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-24">
                            <div className="flex items-center gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">Servicio garantizado</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Mantención Persiana Exterior</h3>
                            <p className="text-3xl font-bold text-blue-700 mb-1">{formatCLP(pricePerUnit)}</p>
                            <p className="text-sm text-gray-500 mb-5">por persiana (IVA incluido)</p>

                            {/* Quantity */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Número de persianas
                                </label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg">
                                        −
                                    </button>
                                    <span className="text-xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}
                                        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg">
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-blue-50 rounded-xl p-3 mb-5 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total estimado</span>
                                <span className="text-xl font-bold text-blue-700">{formatCLP(total)}</span>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-2">
                                <button onClick={handleBuyNow}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                                    Comprar ahora <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={handleAddToCart}
                                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl border-2 transition-colors ${added
                                        ? 'bg-green-50 border-green-500 text-green-700'
                                        : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                        }`}>
                                    {added
                                        ? <><CheckCircle className="w-4 h-4" /> Agregado al carrito</>
                                        : <><ShoppingCart className="w-4 h-4" /> Agregar al carrito</>
                                    }
                                </button>
                                <Link to="/quote"
                                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors">
                                    O cotizar junto a otros productos →
                                </Link>
                            </div>

                            {/* Contact note */}
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    La visita técnica es coordinada por teléfono o WhatsApp para confirmar disponibilidad en tu zona.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process steps */}
                <section className="bg-gray-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">¿Cómo funciona?</h2>
                    <div className="grid sm:grid-cols-4 gap-6">
                        {[
                            { num: '1', title: 'Solicitud', desc: 'Agrega al carrito o contáctanos por WhatsApp indicando tu dirección' },
                            { num: '2', title: 'Coordinación', desc: 'Te llamamos para coordinar día y horario de visita técnica' },
                            { num: '3', title: 'Mantención', desc: 'Nuestro técnico realiza el servicio en tu domicilio' },
                            { num: '4', title: 'Garantía', desc: 'Emitimos informe de servicio con garantía de 3 meses' },
                        ].map(step => (
                            <div key={step.num} className="text-center">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{step.num}</div>
                                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                                <p className="text-sm text-gray-500">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
}

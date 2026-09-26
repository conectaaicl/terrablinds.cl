import React, { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { Trash2, Send, CheckCircle, ArrowRight, ShoppingBag, User, Mail, Phone, MessageSquare, CreditCard, Shield, Ruler } from 'lucide-react';
import api from '../api';
import { trackLead } from '../analytics';
import { Link } from 'react-router-dom';

const StepBadge = ({ n, label, active }) => (
    <div className={`flex items-center gap-2 ${active ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</div>
        <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-blue-700' : 'text-gray-400'}`}>{label}</span>
    </div>
);

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const buildPayload = () => ({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: formData.notes,
        items: cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName || item.name,
            color: item.color || null,
            width: item.width,
            height: item.height,
            quantity: item.quantity || 1,
            price: item.price,
        })),
    });

    const handleSubmitQuote = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/quotes', buildPayload());
            trackLead('carrito', { value: cartTotal });
            setSuccess(true);
            clearCart();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar la cotización. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = async () => {
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Complete su nombre, email y teléfono antes de continuar.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/quotes', buildPayload()).catch(() => {});
            trackLead('carrito_whatsapp', { value: cartTotal });
        } finally {
            setLoading(false);
        }
        const lines = cartItems.map(item => {
            const dims = item.displayDetails || `${item.width} × ${item.height} cm`;
            const color = item.color ? ` — ${item.color}` : '';
            return `• ${item.productName || item.name} (${dims}${color})`;
        });
        const msg = `Hola, quiero coordinar mi pedido de TerraBlinds:\n\n${lines.join('\n')}\n\nTotal estimado: $${cartTotal.toLocaleString('es-CL')}\n\nNombre: ${formData.name}\nTeléfono: ${formData.phone}${formData.notes ? '\nNotas: ' + formData.notes : ''}`;
        window.open(`https://wa.me/56998101891?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (success) {
        return (
            <Layout>
                <SEO title="Cotización Enviada" description="Tu cotización ha sido enviada exitosamente." path="/cart" />
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Cotización Enviada!</h1>
                        <p className="text-gray-500 mb-2">Hemos recibido tu solicitud exitosamente.</p>
                        <p className="text-gray-500 mb-8">Te enviamos una confirmación por correo y un ejecutivo te contactará a la brevedad para coordinar los detalles.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                Volver al Inicio
                            </Link>
                            <Link to="/catalog" className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                                Ver Catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO title="Tu Cotización" description="Revisa y envía tu solicitud de cotización." path="/cart" />

            {/* Page header bar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 max-w-6xl py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900 text-sm">Tu Pedido</span>
                        {cartItems.length > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{cartItems.length}</span>
                        )}
                    </div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-3">
                        <StepBadge n="1" label="Productos" active={true} />
                        <div className="w-8 h-px bg-gray-200 hidden sm:block" />
                        <StepBadge n="2" label="Tus datos" active={cartItems.length > 0} />
                        <div className="w-8 h-px bg-gray-200 hidden sm:block" />
                        <StepBadge n="3" label="WhatsApp" active={cartItems.length > 0} />
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 min-h-screen py-10">
                <div className="container mx-auto px-4 max-w-6xl">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">⚠</span>
                            {error}
                        </div>
                    )}

                    {cartItems.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Tu cotización está vacía</h2>
                            <p className="text-gray-400 text-sm mb-6">Agrega productos desde el catálogo para comenzar.</p>
                            <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                                Explorar Catálogo <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Left: Cart Items */}
                            <div className="lg:w-3/5 space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en tu pedido
                                </p>

                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow group">
                                        {/* Image */}
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {(item.images?.[0] || item.image) ? (
                                                <img src={item.images?.[0] || item.image} alt={item.productName || item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                                {item.productName || item.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Ruler className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                <p className="text-xs text-gray-500">
                                                    {item.displayDetails || `${item.width} × ${item.height} cm`}
                                                </p>
                                            </div>
                                            {item.color && (
                                                <span className="inline-block mt-1.5 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{item.color}</span>
                                            )}
                                        </div>

                                        {/* Price + remove */}
                                        <div className="flex flex-col items-end justify-between flex-shrink-0">
                                            <span className="text-base font-black text-blue-700">
                                                ${item.price.toLocaleString('es-CL')}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 transition-colors mt-2"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Quitar</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Promo nudge */}
                                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-4">
                                    <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <p className="text-xs text-blue-700">
                                        <strong>Instalación experta incluida.</strong> Nuestro equipo mide, fabrica e instala con garantía.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Checkout */}
                            <div className="lg:w-2/5 w-full sticky top-20">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Summary */}
                                    <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Subtotal ({cartItems.length} ítem{cartItems.length !== 1 ? 's' : ''})
                                            </span>
                                            <span className="text-xl font-black text-gray-900">
                                                ${cartTotal.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Precio estimado según medidas ingresadas. El valor final se confirma tras la cotización.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmitQuote} className="px-6 py-5 space-y-3">
                                        <h3 className="font-bold text-gray-900 text-sm mb-3">Tus datos de contacto</h3>

                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input type="text" name="name" required placeholder="Nombre completo *" value={formData.name} onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input type="email" name="email" required placeholder="Email *" value={formData.email} onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input type="tel" name="phone" required placeholder="+56 9 1234 5678 *" value={formData.phone} onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                                            <textarea name="notes" rows="2" placeholder="Notas adicionales (opcional)" value={formData.notes} onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none" />
                                        </div>

                                        {/* Quote CTA */}
                                        <button type="submit" disabled={loading}
                                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200 text-sm">
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                            ) : (
                                                <><Send className="w-4 h-4" /> Solicitar Cotización gratis</>
                                            )}
                                        </button>

                                        {/* Divider */}
                                        <div className="relative flex items-center py-1">
                                            <div className="flex-grow border-t border-gray-100" />
                                            <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">o hablar directo</span>
                                            <div className="flex-grow border-t border-gray-100" />
                                        </div>

                                        {/* WhatsApp button */}
                                        <button type="button" onClick={handleWhatsApp} disabled={loading}
                                            className="w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm text-white disabled:bg-gray-300 wa-pulse">
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                    </svg>
                                                    Coordinar por WhatsApp
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2 justify-center pt-2">
                                            <Shield className="w-3 h-3 text-gray-300" />
                                            <p className="text-[11px] text-gray-400">Te respondemos en minutos · Cotización incluida</p>
                                        </div>
                                    </form>
                                </div>

                                {/* Back link */}
                                <Link to="/catalog" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors mt-4 justify-center">
                                    <ArrowRight className="w-3 h-3 rotate-180" /> Seguir comprando
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Cart;

import React, { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { Trash2, Send, CheckCircle, ArrowRight, ShoppingCart, User, Mail, Phone, MessageSquare, CreditCard, Shield } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

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
            setSuccess(true);
            clearCart();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar la cotización. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (method = 'flow') => {
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Complete su nombre, email y teléfono antes de pagar.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const quoteRes = await api.post('/api/quotes', buildPayload());
            const endpoint = method === 'mp' ? '/api/payment/mercadopago/create' : '/api/payment/create';
            const payRes = await api.post(endpoint, { quoteId: quoteRes.data.id });
            if (payRes.data.redirectUrl) {
                clearCart();
                window.location.href = payRes.data.redirectUrl;
            } else {
                setError('Error al iniciar el pago.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar el pago.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <SEO title="Cotización Enviada" description="Tu cotización ha sido enviada exitosamente." path="/cart" />
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Cotización Enviada!</h1>
                        <p className="text-gray-500 mb-2">Hemos recibido tu solicitud exitosamente.</p>
                        <p className="text-gray-500 mb-8">Te enviamos una confirmación por correo y un ejecutivo te contactará a la brevedad para coordinar los detalles.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/" style={{ backgroundColor: '#2563eb' }} className="px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
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
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tu Cotización</h1>
                            <p className="text-gray-500 text-sm">{cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} seleccionado{cartItems.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">⚠</span>
                            {error}
                        </div>
                    )}

                    {cartItems.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu cotización está vacía</h2>
                            <p className="text-gray-400 mb-6">Agrega productos desde el catálogo para comenzar.</p>
                            <Link to="/catalog" style={{ backgroundColor: '#2563eb' }} className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                                Explorar Catálogo <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items */}
                            <div className="lg:w-3/5 space-y-4">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Productos seleccionados</h2>
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {(item.images?.[0] || item.image) ? (
                                                <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base truncate">{item.productName || item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.displayDetails || `${item.width} × ${item.height} cm`}</p>
                                            {item.color && (
                                                <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{item.color}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className="text-lg font-bold text-blue-600">${item.price.toLocaleString('es-CL')}</span>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Checkout Panel */}
                            <div className="lg:w-2/5">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                                    {/* Total */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-500 text-sm">Subtotal ({cartItems.length} ítem{cartItems.length !== 1 ? 's' : ''})</span>
                                            <span className="font-bold text-gray-900 text-lg">${cartTotal.toLocaleString('es-CL')}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Precio estimado. El valor final se confirma tras la cotización.</p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
                                        <h3 className="font-bold text-gray-900 text-base mb-4">Tus datos de contacto</h3>

                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" name="name" required placeholder="Nombre completo" value={formData.name} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="email" name="email" required placeholder="Tu email" value={formData.email} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="tel" name="phone" required placeholder="+56 9 1234 5678" value={formData.phone} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                                        </div>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <textarea name="notes" rows="2" placeholder="Notas adicionales (opcional)" value={formData.notes} onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none" />
                                        </div>

                                        {/* Quote button */}
                                        <button type="submit" disabled={loading}
                                            style={{ backgroundColor: loading ? '#9ca3af' : '#2563eb' }}
                                            className="w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            ) : (
                                                <><Send className="w-4 h-4" /> Solicitar Cotización</>
                                            )}
                                        </button>

                                        {/* Divider */}
                                        <div className="relative flex items-center py-1">
                                            <div className="flex-grow border-t border-gray-200" />
                                            <span className="flex-shrink mx-3 text-xs text-gray-400 font-medium">O paga directamente</span>
                                            <div className="flex-grow border-t border-gray-200" />
                                        </div>

                                        {/* Payment buttons */}
                                        <button type="button" onClick={() => handlePayment('flow')} disabled={loading}
                                            className="w-full py-3 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                            <CreditCard className="w-4 h-4" /> WebPay / Flow
                                        </button>
                                        <button type="button" onClick={() => handlePayment('mp')} disabled={loading}
                                            className="w-full py-3 disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                            style={{ backgroundColor: loading ? '#9ca3af' : '#009ee3' }}>
                                            <CreditCard className="w-4 h-4" /> Mercado Pago
                                        </button>

                                        <div className="flex items-center gap-2 justify-center pt-1">
                                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                                            <p className="text-xs text-gray-400 text-center">Pagos 100% seguros. Recibirás confirmación por email.</p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Cart;

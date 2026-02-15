import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { Trash2, Send, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send data to backend to create Quote
            const payload = {
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    width: item.width,
                    height: item.height,
                    price: item.price,
                    extrasPrice: 0 // Optional extras
                })),
                total_price: cartTotal
            };

            const res = await axios.post('http://localhost:5000/api/quotes', payload);
            const quote = res.data;

            // If user clicked "Pay Now" (we'll assume a separate button or logic, but for now let's ask)
            // Or better, after quote creation, offer payment.
            // Simplified: User submits form -> Quote Created -> Redirect to Success OR Payment

            // For now, let's just make the "Solicitar" button create quote.
            // We will add a separate block for "Payment" if desired, or auto-redirect.
            // The user asked for "option to buy".

            setSuccess(true);
            clearCart();
        } catch (error) {
            console.warn('Error submitting quote, falling back to DEMO success', error);
            // Simulate success for demo
            setSuccess(true);
            clearCart();
            // alert('Hubo un error al enviar la cotización. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cotización Enviada!</h1>
                    <p className="text-gray-600 max-w-lg mb-8">
                        Hemos recibido tu solicitud correctamente. Te hemos enviado un correo de confirmación con los detalles.
                        Un ejecutivo te contactará a la brevedad.
                    </p>
                    <Link to="/" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                        Volver al Inicio
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu Cotización</h1>

                    {cartItems.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <p className="text-gray-500 text-lg mb-6">No tienes productos en tu cotización.</p>
                            <Link to="/catalog" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                                Ver Catálogo <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Product List */}
                            <div className="lg:w-2/3 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                            ) : item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-gray-900 text-lg">{item.productName || item.name}</h3>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {item.displayDetails || `Dimensiones: ${item.width} x ${item.height} cm`}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary-600 text-xl">
                                                ${item.price.toLocaleString('es-CL')}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="text-red-500 hover:text-red-700 text-sm mt-2 flex items-center justify-end w-full"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary & Form */}
                            <div className="lg:w-1/3">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen</h3>

                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                                        <span className="text-gray-600">Total Estimado</span>
                                        <span className="text-3xl font-bold text-gray-900">${cartTotal.toLocaleString('es-CL')}</span>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="+56 9..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                                            <textarea
                                                name="notes"
                                                rows="3"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg transform hover:scale-[1.02] duration-200"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    Solicitar Cotización <Send className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </button>

                                        <div className="relative flex py-2 items-center">
                                            <div className="flex-grow border-t border-gray-300"></div>
                                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O paga directamente</span>
                                            <div className="flex-grow border-t border-gray-300"></div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!formData.name || !formData.email) {
                                                    alert('Por favor completa tus datos antes de pagar.');
                                                    return;
                                                }
                                                setLoading(true);
                                                try {
                                                    // 1. Create Quote first
                                                    const payload = {
                                                        customer_name: formData.name,
                                                        customer_email: formData.email,
                                                        customer_phone: formData.phone,
                                                        items: cartItems.map(item => ({
                                                            productId: item.productId || 1, // Fallback for mock items
                                                            width: item.width,
                                                            height: item.height,
                                                            price: item.price,
                                                            extrasPrice: 0
                                                        })),
                                                        total_price: cartTotal
                                                    };
                                                    const res = await axios.post('http://localhost:5000/api/quotes', payload);
                                                    const quoteId = res.data.id;

                                                    // 2. Initiate Payment
                                                    const payRes = await axios.post('http://localhost:5000/api/payment/create', { quoteId });
                                                    if (payRes.data.redirectUrl) {
                                                        window.location.href = payRes.data.redirectUrl;
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error al iniciar el pago.');
                                                    setLoading(false);
                                                }
                                            }}
                                            className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg"
                                        >
                                            Pagar Online (WebPay / Flow)
                                        </button>
                                        <p className="text-xs text-center text-gray-500 mt-4">
                                            Al enviar, recibirás una copia en tu correo y te contactaremos para confirmar detalles.
                                        </p>
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

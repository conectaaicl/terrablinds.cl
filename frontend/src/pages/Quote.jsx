import React, { useState } from 'react';
import Layout from '../components/Layout';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { Plus, Trash2, Send, CheckCircle, Calculator } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Quote = () => {
    // Group products by category for the dropdown
    const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];

    // Form State
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [quantity, setQuantity] = useState(1);

    // List State
    const [quoteItems, setQuoteItems] = useState([]);

    // User Data State
    const [userData, setUserData] = useState({ name: '', email: '', phone: '', notes: '' });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const selectedProduct = MOCK_PRODUCTS.find(p => p.id === parseInt(selectedProductId));

    const handleAddItem = () => {
        if (!selectedProduct) return alert('Seleccione un producto');

        const isUnit = selectedProduct.is_unit_price;

        if (!isUnit && (!width || !height)) return alert('Ingrese las medidas');
        if (isUnit && !quantity) return alert('Ingrese la cantidad');

        const newItem = {
            id: Date.now(),
            product: selectedProduct,
            width: isUnit ? 0 : width,
            height: isUnit ? 0 : height,
            quantity: quantity, // Use user entered quantity for all types
            count: quantity
        };

        setQuoteItems([...quoteItems, newItem]);
        // Reset fields
        setWidth('');
        setHeight('');
        setQuantity(1);
    };

    const handleRemoveItem = (id) => {
        setQuoteItems(quoteItems.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (quoteItems.length === 0) return alert('Agregue productos a la lista');

        setLoading(true);
        try {
            // Mock API call
            const payload = {
                customer: userData,
                items: quoteItems.map(item => ({
                    product: item.product.name,
                    category: item.product.category,
                    width: item.width,
                    height: item.height,
                    quantity: item.count
                }))
            };

            console.log("Sending Quote:", payload);

            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Try real API if needed, or just success
            // await axios.post('http://localhost:5000/api/quotes/bulk', payload);

            setSuccess(true);
        } catch (error) {
            console.error(error);
            // Fallback success
            setSuccess(true);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cotización Solicitada!</h1>
                    <p className="text-gray-600 max-w-lg mb-8">
                        Hemos enviado el detalle de tu solicitud a tu correo. Un ejecutivo comercial preparará tu presupuesto formal y te contactará a la brevedad.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <button
                            onClick={() => alert('Enviando PDF a tu correo...')}
                            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">📧</span> Enviar por Email
                        </button>
                        <button
                            onClick={() => alert('Descargando Cotización PDF...')}
                            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">📄</span> Descargar PDF
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors">
                            Volver al Inicio
                        </Link>
                        <button
                            onClick={() => {
                                alert('Redirigiendo a Pasarela de Pago (Flow)...');
                                // Simulate redirect
                                setTimeout(() => window.location.href = '/', 2000);
                            }}
                            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center"
                        >
                            <span className="mr-2">💳</span> Pagar Reserva Ahora
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Cotizador Express</h1>
                        <p className="text-gray-600 mt-2">Agrega múltiples productos y recibe tu presupuesto por email.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Product Builder */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">
                                        1
                                    </div>
                                    Agregar Productos
                                </h3>

                                <div className="space-y-4">
                                    {/* Category Select */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            value={selectedCategory}
                                            onChange={e => {
                                                setSelectedCategory(e.target.value);
                                                setSelectedProductId('');
                                            }}
                                        >
                                            <option value="">Seleccionar Categoría...</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Product Select */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo / Tela</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            value={selectedProductId}
                                            onChange={e => setSelectedProductId(e.target.value)}
                                            disabled={!selectedCategory}
                                        >
                                            <option value="">Seleccionar Modelo...</option>
                                            {MOCK_PRODUCTS
                                                .filter(p => p.category === selectedCategory)
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {/* Inputs - Always Render but Disabled if no product */}
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                        {selectedProduct?.is_unit_price ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                                <input
                                                    type="number" min="1"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    value={quantity}
                                                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (cm)</label>
                                                        <input
                                                            type="number" placeholder="Ej: 150"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                            value={width}
                                                            onChange={e => setWidth(e.target.value)}
                                                            disabled={!selectedProduct}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Alto (cm)</label>
                                                        <input
                                                            type="number" placeholder="Ej: 200"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                            value={height}
                                                            onChange={e => setHeight(e.target.value)}
                                                            disabled={!selectedProduct}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                                    <input
                                                        type="number" min="1"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                        value={quantity}
                                                        onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                        disabled={!selectedProduct}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="pt-2">
                                            {!selectedProduct && (
                                                <p className="text-sm text-red-500 mb-2 text-center">
                                                    * Selecciona un producto para habilitar
                                                </p>
                                            )}
                                            <button
                                                onClick={handleAddItem}
                                                disabled={!selectedProduct}
                                                className={`w-full py-4 text-white font-bold rounded-lg flex items-center justify-center transition-all transform active:scale-95 shadow-md ${!selectedProduct
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 hover:bg-black'
                                                    }`}
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Agregar a la Cotización
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center/Right: List & Submit */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* List */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                                <h3 className="font-bold text-lg mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">
                                        2
                                    </div>
                                    Lista de Cotización
                                </h3>

                                {quoteItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No has agregado productos aún.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Producto</th>
                                                    <th className="px-4 py-3">Detalle</th>
                                                    <th className="px-4 py-3 text-center">Cant.</th>
                                                    <th className="px-4 py-3 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {quoteItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">{item.product.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {item.product.is_unit_price
                                                                ? 'Unidad'
                                                                : `${item.width} x ${item.height} cm`}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{item.count}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Form */}
                            {quoteItems.length > 0 && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
                                    <h3 className="font-bold text-lg mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">
                                            3
                                        </div>
                                        Datos de Contacto
                                    </h3>

                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                            <input
                                                type="text" required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.name}
                                                onChange={e => setUserData({ ...userData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email" required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.email}
                                                onChange={e => setUserData({ ...userData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                            <input
                                                type="tel" required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.phone}
                                                onChange={e => setUserData({ ...userData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                rows="3"
                                                value={userData.notes}
                                                onChange={e => setUserData({ ...userData, notes: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <div className="md:col-span-2 pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center shadow-lg"
                                            >
                                                {loading ? 'Enviando...' : (
                                                    <>
                                                        <Send className="w-5 h-5 mr-2" /> Solicitar Cotización
                                                    </>
                                                )}
                                            </button>
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
};

export default Quote;

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Plus, Trash2, Send, CheckCircle, Calculator } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

const Quote = () => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [quantity, setQuantity] = useState(1);

    const [quoteItems, setQuoteItems] = useState([]);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/api/products');
                const data = res.data.map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                    return p;
                });
                setProducts(data);
            } catch (err) {
                console.error('Error loading products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = [...new Set(products.map(p => p.category))].sort();
    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

    const calculateItemPrice = (product, w, h, qty) => {
        if (product.is_unit_price) {
            return (parseFloat(product.price_unit) || 0) * qty;
        }
        const area = (parseFloat(w) / 100) * (parseFloat(h) / 100);
        const finalArea = area < 1.0 ? 1.0 : area;
        return Math.round(finalArea * (parseFloat(product.base_price_m2) || 0)) * qty;
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        const isUnit = selectedProduct.is_unit_price;

        if (!isUnit && (!width || !height)) {
            setError('Ingrese las medidas.');
            return;
        }

        const price = calculateItemPrice(selectedProduct, width, height, quantity);

        const newItem = {
            id: Date.now(),
            product: selectedProduct,
            width: isUnit ? 0 : parseFloat(width),
            height: isUnit ? 0 : parseFloat(height),
            quantity,
            price
        };

        setQuoteItems([...quoteItems, newItem]);
        setWidth('');
        setHeight('');
        setQuantity(1);
        setError(null);
    };

    const handleRemoveItem = (id) => {
        setQuoteItems(quoteItems.filter(item => item.id !== id));
    };

    const totalAmount = quoteItems.reduce((sum, item) => sum + item.price, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (quoteItems.length === 0) {
            setError('Agregue al menos un producto.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                customer_name: userData.name,
                customer_email: userData.email,
                customer_phone: userData.phone,
                notes: userData.notes,
                items: quoteItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    category: item.product.category,
                    width: item.width,
                    height: item.height,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            await api.post('/api/quotes', payload);
            setSuccess(true);
        } catch (err) {
            const message = err.response?.data?.error || 'Error al enviar la cotizacion. Intente nuevamente.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <SEO title="Cotización Enviada" description="Tu cotización ha sido enviada exitosamente." path="/quote" />
                <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Cotizacion Solicitada</h1>
                    <p className="text-gray-600 max-w-lg mb-8">
                        Hemos enviado el detalle de tu solicitud a tu correo. Un ejecutivo comercial preparara tu presupuesto formal y te contactara a la brevedad.
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
            <SEO
                title="Cotizador Express"
                description="Cotiza tus cortinas y persianas online. Calcula precios al instante y recibe tu presupuesto por email."
                path="/quote"
            />
            <div className="bg-gray-50 py-12 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Cotizador Express</h1>
                        <p className="text-gray-600 mt-2">Agrega multiples productos y recibe tu presupuesto por email.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm max-w-4xl mx-auto">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">1</div>
                                    Agregar Productos
                                </h3>

                                {loadingProducts ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                value={selectedCategory}
                                                onChange={e => { setSelectedCategory(e.target.value); setSelectedProductId(''); }}>
                                                <option value="">Seleccionar Categoria...</option>
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo / Tela</label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                value={selectedProductId}
                                                onChange={e => setSelectedProductId(e.target.value)}
                                                disabled={!selectedCategory}>
                                                <option value="">Seleccionar Modelo...</option>
                                                {products.filter(p => p.category === selectedCategory).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                            {selectedProduct?.is_unit_price ? (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                                    <input type="number" min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                        value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (cm)</label>
                                                            <input type="number" placeholder="Ej: 150" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                                value={width} onChange={e => setWidth(e.target.value)} disabled={!selectedProduct} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alto (cm)</label>
                                                            <input type="number" placeholder="Ej: 200" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                                value={height} onChange={e => setHeight(e.target.value)} disabled={!selectedProduct} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                                        <input type="number" min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                            value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} disabled={!selectedProduct} />
                                                    </div>
                                                </>
                                            )}

                                            {selectedProduct && (
                                                <p className="text-sm text-gray-500">
                                                    Precio ref.: ${selectedProduct.is_unit_price
                                                        ? parseFloat(selectedProduct.price_unit).toLocaleString('es-CL') + '/un'
                                                        : parseFloat(selectedProduct.base_price_m2).toLocaleString('es-CL') + '/m2'}
                                                </p>
                                            )}

                                            <button onClick={handleAddItem} disabled={!selectedProduct}
                                                className={`w-full py-4 text-white font-bold rounded-lg flex items-center justify-center transition-all ${!selectedProduct ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}>
                                                <Plus className="w-5 h-5 mr-2" /> Agregar a la Cotizacion
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                                <h3 className="font-bold text-lg mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">2</div>
                                    Lista de Cotizacion
                                </h3>

                                {quoteItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No has agregado productos aun.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3">Producto</th>
                                                        <th className="px-4 py-3">Detalle</th>
                                                        <th className="px-4 py-3 text-center">Cant.</th>
                                                        <th className="px-4 py-3 text-right">Precio</th>
                                                        <th className="px-4 py-3 text-right">Accion</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {quoteItems.map(item => (
                                                        <tr key={item.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{item.product.name}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                {item.product.is_unit_price ? 'Unidad' : `${item.width} x ${item.height} cm`}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-right font-bold">${item.price.toLocaleString('es-CL')}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="text-right mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-gray-600 mr-4">Total Estimado:</span>
                                            <span className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString('es-CL')}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {quoteItems.length > 0 && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-lg mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-2">3</div>
                                        Datos de Contacto
                                    </h3>

                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                                            <input type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                                            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"
                                                value={userData.notes} onChange={e => setUserData({ ...userData, notes: e.target.value })}></textarea>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <button type="submit" disabled={loading}
                                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-black disabled:bg-gray-400 transition-colors flex items-center justify-center shadow-lg">
                                                {loading ? 'Enviando...' : (<><Send className="w-5 h-5 mr-2" /> Solicitar Cotizacion</>)}
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

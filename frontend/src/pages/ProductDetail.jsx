import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCalculator from '../components/ProductCalculator';
import { Check, Shield, Truck, PenTool } from 'lucide-react';
import api from '../api';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/api/products/${id}`);
                const data = res.data;
                if (typeof data.images === 'string') try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
                if (typeof data.features === 'string') try { data.features = JSON.parse(data.features); } catch (e) { data.features = []; }
                if (Array.isArray(data.images)) {
                    data.images = data.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`);
                }
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('No se pudo cargar el producto.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando producto...</p>
                </div>
            </Layout>
        );
    }

    if (error || !product) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <p className="text-gray-500 mb-8">{error || 'El producto no existe o no esta disponible.'}</p>
                    <Link to="/catalog" className="text-primary-600 hover:underline font-bold">Volver al catalogo</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                                )}
                            </div>
                            <div className="flex space-x-4 overflow-x-auto pb-2">
                                {Array.isArray(product.images) && product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-600 ring-2 ring-primary-100' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Info & Calculator */}
                        <div>
                            <div className="mb-2">
                                <span className="text-primary-600 font-semibold tracking-wide uppercase text-sm">
                                    {product.category}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{product.name}</h1>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {product.description || product.short_description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {Array.isArray(product.features) && product.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center text-gray-700">
                                        <Check className="w-5 h-5 text-green-500 mr-2" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-4">Calcula tu precio a medida</h3>
                                <ProductCalculator product={product} />
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
                                <div className="text-center">
                                    <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Garantia 1 ano</span>
                                </div>
                                <div className="text-center">
                                    <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Despacho Todo Chile</span>
                                </div>
                                <div className="text-center">
                                    <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Instalacion Expertos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetail;

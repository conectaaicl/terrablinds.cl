import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCalculator from '../components/ProductCalculator';
import { Check, Shield, Truck, PenTool } from 'lucide-react';
import axios from 'axios';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            try {
                setLoading(true);
                // 1. Try real API
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                if (res.data) {
                    const data = res.data;
                    // Robust parsing for SQLite JSON fields
                    if (typeof data.images === 'string') {
                        try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
                    }
                    if (typeof data.features === 'string') {
                        try { data.features = JSON.parse(data.features); } catch (e) { data.features = []; }
                    }
                    setProduct(data);
                    setLoading(false); // Fix: Ensure loading is set to false here
                    return;
                }
            } catch (err) {
                console.warn("API Error, attempting mock fallback", err);
            }

            // 2. Fallback to Mock if API fails or returns null
            const found = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
            if (found) {
                setProduct(found);
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id]);

    const isLoading = !product && loading;
    const isNotFound = !product && !loading;

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <p className="text-gray-500">Cargando producto...</p>
                    <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            </Layout>
        );
    }

    if (isNotFound) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <p className="text-gray-500 mb-8">Lo sentimos, el producto que buscas no existe o no se encuentra disponible.</p>
                    <Link to="/catalog" className="text-primary-600 hover:underline font-bold">Volver al catálogo</Link>
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
                                    <img
                                        src={product.images[activeImage]?.startsWith('http') ? product.images[activeImage] : `http://localhost:5000${product.images[activeImage]}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
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
                                        <img src={img && img.startsWith('http') ? img : `http://localhost:5000${img}`} alt="" className="w-full h-full object-cover" />
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
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                {product.name}
                            </h1>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {product.description || product.description_full || product.short_description || product.description_short}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {Array.isArray(product.features) && product.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center text-gray-700">
                                        <Check className="w-5 h-5 text-green-500 mr-2" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Calculator Component */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-4">Calcula tu precio a medida</h3>
                                <ProductCalculator product={product} />
                            </div>

                            {/* Trust Signals */}
                            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
                                <div className="text-center">
                                    <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Garantía 1 año</span>
                                </div>
                                <div className="text-center">
                                    <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Despacho Todo Chile</span>
                                </div>
                                <div className="text-center">
                                    <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Instalación Expertos</span>
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

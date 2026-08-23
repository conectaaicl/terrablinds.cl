import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

import api from '../api';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cfg, setCfg] = useState({});
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'all',
    });

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get('/api/products');
                const data = res.data.map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                    if (Array.isArray(p.images)) {
                        const baseUrl = import.meta.env.VITE_API_URL;
                        p.images = p.images.map(img =>
                            img.startsWith('http') ? img : `${baseUrl}${img}`
                        );
                    }
                    return p;
                });
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('No se pudieron cargar los productos. Intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'category') {
            value === 'all' ? setSearchParams({}) : setSearchParams({ category: value });
        }
    };

    const categories = [...new Set(products.map(p => p.category))].sort();

    const filteredProducts = products.filter(product => {
        if (filters.category !== 'all' && product.category !== filters.category) return false;
        return true;
    });

    return (
        <Layout>
            <SEO
                title="Catálogo de Productos"
                description="Explora nuestra colección de cortinas roller, blackout, sunscreen, persianas y más. Precios por m² con despacho a todo Chile."
                path="/catalog"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://terrablinds.cl/" },
                        { "@type": "ListItem", "position": 2, "name": "Catálogo", "item": "https://terrablinds.cl/catalog" }
                    ]
                }}
            />
            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">{cfg.catalog_title || 'Catálogo de Productos'}</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    {cfg.catalog_subtitle || 'Explora nuestra colección de cortinas y persianas diseñadas a medida para tus espacios.'}
                </p>
            </div>

            <div className="container mx-auto px-4 py-10">
                {/* Category pills */}
                {!loading && categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => handleFilterChange('category', 'all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                filters.category === 'all'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            Todas ({products.length})
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange('category', cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                    filters.category === cat
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {cat} ({products.filter(p => p.category === cat).length})
                            </button>
                        ))}
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-red-200">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <p className="text-gray-400 text-sm mb-5">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No se encontraron productos con estos filtros.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Catalog;

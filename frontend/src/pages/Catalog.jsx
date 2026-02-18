import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';
import api from '../api';

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: 'all',
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get('/api/products');
                const data = res.data.map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                    if (Array.isArray(p.images)) {
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
    };

    const categories = [...new Set(products.map(p => p.category))].sort();

    const filteredProducts = products.filter(product => {
        if (filters.category !== 'all' && product.category !== filters.category) return false;
        return true;
    });

    return (
        <Layout>
            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Catalogo de Productos</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Explora nuestra coleccion de cortinas y persianas disenadas a medida para tus espacios.
                </p>
            </div>

            <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <Filter className="w-5 h-5 mr-2" /> Filtros
                            </h3>
                            <button
                                className="text-sm text-primary-600 hover:text-primary-700"
                                onClick={() => setFilters({ category: 'all' })}
                            >
                                Limpiar
                            </button>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Categoria</h4>
                            <div className="space-y-2">
                                <label className="flex items-center cursor-pointer group mb-2">
                                    <input type="radio" name="category" className="form-radio text-primary-600"
                                        checked={filters.category === 'all'} onChange={() => handleFilterChange('category', 'all')} />
                                    <span className="ml-2 font-semibold text-gray-900 group-hover:text-primary-600">Ver Todas ({products.length})</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center cursor-pointer group">
                                        <input type="radio" name="category" className="form-radio text-primary-600"
                                            checked={filters.category === cat} onChange={() => handleFilterChange('category', cat)} />
                                        <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">
                                            {cat} ({products.filter(p => p.category === cat).length})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500">Mostrando {filteredProducts.length} productos</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-red-200">
                            <p className="text-red-500 text-lg">{error}</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">No se encontraron productos con estos filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Catalog;

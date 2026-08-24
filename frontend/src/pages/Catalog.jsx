import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import api from '../api';

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cfg, setCfg] = useState({});
    const [search, setSearch] = useState('');
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
                        p.images = p.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`);
                    }
                    return p;
                });
                setProducts(data);
            } catch (err) {
                setError('No se pudieron cargar los productos.');
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
        if (search && !product.name.toLowerCase().includes(search.toLowerCase()) &&
            !(product.short_description || '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <Layout>
            <SEO
                title="Catálogo de Productos"
                description="Cortinas roller, blackout, sunscreen, persianas y más. Precios por m² con instalación experta a todo Chile."
                path="/catalog"
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-16 px-4 text-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="inline-block bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                        Fabricación a medida · Santiago y todo Chile
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {cfg.catalog_title || 'Catálogo de Productos'}
                    </h1>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        {cfg.catalog_subtitle || 'Cortinas y persianas de alta calidad, fabricadas a medida para tus espacios.'}
                    </p>
                    {/* Search bar */}
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">

                    {/* Category pills + count */}
                    {!loading && categories.length > 0 && (
                        <div className="flex items-center gap-3 mb-8 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span className="font-semibold uppercase tracking-wider">Filtrar:</span>
                            </div>
                            <button
                                onClick={() => handleFilterChange('category', 'all')}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                                    filters.category === 'all'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                Todos ({products.length})
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleFilterChange('category', cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                                        filters.category === cat
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                                >
                                    {cat} ({products.filter(p => p.category === cat).length})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="aspect-[4/3] bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                                        <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
                            <Package className="w-10 h-10 text-red-300 mx-auto mb-3" />
                            <p className="text-red-500 font-semibold">{error}</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <p className="text-gray-400 text-sm mb-5">
                                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                                {search && <span> para "<strong className="text-gray-600">{search}</strong>"</span>}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-semibold mb-1">Sin resultados</p>
                            <p className="text-gray-400 text-sm">Prueba con otro filtro o término de búsqueda.</p>
                        </div>
                    )}

                    {/* Bottom CTA */}
                    {!loading && filteredProducts.length > 0 && (
                        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
                            <h3 className="text-xl font-bold mb-2">¿No encuentras lo que buscas?</h3>
                            <p className="text-blue-200 text-sm mb-5">Cotiza cualquier producto personalizado o consulta con nuestro equipo.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/quote" className="px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
                                    Cotización personalizada
                                </Link>
                                <Link to="/contact" className="px-6 py-2.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm">
                                    Hablar con un asesor
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Catalog;

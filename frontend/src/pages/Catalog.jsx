import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const Catalog = () => {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [loading, setLoading] = useState(false); // Set to true when implementing real API
    const [filters, setFilters] = useState({
        category: 'all',
        priceRange: 'all'
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:5000/api/products');
                if (res.data && res.data.length > 0) {
                    const data = res.data.map(p => {
                        // Robust parsing for SQLite JSON fields
                        if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                        if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }

                        // Map relative paths to absolute backend URLs if necessary
                        if (Array.isArray(p.images)) {
                            p.images = p.images.map(img =>
                                img.startsWith('http') ? img : `http://localhost:5000${img}`
                            );
                        }
                        return p;
                    });
                    setProducts(data);
                }
            } catch (err) {
                console.warn("API Error, utilizing Mock Data for Demo", err);
                setProducts(MOCK_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredProducts = products.filter(product => {
        if (filters.category !== 'all' && product.category.toLowerCase() !== filters.category.toLowerCase()) return false;
        return true;
    });

    return (
        <Layout>
            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Catálogo de Productos</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Explora nuestra colección de cortinas y persianas diseñadas a medida para tus espacios.
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
                                onClick={() => setFilters({ category: 'all', priceRange: 'all' })}
                            >
                                Limpiar
                            </button>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Categoría</h4>
                            <div className="space-y-2">
                                <label className="flex items-center cursor-pointer group mb-4">
                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                        checked={filters.category === 'all'} onChange={() => handleFilterChange('category', 'all')} />
                                    <span className="ml-2 font-semibold text-gray-900 group-hover:text-primary-600">Ver Todas</span>
                                </label>
                                <div className="space-y-4">
                                    {/* Roller Group */}
                                    <div>
                                        <h5 className="font-semibold text-gray-700 text-sm mb-2">Cortinas Roller</h5>
                                        <div className="space-y-1 pl-2">
                                            {['Roller Blackout', 'Roller Sunscreen', 'Roller Doble'].map(id => (
                                                <label key={id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                                        checked={filters.category === id} onChange={() => handleFilterChange('category', id)} />
                                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">{id.replace('Roller ', '')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duo Group */}
                                    <div>
                                        <h5 className="font-semibold text-gray-700 text-sm mb-2">Roller Duo (Zebra)</h5>
                                        <div className="space-y-1 pl-2">
                                            {['Roller Duo Blackout', 'Roller Duo Traslúcido'].map(id => (
                                                <label key={id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                                        checked={filters.category === id} onChange={() => handleFilterChange('category', id)} />
                                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">{id.replace('Roller Duo ', '')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cortinas Group */}
                                    <div>
                                        <h5 className="font-semibold text-gray-700 text-sm mb-2">Cortinas</h5>
                                        <div className="space-y-1 pl-2">
                                            {['Cortinas Verticales', 'Cortinas Tradicionales'].map(id => (
                                                <label key={id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                                        checked={filters.category === id} onChange={() => handleFilterChange('category', id)} />
                                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">{id.replace('Cortinas ', '')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Domotica Group */}
                                    <div>
                                        <h5 className="font-semibold text-gray-700 text-sm mb-2">Domótica</h5>
                                        <div className="space-y-1 pl-2">
                                            {['Domotica Motor Roller', 'Domotica Motor Persiana', 'Domotica Control Remoto', 'Domotica Hub'].map(id => (
                                                <label key={id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                                        checked={filters.category === id} onChange={() => handleFilterChange('category', id)} />
                                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">{id.replace('Domotica ', '')}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Others */}
                                    <div>
                                        <h5 className="font-semibold text-gray-700 text-sm mb-2">Exterior y Toldos</h5>
                                        <div className="space-y-1 pl-2">
                                            {['Persianas Exterior', 'Toldos'].map(id => (
                                                <label key={id} className="flex items-center cursor-pointer group">
                                                    <input type="radio" name="category" className="form-radio text-primary-600 focus:ring-primary-500"
                                                        checked={filters.category === id} onChange={() => handleFilterChange('category', id)} />
                                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600">{id}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* More filters can be added here */}
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500">Mostrando {filteredProducts.length} productos</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Ordenar por:</span>
                            <select className="border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                                <option>Relevancia</option>
                                <option>Precio: Menor a Mayor</option>
                                <option>Precio: Mayor a Menor</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

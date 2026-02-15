import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, CheckCircle, Save } from 'lucide-react';
import axios from 'axios';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Roller Blackout',
        description: '',
        short_description: '',
        base_price_m2: 0,
        price_unit: 0,
        is_unit_price: false,
        is_active: true,
        stock: 0,
        slug: '',
        features: [],
        images: []
    });
    const [newFeature, setNewFeature] = useState('');
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const categories = [
        'Roller Blackout',
        'Roller Sunscreen',
        'Roller Duo Blackout',
        'Domotica Motor Roller',
        'Persianas Exterior',
        'Accesorios'
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            const data = res.data.map(p => {
                if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                return p;
            });
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                ...product,
                features: product.features || [],
                images: product.images || []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'Roller Blackout',
                description: '',
                short_description: '',
                base_price_m2: 0,
                price_unit: 0,
                is_unit_price: false,
                is_active: true,
                stock: 0,
                slug: '',
                features: [],
                images: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (name === 'name' && !editingProduct) {
            const slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData({ ...formData, [name]: value, slug });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFormData({
                ...formData,
                features: [...formData.features, newFeature.trim()]
            });
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('terrablinds_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formData, config);
                setSuccessMessage('¡Producto actualizado con éxito!');
            } else {
                await axios.post('http://localhost:5000/api/products', formData, config);
                setSuccessMessage('¡Producto creado con éxito!');
            }
            fetchProducts();
            setTimeout(() => {
                handleCloseModal();
                setSuccessMessage('');
            }, 1000);
        } catch (err) {
            console.error('Error saving product', err);
            alert('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            const token = localStorage.getItem('terrablinds_token');
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProducts();
            } catch (err) {
                console.error('Error deleting product', err);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
                    <p className="text-gray-500">Administra el catálogo completo de tu tienda</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-700 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Producto
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o categoría..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nombre</th>
                                <th className="px-6 py-3 font-medium">Categoría</th>
                                <th className="px-6 py-3 font-medium">Precio</th>
                                <th className="px-6 py-3 font-medium">Stock</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Cargando productos...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay productos registrados.</td>
                                </tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {product.is_unit_price
                                            ? `$${parseFloat(product.price_unit).toLocaleString('es-CL')} (un)`
                                            : `$${parseFloat(product.base_price_m2).toLocaleString('es-CL')} (m2)`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="text-primary-600 hover:text-primary-700 p-1 mr-2"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-600 p-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">Información Principal</h3>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Producto</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="Ej: Roller Blackout Premium"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                                            <select
                                                name="category"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            >
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-6 bg-primary-50 p-4 rounded-xl border border-primary-100">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="is_unit_price"
                                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                    checked={formData.is_unit_price}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="ml-2 text-sm font-bold text-primary-700 uppercase tracking-tight">Precio por Unidad</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                    checked={formData.is_active}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="ml-2 text-sm font-bold text-primary-700 uppercase tracking-tight">Activo</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{formData.is_unit_price ? 'Precio Unitario ($)' : 'Precio m² ($)'}</label>
                                                <input
                                                    type="number"
                                                    name={formData.is_unit_price ? 'price_unit' : 'base_price_m2'}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-900"
                                                    value={formData.is_unit_price ? formData.price_unit : formData.base_price_m2}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Disponible</label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                    value={formData.stock}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resumen Corto</label>
                                        <input
                                            type="text"
                                            name="short_description"
                                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formData.short_description}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Completa</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Características</label>
                                        <div className="flex space-x-2 mb-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 border rounded-lg outline-none"
                                                placeholder="Ej: Bloqueo 100% luz"
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddFeature}
                                                className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.features.map((feature, idx) => (
                                                <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                    {feature}
                                                    <button onClick={() => handleRemoveFeature(idx)} className="ml-2">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            {successMessage && (
                                <p className="text-green-600 font-medium flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" /> {successMessage}
                                </p>
                            )}
                            <div className="ml-auto flex space-x-3">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-2 border rounded-lg hover:bg-white transition-colors">Cancelar</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg flex items-center"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <Save className="w-5 h-5 mr-2" />}
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProducts;

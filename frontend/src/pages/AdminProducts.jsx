import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, CheckCircle, Save, Upload, Loader } from 'lucide-react';
import api from '../api';

const CATEGORIES = [
    'Roller Blackout',
    'Roller Sunscreen',
    'Roller Duo Blackout',
    'Domotica Motor Roller',
    'Persianas Exterior',
    'Persianas Interior',
    'Toldos',
    'Accesorios'
];

const emptyForm = {
    name: '', category: 'Roller Blackout', description: '', short_description: '',
    base_price_m2: 0, price_unit: 0, is_unit_price: false, is_active: true,
    stock: 0, slug: '', features: [], images: [], colors: [],
    sku: '', min_width: '', max_width: '', min_height: '', max_height: '', lead_time_days: ''
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [newFeature, setNewFeature] = useState('');
    const [newColor, setNewColor] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/products');
            const data = res.data.map(p => {
                if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                if (typeof p.colors === 'string') try { p.colors = JSON.parse(p.colors); } catch (e) { p.colors = []; }
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
                ...emptyForm,
                ...product,
                features: product.features || [],
                images: product.images || [],
                colors: product.colors || []
            });
        } else {
            setEditingProduct(null);
            setFormData(emptyForm);
        }
        setSuccessMessage('');
        setErrorMessage('');
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
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index) => {
        const f = [...formData.features];
        f.splice(index, 1);
        setFormData({ ...formData, features: f });
    };

    const handleAddColor = () => {
        if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
            setFormData({ ...formData, colors: [...formData.colors, newColor.trim()] });
            setNewColor('');
        }
    };

    const handleRemoveColor = (index) => {
        const c = [...formData.colors];
        c.splice(index, 1);
        setFormData({ ...formData, colors: c });
    };

    const handleRemoveImage = (index) => {
        const imgs = [...formData.images];
        imgs.splice(index, 1);
        setFormData({ ...formData, images: imgs });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploadingImage(true);
        try {
            const formPayload = new FormData();
            files.forEach(f => formPayload.append('images', f));
            const res = await api.post('/api/upload/multiple', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newPaths = res.data.filePaths || [];
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newPaths] }));
        } catch (err) {
            setErrorMessage('Error al subir imagen. Intente con otro archivo.');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        try {
            if (editingProduct) {
                await api.put(`/api/products/${editingProduct.id}`, formData);
                setSuccessMessage('Producto actualizado con éxito.');
            } else {
                await api.post('/api/products', formData);
                setSuccessMessage('Producto creado con éxito.');
            }
            fetchProducts();
            setTimeout(() => { handleCloseModal(); setSuccessMessage(''); }, 1000);
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Error al guardar el producto.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await api.delete(`/api/products/${id}`);
                fetchProducts();
            } catch (err) {
                alert(err.response?.data?.error || 'Error al eliminar el producto.');
            }
        }
    };

    const getImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `${baseUrl}${img}`;
    };

    const handleToggleActive = async (product) => {
        try {
            await api.put(`/api/products/${product.id}`, { ...product, is_active: !product.is_active });
            setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
        } catch (err) {
            alert('Error al cambiar estado del producto.');
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
                <button onClick={() => handleOpenModal()}
                    style={{ backgroundColor: '#2563eb' }}
                    className="text-white px-5 py-2.5 rounded-xl flex items-center hover:opacity-90 transition-opacity shadow-md font-medium">
                    <Plus className="w-5 h-5 mr-2" /> Nuevo Producto
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Buscar por nombre o categoría..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Cargando productos...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay productos registrados.</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded bg-gray-100 mr-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.images && product.images[0] ? (
                                                    <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                                                ) : <ImageIcon className="w-5 h-5 text-gray-400" />}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">{product.name}</span>
                                                {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {product.is_unit_price
                                            ? `$${parseFloat(product.price_unit).toLocaleString('es-CL')} (un)`
                                            : `$${parseFloat(product.base_price_m2).toLocaleString('es-CL')} (m²)`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(product)}
                                            title="Click para cambiar estado"
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 cursor-pointer ${product.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-700 p-1 mr-2"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600 p-1"><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* LEFT */}
                                <div className="space-y-5">
                                    {/* Basic info */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">Información Principal</h3>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto *</label>
                                            <input type="text" name="name" required placeholder="Ej: Roller Blackout Premium"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                value={formData.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                                                <select name="category"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                    value={formData.category} onChange={handleInputChange}>
                                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">SKU / Código</label>
                                                <input type="text" name="sku" placeholder="Ej: RB-001"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                    value={formData.sku} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6 bg-primary-50 p-3 rounded-xl border border-primary-100">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="checkbox" name="is_unit_price" className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                                    checked={formData.is_unit_price} onChange={handleInputChange} />
                                                <span className="ml-2 text-sm font-bold text-primary-700">Precio por Unidad</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input type="checkbox" name="is_active" className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                                    checked={formData.is_active} onChange={handleInputChange} />
                                                <span className="ml-2 text-sm font-bold text-primary-700">Activo</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {formData.is_unit_price ? 'Precio Unitario ($)' : 'Precio m² ($)'}
                                                </label>
                                                <input type="number" name={formData.is_unit_price ? 'price_unit' : 'base_price_m2'} required
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                                                    value={formData.is_unit_price ? formData.price_unit : formData.base_price_m2}
                                                    onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                                                <input type="number" name="stock"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                    value={formData.stock} onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Días fabricación (lead time)</label>
                                            <input type="number" name="lead_time_days" placeholder="Ej: 7"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                value={formData.lead_time_days} onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    {!formData.is_unit_price && (
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
                                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">Dimensiones Fabricables (cm)</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Ancho mínimo</label>
                                                    <input type="number" name="min_width" placeholder="Ej: 30"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        value={formData.min_width} onChange={handleInputChange} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Ancho máximo</label>
                                                    <input type="number" name="max_width" placeholder="Ej: 500"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        value={formData.max_width} onChange={handleInputChange} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Alto mínimo</label>
                                                    <input type="number" name="min_height" placeholder="Ej: 30"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        value={formData.min_height} onChange={handleInputChange} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Alto máximo</label>
                                                    <input type="number" name="max_height" placeholder="Ej: 400"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                                        value={formData.max_height} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT */}
                                <div className="space-y-5">
                                    {/* Description */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Resumen Corto</label>
                                            <input type="text" name="short_description"
                                                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                                                value={formData.short_description} onChange={handleInputChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción Completa</label>
                                            <textarea name="description" rows="4"
                                                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                value={formData.description} onChange={handleInputChange}></textarea>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">Colores / Telas Disponibles</h3>
                                        <div className="flex space-x-2 mb-3">
                                            <input type="text" className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm" placeholder="Ej: Blanco Perla"
                                                value={newColor} onChange={(e) => setNewColor(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }} />
                                            <button type="button" onClick={handleAddColor} className="bg-gray-100 px-3 rounded-lg hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.colors.map((color, idx) => (
                                                <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                    {color}
                                                    <button type="button" onClick={() => handleRemoveColor(idx)} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            {formData.colors.length === 0 && <p className="text-xs text-gray-400">Sin colores definidos</p>}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">Características</h3>
                                        <div className="flex space-x-2 mb-3">
                                            <input type="text" className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm" placeholder="Ej: Bloqueo 100% luz"
                                                value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }} />
                                            <button type="button" onClick={handleAddFeature} className="bg-gray-100 px-3 rounded-lg hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.features.map((feature, idx) => (
                                                <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                    {feature}
                                                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="ml-2"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">Imágenes del Producto</h3>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => handleRemoveImage(idx)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {idx === 0 && (
                                                        <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">Principal</span>
                                                    )}
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 transition-colors">
                                                {uploadingImage
                                                    ? <Loader className="w-6 h-6 animate-spin" />
                                                    : <><Upload className="w-6 h-6 mb-1" /><span className="text-xs">Subir</span></>
                                                }
                                                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                                                    onChange={handleImageUpload} disabled={uploadingImage} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400">Formatos: JPG, PNG, WebP. Máx. 5MB por imagen.</p>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div>
                                {successMessage && <p className="text-green-600 font-medium flex items-center"><CheckCircle className="w-5 h-5 mr-2" />{successMessage}</p>}
                                {errorMessage && <p className="text-red-600 font-medium text-sm">{errorMessage}</p>}
                            </div>
                            <div className="ml-auto flex space-x-3">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-2 border rounded-lg hover:bg-white transition-colors">Cancelar</button>
                                <button onClick={handleSubmit} disabled={loading}
                                    style={{ backgroundColor: loading ? '#9ca3af' : '#2563eb' }}
                                    className="px-8 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center">
                                    {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
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

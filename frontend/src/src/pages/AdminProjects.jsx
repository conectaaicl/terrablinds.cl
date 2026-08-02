import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit2, Trash2, X, Save, Loader, ImageIcon, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const EMPTY = { title: '', category: '', location: '', description: '', image_url: '', sort_order: 0, is_active: true };

const Field = ({ label, children, hint }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const Input = (props) => (
    <input {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
);

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'create' | project object
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/projects/admin');
            setProjects(res.data);
        } catch { setProjects([]); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY); setModal('create'); setError(null); };
    const openEdit = (p) => { setForm({ ...p }); setModal(p); setError(null); };
    const closeModal = () => { setModal(null); setError(null); };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setForm(f => ({ ...f, image_url: res.data.filePath }));
        } catch {
            setError('Error al subir la imagen.');
        } finally {
            setUploadingImg(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (modal === 'create') {
                await api.post('/api/projects', form);
            } else {
                await api.put(`/api/projects/${modal.id}`, form);
            }
            await fetchProjects();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este proyecto?')) return;
        try {
            await api.delete(`/api/projects/${id}`);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch {
            alert('Error al eliminar.');
        }
    };

    const toggleActive = async (project) => {
        try {
            await api.put(`/api/projects/${project.id}`, { ...project, is_active: !project.is_active });
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_active: !p.is_active } : p));
        } catch { alert('Error al actualizar.'); }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
                    <p className="text-gray-500 text-sm">Galería de proyectos realizados visible en el sitio web.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm shadow-sm transition-colors">
                    <Plus className="w-4 h-4" /> Nuevo Proyecto
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!p.is_active ? 'opacity-50' : ''}`}>
                            <div className="relative h-40 bg-gray-100">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                {!p.is_active && (
                                    <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full">Oculto</span>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">{p.category}</p>
                                <h3 className="font-bold text-gray-900">{p.title}</h3>
                                <p className="text-sm text-gray-500">{p.location}</p>
                                {p.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>}
                                <div className="mt-4 flex items-center gap-2">
                                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </button>
                                    <button onClick={() => toggleActive(p)} className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors" title={p.is_active ? 'Ocultar' : 'Mostrar'}>
                                        {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 border border-red-100 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-gray-400">
                            No hay proyectos aún. Crea el primero.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {modal !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                            <Field label="Título *">
                                <Input name="title" value={form.title} onChange={handleChange} required placeholder="Ej: Departamento Providencia" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Categoría">
                                    <Input name="category" value={form.category} onChange={handleChange} placeholder="Roller Blackout" />
                                </Field>
                                <Field label="Ubicación">
                                    <Input name="location" value={form.location} onChange={handleChange} placeholder="Santiago" />
                                </Field>
                            </div>
                            <Field label="Descripción (opcional)">
                                <textarea
                                    name="description" value={form.description || ''} onChange={handleChange}
                                    rows={3} placeholder="Breve descripción del proyecto..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </Field>
                            <Field label="Imagen del Proyecto" hint="Sube una foto del proyecto (máx. 50MB)">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-500">
                                        {uploadingImg ? <Loader className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                        {uploadingImg ? 'Subiendo...' : 'Seleccionar imagen'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                                    </label>
                                    {form.image_url && (
                                        <div className="relative">
                                            <img src={form.image_url} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                                            <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Orden (menor = primero)">
                                    <Input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min={0} />
                                </Field>
                                <Field label="Visible en el sitio">
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded" />
                                        <span className="text-sm text-gray-700">Publicado</span>
                                    </label>
                                </Field>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProjects;

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit2, Trash2, X, Save, Loader, GripVertical, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const EMPTY = { question: '', answer: '', sort_order: 0, is_active: true };

const AdminFAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { fetchFAQs(); }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/faqs/admin');
            setFaqs(res.data);
        } catch { setFaqs([]); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm({ ...EMPTY, sort_order: faqs.length }); setModal('create'); setError(null); };
    const openEdit = (f) => { setForm({ ...f }); setModal(f); setError(null); };
    const closeModal = () => { setModal(null); setError(null); };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (modal === 'create') {
                await api.post('/api/faqs', form);
            } else {
                await api.put(`/api/faqs/${modal.id}`, form);
            }
            await fetchFAQs();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta pregunta?')) return;
        try {
            await api.delete(`/api/faqs/${id}`);
            setFaqs(prev => prev.filter(f => f.id !== id));
        } catch { alert('Error al eliminar.'); }
    };

    const toggleActive = async (faq) => {
        try {
            await api.put(`/api/faqs/${faq.id}`, { ...faq, is_active: !faq.is_active });
            setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_active: !f.is_active } : f));
        } catch { alert('Error al actualizar.'); }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h1>
                    <p className="text-gray-500 text-sm">Gestiona las preguntas que aparecen en la página /faq del sitio.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm shadow-sm transition-colors">
                    <Plus className="w-4 h-4" /> Nueva Pregunta
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : (
                <div className="space-y-3">
                    {faqs.length === 0 && (
                        <div className="text-center py-20 text-gray-400">No hay preguntas frecuentes. Crea la primera.</div>
                    )}
                    {faqs.map((faq, idx) => (
                        <div key={faq.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${!faq.is_active ? 'opacity-50' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1 text-gray-300">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-400 font-mono">#{idx + 1}</span>
                                        {!faq.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Oculta</span>}
                                    </div>
                                    <p className="font-semibold text-gray-900 mb-1">{faq.question}</p>
                                    <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => toggleActive(faq)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors" title={faq.is_active ? 'Ocultar' : 'Mostrar'}>
                                        {faq.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => openEdit(faq)} className="p-2 border border-gray-200 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(faq.id)} className="p-2 border border-red-100 text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Nueva Pregunta' : 'Editar Pregunta'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta *</label>
                                <input
                                    name="question" value={form.question} onChange={handleChange} required
                                    placeholder="¿Cuánto tiempo tarda la fabricación?"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta *</label>
                                <textarea
                                    name="answer" value={form.answer} onChange={handleChange} required rows={5}
                                    placeholder="Escribe la respuesta completa aquí..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                                    <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min={0}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded" />
                                        <span className="text-sm text-gray-700">Publicada</span>
                                    </label>
                                </div>
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

export default AdminFAQ;

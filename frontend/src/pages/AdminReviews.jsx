import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Plus, Star, Edit2, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';

const EMPTY = { author_name: '', author_role: 'Cliente', rating: 5, content: '', avatar_url: '', is_active: true };

function StarRating({ value, onChange }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange?.(n)}
                    className={`w-7 h-7 ${n <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}>
                    <Star className="w-full h-full fill-current" />
                </button>
            ))}
        </div>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try {
            const res = await api.get('/api/reviews');
            setReviews(Array.isArray(res.data) ? res.data : []);
        } catch { setReviews([]); }
        setLoading(false);
    }

    function openAdd() { setForm(EMPTY); setModal({ mode: 'add' }); }
    function openEdit(r) { setForm({ ...r, avatar_url: r.avatar_url || '' }); setModal({ mode: 'edit', id: r.id }); }

    async function save() {
        if (!form.author_name.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            if (modal.mode === 'add') {
                const res = await api.post('/api/reviews', form);
                setReviews(prev => [res.data, ...prev]);
            } else {
                const res = await api.put(`/api/reviews/${modal.id}`, form);
                setReviews(prev => prev.map(r => r.id === modal.id ? res.data : r));
            }
            setModal(null);
        } catch { alert('Error al guardar la reseña.'); }
        setSaving(false);
    }

    async function toggleActive(review) {
        try {
            const res = await api.put(`/api/reviews/${review.id}`, { is_active: !review.is_active });
            setReviews(prev => prev.map(r => r.id === review.id ? res.data : r));
        } catch { alert('Error al actualizar estado.'); }
    }

    async function remove(review) {
        if (!window.confirm(`¿Eliminar reseña de "${review.author_name}"?`)) return;
        try {
            await api.delete(`/api/reviews/${review.id}`);
            setReviews(prev => prev.filter(r => r.id !== review.id));
        } catch { alert('Error al eliminar la reseña.'); }
    }

    const active = reviews.filter(r => r.is_active).length;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{reviews.length} total · {active} activas</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Nueva Reseña
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Cargando...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Sin reseñas aún</p>
                        <p className="text-gray-400 text-sm mt-1">Agrega testimonios de clientes satisfechos.</p>
                        <button onClick={openAdd} className="mt-4 text-blue-600 text-sm font-medium hover:underline">+ Agregar primera reseña</button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reviews.map(r => (
                            <div key={r.id}
                                className={`bg-white rounded-xl border p-5 flex gap-4 transition-all ${r.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                    {r.avatar_url
                                        ? <img src={r.avatar_url} alt={r.author_name} className="w-10 h-10 rounded-full object-cover" />
                                        : r.author_name[0]?.toUpperCase()
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-semibold text-gray-900">{r.author_name}</span>
                                            <span className="text-gray-400 text-sm ml-2">{r.author_role}</span>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {[1,2,3,4,5].map(n => (
                                                <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1.5 line-clamp-2">{r.content}</p>
                                    <p className="text-gray-400 text-xs mt-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CL') : '—'}</p>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                    <button onClick={() => openEdit(r)} title="Editar"
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => toggleActive(r)} title={r.is_active ? 'Ocultar' : 'Mostrar'}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                        {r.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => remove(r)} title="Eliminar"
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modal.mode === 'add' ? 'Nueva Reseña' : 'Editar Reseña'}
                            </h2>
                            <button onClick={() => setModal(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
                                    <input value={form.author_name}
                                        onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="María González" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol / Descripción</label>
                                    <input value={form.author_role}
                                        onChange={e => setForm(f => ({ ...f, author_role: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Cliente residencial" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Calificación</label>
                                <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reseña *</label>
                                <textarea value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Excelente servicio. Las cortinas quedaron perfectas..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de Avatar (opcional)</label>
                                <input value={form.avatar_url}
                                    onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..." />
                            </div>
                            {modal.mode === 'edit' && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_active}
                                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                        className="w-4 h-4 rounded" />
                                    <span className="text-sm text-gray-700">Visible en el sitio</span>
                                </label>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button onClick={() => setModal(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={save} disabled={saving || !form.author_name.trim() || !form.content.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                                {saving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

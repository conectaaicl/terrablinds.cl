import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Plus, Gift, Trash2, ChevronDown, X, Check, User, Phone, Mail } from 'lucide-react';

const STATUS_LABELS = {
    pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
    contacted: { label: 'Contactado', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
    rejected:  { label: 'Rechazado',  color: 'bg-red-100 text-red-700' },
};

const EMPTY = {
    referrer_name: '', referrer_email: '', referrer_phone: '',
    referred_name: '', referred_email: '', referred_phone: '', notes: '',
};

export default function AdminReferidos() {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try {
            const res = await api.get('/api/referrals');
            setReferrals(Array.isArray(res.data) ? res.data : []);
        } catch { setReferrals([]); }
        setLoading(false);
    }

    async function save() {
        if (!form.referrer_name.trim()) return;
        setSaving(true);
        try {
            const res = await api.post('/api/referrals', form);
            setReferrals(prev => [res.data, ...prev]);
            setModal(false);
            setForm(EMPTY);
        } catch { alert('Error al guardar el referido.'); }
        setSaving(false);
    }

    async function updateStatus(id, status) {
        try {
            const res = await api.put(`/api/referrals/${id}`, { status });
            setReferrals(prev => prev.map(r => r.id === id ? res.data : r));
        } catch { alert('Error al actualizar el estado.'); }
    }

    async function updateReward(id, reward_amount) {
        try {
            const res = await api.put(`/api/referrals/${id}`, { reward_amount });
            setReferrals(prev => prev.map(r => r.id === id ? res.data : r));
        } catch { alert('Error al actualizar el bono.'); }
    }

    async function remove(ref) {
        if (!window.confirm(`¿Eliminar referido de "${ref.referrer_name}"?`)) return;
        try {
            await api.delete(`/api/referrals/${ref.id}`);
            setReferrals(prev => prev.filter(r => r.id !== ref.id));
        } catch { alert('Error al eliminar el referido.'); }
    }

    const byStatus = (s) => referrals.filter(r => r.status === s).length;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Referidos</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{referrals.length} total · {byStatus('completed')} completados</p>
                    </div>
                    <button onClick={() => { setForm(EMPTY); setModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Nuevo Referido
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                        <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{byStatus(key)}</div>
                            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Cargando...</div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Sin referidos aún</p>
                        <p className="text-gray-400 text-sm mt-1">Registra clientes que refieren nuevos contactos.</p>
                        <button onClick={() => setModal(true)} className="mt-4 text-blue-600 text-sm font-medium hover:underline">+ Agregar primer referido</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {referrals.map(ref => {
                            const st = STATUS_LABELS[ref.status] || STATUS_LABELS.pending;
                            const expanded = expandedId === ref.id;
                            return (
                                <div key={ref.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                            {ref.referrer_name[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900">{ref.referrer_name}</span>
                                                <span className="text-gray-400 text-xs">→ refirió a</span>
                                                <span className="font-medium text-gray-700">{ref.referred_name || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                {ref.referrer_phone && <span className="text-xs text-gray-500">{ref.referrer_phone}</span>}
                                                {ref.referrer_email && <span className="text-xs text-gray-500">{ref.referrer_email}</span>}
                                                <span className="text-xs text-gray-400">{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString('es-CL') : '—'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <select value={ref.status}
                                                onChange={e => updateStatus(ref.id, e.target.value)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${st.color} cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}>
                                                {Object.entries(STATUS_LABELS).map(([k, { label }]) => (
                                                    <option key={k} value={k}>{label}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => setExpandedId(expanded ? null : ref.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                            </button>
                                            <button onClick={() => remove(ref)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {expanded && (
                                        <div className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quien Refiere</p>
                                                <p className="flex items-center gap-1.5 text-gray-700"><User className="w-3.5 h-3.5 text-gray-400" />{ref.referrer_name}</p>
                                                {ref.referrer_email && <p className="flex items-center gap-1.5 text-gray-600 mt-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{ref.referrer_email}</p>}
                                                {ref.referrer_phone && <p className="flex items-center gap-1.5 text-gray-600 mt-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{ref.referrer_phone}</p>}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Referido</p>
                                                <p className="flex items-center gap-1.5 text-gray-700"><User className="w-3.5 h-3.5 text-gray-400" />{ref.referred_name || '—'}</p>
                                                {ref.referred_email && <p className="flex items-center gap-1.5 text-gray-600 mt-1"><Mail className="w-3.5 h-3.5 text-gray-400" />{ref.referred_email}</p>}
                                                {ref.referred_phone && <p className="flex items-center gap-1.5 text-gray-600 mt-1"><Phone className="w-3.5 h-3.5 text-gray-400" />{ref.referred_phone}</p>}
                                            </div>
                                            {ref.notes && (
                                                <div className="col-span-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                                                    <p className="text-gray-600">{ref.notes}</p>
                                                </div>
                                            )}
                                            <div className="col-span-2 flex items-center gap-3">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bono (CLP)</label>
                                                <input type="number" min="0" step="1000"
                                                    defaultValue={ref.reward_amount}
                                                    onBlur={e => updateReward(ref.id, e.target.value)}
                                                    className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal nuevo referido */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h2 className="text-lg font-bold text-gray-900">Nuevo Referido</h2>
                            <button onClick={() => setModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Quien Refiere</p>
                                <div className="space-y-3">
                                    {[
                                        { key: 'referrer_name', label: 'Nombre *', placeholder: 'Juan Pérez' },
                                        { key: 'referrer_email', label: 'Email', placeholder: 'juan@email.com' },
                                        { key: 'referrer_phone', label: 'Teléfono', placeholder: '+56 9 1234 5678' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                                            <input value={form[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={placeholder} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Persona Referida</p>
                                <div className="space-y-3">
                                    {[
                                        { key: 'referred_name', label: 'Nombre', placeholder: 'María García' },
                                        { key: 'referred_email', label: 'Email', placeholder: 'maria@email.com' },
                                        { key: 'referred_phone', label: 'Teléfono', placeholder: '+56 9 8765 4321' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                                            <input value={form[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={placeholder} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
                                <textarea value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Contexto del referido..." />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button onClick={() => setModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={save} disabled={saving || !form.referrer_name.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                {saving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

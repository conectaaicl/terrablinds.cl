import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Plus, Gift, Trash2, X, Check, Copy, ToggleLeft, ToggleRight, Tag } from 'lucide-react';

const EMPTY = { owner_name: '', owner_email: '', discount_pct: 10, max_uses: '', notes: '', code: '' };

function CodeBadge({ code, active }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }
    return (
        <button onClick={copy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-sm font-bold transition-colors ${
                active ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {code}
        </button>
    );
}

export default function AdminReferidos() {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

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
        if (!form.owner_name.trim()) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                max_uses: form.max_uses ? parseInt(form.max_uses) : null,
            };
            const res = await api.post('/api/referrals', payload);
            setReferrals(prev => [res.data, ...prev]);
            setModal(false);
            setForm(EMPTY);
        } catch (e) {
            alert(e?.response?.data?.error || 'Error al crear el código.');
        }
        setSaving(false);
    }

    async function toggleActive(ref) {
        try {
            const res = await api.put(`/api/referrals/${ref.id}`, { active: !ref.active });
            setReferrals(prev => prev.map(r => r.id === ref.id ? res.data : r));
        } catch { alert('Error al actualizar estado.'); }
    }

    async function remove(ref) {
        if (!window.confirm(`¿Eliminar código "${ref.code}" de ${ref.owner_name}?`)) return;
        try {
            await api.delete(`/api/referrals/${ref.id}`);
            setReferrals(prev => prev.filter(r => r.id !== ref.id));
        } catch { alert('Error al eliminar el código.'); }
    }

    const activeCount = referrals.filter(r => r.active).length;
    const totalUses = referrals.reduce((s, r) => s + (r.uses_count || 0), 0);

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Referidos</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Códigos de descuento para clientes que refieren</p>
                    </div>
                    <button onClick={() => { setForm(EMPTY); setModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Nuevo Código
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total Códigos', value: referrals.length },
                        { label: 'Activos', value: activeCount },
                        { label: 'Usos Totales', value: totalUses },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{value}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Cargando...</div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Sin códigos de referido aún</p>
                        <p className="text-gray-400 text-sm mt-1">Crea códigos de descuento para clientes que refieran nuevos contactos.</p>
                        <button onClick={() => setModal(true)} className="mt-4 text-blue-600 text-sm font-medium hover:underline">+ Crear primer código</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Propietario</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descuento</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usos</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {referrals.map(ref => (
                                    <tr key={ref.id} className={`hover:bg-gray-50 transition-colors ${!ref.active ? 'opacity-50' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <CodeBadge code={ref.code} active={ref.active} />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-medium text-gray-900">{ref.owner_name}</div>
                                            {ref.owner_email && <div className="text-xs text-gray-500">{ref.owner_email}</div>}
                                            {ref.notes && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{ref.notes}</div>}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-bold text-sm px-2.5 py-0.5 rounded-full">
                                                <Tag className="w-3 h-3" />{ref.discount_pct}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-gray-600">
                                            {ref.uses_count}
                                            {ref.max_uses ? <span className="text-gray-400">/{ref.max_uses}</span> : null}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button onClick={() => toggleActive(ref)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                                    ref.active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}>
                                                {ref.active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button onClick={() => remove(ref)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Nuevo Código de Referido</h2>
                            <button onClick={() => setModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre del propietario *</label>
                                <input value={form.owner_name}
                                    onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Juan Pérez" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email del propietario</label>
                                <input value={form.owner_email}
                                    onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="juan@email.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descuento (%)</label>
                                    <input type="number" min="1" max="50" value={form.discount_pct}
                                        onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Usos máx. (vacío = ilimitado)</label>
                                    <input type="number" min="1" value={form.max_uses}
                                        onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="∞" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Código personalizado (opcional)</label>
                                <input value={form.code}
                                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Se genera automáticamente" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notas</label>
                                <textarea value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Contexto del código..." />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0">
                            <button onClick={() => setModal(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={save} disabled={saving || !form.owner_name.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                {saving ? 'Creando...' : <><Check className="w-4 h-4" /> Crear Código</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Gift, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import api from '../api';

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function AdminReferidos() {
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code:'', owner_name:'', owner_email:'', discount_pct:10, max_uses:'', notes:'' });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/referrals/admin').then(r => setRefs(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/referrals/admin', { ...form, discount_pct: parseInt(form.discount_pct), max_uses: form.max_uses ? parseInt(form.max_uses) : null });
      setForm({ code:'', owner_name:'', owner_email:'', discount_pct:10, max_uses:'', notes:'' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear');
    } finally { setCreating(false); }
  }

  async function toggleActive(ref) {
    await api.patch(`/api/referrals/admin/${ref.id}`, { active: !ref.active });
    load();
  }

  async function deleteRef(id) {
    if (!confirm('¿Eliminar este código?')) return;
    await api.delete(`/api/referrals/admin/${id}`);
    load();
  }

  function copyLink(code) {
    navigator.clipboard.writeText(`https://terrablinds.cl/referidos?code=${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Programa de Referidos</h1>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" />Crear nuevo código</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Código *</label>
              <input required className={INPUT} value={form.code} onChange={e => setForm(p=>({...p, code: e.target.value.toUpperCase()}))} placeholder="AMIGO15" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del dueño *</label>
              <input required className={INPUT} value={form.owner_name} onChange={e => setForm(p=>({...p, owner_name: e.target.value}))} placeholder="María González" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" className={INPUT} value={form.owner_email} onChange={e => setForm(p=>({...p, owner_email: e.target.value}))} placeholder="maria@gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descuento (%)</label>
              <input type="number" min="1" max="50" className={INPUT} value={form.discount_pct} onChange={e => setForm(p=>({...p, discount_pct: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Usos máx. (vacío = ilimitado)</label>
              <input type="number" min="1" className={INPUT} value={form.max_uses} onChange={e => setForm(p=>({...p, max_uses: e.target.value}))} placeholder="100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
              <input className={INPUT} value={form.notes} onChange={e => setForm(p=>({...p, notes: e.target.value}))} placeholder="Campaña verano..." />
            </div>
          </div>
          <button type="submit" disabled={creating} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
            {creating ? 'Creando...' : 'Crear código'}
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Código', 'Dueño', 'Descuento', 'Usos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : refs.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No hay códigos aún</td></tr>
              ) : refs.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${!r.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{r.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.owner_name}</div>
                    {r.owner_email && <div className="text-gray-400 text-xs">{r.owner_email}</div>}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700">{r.discount_pct}%</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.uses_count}{r.max_uses ? ` / ${r.max_uses}` : ' / ∞'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyLink(r.code)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Copiar link">
                        {copied === r.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => toggleActive(r)} className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors" title={r.active ? 'Desactivar' : 'Activar'}>
                        {r.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteRef(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

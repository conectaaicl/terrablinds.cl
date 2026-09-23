import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
  Crosshair, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Loader2, CheckCircle2
} from 'lucide-react';

const OPP_TYPE_LABELS = {
  low_ctr: 'CTR bajo',
  position_gap: 'Gap posición',
  no_page: 'Sin landing',
  high_impressions_low_clicks: 'Impresiones sin clics',
  local_opportunity: 'Local',
  product_opportunity: 'Producto',
};
const OPP_TYPE_COLORS = {
  low_ctr: 'bg-amber-100 text-amber-700',
  position_gap: 'bg-blue-100 text-blue-700',
  no_page: 'bg-red-100 text-red-700',
  high_impressions_low_clicks: 'bg-orange-100 text-orange-700',
  local_opportunity: 'bg-green-100 text-green-700',
  product_opportunity: 'bg-violet-100 text-violet-700',
};
const SCORE_COLOR = (s) =>
  s >= 70 ? 'bg-red-100 text-red-700 font-semibold'
  : s >= 50 ? 'bg-orange-100 text-orange-700'
  : s >= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';

const STATUS_OPTIONS = [
  { value: '', label: 'Activas' },
  { value: 'new', label: 'Nuevas' },
  { value: 'reviewed', label: 'Revisadas' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'implemented', label: 'Implementadas' },
  { value: 'dismissed', label: 'Descartadas' },
];
const STATUS_LABELS = { new: 'Nueva', reviewed: 'Revisada', in_progress: 'En progreso', implemented: 'Implementada', dismissed: 'Descartada' };
const STATUS_COLORS = { new: 'bg-blue-100 text-blue-700', reviewed: 'bg-amber-100 text-amber-700', in_progress: 'bg-violet-100 text-violet-700', implemented: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-500' };

const NEXT_STATUS = { new: 'reviewed', reviewed: 'in_progress', in_progress: 'implemented' };
const NEXT_LABEL = { new: 'Marcar revisada', reviewed: 'En progreso', in_progress: 'Implementada' };

const PAGE_SIZE = 50;

export default function AdminRadarOpportunities() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({ status: '', opp_type: '', q: '' });
  const [pendingQ, setPendingQ] = useState('');
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async (off = 0, f = filters) => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, offset: off };
      if (f.status) params.status = f.status;
      if (f.opp_type) params.opp_type = f.opp_type;
      if (f.q) params.q = f.q;
      const res = await api.get('/radar/api/dashboard/opportunities', { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(offset, filters); }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setOffset(0);
    load(0, newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters({ ...filters, q: pendingQ });
  };

  const handleStatusChange = (key, val) => {
    applyFilters({ ...filters, [key]: val });
  };

  const advanceStatus = async (opp) => {
    const next = NEXT_STATUS[opp.status];
    if (!next) return;
    setUpdating(opp.id);
    try {
      await api.patch(`/radar/api/dashboard/opportunities/${opp.id}`, { status: next });
      setItems(prev => prev.map(o => o.id === opp.id ? { ...o, status: next } : o));
      setMsg('Estado actualizado');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.detail || e.message));
    } finally {
      setUpdating(null);
    }
  };

  const dismiss = async (opp) => {
    setUpdating(opp.id);
    try {
      await api.patch(`/radar/api/dashboard/opportunities/${opp.id}`, { status: 'dismissed' });
      setItems(prev => prev.filter(o => o.id !== opp.id));
      setTotal(t => t - 1);
    } catch (e) {
      setMsg('Error al descartar');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Crosshair className="text-blue-600" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Oportunidades SEO</h1>
            <p className="text-xs text-gray-500">{total} resultado{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
            <input
              value={pendingQ}
              onChange={e => setPendingQ(e.target.value)}
              placeholder="Buscar keyword..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              <Search size={16} />
            </button>
          </form>

          <select
            value={filters.status}
            onChange={e => handleStatusChange('status', e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={filters.opp_type}
            onChange={e => handleStatusChange('opp_type', e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(OPP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <button onClick={() => { load(offset, filters); }} className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
            <RefreshCw size={16} />
          </button>

          {msg && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} />{msg}</span>}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              <p className="text-sm">Cargando...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left p-4 font-medium">Query</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-right p-4 font-medium">Score</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">Recomendación</th>
                    <th className="text-right p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((opp) => (
                    <tr key={opp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 max-w-xs">
                        <span className="font-mono text-xs text-gray-700 block truncate">{opp.query}</span>
                        {opp.data_snapshot?.avg_position_28d && (
                          <span className="text-xs text-gray-400">pos {Number(opp.data_snapshot.avg_position_28d).toFixed(1)} · {opp.data_snapshot.impressions_28d} impr</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${OPP_TYPE_COLORS[opp.opp_type] || 'bg-gray-100 text-gray-600'}`}>
                          {OPP_TYPE_LABELS[opp.opp_type] || opp.opp_type}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${SCORE_COLOR(opp.priority_score)}`}>
                          {opp.priority_score}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABELS[opp.status] || opp.status}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-xs text-gray-500 line-clamp-2">{opp.recommendation_text}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end flex-wrap">
                          {NEXT_STATUS[opp.status] && (
                            <button
                              onClick={() => advanceStatus(opp)}
                              disabled={updating === opp.id}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                            >
                              {updating === opp.id ? <Loader2 size={10} className="animate-spin" /> : NEXT_LABEL[opp.status]}
                            </button>
                          )}
                          {opp.status !== 'dismissed' && opp.status !== 'implemented' && (
                            <button
                              onClick={() => dismiss(opp)}
                              disabled={updating === opp.id}
                              className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!items.length && (
                <div className="text-center py-10 text-gray-400 text-sm">No hay oportunidades con estos filtros.</div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-50">
              <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { const o = Math.max(0, offset - PAGE_SIZE); setOffset(o); load(o, filters); }}
                  disabled={offset === 0}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => { const o = offset + PAGE_SIZE; setOffset(o); load(o, filters); }}
                  disabled={offset + PAGE_SIZE >= total}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

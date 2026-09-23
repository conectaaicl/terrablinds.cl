import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
  Crosshair, RefreshCw, Search, TrendingDown, Eye, MousePointerClick,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Loader2
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
  s >= 70 ? 'bg-red-100 text-red-700' : s >= 50 ? 'bg-orange-100 text-orange-700'
  : s >= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';

const STATUS_LABELS = { new: 'Nueva', reviewed: 'Revisada', in_progress: 'En progreso', implemented: 'Implementada', dismissed: 'Descartada' };
const STATUS_COLORS = { new: 'bg-blue-100 text-blue-700', reviewed: 'bg-amber-100 text-amber-700', in_progress: 'bg-violet-100 text-violet-700', implemented: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-500' };

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 items-start">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminRadarDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/radar/api/dashboard/summary');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      await api.post('/radar/api/jobs/full');
      setSyncMsg('Sincronización iniciada en segundo plano. Refresca en ~2 min.');
    } catch (e) {
      setSyncMsg('Error al iniciar sincronización: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSyncing(false);
    }
  };

  const s = data?.stats || {};

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Crosshair className="text-blue-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Search Radar</h1>
              <p className="text-xs text-gray-500">Google Search Console · {s.days_synced ?? 0} días sincronizados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {syncMsg && <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">{syncMsg}</span>}
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-40"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sincronizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <Loader2 size={28} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Eye} label="Impresiones (28d)" value={s.total_impressions?.toLocaleString('es-CL')} sub={`${s.keyword_count ?? 0} keywords`} color="blue" />
              <StatCard icon={MousePointerClick} label="Clics (28d)" value={s.total_clicks?.toLocaleString('es-CL')} sub={`${s.page_count ?? 0} páginas`} color="green" />
              <StatCard icon={AlertTriangle} label="Oportunidades activas" value={s.active_opp} sub={`${s.new_opp ?? 0} nuevas`} color="orange" />
              <StatCard icon={Clock} label="Última sync" value={s.last_sync_date ? new Date(s.last_sync_date).toLocaleDateString('es-CL') : '—'} sub={`${s.gsc_rows?.toLocaleString('es-CL') ?? 0} filas GSC`} color="violet" />
            </div>

            {/* By type */}
            {data?.by_type?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Oportunidades por tipo</h2>
                <div className="flex flex-wrap gap-2">
                  {data.by_type.map(t => (
                    <span key={t.opp_type} className={`text-xs px-3 py-1.5 rounded-full font-medium ${OPP_TYPE_COLORS[t.opp_type] || 'bg-gray-100 text-gray-600'}`}>
                      {OPP_TYPE_LABELS[t.opp_type] || t.opp_type} · {t.count} · avg {t.avg_score}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top opportunities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">Top 10 oportunidades</h2>
                <a href="/admin/radar/oportunidades" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Ver todas <ChevronRight size={12} />
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-50">
                      <th className="text-left p-4 font-medium">Query</th>
                      <th className="text-left p-4 font-medium">Tipo</th>
                      <th className="text-right p-4 font-medium">Score</th>
                      <th className="text-left p-4 font-medium">Estado</th>
                      <th className="text-left p-4 font-medium hidden md:table-cell">Acción recomendada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.top_opportunities || []).map((opp) => (
                      <tr key={opp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4 font-mono text-xs text-gray-700 max-w-xs truncate">{opp.query}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${OPP_TYPE_COLORS[opp.opp_type] || 'bg-gray-100 text-gray-600'}`}>
                            {OPP_TYPE_LABELS[opp.opp_type] || opp.opp_type}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SCORE_COLOR(opp.priority_score)}`}>
                            {opp.priority_score}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABELS[opp.status] || opp.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 hidden md:table-cell">{opp.recommended_action?.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data?.top_opportunities?.length && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No hay oportunidades. Ejecuta una sincronización.
                  </div>
                )}
              </div>
            </div>

            {/* Last syncs */}
            {data?.last_syncs?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas ejecuciones</h2>
                <div className="space-y-2">
                  {data.last_syncs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-gray-600">
                      {log.status === 'success'
                        ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        : log.status === 'running'
                        ? <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
                        : <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                      <span className="font-medium w-40 shrink-0">{log.sync_type}</span>
                      <span className="text-gray-400">{log.started_at ? new Date(log.started_at).toLocaleString('es-CL') : ''}</span>
                      {log.rows_fetched != null && <span className="text-gray-400 ml-auto">{log.rows_fetched} filas</span>}
                      {log.error_message && <span className="text-red-400 truncate max-w-xs ml-2">{log.error_message}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

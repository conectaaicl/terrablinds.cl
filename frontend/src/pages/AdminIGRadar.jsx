import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
  Instagram, RefreshCw, Users, Image, Hash, AlertTriangle,
  CheckCircle2, Loader2, ChevronRight, Bookmark, Eye, Heart
} from 'lucide-react';

const OPP_TYPE_LABELS = {
  sweet_spot: 'Sweet spot',
  local_unused: 'Local sin usar',
  high_saves: 'Alto saves',
  underused_winner: 'Ganador sin usar',
  trending: 'Tendencia',
};
const OPP_TYPE_COLORS = {
  sweet_spot: 'bg-violet-100 text-violet-700',
  local_unused: 'bg-green-100 text-green-700',
  high_saves: 'bg-amber-100 text-amber-700',
  underused_winner: 'bg-blue-100 text-blue-700',
  trending: 'bg-red-100 text-red-700',
};
const SCORE_COLOR = (s) =>
  s >= 70 ? 'bg-red-100 text-red-700 font-semibold'
  : s >= 50 ? 'bg-orange-100 text-orange-700'
  : s >= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';

const NEXT_STATUS = { new: 'reviewed', reviewed: 'in_progress', in_progress: 'implemented' };
const NEXT_LABEL = { new: 'Revisada', reviewed: 'En progreso', in_progress: 'Implementada' };
const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-violet-100 text-violet-700',
  implemented: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-500',
};
const STATUS_LABELS = {
  new: 'Nueva', reviewed: 'Revisada', in_progress: 'En progreso',
  implemented: 'Implementada', dismissed: 'Descartada',
};

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    violet: 'bg-violet-50 text-violet-600',
    pink: 'bg-pink-50 text-pink-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 items-start">
      <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
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

export default function AdminIGRadar() {
  const [status, setStatus] = useState(null);
  const [opps, setOpps] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState('opps');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, oRes, pRes] = await Promise.all([
        api.get('/radar/api/ig/status'),
        api.get('/radar/api/ig/opportunities', { params: { limit: 50 } }),
        api.get('/radar/api/ig/posts', { params: { limit: 30 } }),
      ]);
      setStatus(sRes.data);
      setOpps(oRes.data.items || []);
      setPosts(pRes.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerSync = async (type) => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const endpoint = type === 'posts' ? '/radar/api/ig/sync/posts'
        : type === 'hashtags' ? '/radar/api/ig/sync/hashtags'
        : '/radar/api/ig/sync/full';
      await api.post(endpoint);
      setSyncMsg(type === 'full'
        ? 'Sync completo iniciado. Refresca en ~1 min.'
        : `Sync de ${type} iniciado.`);
      setTimeout(() => load(), 8000);
    } catch (e) {
      setSyncMsg('Error: ' + (e.response?.data?.detail || e.message));
    } finally {
      setSyncing(false);
    }
  };

  const advanceStatus = async (opp) => {
    const next = NEXT_STATUS[opp.status];
    if (!next) return;
    setUpdating(opp.id);
    try {
      await api.patch(`/radar/api/ig/opportunities/${opp.id}`, { status: next });
      setOpps(prev => prev.map(o => o.id === opp.id ? { ...o, status: next } : o));
    } catch (e) { /* ignore */ }
    finally { setUpdating(null); }
  };

  const dismiss = async (opp) => {
    setUpdating(opp.id);
    try {
      await api.patch(`/radar/api/ig/opportunities/${opp.id}`, { status: 'dismissed' });
      setOpps(prev => prev.filter(o => o.id !== opp.id));
    } catch (e) { /* ignore */ }
    finally { setUpdating(null); }
  };

  const s = status?.summary || {};
  const account = status?.account || {};

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Instagram className="text-pink-500" size={24} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Instagram Hashtag Radar</h1>
              <p className="text-xs text-gray-500">
                {account.username ? `@${account.username}` : ''}
                {account.followers != null ? ` · ${account.followers} seguidores · ${account.posts} posts` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {syncMsg && (
              <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                {syncMsg}
              </span>
            )}
            <button onClick={load} disabled={loading}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-40">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => triggerSync('posts')} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 text-pink-700 text-xs font-medium rounded-xl hover:bg-pink-100 disabled:opacity-50 border border-pink-200">
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
              Sync Posts
            </button>
            <button onClick={() => triggerSync('hashtags')} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-violet-700 text-xs font-medium rounded-xl hover:bg-violet-100 disabled:opacity-50 border border-violet-200">
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <Hash size={12} />}
              Scan Hashtags
            </button>
            <button onClick={() => triggerSync('full')} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-xl hover:bg-pink-700 disabled:opacity-50">
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sync completo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <Loader2 size={28} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Cargando datos de Instagram...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Image} label="Posts sincronizados" value={s.posts_synced ?? 0} color="pink" />
              <StatCard icon={Hash} label="Hashtags trackeados" value={s.hashtags_tracked ?? 0} sub="activos" color="violet" />
              <StatCard icon={AlertTriangle} label="Oportunidades activas" value={s.active_opps ?? 0} color="orange" />
              <StatCard icon={Users} label="Seguidores" value={account.followers ?? '—'} sub={account.username ? `@${account.username}` : ''} color="blue" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
              {[['opps', 'Oportunidades'], ['posts', 'Posts propios']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Opportunities tab */}
            {activeTab === 'opps' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {opps.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Hash size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Sin oportunidades todavía</p>
                    <p className="text-xs mt-1">Ejecuta un sync completo para detectar oportunidades de hashtags.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-gray-100">
                          <th className="text-left p-4 font-medium">Hashtag</th>
                          <th className="text-left p-4 font-medium">Tipo</th>
                          <th className="text-right p-4 font-medium">Score</th>
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium hidden lg:table-cell">Recomendación</th>
                          <th className="text-right p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opps.map(opp => (
                          <tr key={opp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                            <td className="p-4">
                              <span className="font-mono text-xs text-pink-700 font-medium">#{opp.hashtag}</span>
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
                              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || ''}`}>
                                {STATUS_LABELS[opp.status] || opp.status}
                              </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <span className="text-xs text-gray-500 line-clamp-2">{opp.recommendation_text}</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-1 justify-end">
                                {NEXT_STATUS[opp.status] && (
                                  <button onClick={() => advanceStatus(opp)} disabled={updating === opp.id}
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50">
                                    {updating === opp.id ? <Loader2 size={10} className="animate-spin" /> : NEXT_LABEL[opp.status]}
                                  </button>
                                )}
                                {opp.status !== 'dismissed' && opp.status !== 'implemented' && (
                                  <button onClick={() => dismiss(opp)} disabled={updating === opp.id}
                                    className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                                    ×
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Posts tab */}
            {activeTab === 'posts' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Image size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Sin posts sincronizados</p>
                    <p className="text-xs mt-1">Haz clic en "Sync Posts" para importar tus publicaciones de Instagram.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-gray-100">
                          <th className="text-left p-4 font-medium">Caption</th>
                          <th className="text-left p-4 font-medium">Hashtags</th>
                          <th className="text-right p-4 font-medium">
                            <Eye size={12} className="inline mr-1" />Reach
                          </th>
                          <th className="text-right p-4 font-medium">
                            <Heart size={12} className="inline mr-1" />Likes
                          </th>
                          <th className="text-right p-4 font-medium">
                            <Bookmark size={12} className="inline mr-1" />Saves
                          </th>
                          <th className="text-right p-4 font-medium hidden md:table-cell">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map(p => (
                          <tr key={p.ig_media_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                            <td className="p-4 max-w-xs">
                              <a href={p.permalink} target="_blank" rel="noreferrer"
                                className="text-xs text-gray-700 line-clamp-2 hover:text-pink-600">
                                {p.caption || '(sin caption)'}
                              </a>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(p.hashtags || []).slice(0, 5).map(h => (
                                  <span key={h} className="text-xs px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-full">
                                    #{h}
                                  </span>
                                ))}
                                {(p.hashtags || []).length > 5 && (
                                  <span className="text-xs text-gray-400">+{p.hashtags.length - 5}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right text-xs text-gray-600">{p.reach ?? '—'}</td>
                            <td className="p-4 text-right text-xs text-gray-600">{p.likes ?? '—'}</td>
                            <td className="p-4 text-right text-xs text-gray-600">{p.saved ?? '—'}</td>
                            <td className="p-4 text-right text-xs text-gray-400 hidden md:table-cell">
                              {p.posted_at ? new Date(p.posted_at).toLocaleDateString('es-CL') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

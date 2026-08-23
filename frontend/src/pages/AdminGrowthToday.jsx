import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
  Sun, Clock, AlertTriangle, CalendarCheck,
  Users2, Phone, CheckCircle2, RefreshCw,
} from 'lucide-react';

const typeLabel = { call: 'Llamada', email: 'Correo', visit: 'Visita', message: 'Mensaje', other: 'Otro' };
const priorityClass = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-600',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}
function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function FollowUpCard({ fu, onDone }) {
  const opp     = fu.opportunity;
  const contact = opp?.contact;
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityClass[fu.priority] || priorityClass.low}`}>
            {fu.priority}
          </span>
          <span className="text-xs text-gray-500">{typeLabel[fu.type] || fu.type}</span>
          <span className="text-xs text-gray-400">{formatDate(fu.scheduled_at)} {formatTime(fu.scheduled_at)}</span>
        </div>
        {contact && (
          <p className="text-sm font-medium text-gray-800 mt-1 truncate">
            {contact.name}
            {contact.phone && (
              <span className="ml-2 text-gray-500 font-normal text-xs">{contact.phone}</span>
            )}
          </p>
        )}
        {opp && (
          <Link
            to={`/admin/growth/opportunities/${opp.id}`}
            className="text-xs text-indigo-600 hover:underline"
          >
            {opp.product_interest || `Oportunidad #${opp.id}`}
          </Link>
        )}
        {fu.note && <p className="text-xs text-gray-500 mt-1 truncate">{fu.note}</p>}
      </div>
      <button
        onClick={() => onDone(fu.id)}
        title="Marcar como realizado"
        className="text-green-600 hover:text-green-800 shrink-0 mt-0.5"
      >
        <CheckCircle2 className="w-5 h-5" />
      </button>
    </div>
  );
}

function StaleCard({ opp }) {
  const contact = opp.contact;
  const daysSince = Math.floor(
    (Date.now() - new Date(opp.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  return (
    <Link
      to={`/admin/growth/opportunities/${opp.id}`}
      className="block p-3 bg-white border border-orange-200 rounded-lg hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {contact?.name || `Opp #${opp.id}`}
          </p>
          <p className="text-xs text-gray-500 truncate">{opp.product_interest}</p>
        </div>
        <span className="text-xs text-orange-600 font-semibold whitespace-nowrap">{daysSince}d sin actividad</span>
      </div>
    </Link>
  );
}

function Section({ icon: Icon, title, count, color, children, empty }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
        {count > 0 && (
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${color} bg-white border`}>
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <p className="text-xs text-gray-400 italic">{empty}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

export default function AdminGrowthToday() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/api/growth/today');
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markDone = async (id) => {
    try {
      await api.put(`/api/growth/follow-ups/${id}`, { status: 'done' });
      load();
    } catch { /* silent */ }
  };

  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-5 h-5 text-yellow-500" />
              <h1 className="text-xl font-bold text-gray-800">¿Qué tengo que hacer hoy?</h1>
            </div>
            <p className="text-sm text-gray-500 capitalize">{todayStr}</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>
        )}

        {loading && !data && (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        )}

        {data && (
          <>
            {/* Summary pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Vencidos', value: data.summary.overdue_follow_ups, color: 'text-red-600 bg-red-50 border-red-200' },
                { label: 'Para hoy', value: data.summary.today_follow_ups, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                { label: 'Sin contactar', value: data.summary.new_uncontacted, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                { label: 'Estancados', value: data.summary.stale_opportunities, color: 'text-orange-600 bg-orange-50 border-orange-200' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overdue */}
              <Section
                icon={AlertTriangle}
                title="Seguimientos vencidos"
                count={data.overdue_follow_ups.length}
                color="text-red-500"
                empty="Sin pendientes vencidos"
              >
                {data.overdue_follow_ups.map(fu => (
                  <FollowUpCard key={fu.id} fu={fu} onDone={markDone} />
                ))}
              </Section>

              {/* Today */}
              <Section
                icon={CalendarCheck}
                title="Para hoy"
                count={data.today_follow_ups.length}
                color="text-blue-500"
                empty="Sin seguimientos para hoy"
              >
                {data.today_follow_ups.map(fu => (
                  <FollowUpCard key={fu.id} fu={fu} onDone={markDone} />
                ))}
              </Section>

              {/* New uncontacted */}
              <Section
                icon={Users2}
                title="Nuevos sin contactar (últimos 3 días)"
                count={data.new_uncontacted.length}
                color="text-purple-500"
                empty="Todos los leads han sido contactados"
              >
                {data.new_uncontacted.map(c => (
                  <Link
                    key={c.id}
                    to={`/admin/growth/contacts/${c.id}`}
                    className="block p-3 bg-white border border-purple-100 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email} · {formatDate(c.created_at)}</p>
                  </Link>
                ))}
              </Section>

              {/* Stale opportunities */}
              <Section
                icon={Clock}
                title={`Estancados (+${data.summary.stale_days} días sin actividad)`}
                count={data.stale_opportunities.length}
                color="text-orange-500"
                empty="No hay oportunidades estancadas"
              >
                {data.stale_opportunities.map(opp => (
                  <StaleCard key={opp.id} opp={opp} />
                ))}
              </Section>
            </div>

            {/* Recent activity */}
            {data.recent_activity.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Actividad reciente (últimas 24h)
                </h3>
                <div className="space-y-2">
                  {data.recent_activity.map(tp => (
                    <div key={tp.id} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                      <span className="font-medium">{tp.opportunity?.contact?.name || `Opp #${tp.opportunity_id}`}</span>
                      <span className="text-gray-400">·</span>
                      <span>{tp.source}</span>
                      <span className="text-gray-400 ml-auto">{formatTime(tp.occurred_at)}</span>
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

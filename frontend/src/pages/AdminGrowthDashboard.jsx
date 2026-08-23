import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
    TrendingUp, Users, CheckCircle2, AlertCircle,
    Clock, BarChart3, RefreshCw,
} from 'lucide-react';

const STATUS_LABELS = {
    new: 'Nuevas', contacted: 'Contactadas', qualified: 'Calificadas',
    quoted: 'Cotizadas', won: 'Ganadas', lost: 'Perdidas',
    spam: 'Spam', duplicate: 'Duplicadas', out_of_coverage: 'Fuera de cobertura',
};

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    qualified: 'bg-violet-100 text-violet-700',
    quoted: 'bg-teal-100 text-teal-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-gray-100 text-gray-500',
    spam: 'bg-red-100 text-red-600',
    duplicate: 'bg-orange-100 text-orange-700',
    out_of_coverage: 'bg-slate-100 text-slate-500',
};

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
    const colors = {
        blue:   'bg-blue-50 text-blue-600',
        green:  'bg-green-50 text-green-600',
        amber:  'bg-amber-50 text-amber-600',
        red:    'bg-red-50 text-red-600',
    };
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
            <div className={`${colors[color]} p-3 rounded-xl`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function fmt(n) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export default function AdminGrowthDashboard() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const load = () => {
        setLoading(true);
        api.get('/api/growth/dashboard')
            .then(r => { setData(r.data); setError(null); })
            .catch(() => setError('No se pudo cargar el dashboard.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-xl font-bold">Dashboard Comercial</h1>
                        <p className="text-blue-200 text-sm mt-1">Resumen de oportunidades y revenue</p>
                    </div>
                    <button
                        onClick={load}
                        className="text-white opacity-70 hover:opacity-100 transition-opacity"
                        title="Refrescar"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {loading && !data && (
                    <div className="flex justify-center py-16 text-gray-400">Cargando…</div>
                )}

                {data && (
                    <>
                        {/* KPIs */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={TrendingUp}
                                label="Abiertas"
                                value={data.opportunities.open}
                                color="blue"
                            />
                            <StatCard
                                icon={CheckCircle2}
                                label="Ganadas"
                                value={data.opportunities.won}
                                sub={fmt(data.revenue.won)}
                                color="green"
                            />
                            <StatCard
                                icon={Clock}
                                label="Sin actividad 7d"
                                value={data.stale_count}
                                color="amber"
                            />
                            <StatCard
                                icon={Users}
                                label="Nuevas opps"
                                value={data.opportunities.new}
                                color="blue"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Por estado */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-gray-400" />
                                    Por estado
                                </h2>
                                <div className="space-y-2">
                                    {Object.entries(data.opportunities.by_status).map(([status, cnt]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[status] || status}
                                            </span>
                                            <span className="text-sm font-bold text-gray-800 tabular-nums">{cnt}</span>
                                        </div>
                                    ))}
                                    {Object.keys(data.opportunities.by_status).length === 0 && (
                                        <p className="text-sm text-gray-400">Sin oportunidades aún.</p>
                                    )}
                                </div>
                            </div>

                            {/* Distribución por fuente */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-gray-400" />
                                    Fuentes de touchpoints
                                </h2>
                                {data.source_distribution.length === 0 ? (
                                    <p className="text-sm text-gray-400">Sin touchpoints registrados.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.source_distribution.map(({ source, count }) => {
                                            const total = data.source_distribution.reduce((s, r) => s + r.count, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={source}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 capitalize">{source.replace(/_/g, ' ')}</span>
                                                        <span className="font-medium tabular-nums">{count} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contactos recientes */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Contactos recientes</h2>
                            {data.contacts_recent.length === 0 ? (
                                <p className="text-sm text-gray-400">Sin contactos aún.</p>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {data.contacts_recent.map(c => {
                                        const opp = c.opportunities?.[0];
                                        return (
                                            <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{c.name || '—'}</p>
                                                    <p className="text-xs text-gray-400">{c.email || c.phone || '—'}</p>
                                                </div>
                                                {opp && (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {STATUS_LABELS[opp.status] || opp.status}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

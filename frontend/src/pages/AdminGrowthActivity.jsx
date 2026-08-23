import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Activity, MessageSquare, GitBranch, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const STATUS_LABELS = {
    new: 'Nueva', contacted: 'Contactada', qualified: 'Calificada',
    quoted: 'Cotizada', won: 'Ganada', lost: 'Perdida',
    spam: 'Spam', duplicate: 'Duplicada', out_of_coverage: 'Sin cobertura',
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

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

function TouchpointItem({ item, navigate }) {
    const tp = item.data;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-blue-50 rounded-lg shrink-0">
                <MessageSquare size={13} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 capitalize">
                        {tp.source?.replace(/_/g, ' ') || 'Touchpoint'}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums shrink-0">{fmtDate(item.at)}</span>
                </div>
                {tp.channel_detail && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{tp.channel_detail}</p>
                )}
                {tp.opportunity?.contact?.name && (
                    <button
                        onClick={() => navigate(`/admin/growth/opportunities/${tp.opportunity_id}`)}
                        className="text-xs text-blue-500 hover:underline mt-0.5"
                    >
                        {tp.opportunity.contact.name}
                        {tp.opportunity.product_interest ? ` · ${tp.opportunity.product_interest}` : ''}
                    </button>
                )}
            </div>
        </div>
    );
}

function EventItem({ item, navigate }) {
    const ev = item.data;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-violet-50 rounded-lg shrink-0">
                <GitBranch size={13} className="text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-gray-700">
                        <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[ev.from_status] || 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABELS[ev.from_status] || ev.from_status}
                        </span>
                        {' → '}
                        <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[ev.to_status] || 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABELS[ev.to_status] || ev.to_status}
                        </span>
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums shrink-0">{fmtDate(item.at)}</span>
                </div>
                {ev.actor && <p className="text-xs text-gray-400 mt-0.5">por {ev.actor}</p>}
                {ev.note && <p className="text-xs text-gray-600 mt-0.5 italic">"{ev.note}"</p>}
                {ev.opportunity?.contact?.name && (
                    <button
                        onClick={() => navigate(`/admin/growth/opportunities/${ev.opportunity_id}`)}
                        className="text-xs text-blue-500 hover:underline mt-0.5"
                    >
                        {ev.opportunity.contact.name}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminGrowthActivity() {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [type, setType]       = useState('');
    const [page, setPage]       = useState(1);

    const load = useCallback(() => {
        setLoading(true);
        const params = { page, limit: 30 };
        if (type) params.type = type;
        api.get('/api/growth/activity', { params })
            .then(r => { setData(r.data); setError(null); })
            .catch(() => setError('Error al cargar actividad.'))
            .finally(() => setLoading(false));
    }, [page, type]);

    useEffect(() => { setPage(1); }, [type]);
    useEffect(load, [load]);

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5">
                    <h1 className="text-white text-xl font-bold">Actividad</h1>
                    <p className="text-blue-200 text-sm mt-1">Touchpoints y cambios de estado</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <Filter size={14} className="text-gray-400" />
                    {[
                        { value: '', label: 'Todo' },
                        { value: 'touchpoint', label: 'Touchpoints' },
                        { value: 'event', label: 'Eventos' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setType(opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                type === opt.value
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                {loading && !data && (
                    <div className="flex justify-center py-16 text-gray-400">Cargando…</div>
                )}

                {data && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        {data.data.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Sin actividad registrada.</p>
                        ) : (
                            <div className="space-y-4 divide-y divide-gray-50">
                                {data.data.map((item, idx) => (
                                    <div key={`${item.type}-${item.data.id}-${idx}`} className={idx > 0 ? 'pt-4' : ''}>
                                        {item.type === 'touchpoint'
                                            ? <TouchpointItem item={item} navigate={navigate} />
                                            : <EventItem item={item} navigate={navigate} />
                                        }
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.pages > 1 && (
                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>Página {page} de {data.pages} · {data.total} eventos</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page <= 1}
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= data.pages}
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

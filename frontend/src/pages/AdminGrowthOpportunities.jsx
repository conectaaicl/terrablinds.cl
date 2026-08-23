import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import OpportunityScore from '../components/OpportunityScore';

const ALL_STATUSES = [
    'new', 'contacted', 'qualified', 'quoted',
    'won', 'lost', 'spam', 'duplicate', 'out_of_coverage',
];

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

function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function AdminGrowthOpportunities() {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [q, setQ]             = useState('');
    const [status, setStatus]   = useState('');
    const [page, setPage]       = useState(1);

    const dq     = useDebounce(q);
    const dstatus = useDebounce(status, 0);

    const load = useCallback(() => {
        setLoading(true);
        const params = { page, limit: 20 };
        if (dq)      params.q      = dq;
        if (dstatus) params.status = dstatus;
        api.get('/api/growth/opportunities', { params })
            .then(r => { setData(r.data); setError(null); })
            .catch(() => setError('Error al cargar oportunidades.'))
            .finally(() => setLoading(false));
    }, [page, dq, dstatus]);

    useEffect(() => { setPage(1); }, [dq, dstatus]);
    useEffect(load, [load]);

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5">
                    <h1 className="text-white text-xl font-bold">Oportunidades</h1>
                    <p className="text-blue-200 text-sm mt-1">Listado completo con filtros</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono…"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="">Todos los estados</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left">Contacto</th>
                                    <th className="px-4 py-3 text-left hidden sm:table-cell">Producto</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left hidden lg:table-cell">Score</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Creada</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando…</td>
                                    </tr>
                                )}
                                {!loading && data?.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin resultados.</td>
                                    </tr>
                                )}
                                {!loading && data?.data.map(opp => (
                                    <tr
                                        key={opp.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/admin/growth/opportunities/${opp.id}`)}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{opp.contact?.name || '—'}</p>
                                            <p className="text-xs text-gray-400">{opp.contact?.email || opp.contact?.phone || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-gray-600 max-w-[160px] truncate">
                                            {opp.product_interest || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[opp.status] || opp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {opp.score != null
                                                ? <OpportunityScore score={opp.score} factors={opp.factors || []} size="sm" />
                                                : <span className="text-xs text-gray-300">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs tabular-nums">
                                            {new Date(opp.created_at).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <ExternalLink size={14} className="text-gray-300 hover:text-blue-500" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data && data.pages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <span>Página {page} de {data.pages} · {data.total} resultados</span>
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
            </div>
        </AdminLayout>
    );
}

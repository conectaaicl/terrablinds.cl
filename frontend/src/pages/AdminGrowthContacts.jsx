import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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

export default function AdminGrowthContacts() {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [q, setQ]             = useState('');
    const [page, setPage]       = useState(1);

    const dq = useDebounce(q);

    const load = useCallback(() => {
        setLoading(true);
        const params = { page, limit: 20 };
        if (dq) params.q = dq;
        api.get('/api/growth/contacts', { params })
            .then(r => { setData(r.data); setError(null); })
            .catch(() => setError('Error al cargar contactos.'))
            .finally(() => setLoading(false));
    }, [page, dq]);

    useEffect(() => { setPage(1); }, [dq]);
    useEffect(load, [load]);

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5">
                    <h1 className="text-white text-xl font-bold">Contactos</h1>
                    <p className="text-blue-200 text-sm mt-1">Base de contactos del Growth Engine</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono…"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
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
                                    <th className="px-4 py-3 text-left">Nombre</th>
                                    <th className="px-4 py-3 text-left hidden sm:table-cell">Contacto</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Última opp.</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Registrado</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Cargando…</td>
                                    </tr>
                                )}
                                {!loading && data?.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin resultados.</td>
                                    </tr>
                                )}
                                {!loading && data?.data.map(c => {
                                    const opp = c.opportunities?.[0];
                                    return (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/admin/growth/contacts/${c.id}`)}
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-800">{c.name || '—'}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                                                {c.email && <div>{c.email}</div>}
                                                {c.phone && <div>{c.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {opp ? (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || ''}`}>
                                                        {STATUS_LABELS[opp.status] || opp.status}
                                                    </span>
                                                ) : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs tabular-nums">
                                                {new Date(c.created_at).toLocaleDateString('es-CL')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <ExternalLink size={14} className="text-gray-300 hover:text-blue-500" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {data && data.pages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                            <span>Página {page} de {data.pages} · {data.total} contactos</span>
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

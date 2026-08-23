import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { RefreshCw, User, MessageSquare, FileText, MoveRight } from 'lucide-react';
import OpportunityScore from '../components/OpportunityScore';

const OPEN_STATUSES = ['new', 'contacted', 'qualified', 'quoted'];

const COLUMN_LABELS = {
    new:       'Nuevas',
    contacted: 'Contactadas',
    qualified: 'Calificadas',
    quoted:    'Cotizadas',
};

const COLUMN_COLORS = {
    new:       { header: 'bg-blue-600',   badge: 'bg-blue-100 text-blue-700' },
    contacted: { header: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700' },
    qualified: { header: 'bg-violet-600', badge: 'bg-violet-100 text-violet-700' },
    quoted:    { header: 'bg-teal-600',   badge: 'bg-teal-100 text-teal-700' },
};

const ALL_STATUS_LABELS = {
    new: 'Nueva', contacted: 'Contactada', qualified: 'Calificada',
    quoted: 'Cotizada', won: 'Ganada', lost: 'Perdida',
    spam: 'Spam', duplicate: 'Duplicada', out_of_coverage: 'Sin cobertura',
};

function OppCard({ opp, onDragStart }) {
    const isStale = opp.updated_at && (Date.now() - new Date(opp.updated_at).getTime() > 7 * 24 * 3600 * 1000);
    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, opp)}
            className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 leading-tight">
                    {opp.contact?.name || '—'}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                    {opp.score != null && (
                        <OpportunityScore score={opp.score} factors={opp.factors || []} size="sm" />
                    )}
                    {isStale && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-200">
                            inactiva
                        </span>
                    )}
                </div>
            </div>
            {opp.product_interest && (
                <p className="text-xs text-gray-500 mt-1 truncate">{opp.product_interest}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {opp.contact?.phone && (
                    <span className="flex items-center gap-1">
                        <User size={11} /> {opp.contact.phone}
                    </span>
                )}
                {opp.last_touchpoint && (
                    <span className="flex items-center gap-1">
                        <MessageSquare size={11} /> {opp.last_touchpoint.source?.replace(/_/g, ' ')}
                    </span>
                )}
                {opp.quote_count > 0 && (
                    <span className="flex items-center gap-1">
                        <FileText size={11} /> {opp.quote_count}
                    </span>
                )}
            </div>
        </div>
    );
}

function MobileTransitionModal({ opp, onClose, onTransition }) {
    if (!opp) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-1">Mover oportunidad</h3>
                <p className="text-sm text-gray-500 mb-4">{opp.contact?.name || '—'} · {opp.product_interest || '—'}</p>
                <div className="space-y-2">
                    {(opp.valid_transitions || []).map(to => (
                        <button
                            key={to}
                            onClick={() => onTransition(opp.id, to)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
                        >
                            <span>{ALL_STATUS_LABELS[to] || to}</span>
                            <MoveRight size={14} className="text-gray-400" />
                        </button>
                    ))}
                    {(opp.valid_transitions || []).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-2">Estado terminal</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default function AdminGrowthPipeline() {
    const [pipeline, setPipeline]   = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [dragging, setDragging]   = useState(null);
    const [dragOver, setDragOver]   = useState(null);
    const [mobileOpp, setMobileOpp] = useState(null);
    const [transitioning, setTransitioning] = useState(false);

    const load = () => {
        setLoading(true);
        api.get('/api/growth/pipeline')
            .then(r => { setPipeline(r.data); setError(null); })
            .catch(() => setError('No se pudo cargar el pipeline.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const doTransition = useCallback(async (oppId, toStatus, note) => {
        setTransitioning(true);
        try {
            await api.post(`/api/growth/opportunities/${oppId}/transition`, { to_status: toStatus, note: note || null });
            setMobileOpp(null);
            load();
        } catch (e) {
            alert(e?.response?.data?.error || 'Error al mover la oportunidad.');
        } finally {
            setTransitioning(false);
        }
    }, []);

    const onDragStart = (e, opp) => {
        setDragging(opp);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e, col) => {
        e.preventDefault();
        if (!dragging) return;
        const allowed = dragging.valid_transitions || [];
        if (allowed.includes(col)) {
            e.dataTransfer.dropEffect = 'move';
            setDragOver(col);
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    };

    const onDrop = (e, col) => {
        e.preventDefault();
        if (!dragging) return;
        const allowed = dragging.valid_transitions || [];
        if (allowed.includes(col)) doTransition(dragging.id, col);
        setDragging(null);
        setDragOver(null);
    };

    const total = pipeline ? OPEN_STATUSES.reduce((s, k) => s + (pipeline[k]?.length || 0), 0) : 0;

    return (
        <AdminLayout>
            <div className="px-4 py-6 space-y-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-xl font-bold">Pipeline</h1>
                        <p className="text-blue-200 text-sm mt-1">{total} oportunidades abiertas</p>
                    </div>
                    <button onClick={load} className="text-white opacity-70 hover:opacity-100 transition-opacity" title="Refrescar">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                {loading && !pipeline && (
                    <div className="flex justify-center py-16 text-gray-400">Cargando…</div>
                )}

                {pipeline && (
                    <>
                        {/* Desktop Kanban */}
                        <div className="hidden md:grid md:grid-cols-4 gap-3">
                            {OPEN_STATUSES.map(col => {
                                const cards   = pipeline[col] || [];
                                const colors  = COLUMN_COLORS[col];
                                const isOver  = dragOver === col;
                                const canDrop = dragging && (dragging.valid_transitions || []).includes(col);
                                return (
                                    <div
                                        key={col}
                                        className={`rounded-2xl flex flex-col min-h-[400px] transition-colors ${
                                            isOver && canDrop ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-gray-50'
                                        }`}
                                        onDragOver={e => onDragOver(e, col)}
                                        onDragLeave={() => setDragOver(null)}
                                        onDrop={e => onDrop(e, col)}
                                    >
                                        <div className={`${colors.header} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
                                            <span className="text-white text-sm font-semibold">{COLUMN_LABELS[col]}</span>
                                            <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">{cards.length}</span>
                                        </div>
                                        <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                                            {cards.map(opp => (
                                                <OppCard key={opp.id} opp={opp} onDragStart={onDragStart} />
                                            ))}
                                            {cards.length === 0 && (
                                                <p className="text-xs text-gray-400 text-center pt-6">Sin oportunidades</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile list */}
                        <div className="md:hidden space-y-4">
                            {OPEN_STATUSES.map(col => {
                                const cards  = pipeline[col] || [];
                                const colors = COLUMN_COLORS[col];
                                if (cards.length === 0) return null;
                                return (
                                    <div key={col} className="bg-gray-50 rounded-2xl overflow-hidden">
                                        <div className={`${colors.header} px-4 py-2.5 flex items-center justify-between`}>
                                            <span className="text-white text-sm font-semibold">{COLUMN_LABELS[col]}</span>
                                            <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">{cards.length}</span>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {cards.map(opp => (
                                                <button
                                                    key={opp.id}
                                                    className="w-full text-left bg-white rounded-xl border border-gray-200 p-3 shadow-sm"
                                                    onClick={() => setMobileOpp(opp)}
                                                >
                                                    <p className="text-sm font-medium text-gray-800">{opp.contact?.name || '—'}</p>
                                                    {opp.product_interest && (
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{opp.product_interest}</p>
                                                    )}
                                                    <p className="text-xs text-blue-600 mt-1">Toca para mover →</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {mobileOpp && (
                <MobileTransitionModal
                    opp={mobileOpp}
                    onClose={() => setMobileOpp(null)}
                    onTransition={doTransition}
                />
            )}

            {transitioning && (
                <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-xl text-sm text-gray-700">Moviendo…</div>
                </div>
            )}
        </AdminLayout>
    );
}

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import OpportunityScore from '../components/OpportunityScore';
import {
    ArrowLeft, User, Phone, Mail, Clock, Tag,
    CheckCircle2, AlertTriangle, MessageSquare, FileText, Activity,
    Plus, Trash2, CalendarCheck,
} from 'lucide-react';

const FOLLOWUP_TYPE_LABELS = { call: 'Llamada', email: 'Correo', visit: 'Visita', message: 'Mensaje', other: 'Otro' };
const FOLLOWUP_PRIORITY_COLORS = {
    high:   'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low:    'bg-gray-100 text-gray-500',
};
const FOLLOWUP_STATUS_LABELS = { pending: 'Pendiente', done: 'Realizado', cancelled: 'Cancelado', missed: 'Perdido' };

const STATUS_LABELS = {
    new: 'Nueva', contacted: 'Contactada', qualified: 'Calificada',
    quoted: 'Cotizada', won: 'Ganada', lost: 'Perdida',
    spam: 'Spam', duplicate: 'Duplicada', out_of_coverage: 'Sin cobertura',
};

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    contacted: 'bg-amber-100 text-amber-700 border-amber-200',
    qualified: 'bg-violet-100 text-violet-700 border-violet-200',
    quoted: 'bg-teal-100 text-teal-700 border-teal-200',
    won: 'bg-green-100 text-green-700 border-green-200',
    lost: 'bg-gray-100 text-gray-500 border-gray-200',
    spam: 'bg-red-100 text-red-600 border-red-200',
    duplicate: 'bg-orange-100 text-orange-700 border-orange-200',
    out_of_coverage: 'bg-slate-100 text-slate-500 border-slate-200',
};

function fmt(n) {
    if (!n) return '—';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
}

function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Icon size={15} className="text-gray-400" />
                {title}
            </h2>
            {children}
        </div>
    );
}

const EMPTY_FU_FORM = {
    type: 'call', priority: 'medium', scheduled_at: '', note: '', next_action: '',
};

export default function AdminGrowthOpportunity() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const [opp, setOpp]           = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [transitioning, setTransitioning] = useState(false);
    const [note, setNote]         = useState('');
    const [wonAmount, setWonAmount] = useState('');
    const [showTransition, setShowTransition] = useState(false);
    const [pendingStatus, setPendingStatus]   = useState(null);

    // Follow-ups state
    const [followUps, setFollowUps]     = useState([]);
    const [fuLoading, setFuLoading]     = useState(false);
    const [showFuForm, setShowFuForm]   = useState(false);
    const [fuForm, setFuForm]           = useState(EMPTY_FU_FORM);
    const [fuSaving, setFuSaving]       = useState(false);
    const [fuError, setFuError]         = useState(null);
    const [score, setScore]             = useState(null);
    const [scoreFactors, setScoreFactors] = useState([]);

    const load = useCallback(() => {
        setLoading(true);
        api.get(`/api/growth/opportunities/${id}`)
            .then(r => { setOpp(r.data); setError(null); })
            .catch(() => setError('No se pudo cargar la oportunidad.'))
            .finally(() => setLoading(false));
    }, [id]);

    const loadFollowUps = useCallback(() => {
        setFuLoading(true);
        api.get(`/api/growth/opportunities/${id}/follow-ups`)
            .then(r => { setFollowUps(r.data?.data || r.data || []); setFuError(null); })
            .catch(() => setFuError('No se pudieron cargar los seguimientos.'))
            .finally(() => setFuLoading(false));
    }, [id]);

    const loadScore = useCallback(() => {
        api.get(`/api/growth/opportunities/${id}/score`)
            .then(r => { setScore(r.data.score); setScoreFactors(r.data.factors || []); })
            .catch(() => {});
    }, [id]);

    useEffect(() => {
        load();
        loadFollowUps();
        loadScore();
    }, [id, load, loadFollowUps, loadScore]);

    const handleTransition = async () => {
        if (!pendingStatus) return;
        setTransitioning(true);
        try {
            const body = { to_status: pendingStatus, note: note || null };
            if (pendingStatus === 'won' && wonAmount) body.won_amount = parseFloat(wonAmount);
            await api.post(`/api/growth/opportunities/${id}/transition`, body);
            setShowTransition(false);
            setNote('');
            setWonAmount('');
            setPendingStatus(null);
            load();
            loadScore();
        } catch (e) {
            alert(e?.response?.data?.error || 'Error al actualizar.');
        } finally {
            setTransitioning(false);
        }
    };

    const handleCreateFu = async (e) => {
        e.preventDefault();
        if (!fuForm.scheduled_at) return;
        setFuSaving(true);
        try {
            await api.post(`/api/growth/opportunities/${id}/follow-ups`, {
                type:         fuForm.type,
                priority:     fuForm.priority,
                scheduled_at: fuForm.scheduled_at,
                note:         fuForm.note || null,
                next_action:  fuForm.next_action || null,
            });
            setFuForm(EMPTY_FU_FORM);
            setShowFuForm(false);
            loadFollowUps();
        } catch (e) {
            setFuError(e?.response?.data?.error || 'Error al guardar el seguimiento.');
        } finally {
            setFuSaving(false);
        }
    };

    const markFuDone = async (fuId) => {
        try {
            await api.put(`/api/growth/follow-ups/${fuId}`, { status: 'done' });
            loadFollowUps();
        } catch { /* silent */ }
    };

    const cancelFu = async (fuId) => {
        try {
            await api.put(`/api/growth/follow-ups/${fuId}`, { status: 'cancelled' });
            loadFollowUps();
        } catch { /* silent */ }
    };

    const deleteFu = async (fuId) => {
        if (!window.confirm('¿Eliminar este seguimiento?')) return;
        try {
            await api.delete(`/api/growth/follow-ups/${fuId}`);
            loadFollowUps();
        } catch { /* silent */ }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-24 text-gray-400">Cargando…</div>
            </AdminLayout>
        );
    }

    if (error || !opp) {
        return (
            <AdminLayout>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error || 'No encontrado.'}</div>
                    <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} /> Volver
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const isTerminal = !opp.valid_transitions?.length;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
                {/* Back + Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={15} /> Volver
                </button>

                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-white text-xl font-bold">
                                {opp.contact?.name || 'Oportunidad ' + opp.id}
                            </h1>
                            <p className="text-blue-200 text-sm mt-1">{opp.product_interest || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {score != null && (
                                <OpportunityScore score={score} factors={scoreFactors} size="lg" />
                            )}
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[opp.status]}`}>
                                {STATUS_LABELS[opp.status] || opp.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Contact */}
                    <Section title="Contacto" icon={User}>
                        {opp.contact ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User size={13} className="text-gray-400 shrink-0" />
                                    <button
                                        onClick={() => navigate(`/admin/growth/contacts/${opp.contact.id}`)}
                                        className="hover:text-blue-600 underline underline-offset-2"
                                    >
                                        {opp.contact.name}
                                    </button>
                                </div>
                                {opp.contact.email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={13} className="text-gray-400 shrink-0" />
                                        {opp.contact.email}
                                    </div>
                                )}
                                {opp.contact.phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={13} className="text-gray-400 shrink-0" />
                                        {opp.contact.phone}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Sin contacto asociado.</p>
                        )}
                    </Section>

                    {/* Details */}
                    <Section title="Detalles" icon={Tag}>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Creada</span><span className="text-gray-800 tabular-nums">{fmtDate(opp.created_at)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Actualizada</span><span className="text-gray-800 tabular-nums">{fmtDate(opp.updated_at)}</span>
                            </div>
                            {opp.won_amount && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Monto ganado</span>
                                    <span className="text-green-700 font-semibold tabular-nums">{fmt(opp.won_amount)}</span>
                                </div>
                            )}
                            {opp.won_at && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Ganada el</span><span className="text-gray-800 tabular-nums">{fmtDate(opp.won_at)}</span>
                                </div>
                            )}
                            {opp.lost_reason && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Razón pérdida</span><span className="text-gray-800 max-w-[60%] text-right">{opp.lost_reason}</span>
                                </div>
                            )}
                        </div>
                    </Section>
                </div>

                {/* Transition */}
                {!isTerminal && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-gray-400" />
                            Mover estado
                        </h2>
                        {!showTransition ? (
                            <div className="flex flex-wrap gap-2">
                                {opp.valid_transitions.map(to => (
                                    <button
                                        key={to}
                                        onClick={() => { setPendingStatus(to); setShowTransition(true); }}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        → {STATUS_LABELS[to] || to}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Mover a <strong>{STATUS_LABELS[pendingStatus]}</strong>
                                </p>
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Nota opcional…"
                                    rows={2}
                                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                />
                                {pendingStatus === 'won' && (
                                    <input
                                        type="number"
                                        value={wonAmount}
                                        onChange={e => setWonAmount(e.target.value)}
                                        placeholder="Monto ganado (CLP)"
                                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleTransition}
                                        disabled={transitioning}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
                                    >
                                        {transitioning ? 'Guardando…' : 'Confirmar'}
                                    </button>
                                    <button
                                        onClick={() => { setShowTransition(false); setPendingStatus(null); setNote(''); }}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {opp.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Notas</p>
                        <p className="text-sm text-amber-900">{opp.notes}</p>
                    </div>
                )}

                {/* Touchpoints */}
                <Section title={`Touchpoints (${opp.touchpoints?.length || 0})`} icon={MessageSquare}>
                    {(!opp.touchpoints || opp.touchpoints.length === 0) ? (
                        <p className="text-sm text-gray-400">Sin touchpoints.</p>
                    ) : (
                        <div className="space-y-2">
                            {opp.touchpoints.map(tp => (
                                <div key={tp.id} className="flex items-start gap-3 text-sm">
                                    <span className="mt-0.5 w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="font-medium text-gray-700 capitalize">{tp.source?.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-gray-400 tabular-nums">{fmtDate(tp.occurred_at)}</span>
                                        </div>
                                        {tp.channel_detail && <p className="text-xs text-gray-500 mt-0.5">{tp.channel_detail}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Events timeline */}
                <Section title={`Historial de estado (${opp.events?.length || 0})`} icon={Activity}>
                    {(!opp.events || opp.events.length === 0) ? (
                        <p className="text-sm text-gray-400">Sin historial.</p>
                    ) : (
                        <div className="space-y-3">
                            {opp.events.map(ev => (
                                <div key={ev.id} className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 w-2 h-2 bg-gray-300 rounded-full shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="text-gray-700">
                                                <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[ev.from_status] || ''}`}>
                                                    {STATUS_LABELS[ev.from_status] || ev.from_status}
                                                </span>
                                                {' → '}
                                                <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[ev.to_status] || ''}`}>
                                                    {STATUS_LABELS[ev.to_status] || ev.to_status}
                                                </span>
                                            </span>
                                            <span className="text-xs text-gray-400 tabular-nums">{fmtDate(ev.created_at)}</span>
                                        </div>
                                        {ev.actor && <p className="text-xs text-gray-400 mt-0.5">por {ev.actor}</p>}
                                        {ev.note && <p className="text-xs text-gray-600 mt-0.5 italic">"{ev.note}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Quotes */}
                {opp.quotes?.length > 0 && (
                    <Section title={`Cotizaciones (${opp.quotes.length})`} icon={FileText}>
                        <div className="space-y-2">
                            {opp.quotes.map(q => (
                                <div key={q.id} className="flex items-center justify-between text-sm py-1">
                                    <div>
                                        <span className="font-medium text-gray-700">#{q.id}</span>
                                        {q.customer_name && <span className="text-gray-400 ml-2">{q.customer_name}</span>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 capitalize">{q.status}</span>
                                        <span className="text-xs text-gray-400 tabular-nums">{fmtDate(q.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Follow-ups */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CalendarCheck size={15} className="text-gray-400" />
                            Seguimientos ({followUps.filter(f => f.status === 'pending').length} pendientes)
                        </h2>
                        <button
                            onClick={() => setShowFuForm(v => !v)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Plus size={13} />
                            {showFuForm ? 'Cancelar' : 'Agregar'}
                        </button>
                    </div>

                    {fuError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs mb-3">{fuError}</div>
                    )}

                    {/* Create form */}
                    {showFuForm && (
                        <form onSubmit={handleCreateFu} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                                    <select
                                        value={fuForm.type}
                                        onChange={e => setFuForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        {Object.entries(FOLLOWUP_TYPE_LABELS).map(([v, l]) => (
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Prioridad</label>
                                    <select
                                        value={fuForm.priority}
                                        onChange={e => setFuForm(f => ({ ...f, priority: e.target.value }))}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        <option value="high">Alta</option>
                                        <option value="medium">Media</option>
                                        <option value="low">Baja</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Fecha y hora *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={fuForm.scheduled_at}
                                    onChange={e => setFuForm(f => ({ ...f, scheduled_at: e.target.value }))}
                                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Nota / próxima acción</label>
                                <textarea
                                    value={fuForm.note}
                                    onChange={e => setFuForm(f => ({ ...f, note: e.target.value }))}
                                    rows={2}
                                    placeholder="Ej: Llamar para confirmar medidas…"
                                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={fuSaving}
                                className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                            >
                                {fuSaving ? 'Guardando…' : 'Guardar seguimiento'}
                            </button>
                        </form>
                    )}

                    {/* List */}
                    {fuLoading ? (
                        <div className="text-center text-gray-400 text-sm py-4">Cargando…</div>
                    ) : followUps.length === 0 ? (
                        <p className="text-sm text-gray-400">Sin seguimientos registrados.</p>
                    ) : (
                        <div className="space-y-2">
                            {followUps.map(fu => {
                                const isPast = fu.status === 'pending' && new Date(fu.scheduled_at) < new Date();
                                return (
                                    <div
                                        key={fu.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-opacity ${
                                            fu.status === 'done' || fu.status === 'cancelled'
                                                ? 'opacity-50 bg-gray-50 border-gray-100'
                                                : isPast
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FOLLOWUP_PRIORITY_COLORS[fu.priority] || ''}`}>
                                                    {fu.priority === 'high' ? 'Alta' : fu.priority === 'medium' ? 'Media' : 'Baja'}
                                                </span>
                                                <span className="text-xs text-gray-500">{FOLLOWUP_TYPE_LABELS[fu.type] || fu.type}</span>
                                                <span className="text-xs text-gray-400 tabular-nums ml-auto">
                                                    {fmtDate(fu.scheduled_at)}
                                                </span>
                                            </div>
                                            {fu.note && <p className="text-xs text-gray-500 mt-1 truncate">{fu.note}</p>}
                                            <span className="text-xs text-gray-400">{FOLLOWUP_STATUS_LABELS[fu.status] || fu.status}</span>
                                        </div>
                                        {fu.status === 'pending' && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => markFuDone(fu.id)}
                                                    title="Marcar como realizado"
                                                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => cancelFu(fu.id)}
                                                    title="Cancelar seguimiento"
                                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => deleteFu(fu.id)}
                                            title="Eliminar"
                                            className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

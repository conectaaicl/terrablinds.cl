import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
    Calendar, Clock, ChevronLeft, ChevronRight, Users, CheckCircle2,
    XCircle, AlertCircle, Loader2, RefreshCw, Lock, Unlock, Trash2,
    Phone, Mail, MapPin, MessageCircle, ChevronDown,
} from 'lucide-react';
import api from '../api';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const SERVICE_LABELS = {
    visita_medidas:    'Toma de medidas',
    tecnico_persianas: 'Serv. persianas',
    tecnico_roller:    'Serv. roller',
    tecnico_otros:     'Serv. otros',
};

const STATUS_CONFIG = {
    pending_payment: { label: 'Pendiente pago',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    confirmed:       { label: 'Confirmada',       cls: 'bg-green-100 text-green-700 border-green-200' },
    completed:       { label: 'Completada',       cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    cancelled:       { label: 'Cancelada',        cls: 'bg-red-100 text-red-700 border-red-200' },
};

function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseLocalDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, revenue: 0 });
    const [blockedDays, setBlockedDays] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calendar nav
    const [calMonth, setCalMonth] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    // Filters / tabs
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCalDate, setSelectedCalDate] = useState('');

    // Block day modal
    const [blockDate, setBlockDate] = useState('');
    const [blockReason, setBlockReason] = useState('');
    const [blocking, setBlocking] = useState(false);

    // Expanded booking detail
    const [expanded, setExpanded] = useState(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const from = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
            const to = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${lastDay}`;

            const [bookingsRes, statsRes, blockedRes] = await Promise.all([
                api.get('/api/bookings/admin'),
                api.get('/api/bookings/stats'),
                api.get(`/api/bookings/blocked-days?from=${from}&to=${to}`),
            ]);
            setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
            setStats(statsRes.data || {});
            setBlockedDays(Array.isArray(blockedRes.data) ? blockedRes.data : []);
        } catch (err) {
            console.error('AdminBookings load error:', err);
        } finally {
            setLoading(false);
        }
    }, [calMonth]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // Filtered list
    const filtered = bookings.filter(b => {
        if (filterStatus !== 'all' && b.status !== filterStatus) return false;
        if (selectedCalDate && b.date !== selectedCalDate) return false;
        return true;
    });

    // Calendar data
    const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
    const firstDow = new Date(calMonth.year, calMonth.month, 1).getDay();
    const today = formatDateLocal(new Date());

    const calDays = [];
    for (let i = 0; i < firstDow; i++) calDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
        const isBlocked = blockedDays.some(bd => bd.date === dateStr);
        calDays.push({ day: d, dateStr, count: dayBookings.length, isBlocked });
    }

    const prevMonth = () => setCalMonth(prev =>
        prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
    );
    const nextMonth = () => setCalMonth(prev =>
        prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
    );

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/api/bookings/${id}`, { status });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            setStats(prev => {
                // Quick recalc
                const all = bookings.map(b => b.id === id ? { ...b, status } : b);
                return {
                    ...prev,
                    confirmed: all.filter(b => b.status === 'confirmed').length,
                    pending: all.filter(b => b.status === 'pending_payment').length,
                    completed: all.filter(b => b.status === 'completed').length,
                    cancelled: all.filter(b => b.status === 'cancelled').length,
                    revenue: all.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b)=>s+(b.amount||0),0),
                };
            });
        } catch (err) {
            alert('Error al actualizar estado: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleBlockDay = async (e) => {
        e.preventDefault();
        if (!blockDate) return;
        setBlocking(true);
        try {
            await api.post('/api/bookings/blocked-days', { date: blockDate, reason: blockReason });
            setBlockDate('');
            setBlockReason('');
            loadAll();
        } catch (err) {
            alert('Error al bloquear día: ' + (err.response?.data?.error || err.message));
        } finally { setBlocking(false); }
    };

    const handleUnblockDay = async (id) => {
        try {
            await api.delete(`/api/bookings/blocked-days/${id}`);
            loadAll();
        } catch (err) {
            alert('Error al desbloquear: ' + (err.response?.data?.error || err.message));
        }
    };

    const whatsappLink = (b) => {
        if (!b.client_phone) return null;
        const num = b.client_phone.replace(/\D/g, '');
        const full = num.startsWith('56') ? num : '56' + num;
        const msg = encodeURIComponent(`Hola ${b.client_name}, te contactamos de TerraBlinds sobre tu reserva del ${b.date} a las ${b.time_slot}.`);
        return `https://wa.me/${full}?text=${msg}`;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Visitas técnicas y servicios agendados</p>
                    </div>
                    <button onClick={loadAll} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Actualizar
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: stats.total,     color: 'text-gray-900',    bg: 'bg-gray-50' },
                        { label: 'Confirmadas', value: stats.confirmed, color: 'text-green-700', bg: 'bg-green-50' },
                        { label: 'Pendiente pago', value: stats.pending,   color: 'text-amber-700', bg: 'bg-amber-50' },
                        { label: 'Completadas', value: stats.completed, color: 'text-blue-700',  bg: 'bg-blue-50' },
                        { label: 'Canceladas', value: stats.cancelled, color: 'text-red-700',   bg: 'bg-red-50' },
                        { label: 'Ingresos',   value: `$${(stats.revenue||0).toLocaleString('es-CL')}`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-white`}>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="font-semibold text-gray-900 text-sm">{MONTHS_ES[calMonth.month]} {calMonth.year}</span>
                                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS_ES.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 pb-1">{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-0.5">
                                {calDays.map((cell, i) => {
                                    if (!cell) return <div key={i} />;
                                    const { day, dateStr, count, isBlocked } = cell;
                                    const isToday = dateStr === today;
                                    const isSelected = dateStr === selectedCalDate;

                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => setSelectedCalDate(isSelected ? '' : dateStr)}
                                            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-all
                                                ${isSelected ? 'bg-blue-700 text-white' : ''}
                                                ${isBlocked && !isSelected ? 'bg-red-50 text-red-300' : ''}
                                                ${!isBlocked && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}
                                                ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
                                            `}
                                        >
                                            {day}
                                            {count > 0 && !isSelected && (
                                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                                            )}
                                            {isBlocked && (
                                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedCalDate && (
                                <p className="text-xs text-center text-blue-600 mt-2 font-medium">
                                    Filtrando: {parseLocalDate(selectedCalDate).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    <button onClick={() => setSelectedCalDate('')} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
                                </p>
                            )}
                        </div>

                        {/* Block day form */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" /> Bloquear día</h3>
                            <form onSubmit={handleBlockDay} className="space-y-2">
                                <input
                                    type="date"
                                    value={blockDate}
                                    onChange={e => setBlockDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                                />
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={e => setBlockReason(e.target.value)}
                                    placeholder="Motivo (opcional)"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                                />
                                <button type="submit" disabled={!blockDate || blocking}
                                    className="w-full py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                                    {blocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                                    Bloquear
                                </button>
                            </form>
                        </div>

                        {/* Blocked days list */}
                        {blockedDays.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 text-sm mb-3">Días bloqueados ({MONTHS_ES[calMonth.month]})</h3>
                                <div className="space-y-2">
                                    {blockedDays.map(bd => (
                                        <div key={bd.id} className="flex items-center justify-between gap-2 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">
                                                    {parseLocalDate(bd.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                {bd.reason && <span className="text-gray-400 text-xs ml-1">· {bd.reason}</span>}
                                            </div>
                                            <button onClick={() => handleUnblockDay(bd.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Desbloquear">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bookings list */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Filter tabs */}
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { key: 'all', label: 'Todas' },
                                { key: 'confirmed', label: 'Confirmadas' },
                                { key: 'pending_payment', label: 'Pendiente pago' },
                                { key: 'completed', label: 'Completadas' },
                                { key: 'cancelled', label: 'Canceladas' },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFilterStatus(f.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === f.key ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No hay reservas{selectedCalDate ? ' para este día' : ''}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(b => {
                                    const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.cancelled;
                                    const isExpanded = expanded === b.id;
                                    const wa = whatsappLink(b);

                                    return (
                                        <div key={b.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            {/* Row */}
                                            <div className="flex items-center gap-3 px-4 py-3">
                                                <button onClick={() => setExpanded(isExpanded ? null : b.id)}
                                                    className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 text-sm truncate">{b.client_name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {SERVICE_LABELS[b.service_type] || b.service_type} · {b.date} · {b.time_slot}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                                <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg border ${st.cls}`}>{st.label}</span>
                                                <button onClick={() => setExpanded(isExpanded ? null : b.id)} className="text-gray-300 hover:text-gray-600 flex-shrink-0">
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>

                                            {/* Expanded detail */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                        {b.client_email && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                                <a href={`mailto:${b.client_email}`} className="text-blue-600 hover:underline truncate">{b.client_email}</a>
                                                            </div>
                                                        )}
                                                        {b.client_phone && (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                                {b.client_phone}
                                                            </div>
                                                        )}
                                                        {b.client_address && (
                                                            <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                                                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                                {b.client_address}
                                                            </div>
                                                        )}
                                                        {b.notes && (
                                                            <div className="sm:col-span-2 bg-gray-50 rounded-lg p-2.5 text-gray-600 text-xs">{b.notes}</div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {wa && (
                                                            <a href={wa} target="_blank" rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                                                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                                            </a>
                                                        )}
                                                        {b.status === 'confirmed' && (
                                                            <button onClick={() => handleStatusChange(b.id, 'completed')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Marcar completada
                                                            </button>
                                                        )}
                                                        {['pending_payment', 'confirmed'].includes(b.status) && (
                                                            <button onClick={() => handleStatusChange(b.id, 'cancelled')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                                                                <XCircle className="w-3.5 h-3.5" /> Cancelar
                                                            </button>
                                                        )}
                                                        {b.status === 'cancelled' && (
                                                            <button onClick={() => handleStatusChange(b.id, 'confirmed')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Reactivar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBookings;

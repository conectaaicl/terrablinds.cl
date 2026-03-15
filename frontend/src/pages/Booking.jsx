import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Clock, User, Mail, Phone, MapPin, ChevronLeft, ChevronRight,
    Sparkles, CheckCircle2, Loader2, AlertCircle, Wrench, Ruler, ArrowRight
} from 'lucide-react';
import api from '../api';

const SERVICE_TYPES = [
    { id: 'visita_medidas',    label: 'Visita técnica toma de medidas',  icon: Ruler,  desc: 'Venimos a medir tus ventanas y asesorarte in situ.' },
    { id: 'tecnico_persianas', label: 'Servicio técnico persianas',       icon: Wrench, desc: 'Reparación o ajuste de persianas ya instaladas.' },
    { id: 'tecnico_roller',    label: 'Servicio técnico cortinas roller', icon: Wrench, desc: 'Reparación o ajuste de cortinas roller ya instaladas.' },
    { id: 'tecnico_otros',     label: 'Servicio técnico otros',           icon: Wrench, desc: 'Otro tipo de servicio técnico no listado.' },
];

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

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

export default function Booking() {
    const [step, setStep] = useState(1); // 1=AI/service, 2=calendar, 3=form, 4=paying

    // AI helper
    const [aiMessage, setAiMessage] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiExplanation, setAiExplanation] = useState('');

    // Service selection
    const [serviceType, setServiceType] = useState('');

    // Calendar
    const [calMonth, setCalMonth] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const [blockedDays, setBlockedDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');

    // Form
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Load blocked days for current visible month range
    const loadBlockedDays = useCallback(async (year, month) => {
        const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const to = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
        try {
            const res = await api.get(`/api/bookings/blocked-days?from=${from}&to=${to}`);
            setBlockedDays(res.data.map(d => d.date));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        loadBlockedDays(calMonth.year, calMonth.month);
    }, [calMonth, loadBlockedDays]);

    const loadSlots = async (date) => {
        setSlotsLoading(true);
        setSlots([]);
        setSelectedSlot('');
        try {
            const res = await api.get(`/api/bookings/availability?date=${date}`);
            if (res.data.available) {
                setSlots(res.data.slots);
            } else {
                setSlots([]);
            }
        } catch { setSlots([]); }
        finally { setSlotsLoading(false); }
    };

    const handleDateSelect = (dateStr) => {
        setSelectedDate(dateStr);
        loadSlots(dateStr);
    };

    const handleAiSuggest = async () => {
        if (!aiMessage.trim()) return;
        setAiLoading(true);
        setAiSuggestion(null);
        try {
            const res = await api.post('/api/bookings/suggest', { message: aiMessage });
            setAiSuggestion(res.data.suggestion);
            setAiExplanation(res.data.explanation);
            if (res.data.suggestion) setServiceType(res.data.suggestion);
        } catch { setAiExplanation('Error al consultar al asistente.'); }
        finally { setAiLoading(false); }
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.name || !form.email) {
            setError('Nombre y email son requeridos.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await api.post('/api/bookings', {
                service_type: serviceType,
                date: selectedDate,
                time_slot: selectedSlot,
                client_name: form.name,
                client_email: form.email,
                client_phone: form.phone,
                client_address: form.address,
                notes: form.notes,
            });
            window.location.href = res.data.redirectUrl;
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la reserva.');
            setSubmitting(false);
        }
    };

    // Calendar helpers
    const today = formatDateLocal(new Date());
    const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
    const firstDow = new Date(calMonth.year, calMonth.month, 1).getDay();

    const prevMonth = () => setCalMonth(prev => {
        if (prev.month === 0) return { year: prev.year - 1, month: 11 };
        return { year: prev.year, month: prev.month - 1 };
    });
    const nextMonth = () => setCalMonth(prev => {
        if (prev.month === 11) return { year: prev.year + 1, month: 0 };
        return { year: prev.year, month: prev.month + 1 };
    });

    const isPast = (dateStr) => dateStr < today;
    const isBlocked = (dateStr) => blockedDays.includes(dateStr);

    const calDays = [];
    for (let i = 0; i < firstDow; i++) calDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calDays.push({ day: d, dateStr });
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar mínima */}
            <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <Link to="/" className="text-blue-700 font-bold text-lg">TerraBlinds</Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 text-sm">Agendar servicio técnico</span>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[
                        { n: 1, label: 'Servicio' },
                        { n: 2, label: 'Fecha y hora' },
                        { n: 3, label: 'Tus datos' },
                    ].map(({ n, label }) => (
                        <React.Fragment key={n}>
                            <div className={`flex flex-col items-center gap-1 ${step >= n ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > n ? 'bg-green-500 text-white' : step === n ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > n ? '✓' : n}
                                </div>
                                <span className="text-[11px] text-gray-500 hidden sm:block">{label}</span>
                            </div>
                            {n < 3 && <div className={`flex-1 h-0.5 max-w-[60px] ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* STEP 1: Service + AI */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">¿Qué servicio necesitas?</h1>
                            <p className="text-gray-500 text-sm mt-1">Valor de visita técnica: <strong>$15.000 CLP</strong> (descontable si realizas la instalación con nosotros)</p>
                        </div>

                        {/* AI assistant */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-800">Asistente IA — ¿No sabes cuál elegir?</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiMessage}
                                    onChange={e => setAiMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
                                    placeholder="Ej: Mi persiana no sube bien, se traba al bajarla"
                                    className="flex-1 text-sm border border-blue-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    onClick={handleAiSuggest}
                                    disabled={aiLoading || !aiMessage.trim()}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
                                >
                                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar'}
                                </button>
                            </div>
                            {aiExplanation && (
                                <div className={`mt-3 text-sm rounded-lg px-3 py-2 ${aiSuggestion ? 'bg-white text-green-700 border border-green-200' : 'text-blue-700'}`}>
                                    {aiSuggestion && <span className="font-semibold">Sugerencia: </span>}
                                    {aiExplanation}
                                </div>
                            )}
                        </div>

                        {/* Service cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SERVICE_TYPES.map(({ id, label, icon: Icon, desc }) => (
                                <button
                                    key={id}
                                    onClick={() => setServiceType(id)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${serviceType === id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${serviceType === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm leading-tight">{label}</p>
                                            <p className="text-xs text-gray-500 mt-1">{desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!serviceType}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                            Continuar <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* STEP 2: Calendar + time slot */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Elige fecha y hora</h2>
                                <p className="text-sm text-gray-500">{SERVICE_TYPES.find(s => s.id === serviceType)?.label}</p>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="font-semibold text-gray-900">
                                    {MONTHS_ES[calMonth.month]} {calMonth.year}
                                </span>
                                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            {/* Days of week */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS_ES.map(d => (
                                    <div key={d} className="text-center text-[11px] font-semibold text-gray-400 pb-2">{d}</div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {calDays.map((cell, i) => {
                                    if (!cell) return <div key={i} />;
                                    const { day, dateStr } = cell;
                                    const past = isPast(dateStr);
                                    const blocked = isBlocked(dateStr);
                                    const selected = dateStr === selectedDate;
                                    const disabled = past || blocked;

                                    return (
                                        <button
                                            key={dateStr}
                                            disabled={disabled}
                                            onClick={() => handleDateSelect(dateStr)}
                                            className={`aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center
                                                ${selected ? 'bg-blue-700 text-white shadow-sm' : ''}
                                                ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
                                                ${!disabled && !selected ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : ''}
                                                ${blocked && !past ? 'line-through text-gray-300' : ''}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-gray-400 mt-3 text-center">Días tachados no están disponibles</p>
                        </div>

                        {/* Time slots */}
                        {selectedDate && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-gray-900 text-sm">
                                        Horarios disponibles — {parseLocalDate(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                                {slotsLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    </div>
                                ) : slots.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-2">No hay horarios disponibles para este día.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {slots.map(({ slot, available }) => (
                                            <button
                                                key={slot}
                                                disabled={!available}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all border
                                                    ${selectedSlot === slot ? 'bg-blue-700 text-white border-blue-700' : ''}
                                                    ${available && selectedSlot !== slot ? 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700' : ''}
                                                    ${!available ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                                                `}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedDate || !selectedSlot}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                            Continuar <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* STEP 3: Client form */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Tus datos de contacto</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {SERVICE_TYPES.find(s => s.id === serviceType)?.label} · {parseLocalDate(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedSlot} hrs
                                </p>
                            </div>
                        </div>

                        {/* Summary card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
                            <div className="flex justify-between">
                                <span>Valor visita técnica</span>
                                <strong>$15.000 CLP</strong>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">Descontable si realizas la instalación con nosotros.</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Nombre completo *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Tu nombre completo"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="tu@email.com"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</label>
                                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+56 9 1234 5678"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Dirección</label>
                                <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                    placeholder="Calle, número, comuna"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1">Comentarios (opcional)</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Indica cualquier detalle útil para la visita..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none" />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !form.name || !form.email}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {submitting ? 'Redirigiendo al pago...' : 'Ir al pago → $15.000 CLP'}
                        </button>

                        <p className="text-xs text-center text-gray-400">
                            Serás redirigido a Flow.cl para pagar de forma segura.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

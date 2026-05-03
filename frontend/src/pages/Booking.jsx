import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, User, Mail, Phone, MapPin, ChevronLeft, ChevronRight,
    Sparkles, CheckCircle2, Loader2, AlertCircle, Wrench, Ruler, ArrowRight,
    Shield, Star, Zap, MessageCircle, CheckCheck, Home,
} from 'lucide-react';
import api from '../api';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

/* ─── Constants ───────────────────────────────────────────────────── */
const SERVICE_TYPES = [
    {
        id: 'visita_medidas',
        label: 'Toma de medidas',
        subtitle: 'Visita técnica gratuita en instalaciones',
        icon: Ruler,
        color: 'blue',
        price: 15000,
        duration: '30–60 min',
        desc: 'Un técnico va a tu domicilio o local, mide todas las ventanas y te asesora sobre el producto ideal.',
        perks: ['Asesoría personalizada', 'Presupuesto en el acto', 'Sin compromiso de compra'],
    },
    {
        id: 'instalacion',
        label: 'Instalación de cortinas',
        subtitle: 'Instalación profesional a domicilio',
        icon: Home,
        color: 'emerald',
        price: 0,
        duration: '1–3 hrs',
        desc: 'Instalamos tus cortinas o persianas ya adquiridas con nosotros. Incluye fijaciones y ajuste fino.',
        perks: ['Garantía de instalación', 'Materiales incluidos', 'Limpieza post-instalación'],
    },
    {
        id: 'tecnico_persianas',
        label: 'Servicio técnico persianas',
        subtitle: 'Reparación o ajuste de persianas',
        icon: Wrench,
        color: 'amber',
        price: 15000,
        duration: '45–90 min',
        desc: 'Revisión, reparación y ajuste de persianas con problemas de mecanismo, láminas o motor.',
        perks: ['Diagnóstico incluido', 'Presupuesto previo', 'Repuestos originales'],
    },
    {
        id: 'tecnico_roller',
        label: 'Servicio técnico roller',
        subtitle: 'Reparación de cortinas roller',
        icon: Wrench,
        color: 'violet',
        price: 15000,
        duration: '45–90 min',
        desc: 'Ajuste de tensión, cambio de tela, reparación de mecanismo o motor en cortinas roller.',
        perks: ['Diagnóstico incluido', 'Presupuesto previo', 'Garantía del servicio'],
    },
    {
        id: 'automatizacion',
        label: 'Instalación de motor',
        subtitle: 'Motorización y automatización',
        icon: Zap,
        color: 'orange',
        price: 0,
        duration: '1–2 hrs',
        desc: 'Instalamos motor tubular en tu cortina o persiana existente. Incluye control remoto y configuración.',
        perks: ['Motor + control remoto', 'Configuración incluida', 'Integración inteligente'],
    },
    {
        id: 'tecnico_otros',
        label: 'Otro servicio técnico',
        subtitle: 'Consulta personalizada',
        icon: Shield,
        color: 'slate',
        price: 15000,
        duration: 'A convenir',
        desc: 'Cualquier otro servicio no listado: toldos, cortinas metálicas, mantención general.',
        perks: ['Diagnóstico gratis', 'Presupuesto sin compromiso', 'Atención personalizada'],
    },
];

const COLOR = {
    blue:    { border: 'border-blue-500',    bg: 'bg-blue-50',    icon: 'bg-blue-600 text-white',    badge: 'bg-blue-100 text-blue-700',    btn: 'bg-blue-600 hover:bg-blue-700',    ring: 'ring-blue-500' },
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', icon: 'bg-emerald-600 text-white', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'ring-emerald-500' },
    amber:   { border: 'border-amber-500',   bg: 'bg-amber-50',   icon: 'bg-amber-500 text-white',   badge: 'bg-amber-100 text-amber-700',   btn: 'bg-amber-500 hover:bg-amber-600',   ring: 'ring-amber-500' },
    violet:  { border: 'border-violet-500',  bg: 'bg-violet-50',  icon: 'bg-violet-600 text-white',  badge: 'bg-violet-100 text-violet-700',  btn: 'bg-violet-600 hover:bg-violet-700',  ring: 'ring-violet-500' },
    orange:  { border: 'border-orange-500',  bg: 'bg-orange-50',  icon: 'bg-orange-500 text-white',  badge: 'bg-orange-100 text-orange-700',  btn: 'bg-orange-500 hover:bg-orange-600',  ring: 'ring-orange-500' },
    slate:   { border: 'border-slate-400',   bg: 'bg-slate-50',   icon: 'bg-slate-600 text-white',   badge: 'bg-slate-100 text-slate-700',   btn: 'bg-slate-600 hover:bg-slate-700',   ring: 'ring-slate-400' },
};

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
function fmtDate(str) {
    return parseLocalDate(str).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtCLP(n) {
    return n > 0 ? `$${parseInt(n).toLocaleString('es-CL')} CLP` : 'Incluido';
}

/* ─── Step indicator ──────────────────────────────────────────────── */
const STEPS = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmar'];
function StepBar({ step }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                    <React.Fragment key={n}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                ${done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : ''}
                                ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100' : ''}
                                ${!done && !active ? 'bg-gray-100 text-gray-400' : ''}
                            `}>
                                {done ? <CheckCheck className="w-4 h-4" /> : n}
                            </div>
                            <span className={`text-[10px] font-semibold hidden sm:block ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 w-12 sm:w-16 mx-1 mb-4 rounded-full transition-all ${step > n ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function Booking() {
    const [step, setStep] = useState(1);

    // AI
    const [aiMessage, setAiMessage] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiExplanation, setAiExplanation] = useState('');

    // Service
    const [serviceType, setServiceType] = useState('');
    const serviceObj = SERVICE_TYPES.find(s => s.id === serviceType);

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

    const loadBlockedDays = useCallback(async (year, month) => {
        const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const to = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
        try {
            const res = await api.get(`/api/bookings/blocked-days?from=${from}&to=${to}`);
            setBlockedDays(res.data.map(d => d.date));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadBlockedDays(calMonth.year, calMonth.month); }, [calMonth, loadBlockedDays]);

    const loadSlots = async (date) => {
        setSlotsLoading(true); setSlots([]); setSelectedSlot('');
        try {
            const res = await api.get(`/api/bookings/availability?date=${date}`);
            setSlots(res.data.available ? res.data.slots : []);
        } catch { setSlots([]); }
        finally { setSlotsLoading(false); }
    };

    const handleDateSelect = (dateStr) => { setSelectedDate(dateStr); loadSlots(dateStr); };

    const handleAiSuggest = async () => {
        if (!aiMessage.trim()) return;
        setAiLoading(true); setAiSuggestion(null);
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
        if (!form.name || !form.email) { setError('Nombre y email son requeridos.'); return; }
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
    const prevMonth = () => setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
    const nextMonth = () => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
    const isPast = (ds) => ds < today;
    const isBlocked = (ds) => blockedDays.includes(ds);
    const isWeekend = (ds) => { const d = new Date(ds + 'T12:00:00'); return d.getDay() === 0 || d.getDay() === 6; };

    const calDays = [];
    for (let i = 0; i < firstDow; i++) calDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calDays.push({ day: d, dateStr });
    }

    const availableSlots = slots.filter(s => s.available).length;

    return (
        <Layout>
            <SEO title="Agendar Servicio — TerraBlinds" description="Agenda una visita técnica, instalación o servicio de mantención. Elige fecha y hora disponible online." path="/agendar" />

            {/* Hero mini */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-10 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4" /> Agenda online · Respuesta inmediata
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Agenda tu servicio</h1>
                    <p className="text-blue-200 text-sm">Elige servicio, fecha y hora. Confirmación automática por email.</p>
                </div>
            </div>

            <div className="bg-gray-50 min-h-screen py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <StepBar step={step} />

                    {/* ── STEP 1: Service ──────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">¿Qué servicio necesitas?</h2>
                                <p className="text-sm text-gray-500">Selecciona el tipo de visita y te asignamos el técnico ideal.</p>
                            </div>

                            {/* AI assistant */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-blue-900">Asistente IA — ¿No sabes cuál elegir?</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aiMessage}
                                        onChange={e => setAiMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
                                        placeholder="Ej: Mi persiana no sube, se traba al bajarla..."
                                        className="flex-1 text-sm border border-blue-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                                    />
                                    <button
                                        onClick={handleAiSuggest}
                                        disabled={aiLoading || !aiMessage.trim()}
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                                    >
                                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {aiLoading ? '' : 'Consultar'}
                                    </button>
                                </div>
                                {aiExplanation && (
                                    <div className={`mt-3 text-sm rounded-xl px-4 py-3 flex items-start gap-2 ${aiSuggestion ? 'bg-white text-emerald-700 border border-emerald-200' : 'text-blue-700 bg-blue-100'}`}>
                                        {aiSuggestion && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                        <span>{aiSuggestion ? <><strong>Sugerencia: </strong></> : ''}{aiExplanation}</span>
                                    </div>
                                )}
                            </div>

                            {/* Service cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SERVICE_TYPES.map(svc => {
                                    const c = COLOR[svc.color];
                                    const selected = serviceType === svc.id;
                                    return (
                                        <button
                                            key={svc.id}
                                            onClick={() => setServiceType(svc.id)}
                                            className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md
                                                ${selected ? `${c.border} ${c.bg} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'}
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${selected ? c.icon : 'bg-gray-100 text-gray-500'}`}>
                                                    <svc.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{svc.label}</p>
                                                        {selected && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{svc.subtitle}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                                                            {svc.price > 0 ? fmtCLP(svc.price) : 'Sin costo'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />{svc.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selected && (
                                                <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-1">
                                                    {svc.perks.map(p => (
                                                        <div key={p} className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <span className="text-emerald-500">✓</span> {p}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!serviceType}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200"
                            >
                                Elegir fecha y hora <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Calendar ─────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(1)} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Elige fecha y hora</h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        {serviceObj && <><serviceObj.icon className="w-3 h-3" /> {serviceObj.label}</>}
                                    </p>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Month nav */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-gray-900">{MONTHS_ES[calMonth.month]} {calMonth.year}</span>
                                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="px-4 pb-4 pt-3">
                                    {/* Day labels */}
                                    <div className="grid grid-cols-7 mb-2">
                                        {DAYS_ES.map((d, i) => (
                                            <div key={d} className={`text-center text-[11px] font-bold pb-2 ${i === 0 || i === 6 ? 'text-red-300' : 'text-gray-400'}`}>{d}</div>
                                        ))}
                                    </div>

                                    {/* Days */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calDays.map((cell, i) => {
                                            if (!cell) return <div key={i} />;
                                            const { day, dateStr } = cell;
                                            const past = isPast(dateStr);
                                            const blocked = isBlocked(dateStr);
                                            const weekend = isWeekend(dateStr);
                                            const selected = dateStr === selectedDate;
                                            const isToday = dateStr === today;
                                            const disabled = past || blocked || weekend;

                                            return (
                                                <button
                                                    key={dateStr}
                                                    disabled={disabled}
                                                    onClick={() => handleDateSelect(dateStr)}
                                                    className={`aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center relative
                                                        ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : ''}
                                                        ${isToday && !selected ? 'ring-2 ring-blue-400 text-blue-700' : ''}
                                                        ${disabled ? 'text-gray-200 cursor-not-allowed' : ''}
                                                        ${weekend && !past ? 'text-gray-200' : ''}
                                                        ${!disabled && !selected ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-105' : ''}
                                                        ${blocked && !past ? 'line-through' : ''}
                                                    `}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="px-4 pb-3 flex items-center gap-4 text-[11px] text-gray-400">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" />Seleccionado</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-blue-400 inline-block" />Hoy</span>
                                    <span>Fin de semana no disponible</span>
                                </div>
                            </div>

                            {/* Time slots */}
                            {selectedDate && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span className="font-bold text-gray-900 text-sm">Horarios disponibles</span>
                                        </div>
                                        {!slotsLoading && availableSlots > 0 && (
                                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                {availableSlots} disponible{availableSlots !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{fmtDate(selectedDate)}</p>

                                    {slotsLoading ? (
                                        <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-sm">Cargando horarios...</span>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="text-center py-6">
                                            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No hay horarios disponibles para este día.</p>
                                            <p className="text-xs text-gray-400 mt-1">Elige otro día en el calendario.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {slots.map(({ slot, available }) => (
                                                <button
                                                    key={slot}
                                                    disabled={!available}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-3 rounded-xl text-sm font-bold transition-all border-2
                                                        ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105' : ''}
                                                        ${available && selectedSlot !== slot ? 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50' : ''}
                                                        ${!available ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 line-through' : ''}
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
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all shadow-lg shadow-blue-200"
                            >
                                Ingresar mis datos <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── STEP 3: Client form ───────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(2)} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Tus datos de contacto</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Para confirmar tu reserva y enviarte recordatorio</p>
                                </div>
                            </div>

                            {/* Mini summary */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {serviceObj && <serviceObj.icon className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 text-sm">
                                    <p className="font-bold text-blue-900">{serviceObj?.label}</p>
                                    <p className="text-blue-700 text-xs mt-0.5">
                                        {selectedDate && fmtDate(selectedDate)} · {selectedSlot} hrs
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-blue-800">
                                    {serviceObj?.price > 0 ? fmtCLP(serviceObj.price) : 'Sin costo'}
                                </span>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                                {[
                                    { key: 'name',    label: 'Nombre completo',  icon: User,    type: 'text',  placeholder: 'Tu nombre completo',      required: true },
                                    { key: 'email',   label: 'Email',            icon: Mail,    type: 'email', placeholder: 'tu@email.com',             required: true },
                                    { key: 'phone',   label: 'Teléfono / WhatsApp', icon: Phone,  type: 'tel',   placeholder: '+56 9 1234 5678',         required: false },
                                    { key: 'address', label: 'Dirección de la visita', icon: MapPin, type: 'text', placeholder: 'Calle, número, comuna',  required: false },
                                ].map(({ key, label, icon: Icon, type, placeholder, required }) => (
                                    <div key={key}>
                                        <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                            <Icon className="w-3.5 h-3.5 text-gray-400" /> {label} {required && <span className="text-red-400">*</span>}
                                        </label>
                                        <input
                                            type={type}
                                            value={form[key]}
                                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Comentarios adicionales</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Indica cualquier detalle útil para la visita (piso, depto, horario preferido, etc.)"
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => { if (!form.name || !form.email) { setError('Nombre y email son requeridos.'); return; } setError(''); setStep(4); }}
                                disabled={!form.name || !form.email}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all shadow-lg shadow-blue-200"
                            >
                                Revisar y confirmar <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── STEP 4: Confirmation summary ─────────────────── */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(3)} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Confirma tu reserva</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Revisa los datos antes de continuar al pago</p>
                                </div>
                            </div>

                            {/* Full summary card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className={`px-5 py-4 ${serviceObj ? COLOR[serviceObj.color].bg : 'bg-blue-50'} border-b border-gray-100`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${serviceObj ? COLOR[serviceObj.color].icon : 'bg-blue-600 text-white'}`}>
                                            {serviceObj && <serviceObj.icon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{serviceObj?.label}</p>
                                            <p className="text-xs text-gray-500">{serviceObj?.desc}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {[
                                        { icon: Calendar, label: 'Fecha', value: selectedDate ? fmtDate(selectedDate) : '' },
                                        { icon: Clock,    label: 'Hora',  value: `${selectedSlot} hrs` },
                                        { icon: User,     label: 'Nombre', value: form.name },
                                        { icon: Mail,     label: 'Email',  value: form.email },
                                        ...(form.phone   ? [{ icon: Phone,  label: 'Teléfono', value: form.phone }]   : []),
                                        ...(form.address ? [{ icon: MapPin, label: 'Dirección', value: form.address }] : []),
                                        ...(form.notes   ? [{ icon: MessageCircle, label: 'Notas', value: form.notes }] : []),
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="px-5 py-3.5 flex items-start gap-3">
                                            <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs font-semibold text-gray-500 w-20 flex-shrink-0">{label}</span>
                                            <span className="text-sm text-gray-900 font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {serviceObj?.price > 0 && (
                                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Total a pagar</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Descontable si realizas la instalación con nosotros</p>
                                        </div>
                                        <span className="text-xl font-black text-blue-700">{fmtCLP(serviceObj.price)}</span>
                                    </div>
                                )}
                                {serviceObj?.price === 0 && (
                                    <div className="px-5 py-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
                                        <p className="text-sm font-bold text-emerald-800">Sin costo de visita</p>
                                        <span className="text-lg font-black text-emerald-700">Gratis</span>
                                    </div>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Shield, text: 'Pago 100% seguro · Flow.cl' },
                                    { icon: CheckCircle2, text: 'Confirmación inmediata por email' },
                                    { icon: Star, text: 'Técnicos certificados' },
                                ].map(b => (
                                    <div key={b.text} className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
                                        <b.icon className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                                        <p className="text-[10px] text-gray-600 leading-tight font-medium">{b.text}</p>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-base hover:bg-blue-700 disabled:opacity-60 transition-all shadow-xl shadow-blue-300 hover:scale-[1.01]"
                            >
                                {submitting
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                    : serviceObj?.price > 0
                                        ? <>Ir al pago → {fmtCLP(serviceObj.price)} <ArrowRight className="w-5 h-5" /></>
                                        : <>Confirmar reserva <CheckCircle2 className="w-5 h-5" /></>
                                }
                            </button>

                            {serviceObj?.price > 0 && (
                                <p className="text-xs text-center text-gray-400">
                                    Serás redirigido a <strong>Flow.cl</strong> para pagar de forma segura con tarjeta, débito o transferencia.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Footer info */}
                    <div className="mt-10 text-center text-xs text-gray-400 space-y-1">
                        <p>¿Preguntas? Escríbenos por <Link to="/contact" className="text-blue-500 hover:underline">email</Link> o WhatsApp</p>
                        <p><Link to="/" className="hover:text-gray-600">← Volver al inicio</Link></p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

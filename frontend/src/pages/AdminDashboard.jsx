import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Package, ShoppingCart, Users, Clock, TrendingUp, DollarSign, ArrowRight, Zap, MessageCircle, RefreshCw, Activity, AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';
import api from '../api';

const LOGO_URL = '/uploads/image-1773550576065-529383678.jpeg';

const STATUS_LABELS = {
    pending:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    contacted: { label: 'Contactado',  cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted:  { label: 'Aceptada',    cls: 'bg-green-100 text-green-700 border-green-200' },
    rejected:  { label: 'Rechazada',   cls: 'bg-red-100 text-red-700 border-red-200' },
    completed: { label: 'Completada',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

// ── Growth Engine Widget helpers ─────────────────────────────────────────────

function geColor(health) {
    if (!health) return 'gray';
    if (health.ge_severity === 'critical' || (health.outbox?.failed > 0)) return 'red';
    if (health.stale_opportunities > 0 || (health.outbox?.pending > 5)) return 'yellow';
    return 'green';
}

const GE_COLORS = {
    green:  { bg: 'bg-green-50',   border: 'border-green-200', dot: 'bg-green-500',  text: 'text-green-700',  label: 'OPERATIVO' },
    yellow: { bg: 'bg-yellow-50',  border: 'border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700', label: 'ADVERTENCIA' },
    red:    { bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-500',    text: 'text-red-700',    label: 'CAÍDO' },
    gray:   { bg: 'bg-gray-50',    border: 'border-gray-200',   dot: 'bg-gray-400',   text: 'text-gray-500',   label: 'CARGANDO...' },
};

const GrowthWidget = ({ health, leadStats, dashboard, loading }) => {
    const [showDetails, setShowDetails] = useState(false);
    const color = loading ? 'gray' : geColor(health);
    const c = GE_COLORS[color];
    const fmt = n => n == null ? '–' : Number(n).toLocaleString('es-CL');
    const fmtDate = d => d ? new Date(d).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '–';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className={`px-5 py-4 flex items-center justify-between border-b ${c.border} ${c.bg}`}>
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-800 text-sm">Motor de Crecimiento</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot} ${loading ? 'animate-pulse' : ''}`} />
                    <span className={`font-bold text-xs tracking-wide ${c.text}`}>{c.label}</span>
                    <button onClick={() => setShowDetails(s => !s)} className="ml-2 text-gray-400 hover:text-gray-600">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Details panel (collapsible) */}
            {showDetails && health && (
                <div className={`px-5 py-3 border-b ${c.border} ${c.bg} text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-2`}>
                    <div><span className="font-semibold text-gray-500 uppercase text-[10px] block">Worker</span>{health.ge_status}</div>
                    <div><span className="font-semibold text-gray-500 uppercase text-[10px] block">Outbox pendiente</span>{fmt(health.outbox?.pending)}</div>
                    <div><span className="font-semibold text-gray-500 uppercase text-[10px] block">Outbox fallidos</span>{fmt(health.outbox?.failed)}</div>
                    <div><span className="font-semibold text-gray-500 uppercase text-[10px] block">Verificado</span>{fmtDate(health.checked_at)}</div>
                </div>
            )}

            {/* Body: 3 panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                {/* Panel 1: Technical status */}
                <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Estado Técnico</p>
                    <div className="space-y-2">
                        {[
                            { label: 'Servidor',        ok: health ? health.ge_severity === 'ok' : null },
                            { label: 'Outbox',          ok: health ? (health.outbox?.failed === 0) : null },
                            { label: 'Opps estancadas', ok: health ? health.stale_opportunities === 0 : null, warn: health?.stale_opportunities > 0 },
                        ].map(({ label, ok, warn }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{label}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    ok === null ? 'bg-gray-100 text-gray-400'
                                    : ok ? 'bg-green-100 text-green-700'
                                    : warn ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                    {ok === null ? '...' : ok ? 'OK' : warn ? 'Advertencia' : 'Error'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 2: Lead reception */}
                <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Recepción de Leads</p>
                    {leadStats ? (
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hoy</span>
                                <span className="font-bold text-gray-800">{fmt(leadStats.contacts.today)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Últimos 7 días</span>
                                <span className="font-bold text-gray-800">{fmt(leadStats.contacts.last_7d)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Últimos 30 días</span>
                                <span className="font-bold text-gray-800">{fmt(leadStats.contacts.last_30d)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Convertidos a Opp.</span>
                                <span className="font-bold text-gray-800">{fmt(leadStats.contacts.converted_to_opportunity)}</span>
                            </div>
                            <div className="pt-1 border-t border-gray-100 flex justify-between">
                                <span className="text-gray-400 text-xs">Último lead</span>
                                <span className="text-xs text-gray-500">{fmtDate(leadStats.contacts.last_at)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-xs">Cargando...</div>
                    )}
                    <p className="text-[10px] text-gray-300 mt-2">Fuente: tabla contacts (persiste aunque se borre el lead)</p>
                </div>

                {/* Panel 3: Commercial pipeline */}
                <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Pipeline Comercial</p>
                    {dashboard ? (
                        <div className="space-y-1.5 text-sm">
                            {[
                                { label: 'Nuevas',       value: dashboard.opportunities.new,  cls: 'text-blue-700 bg-blue-50' },
                                { label: 'En proceso',   value: dashboard.opportunities.open - dashboard.opportunities.new, cls: 'text-indigo-700 bg-indigo-50' },
                                { label: 'Ganadas',      value: dashboard.opportunities.won,  cls: 'text-green-700 bg-green-50' },
                                { label: 'Perdidas',     value: dashboard.opportunities.lost, cls: 'text-red-700 bg-red-50' },
                            ].map(({ label, value, cls }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-gray-500">{label}</span>
                                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${cls}`}>{fmt(value)}</span>
                                </div>
                            ))}
                            {dashboard.revenue?.won > 0 && (
                                <div className="pt-1 border-t border-gray-100 flex justify-between">
                                    <span className="text-gray-400 text-xs">Ingresos ganados</span>
                                    <span className="text-xs font-bold text-green-700">${fmt(dashboard.revenue.won)}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-xs">Cargando...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalQuotes: 0, newLeads: 0, activeProducts: 0, pendingQuotes: 0, totalRevenue: 0, conversionRate: 0 });
    const [allQuotes, setAllQuotes] = useState([]);
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [systemStatus, setSystemStatus] = useState({ backend: null, db: null });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [geHealth, setGeHealth] = useState(null);
    const [geLeadStats, setGeLeadStats] = useState(null);
    const [geDashboard, setGeDashboard] = useState(null);
    const [geLoading, setGeLoading] = useState(true);

    useEffect(() => { fetchAll(); checkSystemStatus(); fetchGE(); }, []);

    const fetchGE = async () => {
        setGeLoading(true);
        try {
            const [h, ls, d] = await Promise.allSettled([
                api.get('/api/growth/health'),
                api.get('/api/growth/lead-stats'),
                api.get('/api/growth/dashboard'),
            ]);
            if (h.status === 'fulfilled')  setGeHealth(h.value.data);
            if (ls.status === 'fulfilled') setGeLeadStats(ls.value.data);
            if (d.status === 'fulfilled')  setGeDashboard(d.value.data);
        } finally {
            setGeLoading(false);
        }
    };

    const checkSystemStatus = async () => {
        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                const data = await res.json();
                setSystemStatus({ backend: true, db: data.db === 'connected' });
            } else {
                setSystemStatus({ backend: false, db: false });
            }
        } catch {
            setSystemStatus({ backend: false, db: false });
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [productsRes, quotesRes] = await Promise.all([api.get('/api/products'), api.get('/api/quotes')]);
            const products = productsRes.data;
            const quotes = quotesRes.data;
            const activeProducts = products.filter(p => p.is_active).length;
            const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
            const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
            const newLeads = quotes.filter(q => new Date(q.created_at) > sevenDaysAgo).length;
            const totalRevenue = quotes.filter(q => q.status === 'accepted' || q.status === 'completed').reduce((s, q) => s + parseFloat(q.total_amount || 0), 0);
            const accepted = quotes.filter(q => q.status === 'accepted').length;
            setStats({ totalQuotes: quotes.length, newLeads, activeProducts, pendingQuotes, totalRevenue, conversionRate: quotes.length > 0 ? ((accepted / quotes.length) * 100).toFixed(1) : 0 });
            setAllQuotes(quotes);
            setRecentQuotes(quotes.slice(0, 6));
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatusDot = ({ ok, label }) => (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${ok === null ? 'bg-gray-300 animate-pulse' : ok ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 flex-1">{label}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok === null ? 'bg-gray-100 text-gray-400' : ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {ok === null ? '...' : ok ? 'OK' : 'Error'}
            </span>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color, bg, onClick, subtitle }) => (
        <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
                <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );

    const whatsappLink = (quote) => {
        const phone = (quote.customer_phone || '').replace(/\D/g, '');
        if (!phone) return null;
        const num = phone.startsWith('56') ? phone : '56' + phone;
        const msg = encodeURIComponent(`Hola ${quote.customer_name}, te contactamos de TerraBlinds sobre tu cotización #${quote.id} por $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}. ¿Cómo podemos ayudarte?`);
        return `https://wa.me/${num}?text=${msg}`;
    };

    return (
        <AdminLayout>
            {/* Welcome Banner */}
            <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 gap-4">
                    <div className="flex items-center gap-5">
                        <img src={LOGO_URL} alt="TerraBlinds" className="h-16 w-auto object-contain rounded-xl shadow-lg" />
                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">Panel de Administración</h1>
                            <p className="text-blue-200 text-sm mt-0.5">Diseño y Protección a Tu Medida</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-blue-300 text-xs hidden sm:block">{lastUpdated ? `Actualizado: ${lastUpdated.toLocaleTimeString('es-CL')}` : ''}</p>
                        <button onClick={() => { fetchAll(); checkSystemStatus(); fetchGE(); }} className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-medium text-white transition-colors backdrop-blur-sm">
                            <RefreshCw className="w-4 h-4" /> Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                    <p className="text-gray-400 text-sm">Calculando estadísticas...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Cotizaciones" value={stats.totalQuotes} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" onClick={() => navigate('/admin/quotes')} subtitle="Histórico completo" />
                        <StatCard title="Nuevos Leads" value={stats.newLeads} icon={Users} color="text-green-600" bg="bg-green-50" onClick={() => navigate('/admin/quotes')} subtitle="Últimos 7 días" />
                        <StatCard title="Productos Activos" value={stats.activeProducts} icon={Package} color="text-purple-600" bg="bg-purple-50" onClick={() => navigate('/admin/products')} subtitle="En catálogo" />
                        <StatCard title="Por Atender" value={stats.pendingQuotes} icon={Clock} color="text-orange-600" bg="bg-orange-50" onClick={() => navigate('/admin/quotes')} subtitle="Requieren seguimiento" />
                    </div>

                    {/* Revenue + Conversion + System Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-5 h-5 text-blue-200" />
                                <p className="text-blue-100 text-sm font-medium">Ingresos Estimados</p>
                            </div>
                            <h2 className="text-3xl font-extrabold">${stats.totalRevenue.toLocaleString('es-CL')}</h2>
                            <p className="text-blue-200 text-xs mt-2">Cotizaciones aceptadas + completadas</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <p className="text-gray-500 text-sm font-medium">Tasa de Conversión</p>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{stats.conversionRate}%</h2>
                            <div className="mt-3 bg-gray-100 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(stats.conversionRate, 100)}%` }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Cotizaciones → Aceptadas</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <p className="text-gray-500 text-sm font-medium">Estado del Sistema</p>
                            </div>
                            <div className="space-y-3">
                                <StatusDot ok={systemStatus.backend} label="Servidor backend" />
                                <StatusDot ok={systemStatus.db} label="Base de datos" />
                                <StatusDot ok={true} label="Sitio web público" />
                            </div>
                        </div>
                    </div>

                    {/* Growth Engine Widget */}
                    <GrowthWidget
                        health={geHealth}
                        leadStats={geLeadStats}
                        dashboard={geDashboard}
                        loading={geLoading}
                    />

                    {/* Estado por categoría */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.entries(STATUS_LABELS).map(([key, { label, cls }]) => {
                            const count = allQuotes.filter(q => q.status === key).length;
                            return (
                                <button key={key} onClick={() => navigate('/admin/quotes')} className={`p-4 rounded-xl border ${cls} text-center hover:opacity-90 transition-opacity`}>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-xs font-semibold mt-1">{label}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Recent Quotes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 text-lg">Cotizaciones Recientes</h2>
                            <button onClick={() => navigate('/admin/quotes')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                                Ver todas <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">#</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Monto</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentQuotes.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-400">Aún no hay cotizaciones.</td></tr>
                                    ) : recentQuotes.map(quote => {
                                        const wa = whatsappLink(quote);
                                        const st = STATUS_LABELS[quote.status] || { label: quote.status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
                                        return (
                                            <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{quote.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 text-sm">{quote.customer_name}</div>
                                                    <div className="text-xs text-gray-400">{quote.customer_email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400">{new Date(quote.created_at).toLocaleDateString('es-CL')}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {wa && (
                                                            <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                                                                <MessageCircle className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => navigate('/admin/quotes')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;

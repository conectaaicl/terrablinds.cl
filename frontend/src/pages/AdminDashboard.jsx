import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Package, ShoppingCart, Users, Clock, TrendingUp, DollarSign, ArrowRight, Zap, MessageCircle, RefreshCw } from 'lucide-react';
import api from '../api';

const STATUS_LABELS = {
    pending:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    contacted: { label: 'Contactado',  cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted:  { label: 'Aceptada',    cls: 'bg-green-100 text-green-700 border-green-200' },
    rejected:  { label: 'Rechazada',   cls: 'bg-red-100 text-red-700 border-red-200' },
    completed: { label: 'Completada',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalQuotes: 0, newLeads: 0, activeProducts: 0, pendingQuotes: 0, totalRevenue: 0, conversionRate: 0 });
    const [allQuotes, setAllQuotes] = useState([]);
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [systemStatus, setSystemStatus] = useState({ backend: null, db: null });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => { fetchAll(); checkSystemStatus(); }, []);

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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">{lastUpdated ? `Actualizado: ${lastUpdated.toLocaleTimeString('es-CL')}` : 'Cargando...'}</p>
                </div>
                <button onClick={() => { fetchAll(); checkSystemStatus(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
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

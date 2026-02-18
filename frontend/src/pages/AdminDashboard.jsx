import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Package, ShoppingCart, Users, Clock, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalQuotes: 0,
        newLeads: 0,
        activeProducts: 0,
        pendingQuotes: 0,
        totalRevenue: 0,
        conversionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentQuotes, setRecentQuotes] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [productsRes, quotesRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/quotes')
            ]);

            const products = productsRes.data;
            const quotes = quotesRes.data;
            const activeProducts = products.filter(p => p.is_active).length;
            const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const newLeads = quotes.filter(q => new Date(q.created_at) > sevenDaysAgo).length;

            const totalRevenue = quotes
                .filter(q => q.status === 'accepted' || q.status === 'completed')
                .reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0);

            const recent = quotes.slice(0, 5);

            setStats({
                totalQuotes: quotes.length,
                newLeads,
                activeProducts,
                pendingQuotes,
                totalRevenue,
                conversionRate: quotes.length > 0 ? ((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100).toFixed(1) : 0
            });
            setRecentQuotes(recent);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
        <div
            onClick={onClick}
            className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110 ${color}`}></div>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-4 rounded-xl flex items-center justify-center transition-colors ${color} bg-opacity-10 text-white`}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>
            <div className={`mt-6 flex items-center text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-primary-600`}>
                Ver detalles <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Resumen general del rendimiento de tu tienda.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Actualizar Datos
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Calculando estadísticas...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Cotizaciones Totales" value={stats.totalQuotes} icon={ShoppingCart} color="bg-blue-600" onClick={() => navigate('/admin/quotes')} subtitle="Histórico de solicitudes" />
                        <StatCard title="Leads Nuevos" value={stats.newLeads} icon={Users} color="bg-green-600" onClick={() => navigate('/admin/quotes')} subtitle="Últimos 7 días" />
                        <StatCard title="Productos Activos" value={stats.activeProducts} icon={Package} color="bg-purple-600" onClick={() => navigate('/admin/products')} subtitle="Catálogo publicado" />
                        <StatCard title="Pendientes" value={stats.pendingQuotes} icon={Clock} color="bg-orange-600" onClick={() => navigate('/admin/quotes')} subtitle="Requieren seguimiento" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Ingresos Estimados (Aceptadas)</p>
                                <h2 className="text-4xl font-extrabold text-gray-900">${stats.totalRevenue.toLocaleString('es-CL')}</h2>
                                <p className="text-green-600 text-xs mt-2 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Valores basados en cotizaciones confirmadas
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Tasa de Conversión</p>
                                <h2 className="text-4xl font-extrabold text-gray-900">{stats.conversionRate}%</h2>
                                <p className="text-blue-600 text-xs mt-2 flex items-center">
                                    Porcentaje de cotizaciones concretadas
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 text-lg">Cotizaciones Recientes</h2>
                            <button onClick={() => navigate('/admin/quotes')} className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                                Gestionar todas
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Monto</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentQuotes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No hay actividad reciente para mostrar.
                                            </td>
                                        </tr>
                                    ) : recentQuotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{quote.customer_name}</div>
                                                <div className="text-xs text-gray-500">{quote.customer_email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(quote.created_at).toLocaleDateString('es-CL')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                ${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => navigate('/admin/quotes')} className="text-primary-600 hover:text-primary-700 p-1">
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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

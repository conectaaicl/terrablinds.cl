import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FileText, Settings, LogOut, Globe, Menu, Bell, Image, HelpCircle } from 'lucide-react';
import api from '../api';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        api.get('/api/quotes').then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setPendingCount(data.filter(q => q.status === 'pending').length);
        }).catch(() => {});
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('terrablinds_token');
        navigate('/admin/login');
    };

    const NavLink = ({ to, icon: Icon, label, badge }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
                <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                </div>
                {badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/10">
                <Link to="/admin" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Terra<span className="text-blue-400">Admin</span>
                    </span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Menú principal</p>
                <NavLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                <NavLink to="/admin/products" icon={ShoppingBag} label="Productos" />
                <NavLink to="/admin/quotes" icon={FileText} label="Cotizaciones" badge={pendingCount} />
                <NavLink to="/admin/projects" icon={Image} label="Proyectos" />
                <NavLink to="/admin/faq" icon={HelpCircle} label="Preguntas Frecuentes" />
                <NavLink to="/admin/settings" icon={Settings} label="Configuración" />
            </nav>
            <div className="p-4 border-t border-white/10 space-y-1">
                <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"
                >
                    <Globe className="w-5 h-5 mr-3" />
                    <span className="font-medium">Ver Sitio Web</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-gray-900 flex-shrink-0 hidden md:flex flex-col fixed h-full z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-gray-900 flex flex-col">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <p className="hidden md:block text-sm text-gray-400">Panel de Administración · TerraBlinds.cl</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <Link to="/admin/quotes" className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                                <Bell className="w-4 h-4" />
                                {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                            </Link>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

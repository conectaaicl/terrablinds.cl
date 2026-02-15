import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FileText, Settings, LogOut, Globe } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('terrablinds_token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <Link to="/admin" className="text-2xl font-bold tracking-tight">
                        Terra<span className="text-primary-500">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin"
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        Productos
                    </Link>
                    <Link
                        to="/admin/quotes"
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/quotes') ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Cotizaciones
                    </Link>
                    <Link
                        to="/admin/settings"
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings') ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        Configuración
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2"
                    >
                        <Globe className="w-5 h-5 mr-3" />
                        Ver Sitio Web
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm py-4 px-8 md:hidden flex justify-between items-center">
                    <Link to="/admin" className="text-xl font-bold text-gray-900">TerraAdmin</Link>
                    {/* Mobile menu toggle would go here */}
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

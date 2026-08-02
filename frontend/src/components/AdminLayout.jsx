import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, FileText, Settings, LogOut, Globe, Menu, X,
    Image, HelpCircle, ChevronDown, ChevronRight, Home, Users, Phone,
    MonitorSmartphone, Palette, Bell, Wrench, Wifi, UserPlus, CalendarCheck,
    Shield, Zap, BookOpen, Camera, Sun, KeyRound, Star, Gift, BarChart2, MapPin,
} from 'lucide-react';
import api from '../api';

const GROUPS = {
    reservas:  ['/admin/bookings'],
    catalogo:  ['/admin/products', '/admin/quotes', '/admin/leads'],
    contenido: ['/admin/projects', '/admin/faq', '/admin/blog', '/admin/contenido'],
    paginas:   ['/admin/paginas/'],
    diseno:    ['/admin/apariencia'],
    marketing: ['/admin/reviews', '/admin/referidos', '/admin/seo', '/admin/ciudades'],
    sistema:   ['/admin/settings'],
};

function activeGroup(pathname) {
    for (const [key, paths] of Object.entries(GROUPS)) {
        if (paths.some(p => pathname.startsWith(p))) return key;
    }
    return null;
}

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [logoUrl, setLogoUrl] = useState('');
    const [openGroups, setOpenGroups] = useState(() => {
        const ag = activeGroup(location.pathname);
        return ag ? [ag] : ['catalogo'];
    });

    useEffect(() => {
        const ag = activeGroup(location.pathname);
        if (ag && !openGroups.includes(ag)) {
            setOpenGroups(prev => [...prev, ag]);
        }
    }, [location.pathname]);

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = res.data;
            if (d.logo_url) setLogoUrl(d.logo_url);
            if (d.favicon_url) {
                const link = document.querySelector("link[rel='icon']") || document.createElement('link');
                link.rel = 'icon'; link.href = d.favicon_url;
                document.head.appendChild(link);
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        api.get('/api/quotes').then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setPendingCount(data.filter(q => q.status === 'pending').length);
        }).catch(() => {});
        api.get('/api/bookings/stats').then(res => {
            setPendingBookings(res.data?.pending || 0);
        }).catch(() => {});
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('terrablinds_token');
        navigate('/admin/login');
    };

    const toggleGroup = (key) => {
        setOpenGroups(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const NavItem = ({ to, icon: Icon, label, badge }) => {
        const active = to === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/8'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate">{label}</span>
                </div>
                {badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ml-1">
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    const NavGroup = ({ label, groupKey, children }) => {
        const open = openGroups.includes(groupKey);
        const isActive = (GROUPS[groupKey] || []).some(p =>
            location.pathname === p || location.pathname.startsWith(p)
        );
        return (
            <div className="mt-5">
                <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between px-1 mb-1.5 group"
                >
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                        isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'
                    }`}>{label}</span>
                    {open
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                    }
                </button>
                {open && (
                    <div className="space-y-0.5">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = () => (
        <>
            <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                    {logoUrl ? (
                        <img src={logoUrl} alt="TerraBlinds" className="h-8 w-auto object-contain" />
                    ) : (
                        <>
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">T</div>
                            <span className="text-sm font-bold text-white">Terra<span className="text-blue-400">Admin</span></span>
                        </>
                    )}
                </Link>
                <button className="lg:hidden text-gray-500 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />

                <div className="pt-1 space-y-0.5">
                    <NavGroup label="Reservas" groupKey="reservas">
                        <NavItem to="/admin/bookings" icon={CalendarCheck} label="Agenda" badge={pendingBookings} />
                    </NavGroup>

                    <NavGroup label="Catálogo" groupKey="catalogo">
                        <NavItem to="/admin/products" icon={Package} label="Productos" />
                        <NavItem to="/admin/quotes" icon={FileText} label="Cotizaciones" badge={pendingCount} />
                        <NavItem to="/admin/leads" icon={UserPlus} label="Leads del Chat" />
                    </NavGroup>

                    <NavGroup label="Contenido" groupKey="contenido">
                        <NavItem to="/admin/projects" icon={Image} label="Proyectos" />
                        <NavItem to="/admin/blog" icon={BookOpen} label="Blog" />
                        <NavItem to="/admin/faq" icon={HelpCircle} label="Preguntas Frecuentes" />
                        <NavItem to="/admin/contenido" icon={BookOpen} label="Contenido General" />
                    </NavGroup>

                    <NavGroup label="Páginas" groupKey="paginas">
                        <NavItem to="/admin/paginas/inicio" icon={Home} label="Inicio" />
                        <NavItem to="/admin/paginas/nosotros" icon={Users} label="Nosotros" />
                        <NavItem to="/admin/paginas/contacto" icon={Phone} label="Contacto" />
                        <NavItem to="/admin/paginas/software" icon={MonitorSmartphone} label="Software" />
                        <NavItem to="/admin/paginas/domotica" icon={Wifi} label="Domótica" />
                        <NavItem to="/admin/paginas/camaras" icon={Camera} label="Cámaras" />
                        <NavItem to="/admin/paginas/paneles-solares" icon={Sun} label="Paneles Solares" />
                        <NavItem to="/admin/paginas/control-acceso" icon={KeyRound} label="Control de Acceso" />
                        <NavItem to="/admin/paginas/cortinas-metalicas" icon={Shield} label="Cortinas Metálicas" />
                        <NavItem to="/admin/paginas/automatizacion" icon={Zap} label="Automatización" />
                        <NavItem to="/admin/paginas/servicio-tecnico" icon={Wrench} label="Serv. Técnico" />
                    </NavGroup>

                    <NavGroup label="Diseño" groupKey="diseno">
                        <NavItem to="/admin/apariencia" icon={Palette} label="Apariencia & Colores" />
                    </NavGroup>

                    <NavGroup label="Marketing" groupKey="marketing">
                        <NavItem to="/admin/reviews" icon={Star} label="Reseñas" />
                        <NavItem to="/admin/referidos" icon={Gift} label="Referidos" />
                        <NavItem to="/admin/seo" icon={BarChart2} label="SEO" />
                        <NavItem to="/admin/ciudades" icon={MapPin} label="Ciudades SEO" />
                    </NavGroup>

                    <NavGroup label="Sistema" groupKey="sistema">
                        <NavItem to="/admin/settings" icon={Settings} label="Configuración" />
                    </NavGroup>
                </div>
            </nav>

            <div className="px-3 py-3 border-t border-white/10 space-y-0.5 flex-shrink-0">
                <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-gray-400 hover:bg-white/8 hover:text-gray-100 rounded-lg transition-all text-sm"
                >
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Ver Sitio Web</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400/70 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <aside className="w-56 bg-[#0f1623] flex-shrink-0 hidden lg:flex flex-col fixed h-full z-20 shadow-xl">
                <SidebarContent />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-56 bg-[#0f1623] flex flex-col shadow-2xl">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">
                <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden text-gray-500 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        <p className="hidden lg:block text-xs text-gray-400 font-medium">Panel de Administración · TerraBlinds.cl</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <Link to="/admin/quotes"
                                className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors">
                                <Bell className="w-3.5 h-3.5" />
                                {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                            </Link>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-5 lg:p-7">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

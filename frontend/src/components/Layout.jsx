import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import VisitCounter from './VisitCounter';
import ChatWidget from './ChatWidget';

// SVG oficial WhatsApp
const WhatsAppIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

// Iconos redes sociales
const FacebookIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);
const InstagramIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
);
const TikTokIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
);
const YouTubeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
);

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [servicesOpen, setServicesOpen] = React.useState(false);

    const serviceLinks = [
        { to: '/software', label: 'Software', color: 'text-blue-400' },
        { to: '/domotica', label: 'Domótica', color: 'text-indigo-400' },
        { to: '/cortinas-metalicas', label: 'Cortinas Metálicas', color: 'text-slate-300' },
        { to: '/automatizacion', label: 'Automatización', color: 'text-amber-400' },
        { to: '/camaras', label: 'Cámaras', color: 'text-gray-300' },
        { to: '/paneles-solares', label: 'Paneles Solares', color: 'text-yellow-300' },
        { to: '/control-acceso', label: 'Control de Acceso', color: 'text-blue-400' },
        { to: '/servicio-tecnico', label: 'Servicio Técnico', color: 'text-slate-300' },
    ];
    const siteConfig = useSiteConfig();
    const { cartCount } = useCart();
    const location = useLocation();

    React.useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

    React.useEffect(() => {
        if (!siteConfig._loaded) return;
        if (siteConfig.favicon_url) {
            const link = document.querySelector("link[rel='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.href = siteConfig.favicon_url;
            document.head.appendChild(link);
        }
        if (siteConfig.brand_name) {
            document.title = siteConfig.brand_name + ' - Cortinas y Persianas a Medida';
        }
    }, [siteConfig._loaded]);

    const waNumber = siteConfig.whatsapp_number || '';
    const phoneDisplay = siteConfig.company_phone || '';
    const logoUrl = siteConfig.logo_url || '';
    const brandName = siteConfig.brand_name || 'TerraBlinds';

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">

            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 bg-[#0d0b08]/90 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center flex-shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="h-12 md:h-14 w-auto object-contain rounded-lg" />
                        ) : (
                            <span className="text-lg md:text-xl font-bold text-white tracking-tight">{brandName}</span>
                        )}
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-0.5 text-sm font-semibold">
                        {[
                            { to: '/', label: 'Inicio' },
                            { to: '/catalog', label: 'Catálogo' },
                            { to: '/projects', label: 'Proyectos' },
                            { to: '/about', label: 'Nosotros' },
                        ].map(({ to, label }) => (
                            <Link key={to} to={to}
                                className="relative px-3 py-2 rounded-lg text-white/75 hover:bg-white/10 hover:text-white transition-all duration-200 group">
                                {label}
                                <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-[#C8973A] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                            </Link>
                        ))}

                        {/* Servicios dropdown */}
                        <div className="relative"
                            onMouseEnter={() => setServicesOpen(true)}
                            onMouseLeave={() => setServicesOpen(false)}
                        >
                            <button className="relative flex items-center gap-1 px-3 py-2 rounded-lg text-white/75 hover:bg-white/10 hover:text-white transition-all duration-200 group">
                                Servicios <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                                <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-[#C8973A] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                            </button>
                            {servicesOpen && (
                                <div className="absolute top-full left-0 mt-1 w-52 bg-gray-950/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-1.5 z-50">
                                    {serviceLinks.map(({ to, label, color }) => (
                                        <Link key={to} to={to}
                                            onClick={() => setServicesOpen(false)}
                                            className={`flex items-center px-4 py-2.5 text-sm ${color || 'text-white/70'} hover:bg-white/10 hover:text-white transition-colors`}>
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {[
                            { to: '/agendar', label: 'Agendar', color: 'text-emerald-400' },
                            { to: '/contact', label: 'Contacto' },
                        ].map(({ to, label, color }) => (
                            <Link key={to} to={to}
                                className={`relative px-3 py-2 rounded-lg ${color || 'text-white/75'} hover:bg-white/10 hover:text-white transition-all duration-200 group`}>
                                {label}
                                <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-[#C8973A] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop right actions */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {waNumber && (
                            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center text-white/70 hover:text-green-400 transition-colors">
                                <WhatsAppIcon className="w-5 h-5 mr-1.5" />
                                {phoneDisplay && <span className="text-sm">{phoneDisplay}</span>}
                            </a>
                        )}
                        <Link to="/cart" className="relative p-2 text-white/70 hover:text-[#C8973A] transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C8973A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/quote"
                            className="px-4 py-2 bg-[#C8973A] hover:bg-[#A87A2A] text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-[#C8973A]/25">
                            Cotizar
                        </Link>
                    </div>

                    {/* Mobile: cart + hamburger */}
                    <div className="flex lg:hidden items-center gap-2">
                        <Link to="/cart" className="relative p-2 text-white/70 hover:text-[#C8973A] transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C8973A] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button className="p-2 text-white/80 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-[#0d0b08] border-t border-white/10">
                        <div className="container mx-auto px-4 py-3">
                            {/* Quick action buttons */}
                            <div className="flex gap-2 mb-3 pb-3 border-b border-white/10">
                                <Link to="/quote" onClick={() => setIsMenuOpen(false)}
                                    className="flex-1 py-2.5 bg-[#C8973A] hover:bg-[#A87A2A] text-white text-sm font-semibold rounded-xl text-center transition-colors">
                                    Cotizar ahora
                                </Link>
                                {waNumber && (
                                    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                        <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                                    </a>
                                )}
                            </div>
                            {/* Nav links in 2 columns */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {[
                                    { to: '/', label: 'Inicio' },
                                    { to: '/catalog', label: 'Catálogo' },
                                    { to: '/projects', label: 'Proyectos' },
                                    { to: '/about', label: 'Nosotros' },
                                    { to: '/software', label: 'Software' },
                                    { to: '/domotica', label: 'Domótica' },
                                    { to: '/cortinas-metalicas', label: 'Cortinas Metálicas' },
                                    { to: '/automatizacion', label: 'Automatización' },
                                    { to: '/camaras', label: 'Cámaras' },
                                    { to: '/paneles-solares', label: 'Paneles Solares' },
                                    { to: '/control-acceso', label: 'Control Acceso' },
                                    { to: '/servicio-tecnico', label: 'Serv. Técnico' },
                                    { to: '/agendar', label: 'Agendar Visita' },
                                    { to: '/contact', label: 'Contacto' },
                                    { to: '/register', label: 'Registrarse' },
                                ].map(({ to, label }) => (
                                    <Link key={to} to={to}
                                        className="py-2.5 text-sm text-white/70 hover:text-white font-medium border-b border-white/5 flex items-center gap-1.5 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}>
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                {children}
            </main>

            {/* ── Footer ── */}
            <footer className="bg-[#0d0b08] text-white py-14 border-t border-white/10">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand column */}
                    <div>
                        <div className="mb-4">
                            {logoUrl ? (
                                <Link to="/">
                                    <img src={logoUrl} alt={brandName} className="h-14 w-auto object-contain rounded-lg" />
                                </Link>
                            ) : (
                                <h3 className="text-xl font-bold text-white">{brandName}</h3>
                            )}
                        </div>
                        <p className="text-white/40 text-sm mb-5 leading-relaxed">
                            {siteConfig.footer_description || 'Cortinas y persianas a medida de alta calidad. Diseñadas para tu hogar, fabricadas para durar.'}
                        </p>
                        {/* Social Networks */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {siteConfig.social_facebook && (
                                <a href={siteConfig.social_facebook} target="_blank" rel="noopener noreferrer"
                                    className="group flex items-center gap-2 bg-[#1877F2] hover:bg-[#0d65d9] text-white px-3 py-1.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#1877F2]/20">
                                    <FacebookIcon />
                                    <span className="text-xs font-semibold">Facebook</span>
                                </a>
                            )}
                            {siteConfig.social_instagram && (
                                <a href={siteConfig.social_instagram} target="_blank" rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-white px-3 py-1.5 rounded-xl transition-all hover:scale-105 shadow-lg"
                                    style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                                    <InstagramIcon />
                                    <span className="text-xs font-semibold">Instagram</span>
                                </a>
                            )}
                            {siteConfig.social_tiktok && (
                                <a href={siteConfig.social_tiktok} target="_blank" rel="noopener noreferrer"
                                    className="group flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-3 py-1.5 rounded-xl transition-all hover:scale-105 shadow-lg border border-white/15">
                                    <TikTokIcon />
                                    <span className="text-xs font-semibold">TikTok</span>
                                </a>
                            )}
                            {siteConfig.social_youtube && (
                                <a href={siteConfig.social_youtube} target="_blank" rel="noopener noreferrer"
                                    className="group flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white px-3 py-1.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-500/20">
                                    <YouTubeIcon />
                                    <span className="text-xs font-semibold">YouTube</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Productos */}
                    <div>
                        <h4 className="text-[#C8973A] font-bold mb-5 text-xs uppercase tracking-widest">Productos</h4>
                        <ul className="space-y-2.5 text-white/40 text-sm">
                            <li><Link to="/catalog?category=Roller Blackout" className="hover:text-white transition-colors">Roller Blackout</Link></li>
                            <li><Link to="/catalog?category=Roller Sunscreen" className="hover:text-white transition-colors">Sunscreen</Link></li>
                            <li><Link to="/catalog?category=Roller Duo Blackout" className="hover:text-white transition-colors">Roller Duo</Link></li>
                            <li><Link to="/catalog?category=Domotica Motor Roller" className="hover:text-white transition-colors">Motorización</Link></li>
                            <li><Link to="/catalog?category=Persianas Exterior" className="hover:text-white transition-colors">Persianas Exterior</Link></li>
                            <li><Link to="/catalog?category=Toldos" className="hover:text-white transition-colors">Toldos</Link></li>
                            <li><Link to="/cortinas-metalicas" className="hover:text-white transition-colors">Cortinas Metálicas</Link></li>
                            <li><Link to="/automatizacion" className="hover:text-white transition-colors">Automatización</Link></li>
                            <li><Link to="/camaras" className="hover:text-white transition-colors">Cámaras de Seguridad</Link></li>
                            <li><Link to="/paneles-solares" className="hover:text-white transition-colors">Paneles Solares</Link></li>
                            <li><Link to="/control-acceso" className="hover:text-white transition-colors">Control de Acceso</Link></li>
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div>
                        <h4 className="text-[#C8973A] font-bold mb-5 text-xs uppercase tracking-widest">Empresa</h4>
                        <ul className="space-y-2.5 text-white/40 text-sm">
                            <li><Link to="/about" className="hover:text-white transition-colors">Quiénes Somos</Link></li>
                            <li><Link to="/projects" className="hover:text-white transition-colors">Proyectos</Link></li>
                            <li><Link to="/servicio-tecnico" className="hover:text-white transition-colors">Servicio Técnico</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Crear Cuenta</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-[#C8973A] font-bold mb-5 text-xs uppercase tracking-widest">Contacto</h4>
                        <ul className="space-y-3 text-white/40 text-sm">
                            {siteConfig.company_email && <li className="hover:text-white/70 transition-colors">{siteConfig.company_email}</li>}
                            {phoneDisplay && <li className="hover:text-white/70 transition-colors">{phoneDisplay}</li>}
                            {siteConfig.company_address && <li className="hover:text-white/70 transition-colors leading-snug">{siteConfig.company_address}</li>}
                            {waNumber && (
                                <li>
                                    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                                        className="hover:text-white transition-colors flex items-center gap-2">
                                        <WhatsAppIcon className="w-4 h-4 text-green-400" />
                                        WhatsApp
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-10 pt-8 border-t border-white/10 text-center text-white/25 text-sm">
                    &copy; {new Date().getFullYear()} {brandName}.cl. Todos los derechos reservados.
                    <VisitCounter />
                </div>
            </footer>

            {/* WhatsApp FAB — above chat widget */}
            {waNumber && (
                <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(siteConfig.whatsapp_default_msg || 'Hola TerraBlinds, me gustaría cotizar cortinas. ¿Me pueden ayudar?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-24 right-5 z-40 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chatea con nosotros en WhatsApp"
                >
                    <WhatsAppIcon className="w-7 h-7" />
                </a>
            )}

            {/* AI Chat Widget */}
            <ChatWidget logoUrl={logoUrl} />
        </div>
    );
};

export default Layout;

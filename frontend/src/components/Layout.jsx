import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api';
import VisitCounter from './VisitCounter';

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
    const [siteConfig, setSiteConfig] = React.useState({});
    const { cartCount } = useCart();

    React.useEffect(() => {
        api.get('/api/config/public')
            .then(res => {
                setSiteConfig(res.data);
                // Dynamic favicon
                if (res.data.favicon_url) {
                    const link = document.querySelector("link[rel='icon']") || document.createElement('link');
                    link.rel = 'icon';
                    link.href = res.data.favicon_url;
                    document.head.appendChild(link);
                }
                // Dynamic page title brand name
                if (res.data.brand_name) {
                    document.title = res.data.brand_name + ' - Cortinas y Persianas a Medida';
                }
            })
            .catch(() => {});
    }, []);

    const waNumber = siteConfig.whatsapp_number || '';
    const phoneDisplay = siteConfig.company_phone || '';
    const logoUrl = siteConfig.logo_url || '';
    const brandName = siteConfig.brand_name || 'TerraBlinds';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain" />
                        ) : (
                            <span>{brandName}</span>
                        )}
                    </Link>

                    <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
                        <Link to="/catalog" className="hover:text-primary-600 transition-colors">Catálogo</Link>
                        <Link to="/quote" className="hover:text-primary-600 transition-colors">Cotizar</Link>
                        <Link to="/projects" className="hover:text-primary-600 transition-colors">Proyectos</Link>
                        <Link to="/about" className="hover:text-primary-600 transition-colors">Nosotros</Link>
                        <Link to="/software" className="hover:text-blue-600 text-blue-500 font-semibold transition-colors">Software</Link>
                        <Link to="/contact" className="hover:text-primary-600 transition-colors">Contacto</Link>
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        {waNumber && (
                            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                                <WhatsAppIcon className="w-5 h-5 mr-2" />
                                {phoneDisplay && <span>{phoneDisplay}</span>}
                            </a>
                        )}
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/register"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                            Registrarse
                        </Link>
                    </div>

                    <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4">
                        <Link to="/" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
                        <Link to="/catalog" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Catálogo</Link>
                        <Link to="/quote" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Cotizar</Link>
                        <Link to="/projects" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Proyectos</Link>
                        <Link to="/about" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
                        <Link to="/software" className="block text-blue-500 font-semibold hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Software</Link>
                        <Link to="/contact" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
                        <Link to="/register" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                        <Link to="/cart" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                            Cotización ({cartCount})
                        </Link>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">TerraBlinds</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Cortinas y persianas a medida de alta calidad. Diseñadas para tu hogar, fabricadas para durar.
                        </p>
                        {/* Social Networks */}
                        <div className="flex space-x-3">
                            {siteConfig.social_facebook && (
                                <a href={siteConfig.social_facebook} target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <FacebookIcon />
                                </a>
                            )}
                            {siteConfig.social_instagram && (
                                <a href={siteConfig.social_instagram} target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <InstagramIcon />
                                </a>
                            )}
                            {siteConfig.social_tiktok && (
                                <a href={siteConfig.social_tiktok} target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-800 hover:bg-black rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <TikTokIcon />
                                </a>
                            )}
                            {siteConfig.social_youtube && (
                                <a href={siteConfig.social_youtube} target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                    <YouTubeIcon />
                                </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Productos</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/catalog?category=Roller Blackout" className="hover:text-white">Roller Blackout</Link></li>
                            <li><Link to="/catalog?category=Roller Sunscreen" className="hover:text-white">Sunscreen</Link></li>
                            <li><Link to="/catalog?category=Roller Duo Blackout" className="hover:text-white">Roller Duo</Link></li>
                            <li><Link to="/catalog?category=Domotica Motor Roller" className="hover:text-white">Motorización</Link></li>
                            <li><Link to="/catalog?category=Persianas Exterior" className="hover:text-white">Persianas Exterior</Link></li>
                            <li><Link to="/catalog?category=Toldos" className="hover:text-white">Toldos</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Empresa</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/about" className="hover:text-white">Quiénes Somos</Link></li>
                            <li><Link to="/projects" className="hover:text-white">Proyectos</Link></li>
                            <li><Link to="/faq" className="hover:text-white">Preguntas Frecuentes</Link></li>
                            <li><Link to="/contact" className="hover:text-white">Contacto</Link></li>
                            <li><Link to="/register" className="hover:text-white">Crear Cuenta</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {siteConfig.company_email && <li>{siteConfig.company_email}</li>}
                            {phoneDisplay && <li>{phoneDisplay}</li>}
                            {siteConfig.company_address && <li>{siteConfig.company_address}</li>}
                            {waNumber && (
                                <li>
                                    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                                        className="hover:text-white flex items-center gap-2">
                                        <WhatsAppIcon className="w-4 h-4 text-green-400" />
                                        WhatsApp
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} TerraBlinds.cl. Todos los derechos reservados.
                    <VisitCounter />
                </div>
            </footer>

            {/* WhatsApp FAB with pre-loaded message */}
            {waNumber && (
                <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hola TerraBlinds, me gustaría cotizar cortinas. ¿Me pueden ayudar?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chatea con nosotros en WhatsApp"
                >
                    <WhatsAppIcon className="w-8 h-8" />
                </a>
            )}
        </div>
    );
};

export default Layout;

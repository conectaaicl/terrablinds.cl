import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api';

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [whatsappNumber, setWhatsappNumber] = React.useState('');
    const [logoUrl, setLogoUrl] = React.useState('');
    const [companyPhone, setCompanyPhone] = React.useState('');
    const { cartCount } = useCart();

    React.useEffect(() => {
        const storedLogo = localStorage.getItem('company_logo');
        if (storedLogo) setLogoUrl(storedLogo);

        api.get('/api/config/public')
            .then(res => {
                const data = res.data;
                if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
                if (data.company_phone) setCompanyPhone(data.company_phone);
                if (data.logo_url && !storedLogo) setLogoUrl(data.logo_url);
            })
            .catch(err => {
                console.error('Error fetching config', err);
            });
    }, []);

    const phoneDisplay = companyPhone || '';
    const waNumber = whatsappNumber || '';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-gray-800 tracking-tight flex items-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="TerraBlinds Logo" className="h-10 w-auto object-contain" />
                        ) : (
                            <>Terra<span className="text-primary-600">Blinds</span></>
                        )}
                    </Link>

                    <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <Link to="/catalog" className="hover:text-primary-600 transition-colors">Catálogo</Link>
                        <Link to="/about" className="hover:text-primary-600 transition-colors">Nosotros</Link>
                        <Link to="/contact" className="hover:text-primary-600 transition-colors">Contacto</Link>
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        {waNumber && (
                            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                                <Phone className="w-5 h-5 mr-2" />
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
                    </div>

                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4">
                        <Link to="/" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/catalog" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Catálogo</Link>
                        <Link to="/about" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Nosotros</Link>
                        <Link to="/contact" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
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
                        <p className="text-gray-400 text-sm">
                            Cortinas y persianas a medida de alta calidad. Diseñadas para tu hogar, fabricadas para durar.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Productos</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/catalog?category=Roller Blackout" className="hover:text-white">Roller Blackout</Link></li>
                            <li><Link to="/catalog?category=Roller Sunscreen" className="hover:text-white">Sunscreen</Link></li>
                            <li><Link to="/catalog?category=Roller Duo Blackout" className="hover:text-white">Roller Duo</Link></li>
                            <li><Link to="/catalog?category=Domotica Motor Roller" className="hover:text-white">Motorización</Link></li>
                            <li><Link to="/catalog?category=Persianas Exterior" className="hover:text-white">Persianas Exterior</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Empresa</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/about" className="hover:text-white">Quiénes Somos</Link></li>
                            <li><Link to="/projects" className="hover:text-white">Proyectos</Link></li>
                            <li><Link to="/faq" className="hover:text-white">Preguntas Frecuentes</Link></li>
                            <li><Link to="/contact" className="hover:text-white">Contacto</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>contacto@terrablinds.cl</li>
                            {phoneDisplay && <li>{phoneDisplay}</li>}
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} TerraBlinds.cl. Todos los derechos reservados.
                </div>
            </footer>
            {waNumber && (
                <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chatea con nosotros"
                >
                    <Phone className="w-8 h-8" />
                </a>
            )}
        </div>
    );
};

export default Layout;

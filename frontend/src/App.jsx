import React, { useEffect } from 'react'
import PopupBanner from './components/PopupBanner';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import Home from './pages/Home';
const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Quote = React.lazy(() => import('./pages/Quote'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const Projects = React.lazy(() => import('./pages/Projects'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Software = React.lazy(() => import('./pages/Software'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const PaymentResult = React.lazy(() => import('./pages/PaymentResult'));
// Admin
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));
const AdminQuotes = React.lazy(() => import('./pages/AdminQuotes'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const AdminProjects = React.lazy(() => import('./pages/AdminProjects'));
const AdminFAQ = React.lazy(() => import('./pages/AdminFAQ'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminApariencia = React.lazy(() => import('./pages/AdminApariencia'));
const AdminInicio = React.lazy(() => import('./pages/AdminInicio'));
const AdminNosotros = React.lazy(() => import('./pages/AdminNosotros'));
const AdminContacto = React.lazy(() => import('./pages/AdminContacto'));
const AdminSoftware = React.lazy(() => import('./pages/AdminSoftware'));
const AdminServicioTecnico = React.lazy(() => import('./pages/AdminServicioTecnico'));
const ServicioTecnico = React.lazy(() => import('./pages/ServicioTecnico'));
const Domotica = React.lazy(() => import('./pages/Domotica'));
const AdminDomotica = React.lazy(() => import('./pages/AdminDomotica'));
const CortinasMetalicas = React.lazy(() => import('./pages/CortinasMetalicas'));
const AdminCortinasMetalicas = React.lazy(() => import('./pages/AdminCortinasMetalicas'));
const Automatizacion = React.lazy(() => import('./pages/Automatizacion'));
const AdminAutomatizacion = React.lazy(() => import('./pages/AdminAutomatizacion'));
const AdminLeads = React.lazy(() => import('./pages/AdminLeads'));
const AdminBookings = React.lazy(() => import('./pages/AdminBookings'));
const AdminContenido = React.lazy(() => import('./pages/AdminContenido'));
const AdminBlog = React.lazy(() => import('./pages/AdminBlog'));
const Booking = React.lazy(() => import('./pages/Booking'));
const BookingResult = React.lazy(() => import('./pages/BookingResult'));
const Camaras = React.lazy(() => import('./pages/Camaras'));
const AdminCamaras = React.lazy(() => import('./pages/AdminCamaras'));
const PanelesSolares = React.lazy(() => import('./pages/PanelesSolares'));
const AdminPanelesSolares = React.lazy(() => import('./pages/AdminPanelesSolares'));
const ControlAcceso = React.lazy(() => import('./pages/ControlAcceso'));
const AdminControlAcceso = React.lazy(() => import('./pages/AdminControlAcceso'));
const ComunaPage = React.lazy(() => import('./pages/ComunaPage'));
const AdminReviews = React.lazy(() => import('./pages/AdminReviews'));
const AdminReferidos = React.lazy(() => import('./pages/AdminReferidos'));
const AdminSEO = React.lazy(() => import('./pages/AdminSEO'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const LaSerena = React.lazy(() => import('./pages/LaSerena'));
import ProtectedRoute from './components/ProtectedRoute';

// Growth Engine — lazy loaded for code-splitting
const AdminGrowthDashboard   = React.lazy(() => import('./pages/AdminGrowthDashboard'));
const AdminGrowthPipeline    = React.lazy(() => import('./pages/AdminGrowthPipeline'));
const AdminGrowthOpportunities = React.lazy(() => import('./pages/AdminGrowthOpportunities'));
const AdminGrowthOpportunity = React.lazy(() => import('./pages/AdminGrowthOpportunity'));
const AdminGrowthContacts    = React.lazy(() => import('./pages/AdminGrowthContacts'));
const AdminGrowthContact     = React.lazy(() => import('./pages/AdminGrowthContact'));
const AdminGrowthActivity    = React.lazy(() => import('./pages/AdminGrowthActivity'));
const AdminGrowthToday       = React.lazy(() => import('./pages/AdminGrowthToday'));
// Search Radar
const AdminRadarDashboard    = React.lazy(() => import('./pages/AdminRadarDashboard'));
const AdminRadarOpportunities = React.lazy(() => import('./pages/AdminRadarOpportunities'));
const AdminIGRadar = React.lazy(() => import('./pages/AdminIGRadar'));

// Suspense must wrap the element prop, NOT be a child of <Routes>/<Route>

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// React Router v7 invariant: only <Route> or <Fragment> allowed as route children
const GE_FALLBACK = <div className="p-8 text-center text-gray-500">Cargando...</div>;
const GE = ({ Page }) => <React.Suspense fallback={GE_FALLBACK}><Page /></React.Suspense>;

function App() {
  return (
    <SiteConfigProvider>
      <CartProvider>
      <Router>
        <ScrollToTop />
        <PopupBanner />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<GE Page={Catalog} />} />
          <Route path="/product/:id" element={<GE Page={ProductDetail} />} />
          <Route path="/cart" element={<GE Page={Cart} />} />
          <Route path="/quote" element={<GE Page={Quote} />} />
          <Route path="/contact" element={<GE Page={Contact} />} />
          <Route path="/about" element={<GE Page={About} />} />
          <Route path="/projects" element={<GE Page={Projects} />} />
          <Route path="/faq" element={<GE Page={FAQ} />} />
          {/* No customer accounts in the backend (/api/auth/register never existed) */}
          <Route path="/register" element={<Navigate to="/quote" replace />} />
          <Route path="/software" element={<GE Page={Software} />} />
          <Route path="/servicio-tecnico" element={<GE Page={ServicioTecnico} />} />
          <Route path="/domotica" element={<GE Page={Domotica} />} />
          <Route path="/cortinas-metalicas" element={<GE Page={CortinasMetalicas} />} />
          <Route path="/automatizacion" element={<GE Page={Automatizacion} />} />
          <Route path="/payment/result" element={<GE Page={PaymentResult} />} />
          <Route path="/agendar" element={<GE Page={Booking} />} />
          <Route path="/cortinas/:slug" element={<GE Page={ComunaPage} />} />
          <Route path="/reserva/resultado" element={<GE Page={BookingResult} />} />
          <Route path="/camaras" element={<GE Page={Camaras} />} />
          <Route path="/paneles-solares" element={<GE Page={PanelesSolares} />} />
          <Route path="/control-acceso" element={<GE Page={ControlAcceso} />} />
          <Route path="/blog" element={<GE Page={Blog} />} />
          <Route path="/blog/:slug" element={<GE Page={BlogPost} />} />
          <Route path="/la-serena" element={<GE Page={LaSerena} />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<GE Page={AdminLogin} />} />
          <Route path="/admin/reset-password" element={<GE Page={AdminLogin} />} />

          {/* Admin Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<GE Page={AdminDashboard} />} />
            <Route path="/admin/products" element={<GE Page={AdminProducts} />} />
            <Route path="/admin/quotes" element={<GE Page={AdminQuotes} />} />
            <Route path="/admin/projects" element={<GE Page={AdminProjects} />} />
            <Route path="/admin/faq" element={<GE Page={AdminFAQ} />} />
            <Route path="/admin/settings" element={<GE Page={AdminSettings} />} />
            <Route path="/admin/apariencia" element={<GE Page={AdminApariencia} />} />
            <Route path="/admin/paginas/inicio" element={<GE Page={AdminInicio} />} />
            <Route path="/admin/paginas/nosotros" element={<GE Page={AdminNosotros} />} />
            <Route path="/admin/paginas/contacto" element={<GE Page={AdminContacto} />} />
            <Route path="/admin/paginas/software" element={<GE Page={AdminSoftware} />} />
            <Route path="/admin/paginas/servicio-tecnico" element={<GE Page={AdminServicioTecnico} />} />
            <Route path="/admin/paginas/domotica" element={<GE Page={AdminDomotica} />} />
            <Route path="/admin/paginas/cortinas-metalicas" element={<GE Page={AdminCortinasMetalicas} />} />
            <Route path="/admin/paginas/automatizacion" element={<GE Page={AdminAutomatizacion} />} />
            <Route path="/admin/leads" element={<GE Page={AdminLeads} />} />
            <Route path="/admin/bookings" element={<GE Page={AdminBookings} />} />
            <Route path="/admin/contenido" element={<GE Page={AdminContenido} />} />
            <Route path="/admin/blog" element={<GE Page={AdminBlog} />} />
            <Route path="/admin/paginas/camaras" element={<GE Page={AdminCamaras} />} />
            <Route path="/admin/paginas/paneles-solares" element={<GE Page={AdminPanelesSolares} />} />
            <Route path="/admin/paginas/control-acceso" element={<GE Page={AdminControlAcceso} />} />
            <Route path="/admin/reviews" element={<GE Page={AdminReviews} />} />
            <Route path="/admin/referidos" element={<GE Page={AdminReferidos} />} />
            <Route path="/admin/seo" element={<GE Page={AdminSEO} />} />
            <Route path="/admin/growth" element={<GE Page={AdminGrowthDashboard} />} />
            <Route path="/admin/growth/today" element={<GE Page={AdminGrowthToday} />} />
            <Route path="/admin/growth/pipeline" element={<GE Page={AdminGrowthPipeline} />} />
            <Route path="/admin/growth/opportunities" element={<GE Page={AdminGrowthOpportunities} />} />
            <Route path="/admin/growth/opportunities/:id" element={<GE Page={AdminGrowthOpportunity} />} />
            <Route path="/admin/growth/contacts" element={<GE Page={AdminGrowthContacts} />} />
            <Route path="/admin/growth/contacts/:id" element={<GE Page={AdminGrowthContact} />} />
            <Route path="/admin/growth/activity" element={<GE Page={AdminGrowthActivity} />} />
            <Route path="/admin/radar" element={<GE Page={AdminRadarDashboard} />} />
            <Route path="/admin/radar/oportunidades" element={<GE Page={AdminRadarOpportunities} />} />
                <Route path="/admin/radar/ig" element={<GE Page={AdminIGRadar} />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<GE Page={NotFound} />} />
        </Routes>
      </Router>
      </CartProvider>
    </SiteConfigProvider>
  );
}

export default App;

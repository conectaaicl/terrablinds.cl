import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import About from './pages/About';
import Projects from './pages/Projects';
import FAQ from './pages/FAQ';
import Register from './pages/Register';
import Software from './pages/Software';
import NotFound from './pages/NotFound';
import PaymentResult from './pages/PaymentResult';
// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminQuotes from './pages/AdminQuotes';
import AdminSettings from './pages/AdminSettings';
import AdminProjects from './pages/AdminProjects';
import AdminFAQ from './pages/AdminFAQ';
import AdminLogin from './pages/AdminLogin';
import AdminApariencia from './pages/AdminApariencia';
import AdminInicio from './pages/AdminInicio';
import AdminNosotros from './pages/AdminNosotros';
import AdminContacto from './pages/AdminContacto';
import AdminSoftware from './pages/AdminSoftware';
import AdminServicioTecnico from './pages/AdminServicioTecnico';
import ServicioTecnico from './pages/ServicioTecnico';
import Domotica from './pages/Domotica';
import AdminDomotica from './pages/AdminDomotica';
import CortinasMetalicas from './pages/CortinasMetalicas';
import AdminCortinasMetalicas from './pages/AdminCortinasMetalicas';
import Automatizacion from './pages/Automatizacion';
import AdminAutomatizacion from './pages/AdminAutomatizacion';
import AdminLeads from './pages/AdminLeads';
import AdminBookings from './pages/AdminBookings';
import AdminContenido from './pages/AdminContenido';
import AdminBlog from './pages/AdminBlog';
import Booking from './pages/Booking';
import BookingResult from './pages/BookingResult';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/register" element={<Register />} />
          <Route path="/software" element={<Software />} />
          <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
          <Route path="/domotica" element={<Domotica />} />
          <Route path="/cortinas-metalicas" element={<CortinasMetalicas />} />
          <Route path="/automatizacion" element={<Automatizacion />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/agendar" element={<Booking />} />
          <Route path="/reserva/resultado" element={<BookingResult />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<AdminLogin />} />

          {/* Admin Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/quotes" element={<AdminQuotes />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/faq" element={<AdminFAQ />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/apariencia" element={<AdminApariencia />} />
            <Route path="/admin/paginas/inicio" element={<AdminInicio />} />
            <Route path="/admin/paginas/nosotros" element={<AdminNosotros />} />
            <Route path="/admin/paginas/contacto" element={<AdminContacto />} />
            <Route path="/admin/paginas/software" element={<AdminSoftware />} />
            <Route path="/admin/paginas/servicio-tecnico" element={<AdminServicioTecnico />} />
            <Route path="/admin/paginas/domotica" element={<AdminDomotica />} />
            <Route path="/admin/paginas/cortinas-metalicas" element={<AdminCortinasMetalicas />} />
            <Route path="/admin/paginas/automatizacion" element={<AdminAutomatizacion />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/contenido" element={<AdminContenido />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

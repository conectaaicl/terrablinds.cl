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
// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminQuotes from './pages/AdminQuotes';
import AdminSettings from './pages/AdminSettings';
import AdminProjects from './pages/AdminProjects';
import AdminFAQ from './pages/AdminFAQ';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentResult from './pages/PaymentResult';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
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
          <Route path="/payment/result" element={<PaymentResult />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<AdminLogin />} />

          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/quotes" element={<AdminQuotes />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/faq" element={<AdminFAQ />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

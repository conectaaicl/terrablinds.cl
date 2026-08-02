import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';
import { MapPin, CheckCircle, Clock, Star, ChevronRight, MessageCircle, Calendar } from 'lucide-react';

const SERVICIOS = [
  { nombre: 'Cortinas Roller Blackout', desc: 'Bloqueo total de luz, ideal para dormitorios', href: '/catalog' },
  { nombre: 'Cortinas Roller Sunscreen', desc: 'Filtro solar con vista exterior preservada', href: '/catalog' },
  { nombre: 'Cortinas Roller Duo', desc: 'Blackout y sunscreen en una sola cortina', href: '/catalog' },
  { nombre: 'Persianas de Madera', desc: 'Elegancia natural para cualquier ambiente', href: '/catalog' },
  { nombre: 'Toldos a Medida', desc: 'Protección solar para terrazas y exteriores', href: '/catalog' },
  { nombre: 'Cierres de Terraza', desc: 'PVC y cristal para ampliar tu espacio', href: '/catalog' },
];

export default function CiudadPage() {
  const { slug } = useParams();
  const [ciudad, setCiudad] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/api/cities/${slug}`)
      .then(r => setCiudad(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <Navigate to="/404" replace />;
  if (!ciudad) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const title = `Cortinas Roller y Persianas en ${ciudad.nombre} | TerraBlinds`;
  const description = `Fabricación e instalación de cortinas roller, persianas y toldos a medida en ${ciudad.nombre}. Consultar costo de visita de medición. Garantía incluida. TerraBlinds Chile.`;
  const waUrl = `https://wa.me/56998101891?text=${encodeURIComponent(ciudad.waMsg || `Hola! Quisiera cotizar cortinas en ${ciudad.nombre}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "TerraBlinds",
    "url": "https://terrablinds.cl",
    "logo": "https://terrablinds.cl/logoterrablinds.png",
    "telephone": "+56998101891",
    "areaServed": {
      "@type": "City",
      "name": ciudad.nombre,
      "containedInPlace": { "@type": "State", "name": ciudad.region }
    },
    "description": description,
    "priceRange": "$$",
    "address": { "@type": "PostalAddress", "addressCountry": "CL", "addressRegion": ciudad.region },
  };

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://terrablinds.cl/og-terrablinds.jpg" />
        <link rel="canonical" href={`https://terrablinds.cl/cortinas-roller/${ciudad.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section
        className="relative text-white py-20 px-4"
        style={ciudad.heroImg
          ? { backgroundImage: `url(${ciudad.heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)' }
        }
      >
        {ciudad.heroImg && <div className="absolute inset-0 bg-black/55" />}
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold mb-4">
            <MapPin size={16} /><span>{ciudad.zona}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Cortinas Roller y Persianas<br />
            <span className="text-gold-400">en {ciudad.nombre}</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">{ciudad.descripcion}</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/quote"
              className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2">
              Cotizar en {ciudad.nombre} <ChevronRight size={18} />
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2">
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Destacados */}
      {ciudad.destacados?.length > 0 && (
        <section className="bg-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">¿Por qué elegirnos en {ciudad.nombre}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ciudad.destacados.filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Servicios */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nuestros productos en {ciudad.nombre}</h2>
          <p className="text-gray-500 mb-8">Fabricamos a medida exacta para tu hogar u oficina</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICIOS.map((s, i) => (
              <Link key={i} to={s.href}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-5 transition-all group">
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-gold-600 transition-colors">{s.nombre}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Cómo trabajamos en {ciudad.nombre}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MapPin,     n: '1', title: 'Visita de medición', desc: `Un técnico visita tu domicilio en ${ciudad.nombre}. Consultar costo de visita.` },
              { icon: Clock,      n: '2', title: 'Fabricamos en 5-7 días', desc: 'Producción propia garantiza calidad y tiempo exacto.' },
              { icon: CheckCircle, n: '3', title: 'Instalación profesional', desc: `Instalamos en ${ciudad.nombre} con garantía de 12 meses.` },
            ].map(({ icon: Icon, n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-gold-500" size={26} />
                </div>
                <div className="text-xs font-bold text-gold-500 mb-1">PASO {n}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {ciudad.faq?.length > 0 && (
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Preguntas frecuentes — {ciudad.nombre}</h2>
            <div className="space-y-4">
              {ciudad.faq.filter(f => f.q).map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <Star size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />{item.q}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">¿Listo para transformar tu hogar en {ciudad.nombre}?</h2>
          <p className="text-gray-300 mb-8">Cotización gratuita · Instalación garantizada</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/quote" className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-10 py-4 rounded-xl transition-colors">
              Cotizar ahora
            </Link>
            <Link to="/agendar"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-xl transition-colors inline-flex items-center gap-2 border border-white/20">
              <Calendar size={18} /> Agendar visita
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { MapPin, CheckCircle, Phone, Star, ChevronRight } from 'lucide-react';
import api from '../api';

const COMMUNES = {
    'las-condes':    { name: 'Las Condes',    region: 'Región Metropolitana', desc: 'Servicio premium de cortinas y persianas en Las Condes con instalación a domicilio.' },
    'providencia':   { name: 'Providencia',   region: 'Región Metropolitana', desc: 'Cortinas roller, blackout y persianas a medida con instalación experta en Providencia.' },
    'vitacura':      { name: 'Vitacura',       region: 'Región Metropolitana', desc: 'Soluciones de alta gama en cortinas y toldos para hogares y oficinas en Vitacura.' },
    'nunoa':         { name: 'Ñuñoa',          region: 'Región Metropolitana', desc: 'Instalación profesional de cortinas roller y persianas en Ñuñoa. Presupuesto sin costo.' },
    'santiago':      { name: 'Santiago',       region: 'Región Metropolitana', desc: 'Cortinas y persianas a medida para toda la ciudad de Santiago. Entrega e instalación incluida.' },
    'la-florida':    { name: 'La Florida',     region: 'Región Metropolitana', desc: 'Cortinas roller y blackout con instalación en La Florida. Precios directos de fábrica.' },
    'maipu':         { name: 'Maipú',          region: 'Región Metropolitana', desc: 'Amplio catálogo de cortinas y persianas con servicio a domicilio en Maipú.' },
    'penalulen':     { name: 'Peñalolén',      region: 'Región Metropolitana', desc: 'Cortinas a medida e instalación profesional en Peñalolén.' },
    'la-reina':      { name: 'La Reina',       region: 'Región Metropolitana', desc: 'Persianas y cortinas roller con instalación en La Reina. Cotiza gratis hoy.' },
    'lo-barnechea':  { name: 'Lo Barnechea',   region: 'Región Metropolitana', desc: 'Cortinas y toldos de calidad premium con instalación en Lo Barnechea.' },
    'san-miguel':    { name: 'San Miguel',     region: 'Región Metropolitana', desc: 'Cortinas roller y blackout a medida con instalación en San Miguel.' },
    'pudahuel':      { name: 'Pudahuel',       region: 'Región Metropolitana', desc: 'Amplio catálogo y servicio de instalación de cortinas en Pudahuel.' },
    'quilicura':     { name: 'Quilicura',      region: 'Región Metropolitana', desc: 'Cortinas y persianas a medida con instalación en Quilicura.' },
    'macul':         { name: 'Macul',          region: 'Región Metropolitana', desc: 'Servicio completo de cortinas roller y persianas con instalación en Macul.' },
    'estacion-central': { name: 'Estación Central', region: 'Región Metropolitana', desc: 'Cortinas a medida e instalación en Estación Central. Cotización gratuita.' },
};

const FEATURES = [
    'Medición a domicilio sin costo',
    'Instalación con garantía de 1 año',
    'Cortinas roller, blackout y sunscreen',
    'Persianas, toldos y cierres de terraza',
    'Motorización e integración domotica',
    'Más de 200 telas y materiales disponibles',
];

export default function ComunaLanding() {
    const { comuna } = useParams();
    const info = COMMUNES[comuna] || null;
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [waConfig, setWaConfig] = useState({ url: 'https://wa.me/56943449232', label: 'Cotizar por WhatsApp' });

    useEffect(() => {
        api.get('/api/products').then(res => {
            const all = Array.isArray(res.data) ? res.data : (res.data.products || []);
            setFeaturedProducts(all.slice(0, 3));
        }).catch(() => {});
        api.get('/api/config/public').then(res => {
            const d = res.data;
            if (d.whatsapp_cta_url) setWaConfig(p => ({ ...p, url: d.whatsapp_cta_url }));
        }).catch(() => {});
    }, []);

    if (!info) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Comuna no encontrada</h1>
                    <Link to="/" className="text-primary-600 hover:underline">Volver al inicio</Link>
                </div>
            </Layout>
        );
    }

    const communeName = info.name;
    const waUrl = `https://wa.me/56943449232?text=Hola%2C%20necesito%20cotizar%20cortinas%20para%20${encodeURIComponent(communeName)}`;
    const title = `Cortinas Roller ${communeName} — Instalación a Domicilio | TerraBlinds`;
    const description = `${info.desc} Presupuesto gratis sin compromiso. ☎ Llámanos o escríbenos por WhatsApp.`;
    const canonicalPath = `/cortinas-roller-${comuna}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `Cortinas Roller ${communeName}`,
        "description": description,
        "provider": {
            "@type": "LocalBusiness",
            "name": "TerraBlinds",
            "telephone": "+56943449232",
            "address": { "@type": "PostalAddress", "addressLocality": communeName, "addressRegion": info.region, "addressCountry": "CL" }
        },
        "areaServed": { "@type": "City", "name": communeName }
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://terrablinds.cl/" },
            { "@type": "ListItem", "position": 2, "name": `Cortinas Roller ${communeName}`, "item": `https://terrablinds.cl${canonicalPath}` }
        ]
    };

    return (
        <Layout>
            <SEO title={title} description={description} path={canonicalPath} jsonLd={[jsonLd, breadcrumbLd]} />

            {/* Hero */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-2 text-primary-400 text-sm font-semibold uppercase tracking-widest mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{info.region}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Cortinas Roller en <span className="text-primary-400">{communeName}</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">{info.desc} Instalación profesional con garantía de 1 año.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href={waUrl} target="_blank" rel="noopener noreferrer"
                            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105">
                            Cotizar por WhatsApp <ChevronRight className="w-5 h-5" />
                        </a>
                        <Link to="/catalog"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center hover:scale-105">
                            Ver Catálogo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
                        ¿Por qué elegirnos en {communeName}?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary-200 transition-all">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rating strip */}
            <section className="bg-primary-600 text-white py-10 px-4">
                <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                            <span className="ml-2 font-bold text-lg">4.9</span>
                        </div>
                        <p className="text-white/80 text-sm">+87 clientes satisfechos en Santiago</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-8 h-8 text-white/80" />
                        <div>
                            <p className="font-bold text-xl">+56 9 4344 9232</p>
                            <p className="text-white/70 text-sm">Lun–Vie 9–18h · Sáb 10–14h</p>
                        </div>
                    </div>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        className="px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 transition-all whitespace-nowrap">
                        Pedir presupuesto
                    </a>
                </div>
            </section>

            {/* Featured products */}
            {featuredProducts.length > 0 && (
                <section className="py-16 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
                            Productos más instalados en {communeName}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {featuredProducts.map(p => (
                                <Link key={p.id} to={`/product/${p.id}`}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
                                    {p.images?.[0] && (
                                        <div className="aspect-video overflow-hidden">
                                            <img src={typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0]}
                                                alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">{p.category}</p>
                                        <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{p.short_description || p.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all">
                                Ver catálogo completo <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA final */}
            <section className="py-16 px-4 bg-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para transformar tus espacios?</h2>
                    <p className="text-gray-500 mb-8">Cotización sin costo · Medición a domicilio en {communeName} · Instalación garantizada</p>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-green-300/40 hover:scale-105">
                        Cotizar gratis por WhatsApp <ChevronRight className="w-5 h-5" />
                    </a>
                </div>
            </section>
        </Layout>
    );
}

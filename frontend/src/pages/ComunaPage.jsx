import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { getComunaBySlug } from '../data/comunas';
import { CheckCircle2, MapPin, Phone, MessageCircle, ChevronRight } from 'lucide-react';

const INSTALACIONES = [
    { src: '/uploads/roller-duo-zebra.webp',        alt: 'Cortina roller duo zebra instalada en living',   label: 'Roller duo zebra',        cat: 'Cortinas Roller' },
    { src: '/uploads/cierre-terraza-cristal.webp',  alt: 'Cierre de terraza en cristal con vista panorámica', label: 'Cierre de terraza en cristal', cat: 'Cierres de Terraza' },
    { src: '/uploads/persianas-interior.webp',      alt: 'Minipersiana de aluminio en cocina',           label: 'Minipersiana de aluminio', cat: 'Persianas' },
    { src: '/uploads/toldo-terraza.webp',           alt: 'Toldo retráctil sobre terraza de madera',       label: 'Toldo retráctil',         cat: 'Toldos' },
    { src: '/uploads/persiana-exterior-real.png',   alt: 'Persiana exterior de aluminio instalada',       label: 'Persiana exterior',       cat: 'Persianas' },
    { src: '/uploads/malla-seguridad-balcon.webp',  alt: 'Malla de seguridad transparente en balcón',     label: 'Malla de seguridad',      cat: 'Mallas' },
];


const WhatsAppIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const PRODUCTOS = [
    { nombre: 'Cortinas Roller Blackout', desc: 'Oscurecimiento total. Ideal para dormitorios.' },
    { nombre: 'Cortinas Roller Sunscreen', desc: 'Filtro solar con vista exterior preservada.' },
    { nombre: 'Persianas Venecianas', desc: 'Control total de luz y privacidad.' },
    { nombre: 'Persianas Exteriores', desc: 'Protección fachada y aislamiento térmico.' },
    { nombre: 'Toldos Retráctiles', desc: 'Para terrazas y balcones, con o sin motor.' },
    { nombre: 'Motorización', desc: 'Control desde celular, voz o app.' },
];

export default function ComunaPage() {
    const { slug } = useParams();
    const comuna = getComunaBySlug(slug);

    if (!comuna) return <Navigate to="/404" replace />;

    const nombreMostrado = comuna.nombreDisplay || comuna.nombre;
    const waMsg = encodeURIComponent(`Hola, quiero cotizar cortinas o persianas en ${nombreMostrado}.`);
    const waUrl = `https://wa.me/56998101891?text=${waMsg}`;

    const schemaLD = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'TerraBlinds',
        url: 'https://terrablinds.cl',
        telephone: '+56998101891',
        areaServed: {
            '@type': 'City',
            name: nombreMostrado,
            containedInPlace: { '@type': 'State', name: 'Región Metropolitana de Santiago' },
        },
        description: comuna.descripcion,
    };

    return (
        <Layout>
            <SEO
                title={`Cortinas y Persianas en ${nombreMostrado} | TerraBlinds`}
                description={comuna.descripcion}
                path={`/cortinas/${slug}`}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLD) }}
            />

            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-14 px-4">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                        <MapPin className="w-4 h-4" />
                        <span>Región Metropolitana · {nombreMostrado}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                        Cortinas y persianas<br />
                        <span className="text-amber-400">en {nombreMostrado}</span>
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        {comuna.intro}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            to="/quote"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/30 text-sm"
                        >
                            Cotizar ahora — gratis
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                        <a
                            href={waUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-7 py-3.5 wa-pulse hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm"
                        >
                            <WhatsAppIcon />
                            Escribir por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* Destacados */}
            <section className="py-12 px-4 bg-slate-800/50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-white text-center mb-8">
                        ¿Por qué elegirnos en {nombreMostrado}?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {comuna.destacados.map((d, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
                                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-300 text-sm leading-relaxed">{d}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Productos */}
            <section className="py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-white text-center mb-2">
                        Productos disponibles en {nombreMostrado}
                    </h2>
                    <p className="text-slate-400 text-sm text-center mb-8">
                        Fabricación a medida · Instalación incluida · Garantía en cada trabajo
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PRODUCTOS.map((p, i) => (
                            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 hover:border-amber-500/40 transition-colors">
                                <h3 className="font-bold text-white text-sm mb-1">{p.nombre}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Instalaciones reales */}
            <section className="py-12 px-4 bg-slate-800/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase text-amber-400 mb-3">Trabajos reales</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Así quedan nuestras instalaciones</h2>
                        <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                            Fotos de proyectos terminados. Lo mismo que instalamos en {nombreMostrado}.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {INSTALACIONES.map(f => (
                            <Link
                                key={f.src}
                                to={`/catalog?category=${encodeURIComponent(f.cat)}`}
                                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                            >
                                <img
                                    src={f.src}
                                    alt={f.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                                <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-tight">
                                    {f.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA final */}
            <section className="py-14 px-4 bg-gradient-to-br from-amber-500/10 to-slate-900">
                <div className="max-w-xl mx-auto text-center space-y-5">
                    <h2 className="text-2xl font-extrabold text-white">
                        ¿Listo para cotizar en {nombreMostrado}?
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Sin medidas exactas. Completa el formulario en 30 segundos y te contactamos por WhatsApp con un presupuesto a medida.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/quote"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors text-base shadow-lg shadow-amber-900/30"
                        >
                            Cotizar gratis
                        </Link>
                        <a
                            href={waUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors text-sm"
                        >
                            <WhatsAppIcon />
                            WhatsApp directo
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
                        <span>✓ Sin compromiso</span>
                        <span>✓ Respuesta en horas</span>
                        <span>✓ Instalación garantizada</span>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

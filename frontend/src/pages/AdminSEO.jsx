import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import {
    Globe, Search, ExternalLink, CheckCircle, AlertCircle, Clock,
    BarChart2, FileText, Zap, Map, Shield, RefreshCw, TrendingUp, Eye
} from 'lucide-react';

const SITE_URL = 'https://terrablinds.cl';
const SITEMAP_URL = `${SITE_URL}/api/sitemap.xml`;
const SEARCH_CONSOLE_URL = 'https://search.google.com/search-console?resource_id=sc-domain%3Aterrablinds.cl';
const PAGESPEED_URL = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_URL)}`;
const RICH_RESULTS_URL = `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL)}`;
const MOBILE_TEST_URL = `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(SITE_URL)}`;

const GOOGLE_TOOLS = [
    {
        label: 'Search Console',
        desc: 'Ver posicionamiento, clics e impresiones en Google',
        icon: Search,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        iconColor: 'text-blue-600',
        href: SEARCH_CONSOLE_URL,
        badge: 'Principal',
        badgeColor: 'bg-blue-600 text-white',
    },
    {
        label: 'PageSpeed Insights',
        desc: 'Velocidad y rendimiento del sitio (Core Web Vitals)',
        icon: Zap,
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        iconColor: 'text-yellow-600',
        href: PAGESPEED_URL,
    },
    {
        label: 'Rich Results Test',
        desc: 'Comprobar datos estructurados y resultados enriquecidos',
        icon: Shield,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        iconColor: 'text-purple-600',
        href: RICH_RESULTS_URL,
    },
    {
        label: 'Mobile Friendly Test',
        desc: 'Verificar que el sitio es apto para móviles',
        icon: Eye,
        color: 'bg-green-50 text-green-700 border-green-200',
        iconColor: 'text-green-600',
        href: MOBILE_TEST_URL,
    },
    {
        label: 'Ver Sitemap XML',
        desc: `${SITEMAP_URL}`,
        icon: Map,
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        iconColor: 'text-gray-500',
        href: SITEMAP_URL,
    },
    {
        label: 'Ver robots.txt',
        desc: `${SITE_URL}/robots.txt`,
        icon: FileText,
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        iconColor: 'text-gray-500',
        href: `${SITE_URL}/robots.txt`,
    },
];

const STATUS_ITEMS = [
    { label: 'Verificación Google (meta tag)', status: 'ok', detail: 'Instalada en index.html' },
    { label: 'Sitemap enviado', status: 'ok', detail: '/api/sitemap.xml · enviado a Search Console' },
    { label: 'robots.txt', status: 'ok', detail: 'Accesible en /robots.txt' },
    { label: 'HTTPS activo', status: 'ok', detail: 'Certificado SSL válido en terrablinds.cl' },
    { label: 'Indexación en proceso', status: 'pending', detail: 'Google tarda 1–4 semanas en indexar todo' },
];

export default function AdminSEO() {
    const [sitemapCount, setSitemapCount] = useState(null);
    const [sitemapLoading, setSitemapLoading] = useState(true);
    const [blogCount, setBlogCount] = useState(null);
    const [productCount, setProductCount] = useState(null);

    useEffect(() => {
        // Count sitemap URLs
        fetch(SITEMAP_URL)
            .then(r => r.text())
            .then(xml => {
                const matches = xml.match(/<loc>/g);
                setSitemapCount(matches ? matches.length : 0);
            })
            .catch(() => setSitemapCount(null))
            .finally(() => setSitemapLoading(false));

        // Count blog posts
        api.get('/api/blog?limit=1').then(r => setBlogCount(r.data.total || r.data.posts?.length)).catch(() => {});

        // Count products
        api.get('/api/products').then(r => {
            const data = Array.isArray(r.data) ? r.data : r.data.products || [];
            setProductCount(data.filter(p => p.is_active).length);
        }).catch(() => {});
    }, []);

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SEO & Google</h1>
                    <p className="text-sm text-gray-500 mt-1">Herramientas de posicionamiento y estado de indexación de terrablinds.cl</p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {sitemapLoading ? '—' : (sitemapCount ?? '?')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Páginas en sitemap</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                        <div className="text-3xl font-bold text-amber-600">
                            {blogCount ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Artículos de blog</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {productCount ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Productos activos</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                        <div className="text-3xl font-bold text-purple-600">✓</div>
                        <div className="text-xs text-gray-500 mt-1">Verificado en Google</div>
                    </div>
                </div>

                {/* Google Search Console CTA */}
                <a
                    href={SEARCH_CONSOLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md hover:from-blue-700 hover:to-blue-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-lg font-bold">Abrir Google Search Console</div>
                            <div className="text-blue-200 text-sm mt-0.5">Posicionamiento · Clics · Impresiones · Errores de indexación</div>
                        </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors flex-shrink-0" />
                </a>

                {/* Status checklist */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Estado del SEO técnico</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {STATUS_ITEMS.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                                {item.status === 'ok' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : item.status === 'pending' ? (
                                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">{item.label}</div>
                                    <div className="text-xs text-gray-400">{item.detail}</div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    item.status === 'ok' ? 'bg-green-100 text-green-700' :
                                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {item.status === 'ok' ? 'OK' : item.status === 'pending' ? 'Pendiente' : 'Error'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Google Tools Grid */}
                <div>
                    <h2 className="font-semibold text-gray-800 mb-4">Herramientas de Google</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {GOOGLE_TOOLS.map((tool, i) => (
                            <a
                                key={i}
                                href={tool.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md group ${tool.color}`}
                            >
                                <div className={`mt-0.5 flex-shrink-0 ${tool.iconColor}`}>
                                    <tool.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{tool.label}</span>
                                        {tool.badge && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                                                {tool.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs opacity-70 mt-0.5 truncate">{tool.desc}</div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity flex-shrink-0 mt-0.5" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* SEO Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <h3 className="font-semibold text-amber-800 text-sm">Tips para mejorar el posicionamiento</h3>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-700">
                        <li>• Publica artículos de blog regularmente — mínimo 1 por semana para resultados rápidos</li>
                        <li>• Responde consultas en Google Business Profile para mejorar el SEO local</li>
                        <li>• Agrega fotos reales de proyectos — las imágenes propias posicionan mejor que stock</li>
                        <li>• Obtén reseñas en Google Maps — influyen directamente en el ranking local</li>
                        <li>• Los primeros resultados en Google tardan 3–6 meses con contenido constante</li>
                    </ul>
                </div>

            </div>
        </AdminLayout>
    );
}

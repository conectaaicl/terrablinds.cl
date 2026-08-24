import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ArrowRight, Search, BookOpen } from 'lucide-react';
import api from '../api';

const fmtDate = d => d
    ? new Date(d).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

export default function Blog() {
    const [posts, setPosts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ]           = useState('');
    const [cfg, setCfg]       = useState({});

    useEffect(() => {
        api.get('/api/config/public').then(r => setCfg(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        const params = q.trim() ? `?search=${encodeURIComponent(q)}` : '';
        setLoading(true);
        api.get(`/api/blogs${params}`)
            .then(r => setPosts(Array.isArray(r.data) ? r.data : []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [q]);

    return (
        <Layout>
            <SEO
                title={cfg.seo_title_blog || 'Blog — Consejos y Tendencias'}
                description={cfg.seo_desc_blog || 'Artículos, consejos y tendencias sobre cortinas, persianas, toldos y decoración de interiores.'}
                path="/blog"
            />

            {/* Header */}
            <div className="bg-[#0d0b08] text-white py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#C8973A] mb-4 px-4 py-1.5 rounded-full border border-[#C8973A]/40 bg-[#C8973A]/10">
                        Blog
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Consejos y Tendencias</h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Artículos sobre decoración, control solar, automatización y cómo elegir el producto correcto para cada espacio.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#F7F4EF] border-b border-[#E8E2D8] py-5 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Buscar artículos..."
                            className="w-full pl-10 pr-4 py-2.5 border border-[#E8E2D8] rounded-xl text-sm focus:ring-2 focus:ring-[#C8973A]/30 focus:border-[#C8973A] outline-none bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Posts */}
            <section className="py-14 px-4 bg-[#F7F4EF]">
                <div className="container mx-auto max-w-4xl">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20">
                            <BookOpen className="w-12 h-12 text-[#C8973A]/40 mx-auto mb-4" />
                            <p className="text-[#7A6F65] text-lg font-medium">
                                {q ? 'No hay artículos que coincidan.' : 'Próximamente publicaremos artículos aquí.'}
                            </p>
                            {q && (
                                <button onClick={() => setQ('')}
                                    className="mt-4 text-[#C8973A] font-semibold text-sm hover:underline">
                                    Ver todos los artículos
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map(post => (
                                <Link key={post.id} to={`/blog/${post.slug}`}
                                    className="group block bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#C8973A]/50 hover:shadow-xl hover:shadow-[#C8973A]/10 transition-all duration-300 overflow-hidden">
                                    <div className="h-52 overflow-hidden bg-[#F7F4EF]">
                                        {post.cover_image ? (
                                            <img src={post.cover_image} alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#C8973A]/20 to-[#C8973A]/5 flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-[#C8973A]/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        {post.published_at && (
                                            <p className="text-xs text-[#C8973A] font-semibold mb-2">{fmtDate(post.published_at)}</p>
                                        )}
                                        <h2 className="font-extrabold text-[#1A1614] text-lg leading-snug mb-2 line-clamp-2">{post.title}</h2>
                                        {post.excerpt && (
                                            <p className="text-sm text-[#7A6F65] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 text-[#C8973A] font-semibold text-sm group-hover:gap-2.5 transition-all duration-200">
                                            Leer más <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

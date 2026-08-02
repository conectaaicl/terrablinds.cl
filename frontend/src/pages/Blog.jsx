import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import api from '../api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/blog?page=${page}&limit=9`)
            .then(r => {
                setPosts(r.data.posts || []);
                setTotalPages(r.data.pages || 1);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <Layout>
            <SEO
                title="Blog | Consejos de Cortinas y Persianas | TerraBlinds"
                description="Guías, consejos y tendencias sobre cortinas roller, persianas y decoración de interiores en Chile. Aprende a elegir, medir e instalar."
                path="/blog"
            />

            {/* Hero */}
            <div className="bg-gray-900 py-20 px-4 text-center">
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-3">Recursos & Guías</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Blog TerraBlinds</h1>
                <p className="text-lg text-gray-300 max-w-xl mx-auto">
                    Consejos prácticos para elegir, medir e instalar cortinas y persianas. Todo lo que necesitas saber antes de comprar.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-14">
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="text-xl">Próximamente publicaremos artículos.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <Link key={post.id} to={`/blog/${post.slug}`}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Image */}
                                    <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
                                        {post.featured_image ? (
                                            <img src={post.featured_image} alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">🪟</div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span>{fmtDate(post.published_at)}</span>
                                            <span>·</span>
                                            <span>{post.read_time} min de lectura</span>
                                        </div>
                                        <h2 className="text-base font-bold text-gray-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                                            {post.excerpt || post.meta_description}
                                        </p>
                                        <span className="mt-4 text-sm font-semibold text-amber-600 group-hover:text-amber-800">
                                            Leer artículo →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-xl font-bold mb-2">¿Listo para cotizar tu proyecto?</h3>
                    <p className="text-amber-100 mb-5 text-sm">Fabricación a medida con instalación profesional en todo Chile.</p>
                    <Link to="/quote" className="inline-block bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-colors">
                        Cotizar gratis
                    </Link>
                </div>
            </div>
        </Layout>
    );
}

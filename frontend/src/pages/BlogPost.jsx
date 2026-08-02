import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import api from '../api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/blog/${slug}`)
            .then(r => setPost(r.data))
            .catch(err => { if (err.response?.status === 404) setNotFound(true); })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            </div>
        </Layout>
    );

    if (notFound || !post) return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <p className="text-6xl mb-4">📄</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Artículo no encontrado</h1>
                <Link to="/blog" className="text-amber-600 hover:underline mt-4">← Volver al blog</Link>
            </div>
        </Layout>
    );

    const keywords = post.keywords ? post.keywords.split(',').map(k => k.trim()) : [];

    return (
        <Layout>
            <SEO
                title={post.meta_title || post.title}
                description={post.meta_description || post.excerpt || ''}
                path={`/blog/${post.slug}`}
                image={post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : 'https://terrablinds.cl' + post.featured_image) : undefined}
                type="article"
                jsonLd={{
                  '@context': 'https://schema.org',
                  '@type': 'Article',
                  headline: post.meta_title || post.title,
                  description: post.meta_description || post.excerpt || '',
                  image: post.featured_image ? (post.featured_image.startsWith('http') ? post.featured_image : 'https://terrablinds.cl' + post.featured_image) : 'https://terrablinds.cl/og-terrablinds.jpg',
                  datePublished: post.published_at,
                  dateModified: post.updated_at || post.published_at,
                  author: { '@type': 'Person', name: post.author || 'TerraBlinds' },
                  publisher: { '@type': 'Organization', name: 'TerraBlinds', logo: { '@type': 'ImageObject', url: 'https://terrablinds.cl/logoterrablinds.png' } }
                }}
            />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 py-3 px-4">
                <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>/</span>
                    <Link to="/blog" className="hover:text-gray-600">Blog</Link>
                    <span>/</span>
                    <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <header className="mb-10">
                    {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {keywords.slice(0, 3).map(k => (
                                <span key={k} className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                                    {k}
                                </span>
                            ))}
                        </div>
                    )}
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                            <span>✍️</span> {post.author}
                        </span>
                        <span>·</span>
                        <span>{fmtDate(post.published_at)}</span>
                        <span>·</span>
                        <span>{post.read_time} min de lectura</span>
                        {post.views > 0 && <><span>·</span><span>{post.views} vistas</span></>}
                    </div>
                </header>

                {/* Featured image */}
                {post.featured_image && (
                    <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-gray-100">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-lg text-gray-600 leading-relaxed mb-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl italic">
                        {post.excerpt}
                    </p>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:border-collapse"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer CTA */}
                <div className="mt-14 p-7 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl text-white text-center">
                    <h3 className="text-lg font-bold mb-2">¿Necesitas cortinas o persianas a medida?</h3>
                    <p className="text-amber-100 text-sm mb-4">Fabricación propia. Instalación profesional. Despacho a todo Chile.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/quote" className="bg-white text-amber-700 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm">
                            Cotizar gratis
                        </Link>
                        <Link to="/catalog" className="border border-white/50 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
                            Ver catálogo
                        </Link>
                    </div>
                </div>

                {/* Back link */}
                <div className="mt-8 text-center">
                    <Link to="/blog" className="text-sm text-gray-400 hover:text-amber-600 transition-colors">
                        ← Volver al blog
                    </Link>
                </div>
            </article>
        </Layout>
    );
}

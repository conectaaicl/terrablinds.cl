import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';
import api from '../api';
import { COMUNAS, findComunas, displayName } from '../data/comunas';

const fmtDate = d => d
    ? new Date(d).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

export default function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const bodyRef = useRef(null);
    const [post, setPost]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/blogs/slug/${slug}`)
            .then(r => setPost(r.data))
            .catch(err => { if (err?.response?.status === 404) setNotFound(true); })
            .finally(() => setLoading(false));
    }, [slug]);


    // Primera mención de cada comuna en el cuerpo -> enlace a su página.
    // Se hace sobre nodos de texto para no romper el HTML del post ni
    // enlazar dentro de títulos o de enlaces que ya existen.
    useEffect(() => {
        const root = bodyRef.current;
        if (!post?.content || !root) return;
        for (const com of COMUNAS) {
            const names = [com.nombreDisplay, com.nombre].filter(Boolean);
            if (com.slug === 'colina') names.push('Chicureo');
            let linked = false;
            for (const n of [...new Set(names)]) {
                if (linked) break;
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                    acceptNode: node => node.parentElement?.closest('a, h1, h2, h3, h4') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
                });
                let node;
                while ((node = walker.nextNode())) {
                    const idx = node.nodeValue.indexOf(n);
                    if (idx === -1) continue;
                    const target = node.splitText(idx);
                    target.splitText(n.length);
                    const a = document.createElement('a');
                    a.href = `/cortinas/${com.slug}`;
                    a.textContent = n;
                    a.dataset.comuna = com.slug;
                    target.parentNode.replaceChild(a, target);
                    linked = true;
                    break;
                }
            }
        }
    }, [post]);

    const onBodyClick = (e) => {
        const a = e.target.closest?.('a[data-comuna]');
        if (!a) return;
        e.preventDefault();
        navigate(a.getAttribute('href'));
    };

    if (loading) {
        return (
            <Layout>
                <div className="py-24 flex justify-center">
                    <div className="w-8 h-8 border-2 border-[#C8973A] border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (notFound || !post) {
        return (
            <Layout>
                <div className="py-24 text-center px-4">
                    <BookOpen className="w-12 h-12 text-[#C8973A]/40 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#1A1614] mb-2">Artículo no encontrado</h1>
                    <p className="text-[#7A6F65] mb-6">El artículo que buscas no existe o fue eliminado.</p>
                    <Link to="/blog" className="inline-flex items-center gap-2 text-[#C8973A] font-semibold hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Volver al blog
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={post.meta_description ? undefined : post.title}
                description={post.meta_description || post.excerpt || ''}
                image={post.cover_image || undefined}
                path={`/blog/${slug}`}
                canonical={(() => { const cm = findComunas(post.title)[0]; return cm ? `https://terrablinds.cl/cortinas/${cm.slug}` : undefined; })()}
                type="article"
            />

            {/* Cover */}
            {post.cover_image && (
                <div className="w-full h-64 md:h-96 overflow-hidden bg-[#F7F4EF]">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="py-12 px-4">
                <div className="container mx-auto max-w-3xl">
                    {/* Back */}
                    <Link to="/blog" className="inline-flex items-center gap-2 text-[#7A6F65] hover:text-[#C8973A] text-sm font-medium mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al blog
                    </Link>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#7A6F65] mb-6">
                        {post.published_at && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-[#C8973A]" />
                                {fmtDate(post.published_at)}
                            </span>
                        )}
                        {post.author && (
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-[#C8973A]" />
                                {post.author}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1614] tracking-tight leading-tight mb-6">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg text-[#7A6F65] leading-relaxed mb-8 border-l-4 border-[#C8973A] pl-4 italic">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Body */}
                    {post.content && (
                        <div
                            ref={bodyRef}
                            onClick={onBodyClick}
                            className="prose prose-stone max-w-none
                                prose-headings:font-extrabold prose-headings:text-[#1A1614] prose-headings:tracking-tight
                                prose-p:text-[#4A3F35] prose-p:leading-relaxed
                                prose-a:text-[#C8973A] prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-[#1A1614]
                                prose-img:rounded-xl prose-img:shadow-md
                                prose-blockquote:border-[#C8973A] prose-blockquote:text-[#7A6F65]"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    )}

                    {/* Comunas relacionadas */}
                    {(() => {
                        let found = findComunas(post.title);
                        if (!found.length) found = COMUNAS.filter(x => ['las-condes', 'providencia', 'vitacura', 'nunoa'].includes(x.slug));
                        return (
                            <div className="mt-10 pt-6 border-t border-[#E8E2D8]">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#7A6F65] mb-3">Instalamos en tu comuna</p>
                                <div className="flex flex-wrap gap-2">
                                    {found.map(x => (
                                        <Link key={x.slug} to={`/cortinas/${x.slug}`}
                                            className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#F5F0E8] text-[#1A1614] hover:bg-[#C8973A] hover:text-white transition-colors">
                                            {displayName(x)}
                                        </Link>
                                    ))}
                                    <Link to="/la-serena"
                                        className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-[#F5F0E8] text-[#1A1614] hover:bg-[#C8973A] hover:text-white transition-colors">
                                        La Serena y Coquimbo
                                    </Link>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-[#E8E2D8] flex items-center justify-between flex-wrap gap-4">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-[#C8973A] font-semibold hover:underline text-sm">
                            <ArrowLeft className="w-4 h-4" /> Todos los artículos
                        </Link>
                        <Link to="/quote" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8973A] hover:bg-[#A87A2A] text-white font-semibold rounded-xl text-sm transition-colors">
                            Cotizar ahora →
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

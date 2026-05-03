import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit2, Trash2, Save, X, Loader, CheckCircle, Upload, Eye, EyeOff, BookOpen, ExternalLink } from 'lucide-react';
import api from '../api';

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
const TEXTAREA = INPUT + " resize-none";

const EMPTY = { title: '', slug: '', excerpt: '', content: '', meta_description: '', meta_keywords: '', cover_image: '', author: 'TerraBlinds', is_published: true, published_at: new Date().toISOString().slice(0, 10) };

function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function PhotoUpload({ value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const ref = useRef();
    const baseUrl = import.meta.env.VITE_API_URL;
    const handleFile = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data.url.startsWith('http') ? res.data.url : `${baseUrl}${res.data.url}`;
            onChange(url);
        } catch { alert('Error al subir la imagen'); } finally { setUploading(false); }
    };
    return (
        <div className="space-y-2">
            {value ? (
                <div className="relative">
                    <img src={value} alt="Cover" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => onChange('')}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow">
                        <X className="w-3.5 h-3.5" /></button>
                </div>
            ) : (
                <div onClick={() => ref.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploading ? <Loader className="w-8 h-8 animate-spin text-blue-500" />
                        : <><Upload className="w-8 h-8 text-gray-400 mb-2" /><p className="text-sm text-gray-500">Subir imagen de portada</p><p className="text-xs text-gray-400">JPG, PNG, WebP</p></>}
                </div>
            )}
            <input type="file" ref={ref} accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                placeholder="O pega una URL de imagen..." className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none" />
        </div>
    );
}

export default function AdminBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const load = () => {
        setLoading(true);
        api.get('/api/blogs/admin/all').then(r => setPosts(r.data)).catch(() => setPosts([])).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => {
        setEditing('new');
        setForm({ ...EMPTY, published_at: new Date().toISOString().slice(0, 10) });
        setError(null); setSaved(false);
    };

    const openEdit = (post) => {
        setEditing(post.id);
        setForm({
            ...post,
            published_at: post.published_at ? post.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        });
        setError(null); setSaved(false);
    };

    const closeForm = () => { setEditing(null); setForm(EMPTY); };

    const onChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(p => {
            const next = { ...p, [name]: type === 'checkbox' ? checked : value };
            if (name === 'title' && editing === 'new') next.slug = slugify(value);
            return next;
        });
    };

    const save = async (e) => {
        e.preventDefault(); setSaving(true); setError(null); setSaved(false);
        try {
            if (editing === 'new') {
                await api.post('/api/blogs', form);
            } else {
                await api.put(`/api/blogs/${editing}`, form);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            load();
            if (editing === 'new') closeForm();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar.');
        } finally { setSaving(false); }
    };

    const deletePost = async (id) => {
        if (!window.confirm('¿Eliminar este post?')) return;
        setDeleting(id);
        try { await api.delete(`/api/blogs/${id}`); load(); }
        catch { alert('Error al eliminar.'); }
        finally { setDeleting(null); }
    };

    const togglePublish = async (post) => {
        try { await api.put(`/api/blogs/${post.id}`, { is_published: !post.is_published }); load(); }
        catch { alert('Error al cambiar estado.'); }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" /> Blog
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Crea y gestiona los artículos del blog.</p>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">
                    <Plus className="w-4 h-4" /> Nuevo Post
                </button>
            </div>

            {/* Form */}
            {editing !== null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">{editing === 'new' ? 'Nuevo Post' : 'Editar Post'}</h2>
                        <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
                    {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Guardado.</div>}
                    <form onSubmit={save} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                                <input required className={INPUT} name="title" value={form.title} onChange={onChange} placeholder="Título del artículo" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                                <input required className={INPUT} name="slug" value={form.slug} onChange={onChange} placeholder="mi-articulo-de-blog" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada</label>
                            <PhotoUpload value={form.cover_image} onChange={url => setForm(p => ({ ...p, cover_image: url }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (excerpt)</label>
                            <textarea rows={2} className={TEXTAREA} name="excerpt" value={form.excerpt || ''} onChange={onChange} placeholder="Breve descripción que aparece en la lista del blog..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
                            <textarea required rows={10} className={TEXTAREA} name="content" value={form.content} onChange={onChange} placeholder="Escribe el contenido del artículo aquí. Puedes usar HTML básico como <b>negrita</b>, <p>párrafo</p>, <h2>subtítulo</h2>..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                                <input className={INPUT} name="author" value={form.author || ''} onChange={onChange} placeholder="TerraBlinds" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de publicación</label>
                                <input type="date" className={INPUT} name="published_at" value={form.published_at || ''} onChange={onChange} />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input type="checkbox" id="is_published" name="is_published" checked={!!form.is_published} onChange={onChange} className="w-4 h-4 text-blue-600 rounded" />
                                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">Publicado</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta descripción SEO</label>
                                <input className={INPUT} name="meta_description" value={form.meta_description || ''} onChange={onChange} placeholder="Descripción para buscadores (máx 160 caracteres)" maxLength={160} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Palabras clave SEO</label>
                                <input className={INPUT} name="meta_keywords" value={form.meta_keywords || ''} onChange={onChange} placeholder="cortinas, persianas, roller" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeForm} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm text-sm">
                                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Guardando...' : editing === 'new' ? 'Crear Post' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Post list */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No hay posts aún. ¡Crea el primero!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                            {post.cover_image ? (
                                <img src={post.cover_image} alt={post.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                            ) : (
                                <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {post.is_published ? 'Publicado' : 'Borrador'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{post.excerpt ? post.excerpt.slice(0, 80) + (post.excerpt.length > 80 ? '...' : '') : ''}</p>
                                <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug} · {post.author} · {post.published_at ? new Date(post.published_at).toLocaleDateString('es-CL') : ''}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => togglePublish(post)} title={post.is_published ? 'Despublicar' : 'Publicar'}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                    {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" title="Ver en el sitio"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => openEdit(post)} title="Editar"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deletePost(post.id)} disabled={deleting === post.id} title="Eliminar"
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50">
                                    {deleting === post.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

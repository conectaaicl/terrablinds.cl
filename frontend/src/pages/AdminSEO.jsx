import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Search, Save, ExternalLink, Check, Upload, Loader, X, Image as ImageIcon } from 'lucide-react';

const CHAR_LIMITS = { title: 60, description: 160 };

function CharCounter({ value, max }) {
    const len = (value || '').length;
    const pct = len / max;
    const color = pct > 1 ? 'text-red-500' : pct > 0.85 ? 'text-yellow-500' : 'text-gray-400';
    return <span className={`text-xs font-mono ${color}`}>{len}/{max}</span>;
}

function GooglePreview({ title, description, path }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
            <p className="text-xs text-green-700 font-medium mb-0.5">terrablinds.cl{path}</p>
            <p className="text-blue-700 text-base font-medium leading-tight mb-1 line-clamp-1">
                {title || <span className="text-gray-400 italic">Sin título</span>}
            </p>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                {description || <span className="text-gray-400 italic">Sin descripción</span>}
            </p>
        </div>
    );
}

export default function AdminSEO() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const [changes, setChanges] = useState({});
    const [uploadingOg, setUploadingOg] = useState(false);
    const ogInputRef = useRef(null);
    const baseUrl = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        api.get('/api/seo/pages')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setPages(data);
                if (data.length > 0 && !activeKey) setActiveKey(data[0].key);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const getVal = (key, field) => {
        if (changes[key]?.[field] !== undefined) return changes[key][field];
        return pages.find(p => p.key === key)?.[field] || '';
    };

    const setVal = (key, field, value) => {
        setChanges(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const handleOgImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeKey) return;
        setUploadingOg(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setVal(activeKey, 'og_image', res.data.filePath);
        } catch { alert('Error al subir imagen OG.'); }
        finally {
            setUploadingOg(false);
            if (ogInputRef.current) ogInputRef.current.value = '';
        }
    };

    async function save() {
        if (Object.keys(changes).length === 0) return;
        setSaving(true);
        try {
            const payload = Object.entries(changes).map(([key, vals]) => ({
                key,
                title: getVal(key, 'title'),
                description: getVal(key, 'description'),
                og_image: getVal(key, 'og_image'),
            }));
            await api.put('/api/seo/pages', { pages: payload });
            setPages(prev => prev.map(p => ({
                ...p,
                ...(changes[p.key] ? {
                    title: getVal(p.key, 'title'),
                    description: getVal(p.key, 'description'),
                    og_image: getVal(p.key, 'og_image'),
                } : {}),
            })));
            setChanges({});
            setSavedAt(new Date());
        } catch { alert('Error al guardar cambios de SEO.'); }
        setSaving(false);
    }

    const activePage = pages.find(p => p.key === activeKey);
    const hasChanges = Object.keys(changes).length > 0;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Títulos y descripciones para buscadores</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {savedAt && !hasChanges && (
                            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                <Check className="w-4 h-4" /> Guardado
                            </span>
                        )}
                        <button onClick={save} disabled={saving || !hasChanges}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
                    <Search className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-800">Cómo funciona el SEO aquí</p>
                        <p className="text-blue-600 mt-0.5">Los cambios aquí actualizan las etiquetas &lt;title&gt; y &lt;meta description&gt; que Google ve al indexar tu sitio. Mantén el título bajo 60 caracteres y la descripción bajo 160.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Cargando...</div>
                ) : (
                    <div className="flex gap-6">
                        {/* Page list */}
                        <div className="w-52 flex-shrink-0 space-y-1">
                            {pages.map(p => {
                                const changed = !!changes[p.key];
                                return (
                                    <button key={p.key} onClick={() => setActiveKey(p.key)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                                            activeKey === p.key
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        <span className="truncate">{p.label}</span>
                                        {changed && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Editor */}
                        {activePage && (
                            <div className="flex-1 space-y-5">
                                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-semibold text-gray-900">{activePage.label}</h2>
                                        <a href={activePage.path} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                            Ver página <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-semibold text-gray-600">Título SEO</label>
                                            <CharCounter value={getVal(activeKey, 'title')} max={CHAR_LIMITS.title} />
                                        </div>
                                        <input
                                            value={getVal(activeKey, 'title')}
                                            onChange={e => setVal(activeKey, 'title', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Título para Google (máx. 60 caracteres)"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-semibold text-gray-600">Meta Descripción</label>
                                            <CharCounter value={getVal(activeKey, 'description')} max={CHAR_LIMITS.description} />
                                        </div>
                                        <textarea
                                            value={getVal(activeKey, 'description')}
                                            onChange={e => setVal(activeKey, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            placeholder="Descripción para Google (máx. 160 caracteres)"
                                        />
                                    </div>

                                    {/* OG Image */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Imagen OG (og:image para redes sociales)</label>
                                        {getVal(activeKey, 'og_image') ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={getVal(activeKey, 'og_image').startsWith('http') ? getVal(activeKey, 'og_image') : `${baseUrl}${getVal(activeKey, 'og_image')}`}
                                                    alt="OG preview"
                                                    className="w-full max-w-xs h-28 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setVal(activeKey, 'og_image', '')}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                ><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 hover:border-blue-400 cursor-pointer rounded-lg text-gray-400 hover:text-blue-500 transition-colors text-sm w-fit">
                                                {uploadingOg ? <><Loader className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir imagen OG</>}
                                                <input ref={ogInputRef} type="file" accept="image/*" className="hidden" onChange={handleOgImageUpload} disabled={uploadingOg} />
                                            </label>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">Recomendado: 1200×630 px. Se muestra al compartir en redes sociales.</p>
                                    </div>
                                </div>

                                {/* Google preview */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vista previa en Google</p>
                                    <GooglePreview
                                        title={getVal(activeKey, 'title')}
                                        description={getVal(activeKey, 'description')}
                                        path={activePage.path}
                                    />
                                </div>

                                {/* Sitemap link */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Herramientas</p>
                                    <div className="flex gap-3 flex-wrap">
                                        <a href="/sitemap.xml" target="_blank"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            <ExternalLink className="w-3.5 h-3.5" /> sitemap.xml
                                        </a>
                                        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            <ExternalLink className="w-3.5 h-3.5" /> Google Search Console
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, Palette, Upload, Loader, X } from 'lucide-react';
import api from '../api';

const Section = ({ title, desc, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {children}
    </div>
);

const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
        {children}
    </div>
);

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

const ImageUploadField = ({ label, hint, value, fieldName, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange(fieldName, res.data.filePath);
        } catch { alert('Error al subir la imagen.'); }
        finally { setUploading(false); e.target.value = ''; }
    };
    return (
        <Field label={label} hint={hint}>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input className={INPUT} value={value || ''} onChange={e => onChange(fieldName, e.target.value)} placeholder="URL de imagen o sube un archivo" />
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
                        {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Subiendo...' : 'Subir'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                    </label>
                </div>
                {value && (
                    <div className="relative inline-block">
                        <img src={value} alt="preview" className="h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1" />
                        <button type="button" onClick={() => onChange(fieldName, '')}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                )}
            </div>
        </Field>
    );
};

const COLOR_PRESETS = [
    { name: 'Azul Real', primary: '#2563eb', secondary: '#1d4ed8', accent: '#3b82f6' },
    { name: 'Esmeralda', primary: '#059669', secondary: '#047857', accent: '#10b981' },
    { name: 'Ámbar', primary: '#d97706', secondary: '#b45309', accent: '#f59e0b' },
    { name: 'Violeta', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
    { name: 'Rosa Elegante', primary: '#db2777', secondary: '#be185d', accent: '#ec4899' },
    { name: 'Gris Slate', primary: '#475569', secondary: '#334155', accent: '#64748b' },
    { name: 'Rojo', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
    { name: 'Índigo', primary: '#4f46e5', secondary: '#4338ca', accent: '#6366f1' },
];

export default function AdminApariencia() {
    const [s, setS] = useState({
        logo_url: '', favicon_url: '',
        theme_primary: '#2563eb', theme_secondary: '#1d4ed8', theme_accent: '#3b82f6',
        theme_bg_dark: '#111827', theme_text_light: '#f9fafb',
        brand_name: 'TerraBlinds', brand_slogan: 'Elegancia para tus espacios',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/config').then(r => setS(p => ({ ...p, ...r.data }))).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const set = (key, val) => setS(p => ({ ...p, [key]: val }));
    const applyPreset = (preset) => setS(p => ({ ...p, theme_primary: preset.primary, theme_secondary: preset.secondary, theme_accent: preset.accent }));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true); setSaved(false); setError(null);
        try {
            await api.put('/api/config', s);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { setError('Error al guardar.'); }
        finally { setSaving(false); }
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Palette className="w-6 h-6 text-blue-600" /> Apariencia & Colores</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Personaliza el diseño visual del sitio web.</p>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Cambios guardados correctamente.</div>}

            <form onSubmit={save} className="space-y-5">
                {/* Brand */}
                <Section title="Identidad de Marca" desc="Logo y nombre que aparecen en el sitio y el admin.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nombre de la Marca">
                            <input className={INPUT} value={s.brand_name || ''} onChange={e => set('brand_name', e.target.value)} placeholder="TerraBlinds" />
                        </Field>
                        <Field label="Eslogan / Tagline">
                            <input className={INPUT} value={s.brand_slogan || ''} onChange={e => set('brand_slogan', e.target.value)} placeholder="Elegancia para tus espacios" />
                        </Field>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUploadField label="Logo (PNG recomendado)" hint="Se muestra en el header y footer. Alto máx 80px." value={s.logo_url} fieldName="logo_url" onChange={set} />
                        <ImageUploadField label="Favicon" hint="Icono de 32×32px o 64×64px para la pestaña del navegador." value={s.favicon_url} fieldName="favicon_url" onChange={set} />
                    </div>
                </Section>

                {/* Colors */}
                <Section title="Paleta de Colores" desc="Colores principales del sitio. Elige un preset o personaliza.">
                    <div className="mb-5">
                        <p className="text-sm font-medium text-gray-700 mb-3">Presets de colores</p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map(p => (
                                <button key={p.name} type="button" onClick={() => applyPreset(p)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 text-sm font-medium text-gray-700 transition-colors bg-white hover:bg-gray-50">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { key: 'theme_primary', label: 'Color Principal', desc: 'Botones, links, badges' },
                            { key: 'theme_secondary', label: 'Color Secundario', desc: 'Hover states, sombras' },
                            { key: 'theme_accent', label: 'Color de Acento', desc: 'Highlights, iconos activos' },
                        ].map(c => (
                            <div key={c.key} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <label className="text-sm font-semibold text-gray-800">{c.label}</label>
                                <p className="text-xs text-gray-400">{c.desc}</p>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={s[c.key] || '#2563eb'} onChange={e => set(c.key, e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5" />
                                    <input className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-mono"
                                        value={s[c.key] || ''} onChange={e => set(c.key, e.target.value)} placeholder="#2563eb" />
                                </div>
                                <div className="h-8 rounded-lg" style={{ backgroundColor: s[c.key] }} />
                            </div>
                        ))}
                    </div>

                    {/* Live preview */}
                    <div className="mt-5 p-5 rounded-xl border border-gray-200 bg-white">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vista previa de colores</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button type="button" className="px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: s.theme_primary }}>Botón Principal</button>
                            <button type="button" className="px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: s.theme_secondary }}>Botón Secundario</button>
                            <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: s.theme_accent }}>Etiqueta</span>
                            <a href="#" className="text-sm font-medium underline" style={{ color: s.theme_primary }} onClick={e => e.preventDefault()}>Enlace de ejemplo</a>
                        </div>
                    </div>
                </Section>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

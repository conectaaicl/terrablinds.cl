import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, MonitorSmartphone, Upload, Loader, X } from 'lucide-react';
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
const TEXTAREA = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none";

const ImageUploadField = ({ label, hint, value, fieldName, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const handleFile = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange(fieldName, res.data.filePath);
        } catch { alert('Error.'); } finally { setUploading(false); e.target.value = ''; }
    };
    return (
        <Field label={label} hint={hint}>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input className={INPUT} value={value || ''} onChange={e => onChange(fieldName, e.target.value)} placeholder="URL o sube archivo" />
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
                        {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Subiendo...' : 'Subir'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                    </label>
                </div>
                {value && (
                    <div className="relative inline-block">
                        <img src={value} alt="" className="h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1" />
                        <button type="button" onClick={() => onChange(fieldName, '')} className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                )}
            </div>
        </Field>
    );
};

export default function AdminSoftware() {
    const [s, setS] = useState({
        software_enabled: 'true',
        software_title: '', software_subtitle: '', software_description: '',
        software_badge: '', software_image_url: '',
        software_cta_label: '', software_cta_url: '',
        software_alt_label: '', software_alt_url: '',
        software_feature1: '', software_feature2: '', software_feature3: '', software_feature4: '',
        software_price: '', software_price_period: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/config').then(r => setS(p => ({ ...p, ...r.data }))).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const onChange = e => setS(p => ({ ...p, [e.target.name]: e.target.value }));
    const set = (k, v) => setS(p => ({ ...p, [k]: v }));

    const save = async (e) => {
        e.preventDefault(); setSaving(true); setSaved(false); setError(null);
        try { await api.put('/api/config', s); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch { setError('Error al guardar.'); } finally { setSaving(false); }
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MonitorSmartphone className="w-6 h-6 text-blue-600" /> Página Software</h1>
                <p className="text-gray-500 text-sm mt-0.5">Gestiona el contenido de la página de presentación del software.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Guardado.</div>}

            <form onSubmit={save} className="space-y-5">
                <Section title="Visibilidad">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded accent-blue-600"
                            checked={s.software_enabled === 'true' || s.software_enabled === true}
                            onChange={e => set('software_enabled', e.target.checked ? 'true' : 'false')} />
                        <div>
                            <span className="text-sm font-medium text-gray-800">Mostrar esta página en el sitio web</span>
                            <p className="text-xs text-gray-400">Si está desactivado, la página no aparecerá en el menú de navegación.</p>
                        </div>
                    </label>
                </Section>

                <Section title="Contenido Principal">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Nombre del Producto"><input className={INPUT} name="software_title" value={s.software_title || ''} onChange={onChange} placeholder="WorkShopOS" /></Field>
                            <Field label="Badge / Etiqueta"><input className={INPUT} name="software_badge" value={s.software_badge || ''} onChange={onChange} placeholder="Desarrollado por TerraBlinds" /></Field>
                        </div>
                        <Field label="Subtítulo"><input className={INPUT} name="software_subtitle" value={s.software_subtitle || ''} onChange={onChange} placeholder="El sistema de gestión para talleres de cortinas" /></Field>
                        <Field label="Descripción completa"><textarea className={TEXTAREA} rows={4} name="software_description" value={s.software_description || ''} onChange={onChange} placeholder="Describe el software, sus beneficios y para quién está dirigido..." /></Field>
                        <ImageUploadField label="Imagen / Screenshot" hint="Captura de pantalla del software. Recomendado: 1200×700px." value={s.software_image_url} fieldName="software_image_url" onChange={set} />
                    </div>
                </Section>

                <Section title="Características del Producto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1,2,3,4].map(n => (
                            <Field key={n} label={`Característica ${n}`}>
                                <input className={INPUT} name={`software_feature${n}`} value={s[`software_feature${n}`] || ''} onChange={onChange}
                                    placeholder={['Gestión de órdenes de trabajo', 'Panel de cotizaciones', 'App para instaladores', 'Informes y estadísticas'][n-1]} />
                            </Field>
                        ))}
                    </div>
                </Section>

                <Section title="Precio (opcional)">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Precio" hint="Ej: $29.990"><input className={INPUT} name="software_price" value={s.software_price || ''} onChange={onChange} placeholder="$29.990" /></Field>
                        <Field label="Período" hint="Ej: /mes"><input className={INPUT} name="software_price_period" value={s.software_price_period || ''} onChange={onChange} placeholder="/mes" /></Field>
                    </div>
                </Section>

                <Section title="Botones de Acción (CTA)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Botón principal — Texto"><input className={INPUT} name="software_cta_label" value={s.software_cta_label || ''} onChange={onChange} placeholder="Comenzar ahora" /></Field>
                        <Field label="Botón principal — URL"><input className={INPUT} name="software_cta_url" value={s.software_cta_url || ''} onChange={onChange} placeholder="https://working.conectaai.cl" /></Field>
                        <Field label="Botón secundario — Texto"><input className={INPUT} name="software_alt_label" value={s.software_alt_label || ''} onChange={onChange} placeholder="Ver demo" /></Field>
                        <Field label="Botón secundario — URL"><input className={INPUT} name="software_alt_url" value={s.software_alt_url || ''} onChange={onChange} placeholder="https://working.conectaai.cl/demo" /></Field>
                    </div>
                </Section>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

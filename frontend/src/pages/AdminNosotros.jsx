import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, Users, Upload, Loader, X } from 'lucide-react';
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
        } catch { alert('Error al subir.'); } finally { setUploading(false); e.target.value = ''; }
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
                        <img src={value} alt="" className="h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1" />
                        <button type="button" onClick={() => onChange(fieldName, '')} className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                )}
            </div>
        </Field>
    );
};

export default function AdminNosotros() {
    const [s, setS] = useState({
        about_title: '', about_subtitle: '',
        about_history_title: '', about_history_text1: '', about_history_text2: '', about_image_url: '',
        about_val1_title: '', about_val1_text: '',
        about_val2_title: '', about_val2_text: '',
        about_val3_title: '', about_val3_text: '',
        about_val4_title: '', about_val4_text: '',
        about_team_title: '', about_team_subtitle: '',
        about_cta_title: '', about_cta_text: '', about_cta_label: '',
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
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Página Nosotros</h1>
                <p className="text-gray-500 text-sm mt-0.5">Edita toda la información de la página "Sobre Nosotros".</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Guardado correctamente.</div>}

            <form onSubmit={save} className="space-y-5">
                <Section title="Encabezado de la Página">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Título principal"><input className={INPUT} name="about_title" value={s.about_title || ''} onChange={onChange} placeholder="Sobre Nosotros" /></Field>
                        <Field label="Subtítulo"><input className={INPUT} name="about_subtitle" value={s.about_subtitle || ''} onChange={onChange} placeholder="Dedicados a transformar tus espacios..." /></Field>
                    </div>
                </Section>

                <Section title="Historia de la Empresa" desc="Texto narrativo e imagen de la empresa.">
                    <div className="space-y-4">
                        <Field label="Título de la sección historia"><input className={INPUT} name="about_history_title" value={s.about_history_title || ''} onChange={onChange} placeholder="Expertos en cortinas desde 2010" /></Field>
                        <Field label="Párrafo 1"><textarea className={TEXTAREA} rows={3} name="about_history_text1" value={s.about_history_text1 || ''} onChange={onChange} placeholder="Primer párrafo de la historia..." /></Field>
                        <Field label="Párrafo 2 (opcional)"><textarea className={TEXTAREA} rows={3} name="about_history_text2" value={s.about_history_text2 || ''} onChange={onChange} placeholder="Segundo párrafo..." /></Field>
                        <ImageUploadField label="Imagen principal" hint="Foto del equipo o instalación. Recomendado: 800×600px." value={s.about_image_url} fieldName="about_image_url" onChange={set} />
                    </div>
                </Section>

                <Section title="Valores de la Empresa" desc="4 tarjetas con los valores o pilares de la empresa.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Valor {n}</p>
                                <Field label="Título">
                                    <input className={INPUT} name={`about_val${n}_title`} value={s[`about_val${n}_title`] || ''} onChange={onChange}
                                        placeholder={['Calidad Premium', 'Puntualidad', 'Garantía Total', 'Asesoría Personalizada'][n-1]} />
                                </Field>
                                <Field label="Descripción">
                                    <textarea className={TEXTAREA} rows={2} name={`about_val${n}_text`} value={s[`about_val${n}_text`] || ''} onChange={onChange} placeholder="Descripción del valor..." />
                                </Field>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Llamado a la Acción (CTA)" desc="Sección final de la página con invitación a contactar o cotizar.">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Título del CTA"><input className={INPUT} name="about_cta_title" value={s.about_cta_title || ''} onChange={onChange} placeholder="¿Listo para transformar tu espacio?" /></Field>
                            <Field label="Texto del botón"><input className={INPUT} name="about_cta_label" value={s.about_cta_label || ''} onChange={onChange} placeholder="Solicitar Cotización" /></Field>
                        </div>
                        <Field label="Texto descriptivo"><textarea className={TEXTAREA} rows={2} name="about_cta_text" value={s.about_cta_text || ''} onChange={onChange} placeholder="Contáctanos hoy y recibe asesoría gratuita..." /></Field>
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

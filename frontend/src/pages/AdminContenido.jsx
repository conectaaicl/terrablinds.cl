import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, FileText } from 'lucide-react';
import api from '../api';

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
const TEXTAREA = INPUT + " resize-none";

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

const DEFAULTS = {
    catalog_title: 'Catálogo de Productos',
    catalog_subtitle: 'Explora nuestra colección de cortinas y persianas diseñadas a medida para tus espacios.',
    faq_title: 'Preguntas Frecuentes',
    faq_subtitle: 'Todo lo que necesitas saber antes de cotizar.',
    projects_title: 'Proyectos Realizados',
    projects_subtitle: 'Más de 500 proyectos exitosos en hogares y empresas a lo largo de Chile.',
    blog_title: 'Blog TerraBlinds',
    blog_subtitle: 'Consejos, tendencias y novedades sobre cortinas y decoración de interiores.',
    contact_extra_text: '',
    booking_hero_title: 'Agenda tu Servicio',
    booking_hero_subtitle: 'Elige servicio, fecha y hora. Confirmación automática por email.',
    footer_schedule: 'Lun – Vie: 9:00 – 18:00 · Sáb: 10:00 – 14:00',
    footer_address: 'Santiago, Chile',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    google_analytics_id: '',
};

export default function AdminContenido() {
    const [s, setS] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/config').then(r => setS(p => ({ ...p, ...r.data }))).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const onChange = e => setS(p => ({ ...p, [e.target.name]: e.target.value }));

    const save = async (e) => {
        e.preventDefault(); setSaving(true); setSaved(false); setError(null);
        try {
            await api.put('/api/config', s);
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch { setError('Error al guardar.'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" /> Contenido General del Sitio
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    Encabezados de páginas, datos de contacto, redes sociales y analytics.
                </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-5">{error}</div>}
            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Guardado correctamente.
                </div>
            )}

            <form onSubmit={save} className="space-y-5">

                <Section title="Catálogo de Productos" desc="Encabezado de la página /catalog">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="catalog_title" value={s.catalog_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="catalog_subtitle" value={s.catalog_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Preguntas Frecuentes" desc="Encabezado de la página /faq">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="faq_title" value={s.faq_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="faq_subtitle" value={s.faq_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Proyectos Realizados" desc="Encabezado de la página /projects">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="projects_title" value={s.projects_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="projects_subtitle" value={s.projects_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Blog" desc="Encabezado de la página /blog">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="blog_title" value={s.blog_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="blog_subtitle" value={s.blog_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Página de Reservas" desc="Encabezado de la página /booking">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="booking_hero_title" value={s.booking_hero_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="booking_hero_subtitle" value={s.booking_hero_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Pie de Página (Footer)" desc="Información que aparece en el footer del sitio">
                    <div className="space-y-4">
                        <Field label="Horario de atención" hint="Ej: Lun – Vie: 9:00 – 18:00 · Sáb: 10:00 – 14:00">
                            <input className={INPUT} name="footer_schedule" value={s.footer_schedule || ''} onChange={onChange} />
                        </Field>
                        <Field label="Dirección" hint="Texto de dirección que aparece en el footer">
                            <input className={INPUT} name="footer_address" value={s.footer_address || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Redes Sociales" desc="URLs de tus perfiles en redes sociales">
                    <div className="space-y-4">
                        <Field label="WhatsApp (número con código de país)" hint="Ej: 56912345678">
                            <input className={INPUT} name="whatsapp_number" value={s.whatsapp_number || ''} onChange={onChange} placeholder="56912345678" />
                        </Field>
                        <Field label="Instagram URL">
                            <input className={INPUT} name="instagram_url" value={s.instagram_url || ''} onChange={onChange} placeholder="https://instagram.com/terrablinds" />
                        </Field>
                        <Field label="Facebook URL">
                            <input className={INPUT} name="facebook_url" value={s.facebook_url || ''} onChange={onChange} placeholder="https://facebook.com/terrablinds" />
                        </Field>
                        <Field label="TikTok URL">
                            <input className={INPUT} name="tiktok_url" value={s.tiktok_url || ''} onChange={onChange} placeholder="https://tiktok.com/@terrablinds" />
                        </Field>
                    </div>
                </Section>

                <Section title="Google Analytics" desc="Conecta tu sitio con Google Analytics 4">
                    <Field label="ID de medición (G-XXXXXXXXXX)" hint="Lo encuentras en Google Analytics → Admin → Flujos de datos → tu sitio web → ID de medición">
                        <input className={INPUT} name="google_analytics_id" value={s.google_analytics_id || ''} onChange={onChange} placeholder="G-XXXXXXXXXX" />
                    </Field>
                    {s.google_analytics_id && (
                        <p className="text-xs text-green-600 mt-2">✓ Analytics configurado. Recarga la página del sitio para que empiece a medir.</p>
                    )}
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

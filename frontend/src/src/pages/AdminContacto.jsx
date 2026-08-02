import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, Phone, Loader } from 'lucide-react';
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

export default function AdminContacto() {
    const [s, setS] = useState({
        company_email: '', company_phone: '', whatsapp_number: '', company_address: '',
        company_region: '', company_city: '',
        contact_title: '', contact_subtitle: '',
        contact_hours: '', contact_map_embed: '',
        social_facebook: '', social_instagram: '', social_tiktok: '', social_youtube: '', social_twitter: '',
        admin_notification_email: '', resend_api_key: '',
    });
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
        try { await api.put('/api/config', s); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch { setError('Error al guardar.'); } finally { setSaving(false); }
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Phone className="w-6 h-6 text-blue-600" /> Página Contacto</h1>
                <p className="text-gray-500 text-sm mt-0.5">Gestiona la información de contacto que ve el público.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Guardado correctamente.</div>}

            <form onSubmit={save} className="space-y-5">
                <Section title="Encabezado de la Página">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Título"><input className={INPUT} name="contact_title" value={s.contact_title || ''} onChange={onChange} placeholder="Contáctanos" /></Field>
                        <Field label="Subtítulo"><input className={INPUT} name="contact_subtitle" value={s.contact_subtitle || ''} onChange={onChange} placeholder="Estamos listos para ayudarte" /></Field>
                    </div>
                </Section>

                <Section title="Información de Contacto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Email de Contacto Público"><input type="email" className={INPUT} name="company_email" value={s.company_email || ''} onChange={onChange} placeholder="contacto@terrablinds.cl" /></Field>
                        <Field label="Teléfono"><input className={INPUT} name="company_phone" value={s.company_phone || ''} onChange={onChange} placeholder="+56 9 1234 5678" /></Field>
                        <Field label="WhatsApp (solo dígitos)" hint="Ej: 56912345678 (código país + número, sin + ni espacios)">
                            <input className={INPUT} name="whatsapp_number" value={s.whatsapp_number || ''} onChange={onChange} placeholder="56912345678" />
                        </Field>
                        <Field label="Horario de Atención"><input className={INPUT} name="contact_hours" value={s.contact_hours || ''} onChange={onChange} placeholder="Lun–Vie 9:00–18:00 hrs" /></Field>
                        <Field label="Ciudad"><input className={INPUT} name="company_city" value={s.company_city || ''} onChange={onChange} placeholder="Santiago" /></Field>
                        <Field label="Región"><input className={INPUT} name="company_region" value={s.company_region || ''} onChange={onChange} placeholder="Región Metropolitana" /></Field>
                        <div className="md:col-span-2">
                            <Field label="Dirección completa"><input className={INPUT} name="company_address" value={s.company_address || ''} onChange={onChange} placeholder="Av. Ejemplo 123, Las Condes, Santiago" /></Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field label="Embed Google Maps (iframe src)" hint="Pega aquí el URL del iframe de Google Maps. Obténlo en google.com/maps → Compartir → Insertar un mapa → copia el src=&quot;...&quot;">
                                <textarea className={TEXTAREA} rows={2} name="contact_map_embed" value={s.contact_map_embed || ''} onChange={onChange} placeholder="https://www.google.com/maps/embed?pb=..." />
                            </Field>
                        </div>
                    </div>
                </Section>

                <Section title="Redes Sociales" desc="URLs completas de cada red social.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'social_facebook', label: 'Facebook', ph: 'https://facebook.com/terrablinds' },
                            { name: 'social_instagram', label: 'Instagram', ph: 'https://instagram.com/terrablinds' },
                            { name: 'social_tiktok', label: 'TikTok', ph: 'https://tiktok.com/@terrablinds' },
                            { name: 'social_youtube', label: 'YouTube', ph: 'https://youtube.com/@terrablinds' },
                            { name: 'social_twitter', label: 'Twitter / X', ph: 'https://x.com/terrablinds' },
                        ].map(f => (
                            <Field key={f.name} label={f.label}>
                                <input className={INPUT} name={f.name} value={s[f.name] || ''} onChange={onChange} placeholder={f.ph} />
                            </Field>
                        ))}
                    </div>
                </Section>

                <Section title="Email & Notificaciones" desc="Configuración de Resend para enviar y recibir emails.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Resend API Key" hint="Obtén tu clave en resend.com">
                            <input type="password" className={INPUT} name="resend_api_key" value={s.resend_api_key || ''} onChange={onChange} placeholder="re_••••••••" />
                        </Field>
                        <Field label="Email para notificaciones admin" hint="Recibe un aviso cada vez que llegue una nueva cotización.">
                            <input type="email" className={INPUT} name="admin_notification_email" value={s.admin_notification_email || ''} onChange={onChange} placeholder="ventas@terrablinds.cl" />
                        </Field>
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

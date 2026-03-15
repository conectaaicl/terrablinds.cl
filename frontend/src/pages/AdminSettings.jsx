import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, Upload, X } from 'lucide-react';
import api from '../api';

const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">{title}</h2>
        {children}
    </div>
);

const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const Input = (props) => (
    <input {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
);

const Textarea = (props) => (
    <textarea {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none" />
);

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
        } catch {
            alert('Error al subir la imagen. Asegúrate de que el archivo sea menor a 20MB.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <Field label={label} hint={hint}>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        value={value || ''}
                        onChange={e => onChange(fieldName, e.target.value)}
                        placeholder="URL de imagen o sube un archivo"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
                        {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Subiendo...' : 'Subir'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                    </label>
                </div>
                {value && (
                    <div className="relative inline-block">
                        <img src={value} alt="preview" className="h-16 rounded-lg object-contain border border-gray-200 bg-gray-50 p-1" />
                        <button type="button" onClick={() => onChange(fieldName, '')}
                            className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </Field>
    );
};

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        // Pagos
        flow_api_key: '', flow_secret_key: '', flow_api_url: '',
        mercadopago_access_token: '', mercadopago_public_key: '',
        // Email
        resend_api_key: '', admin_notification_email: '',
        // Marca
        logo_url: '',
        // Hero
        hero_title: '', hero_subtitle: '', hero_cta_primary: '', hero_cta_secondary: '', hero_bg_image: '',
        // Contacto
        whatsapp_number: '', company_email: '', company_phone: '', company_address: '',
        // Redes sociales
        social_facebook: '', social_instagram: '', social_tiktok: '', social_youtube: '', social_twitter: '',
        // About
        about_title: '', about_subtitle: '',
        about_history_title: '', about_history_text1: '', about_history_text2: '', about_image_url: '',
        about_val1_title: '', about_val1_text: '',
        about_val2_title: '', about_val2_text: '',
        about_val3_title: '', about_val3_text: '',
        about_val4_title: '', about_val4_text: '',
        // Software
        software_enabled: 'true',
        software_title: '', software_subtitle: '', software_description: '',
        software_badge: '', software_image_url: '',
        software_cta_label: '', software_cta_url: '',
        software_alt_label: '', software_alt_url: '',
        // Automatización
        webhook_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/config');
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            console.error('Error fetching settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleFieldChange = (name, value) => {
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);
        try {
            await api.put('/api/config', settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-500">Gestiona integraciones, contenido y diseño del sitio.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" /> Configuración guardada correctamente.
                        </div>
                    )}

                    {/* HERO */}
                    <Section title="Banner Principal (Hero)">
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Título Principal" hint="Texto grande que aparece en el banner de inicio.">
                                <Input name="hero_title" value={settings.hero_title || ''} onChange={handleChange}
                                    placeholder="Ej: Elegancia y Control para tus Espacios" />
                            </Field>
                            <Field label="Subtítulo" hint="Texto descriptivo bajo el título.">
                                <Input name="hero_subtitle" value={settings.hero_subtitle || ''} onChange={handleChange}
                                    placeholder="Ej: Cortinas roller, persianas y toldos a medida." />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Botón Primario (texto)">
                                    <Input name="hero_cta_primary" value={settings.hero_cta_primary || ''} onChange={handleChange}
                                        placeholder="Ver Catálogo" />
                                </Field>
                                <Field label="Botón Secundario (texto)">
                                    <Input name="hero_cta_secondary" value={settings.hero_cta_secondary || ''} onChange={handleChange}
                                        placeholder="Cotizar Ahora" />
                                </Field>
                            </div>
                            <ImageUploadField
                                label="Imagen de Fondo del Hero"
                                hint="Recomendado: 1920×1080px. Deja vacío para usar fondo oscuro por defecto."
                                value={settings.hero_bg_image}
                                fieldName="hero_bg_image"
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Section>

                    {/* IDENTIDAD */}
                    <Section title="Identidad de Marca">
                        <ImageUploadField
                            label="Logo del sitio"
                            hint="Se mostrará en el header y footer. Recomendado: PNG transparente, alto máx. 80px."
                            value={settings.logo_url}
                            fieldName="logo_url"
                            onChange={handleFieldChange}
                        />
                    </Section>

                    {/* EMPRESA */}
                    <Section title="Información de la Empresa">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Email de Contacto">
                                <Input type="email" name="company_email" value={settings.company_email || ''} onChange={handleChange}
                                    placeholder="contacto@terrablinds.cl" />
                            </Field>
                            <Field label="Teléfono">
                                <Input name="company_phone" value={settings.company_phone || ''} onChange={handleChange}
                                    placeholder="+56 9 1234 5678" />
                            </Field>
                            <Field label="Número WhatsApp" hint="Solo dígitos, sin +. Ej: 56912345678">
                                <Input name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={handleChange}
                                    placeholder="56912345678" />
                            </Field>
                            <div className="col-span-2">
                                <Field label="Dirección">
                                    <Input name="company_address" value={settings.company_address || ''} onChange={handleChange}
                                        placeholder="Av. Ejemplo 123, Santiago" />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* REDES SOCIALES */}
                    <Section title="Redes Sociales">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Facebook (URL completa)">
                                <Input name="social_facebook" value={settings.social_facebook || ''} onChange={handleChange}
                                    placeholder="https://facebook.com/terrablinds" />
                            </Field>
                            <Field label="Instagram (URL completa)">
                                <Input name="social_instagram" value={settings.social_instagram || ''} onChange={handleChange}
                                    placeholder="https://instagram.com/terrablinds" />
                            </Field>
                            <Field label="TikTok (URL completa)">
                                <Input name="social_tiktok" value={settings.social_tiktok || ''} onChange={handleChange}
                                    placeholder="https://tiktok.com/@terrablinds" />
                            </Field>
                            <Field label="YouTube (URL completa)">
                                <Input name="social_youtube" value={settings.social_youtube || ''} onChange={handleChange}
                                    placeholder="https://youtube.com/@terrablinds" />
                            </Field>
                        </div>
                    </Section>

                    {/* ABOUT */}
                    <Section title="Página «Sobre Nosotros»">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Título de la página">
                                    <Input name="about_title" value={settings.about_title || ''} onChange={handleChange}
                                        placeholder="Sobre Nosotros" />
                                </Field>
                                <Field label="Subtítulo">
                                    <Input name="about_subtitle" value={settings.about_subtitle || ''} onChange={handleChange}
                                        placeholder="Dedicados a transformar tus espacios..." />
                                </Field>
                            </div>
                            <ImageUploadField
                                label="Imagen principal (sección historia)"
                                hint="Foto del equipo, taller o instalación. Recomendado: 800×600px."
                                value={settings.about_image_url}
                                fieldName="about_image_url"
                                onChange={handleFieldChange}
                            />
                            <Field label="Título de la sección historia">
                                <Input name="about_history_title" value={settings.about_history_title || ''} onChange={handleChange}
                                    placeholder="Expertos en cortinas y persianas desde 2010" />
                            </Field>
                            <Field label="Párrafo 1">
                                <Textarea name="about_history_text1" value={settings.about_history_text1 || ''} onChange={handleChange}
                                    rows={3} placeholder="Texto del primer párrafo de la historia de la empresa..." />
                            </Field>
                            <Field label="Párrafo 2 (opcional)">
                                <Textarea name="about_history_text2" value={settings.about_history_text2 || ''} onChange={handleChange}
                                    rows={3} placeholder="Texto del segundo párrafo..." />
                            </Field>

                            <p className="text-sm font-semibold text-gray-700 mt-2 border-t pt-4">Tarjetas de valores (4 tarjetas)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                        <Field label={`Valor ${n} — Título`}>
                                            <Input name={`about_val${n}_title`} value={settings[`about_val${n}_title`] || ''} onChange={handleChange}
                                                placeholder="Ej: Calidad" />
                                        </Field>
                                        <Field label={`Valor ${n} — Descripción`}>
                                            <Input name={`about_val${n}_text`} value={settings[`about_val${n}_text`] || ''} onChange={handleChange}
                                                placeholder="Materiales certificados y duraderos." />
                                        </Field>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>

                    {/* SOFTWARE */}
                    <Section title="Página «Software» — WorkShopOS">
                        <div className="grid grid-cols-1 gap-4">
                            <Field label="Mostrar sección Software en el sitio">
                                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                    <input type="checkbox" name="software_enabled"
                                        checked={settings.software_enabled === 'true' || settings.software_enabled === true}
                                        onChange={e => handleFieldChange('software_enabled', e.target.checked ? 'true' : 'false')}
                                        className="w-4 h-4 rounded" />
                                    <span className="text-sm text-gray-700">Visible para visitantes</span>
                                </label>
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Nombre del producto">
                                    <Input name="software_title" value={settings.software_title || ''} onChange={handleChange}
                                        placeholder="WorkShopOS" />
                                </Field>
                                <Field label="Badge / etiqueta">
                                    <Input name="software_badge" value={settings.software_badge || ''} onChange={handleChange}
                                        placeholder="Desarrollado por TerraBlinds" />
                                </Field>
                            </div>
                            <Field label="Subtítulo">
                                <Input name="software_subtitle" value={settings.software_subtitle || ''} onChange={handleChange}
                                    placeholder="El sistema de gestión para talleres y empresas de instalación" />
                            </Field>
                            <Field label="Descripción completa">
                                <Textarea name="software_description" value={settings.software_description || ''} onChange={handleChange}
                                    rows={3} placeholder="Descripción del producto, qué hace, para quién es..." />
                            </Field>
                            <ImageUploadField
                                label="Imagen / Screenshot del producto"
                                hint="Captura de pantalla del software. Recomendado: 1200×700px."
                                value={settings.software_image_url}
                                fieldName="software_image_url"
                                onChange={handleFieldChange}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Botón principal — Texto">
                                    <Input name="software_cta_label" value={settings.software_cta_label || ''} onChange={handleChange}
                                        placeholder="Comprar ahora" />
                                </Field>
                                <Field label="Botón principal — URL">
                                    <Input name="software_cta_url" value={settings.software_cta_url || ''} onChange={handleChange}
                                        placeholder="https://working.conectaai.cl" />
                                </Field>
                                <Field label="Botón secundario — Texto">
                                    <Input name="software_alt_label" value={settings.software_alt_label || ''} onChange={handleChange}
                                        placeholder="Ver más información" />
                                </Field>
                                <Field label="Botón secundario — URL">
                                    <Input name="software_alt_url" value={settings.software_alt_url || ''} onChange={handleChange}
                                        placeholder="https://working.conectaai.cl" />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* EMAIL */}
                    <Section title="Email & Notificaciones (Resend)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Resend API Key" hint="Obtén tu clave en resend.com">
                                <Input type="password" name="resend_api_key" value={settings.resend_api_key || ''} onChange={handleChange}
                                    placeholder="re_12345678..." />
                            </Field>
                            <Field label="Email para recibir notificaciones" hint="Se enviará un aviso a este email con cada nueva cotización.">
                                <Input type="email" name="admin_notification_email" value={settings.admin_notification_email || ''} onChange={handleChange}
                                    placeholder="ventas@terrablinds.cl" />
                            </Field>
                        </div>
                    </Section>

                    {/* FLOW */}
                    <Section title="Pasarela de Pago — Flow.cl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Flow API Key">
                                <Input name="flow_api_key" value={settings.flow_api_key || ''} onChange={handleChange}
                                    placeholder="API Key de Flow" />
                            </Field>
                            <Field label="Flow Secret Key">
                                <Input type="password" name="flow_secret_key" value={settings.flow_secret_key || ''} onChange={handleChange}
                                    placeholder="Secret Key de Flow" />
                            </Field>
                            <div className="col-span-2">
                                <Field label="Flow API URL" hint="Producción: https://www.flow.cl/api | Sandbox: https://sandbox.flow.cl/api">
                                    <Input name="flow_api_url" value={settings.flow_api_url || 'https://www.flow.cl/api'} onChange={handleChange}
                                        placeholder="https://www.flow.cl/api" />
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* MERCADO PAGO */}
                    <Section title="Pasarela de Pago — Mercado Pago">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Access Token" hint="Token de producción o sandbox de tu cuenta MP.">
                                <Input type="password" name="mercadopago_access_token" value={settings.mercadopago_access_token || ''} onChange={handleChange}
                                    placeholder="APP_USR-..." />
                            </Field>
                            <Field label="Public Key (opcional)" hint="Necesaria solo para integración con JavaScript SDK.">
                                <Input name="mercadopago_public_key" value={settings.mercadopago_public_key || ''} onChange={handleChange}
                                    placeholder="APP_USR-..." />
                            </Field>
                        </div>
                    </Section>

                    {/* WEBHOOK / N8N */}
                    <Section title="Automatización — Webhook (n8n / Zapier)">
                        <Field
                            label="URL del Webhook"
                            hint="Cada vez que llegue una cotización nueva, se enviará un POST a esta URL. Ideal para n8n (WhatsApp, email, Slack, CRM, etc.)"
                        >
                            <Input
                                name="webhook_url"
                                value={settings.webhook_url || ''}
                                onChange={handleChange}
                                placeholder="https://tu-n8n.com/webhook/terrablinds-quotes"
                            />
                        </Field>
                    </Section>

                    <div className="flex justify-end">
                        <button type="submit" disabled={saving}
                            style={{ backgroundColor: saving ? '#9ca3af' : '#2563eb' }}
                            className="px-6 py-3 text-white font-bold rounded-xl shadow-md flex items-center hover:opacity-90 transition-opacity">
                            {saving ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            Guardar Configuración
                        </button>
                    </div>
                </form>
            )}
        </AdminLayout>
    );
};

export default AdminSettings;

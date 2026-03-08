import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle } from 'lucide-react';
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

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        // Pagos
        flow_api_key: '',
        flow_secret_key: '',
        flow_api_url: '',
        mercadopago_access_token: '',
        mercadopago_public_key: '',
        // Email
        resend_api_key: '',
        admin_notification_email: '',
        // Marca
        logo_url: '',
        // Hero
        hero_title: '',
        hero_subtitle: '',
        hero_cta_primary: '',
        hero_cta_secondary: '',
        hero_bg_image: '',
        // Contacto
        whatsapp_number: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        // Redes sociales
        social_facebook: '',
        social_instagram: '',
        social_tiktok: '',
        social_youtube: '',
        social_twitter: ''
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
                            <Field label="URL Imagen de Fondo del Hero" hint="Deja en blanco para usar el fondo oscuro por defecto.">
                                <Input name="hero_bg_image" value={settings.hero_bg_image || ''} onChange={handleChange}
                                    placeholder="https://ejemplo.com/banner.jpg" />
                            </Field>
                        </div>
                    </Section>

                    {/* IDENTIDAD */}
                    <Section title="Identidad de Marca">
                        <Field label="URL del Logo" hint="Se mostrará en el header. Recomendado: PNG transparente, alto máx. 80px.">
                            <Input name="logo_url" value={settings.logo_url || ''} onChange={handleChange}
                                placeholder="https://ejemplo.com/logo.png" />
                        </Field>
                        {settings.logo_url && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                                <img src={settings.logo_url} alt="Logo" className="h-10 object-contain" />
                            </div>
                        )}
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

                    {/* EMAIL */}
                    <Section title="Email & Notificaciones (Resend)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Resend API Key" hint="Obtén tu clave en resend.com">
                                <Input type="password" name="resend_api_key" value={settings.resend_api_key || ''} onChange={handleChange}
                                    placeholder="re_12345678..." />
                            </Field>
                            <Field label="Email para recibir notificaciones de cotizaciones" hint="Se enviará un aviso a este email con cada nueva cotización.">
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

                    <div className="flex justify-end">
                        <button type="submit" disabled={saving}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-lg flex items-center transition-colors">
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

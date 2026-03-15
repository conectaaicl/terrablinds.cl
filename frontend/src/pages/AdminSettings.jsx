import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react';
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

const SecretInput = ({ name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={INPUT + ' pr-10'}
            />
            <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
};

export default function AdminSettings() {
    const [s, setS] = useState({
        flow_api_key: '', flow_secret_key: '', flow_api_url: 'https://www.flow.cl/api',
        mercadopago_access_token: '', mercadopago_public_key: '',
        resend_api_key: '', admin_notification_email: '',
        webhook_url: '',
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
        try {
            await api.put('/api/config', s);
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch { setError('Error al guardar la configuración.'); }
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
                    <Settings className="w-6 h-6 text-blue-600" /> Configuración del Sistema
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    Integración con pasarelas de pago y emails. Para el contenido del sitio, usa las secciones de <strong>Páginas</strong> y <strong>Apariencia</strong>.
                </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-5">{error}</div>}
            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Configuración guardada correctamente.
                </div>
            )}

            <form onSubmit={save} className="space-y-5">

                {/* Flow */}
                <Section title="Pasarela de Pago — Flow.cl" desc="Acepta pagos con tarjeta de crédito/débito y transferencia via Flow.cl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Flow API Key">
                            <input className={INPUT} name="flow_api_key" value={s.flow_api_key || ''} onChange={onChange} placeholder="API Key de Flow" />
                        </Field>
                        <Field label="Flow Secret Key">
                            <SecretInput name="flow_secret_key" value={s.flow_secret_key || ''} onChange={onChange} placeholder="Secret Key de Flow" />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Flow API URL" hint="Producción: https://www.flow.cl/api · Sandbox: https://sandbox.flow.cl/api">
                                <input className={INPUT} name="flow_api_url" value={s.flow_api_url || ''} onChange={onChange} />
                            </Field>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                            <strong>Webhook URL para Flow:</strong> Configura en el panel de Flow la URL de confirmación:
                            <code className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded font-mono">{window.location.origin}/api/payment/confirm</code>
                        </p>
                    </div>
                </Section>

                {/* MercadoPago */}
                <Section title="Pasarela de Pago — Mercado Pago" desc="Acepta pagos via Mercado Pago (tarjetas, transferencias, efectivo).">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Access Token" hint="Token de tu cuenta MP (producción o sandbox).">
                            <SecretInput name="mercadopago_access_token" value={s.mercadopago_access_token || ''} onChange={onChange} placeholder="APP_USR-..." />
                        </Field>
                        <Field label="Public Key" hint="Necesaria para integración frontend.">
                            <input className={INPUT} name="mercadopago_public_key" value={s.mercadopago_public_key || ''} onChange={onChange} placeholder="APP_USR-..." />
                        </Field>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                            <strong>Webhook URL para MercadoPago:</strong>
                            <code className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded font-mono">{window.location.origin}/api/payment/mercadopago/webhook</code>
                        </p>
                    </div>
                </Section>

                {/* Email */}
                <Section title="Email & Notificaciones — Resend" desc="Envío de cotizaciones, confirmaciones y notificaciones por email.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Resend API Key" hint="Obtén tu clave gratuita en resend.com">
                            <SecretInput name="resend_api_key" value={s.resend_api_key || ''} onChange={onChange} placeholder="re_••••••••••••••••" />
                        </Field>
                        <Field label="Email para notificaciones" hint="Recibirás un aviso aquí con cada nueva cotización.">
                            <input type="email" className={INPUT} name="admin_notification_email" value={s.admin_notification_email || ''} onChange={onChange} placeholder="ventas@terrablinds.cl" />
                        </Field>
                    </div>
                </Section>

                {/* Webhook */}
                <Section title="Automatización — Webhook" desc="Integración con n8n, Zapier u otras herramientas de automatización.">
                    <Field label="Webhook URL" hint="Cuando llegue una nueva cotización, se hará un POST a esta URL con los datos.">
                        <input className={INPUT} name="webhook_url" value={s.webhook_url || ''} onChange={onChange} placeholder="https://n8n.tudominio.com/webhook/..." />
                    </Field>
                </Section>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm">
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

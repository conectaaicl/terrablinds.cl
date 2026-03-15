import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, Wifi } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

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
    domotica_title: 'Domótica e Interruptores Inteligentes',
    domotica_subtitle: 'Controla cortinas, persianas, luces y más desde tu smartphone o con tu voz. Compatible con Alexa, Google Home y Apple HomeKit.',
    domotica_feat1_title: 'Control por App',
    domotica_feat1_desc: 'Maneja todo desde tu smartphone, en casa o desde cualquier lugar del mundo.',
    domotica_feat2_title: 'Control por Voz',
    domotica_feat2_desc: 'Compatible con Alexa, Google Home y Apple HomeKit.',
    domotica_feat3_title: 'Horarios Automáticos',
    domotica_feat3_desc: 'Programa aperturas y cierres por hora o según la luz solar.',
    domotica_feat4_title: 'Conexión WiFi',
    domotica_feat4_desc: 'Sin necesidad de hub adicional. Conecta directo a tu red doméstica.',
    domotica_feat5_title: 'Instalación Profesional',
    domotica_feat5_desc: 'Nuestros técnicos instalan y configuran todo el sistema.',
    domotica_feat6_title: 'Escenas Inteligentes',
    domotica_feat6_desc: 'Crea rutinas: amanecer, cine, ausencia o llegada a casa.',
};

export default function AdminDomotica() {
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
                    <Wifi className="w-6 h-6 text-indigo-600" /> Domótica
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    Edita el contenido de la página de domótica.{' '}
                    <a href="/domotica" target="_blank" className="text-blue-600 hover:underline">Ver página →</a>
                    {' · '}
                    <Link to="/admin/products" className="text-blue-600 hover:underline">Gestionar productos →</Link>
                </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-5">{error}</div>}
            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Guardado correctamente.
                </div>
            )}

            <form onSubmit={save} className="space-y-5">

                <Section title="Encabezado (Hero)" desc="Título y subtítulo de la página de domótica">
                    <div className="space-y-4">
                        <Field label="Título principal">
                            <input className={INPUT} name="domotica_title" value={s.domotica_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="domotica_subtitle" value={s.domotica_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Beneficios / Características" desc="Las 6 tarjetas de beneficios que aparecen bajo el hero">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Beneficio {i}</p>
                                <Field label="Título">
                                    <input className={INPUT} name={`domotica_feat${i}_title`} value={s[`domotica_feat${i}_title`] || ''} onChange={onChange} />
                                </Field>
                                <Field label="Descripción">
                                    <input className={INPUT} name={`domotica_feat${i}_desc`} value={s[`domotica_feat${i}_desc`] || ''} onChange={onChange} />
                                </Field>
                            </div>
                        ))}
                    </div>
                </Section>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                    <strong>Productos de domótica:</strong> Se gestionan desde{' '}
                    <Link to="/admin/products" className="underline font-semibold">Admin → Productos</Link>.
                    Usa la categoría <strong>"Domótica / Hub"</strong> para que aparezcan en esta página.
                </div>

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

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, Shield } from 'lucide-react';
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
    metalicas_title: 'Cortinas Enrollables Metálicas',
    metalicas_subtitle: 'Protección resistente para locales comerciales, bodegas y garajes. Fabricadas en acero galvanizado, con opción de automatización total.',
    metalicas_cta_title: '¿Quieres automatizar tu cortina metálica?',
    metalicas_cta_desc: 'Agrega un motor tubular y maneja todo con control remoto o desde tu celular.',
    metalicas_feat1_title: 'Seguridad Máxima',
    metalicas_feat1_desc: 'Láminas de acero galvanizado de alta resistencia. Protege tu local o garage de robos e intrusiones.',
    metalicas_feat2_title: 'Cierre Hermético',
    metalicas_feat2_desc: 'Sistema de guías laterales y faldón inferior que garantiza cierre sin filtraciones de aire ni polvo.',
    metalicas_feat3_title: 'Automatizable',
    metalicas_feat3_desc: 'Instala un motor tubular y maneja la cortina con control remoto, app o botón.',
    metalicas_feat4_title: 'Para Locales y Comercios',
    metalicas_feat4_desc: 'Ideal para tiendas, bodegas, talleres y estacionamientos.',
    metalicas_feat5_title: 'Para Garage Residencial',
    metalicas_feat5_desc: 'Solución compacta y elegante para garajes de casas.',
    metalicas_feat6_title: 'Instalación Profesional',
    metalicas_feat6_desc: 'Técnicos certificados miden, fabrican e instalan con garantía.',
};

export default function AdminCortinasMetalicas() {
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
                    <Shield className="w-6 h-6 text-slate-600" /> Cortinas Metálicas
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    Edita el contenido de la página de cortinas metálicas.{' '}
                    <a href="/cortinas-metalicas" target="_blank" className="text-blue-600 hover:underline">Ver página →</a>
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

                <Section title="Encabezado (Hero)" desc="Título y subtítulo principal de la página">
                    <div className="space-y-4">
                        <Field label="Título principal">
                            <input className={INPUT} name="metalicas_title" value={s.metalicas_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <textarea rows={2} className={TEXTAREA} name="metalicas_subtitle" value={s.metalicas_subtitle || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Banner de Automatización (CTA amarillo)" desc="El banner destacado que invita a cotizar automatización">
                    <div className="space-y-4">
                        <Field label="Título del banner">
                            <input className={INPUT} name="metalicas_cta_title" value={s.metalicas_cta_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Descripción del banner">
                            <textarea rows={2} className={TEXTAREA} name="metalicas_cta_desc" value={s.metalicas_cta_desc || ''} onChange={onChange} />
                        </Field>
                    </div>
                </Section>

                <Section title="Beneficios / Características" desc="Las 6 tarjetas de beneficios que aparecen en la página">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Beneficio {i}</p>
                                <Field label="Título">
                                    <input className={INPUT} name={`metalicas_feat${i}_title`} value={s[`metalicas_feat${i}_title`] || ''} onChange={onChange} />
                                </Field>
                                <Field label="Descripción">
                                    <input className={INPUT} name={`metalicas_feat${i}_desc`} value={s[`metalicas_feat${i}_desc`] || ''} onChange={onChange} />
                                </Field>
                            </div>
                        ))}
                    </div>
                </Section>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                    <strong>Productos de cortinas metálicas:</strong> Se gestionan desde{' '}
                    <Link to="/admin/products" className="underline font-semibold">Admin → Productos</Link>.
                    Usa la categoría <strong>"Cortinas Metálicas"</strong> para que aparezcan en esta página.
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

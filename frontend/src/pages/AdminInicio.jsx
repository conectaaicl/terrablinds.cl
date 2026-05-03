import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, Home, Upload, Loader, X } from 'lucide-react';
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

export default function AdminInicio() {
    const [s, setS] = useState({
        hero_title: '', hero_subtitle: '',
        hero_cta_primary: '', hero_cta_secondary: '',
        hero_bg_image: '', hero_badge: '',
        stat1_num: '', stat1_label: '',
        stat2_num: '', stat2_label: '',
        stat3_num: '', stat3_label: '',
        section_features_title: '', section_features_subtitle: '',
        feature1_title: '', feature1_text: '',
        feature2_title: '', feature2_text: '',
        feature3_title: '', feature3_text: '',
        feature4_title: '', feature4_text: '',
        cat1_image: '', cat1_title: 'Cortinas Roller', cat1_link: '/catalog?category=Cortinas Roller',
        cat2_image: '', cat2_title: 'Blackout', cat2_link: '/catalog?category=Blackout',
        cat3_image: '', cat3_title: 'Persianas', cat3_link: '/catalog?category=Persianas',
        home_projects_title: 'Proyectos Destacados', home_projects_subtitle: 'Trabajos reales en hogares y empresas de Chile.',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/config').then(r => setS(p => ({ ...p, ...r.data }))).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const set = (key, val) => setS(p => ({ ...p, [key]: val }));
    const onChange = e => set(e.target.name, e.target.value);

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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Home className="w-6 h-6 text-blue-600" /> Página de Inicio</h1>
                <p className="text-gray-500 text-sm mt-0.5">Edita el contenido del banner principal y secciones de la página de inicio.</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Cambios guardados correctamente.</div>}

            <form onSubmit={save} className="space-y-5">
                <Section title="Banner Principal (Hero)" desc="El banner grande que ven los visitantes al entrar al sitio.">
                    <div className="space-y-4">
                        <Field label="Badge / Etiqueta pequeña" hint="Texto pequeño sobre el título. Ej: 'Instalación profesional en Santiago'">
                            <input className={INPUT} name="hero_badge" value={s.hero_badge || ''} onChange={onChange} placeholder="✓ Instalación profesional en Santiago" />
                        </Field>
                        <Field label="Título Principal" hint="Texto grande y llamativo. Usa saltos de línea \\n si es necesario.">
                            <textarea className={TEXTAREA} name="hero_title" rows={2} value={s.hero_title || ''} onChange={onChange}
                                placeholder="Elegancia y Control para tus Espacios" />
                        </Field>
                        <Field label="Subtítulo" hint="Descripción corta bajo el título.">
                            <textarea className={TEXTAREA} name="hero_subtitle" rows={2} value={s.hero_subtitle || ''} onChange={onChange}
                                placeholder="Cortinas roller, persianas y toldos a medida con instalación incluida." />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Texto Botón Primario">
                                <input className={INPUT} name="hero_cta_primary" value={s.hero_cta_primary || ''} onChange={onChange} placeholder="Ver Catálogo" />
                            </Field>
                            <Field label="Texto Botón Secundario">
                                <input className={INPUT} name="hero_cta_secondary" value={s.hero_cta_secondary || ''} onChange={onChange} placeholder="Cotizar Ahora" />
                            </Field>
                        </div>
                        <ImageUploadField label="Imagen de Fondo del Hero" hint="Recomendado: 1920×1080px. Deja vacío para fondo oscuro por defecto." value={s.hero_bg_image} fieldName="hero_bg_image" onChange={set} />
                    </div>
                </Section>

                <Section title="Estadísticas / Contadores" desc="Los números que aparecen destacados en la sección de stats. Ej: '500+ Proyectos'">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <p className="text-sm font-semibold text-gray-700">Estadística {n}</p>
                                <Field label="Número / Valor">
                                    <input className={INPUT} name={`stat${n}_num`} value={s[`stat${n}_num`] || ''} onChange={onChange} placeholder={n === 1 ? '500+' : n === 2 ? '12 años' : '100%'} />
                                </Field>
                                <Field label="Etiqueta">
                                    <input className={INPUT} name={`stat${n}_label`} value={s[`stat${n}_label`] || ''} onChange={onChange} placeholder={n === 1 ? 'Proyectos realizados' : n === 2 ? 'De experiencia' : 'Garantía de calidad'} />
                                </Field>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Sección de Características" desc="Sección que explica las ventajas o características del servicio.">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Título de la sección">
                                <input className={INPUT} name="section_features_title" value={s.section_features_title || ''} onChange={onChange} placeholder="¿Por qué elegirnos?" />
                            </Field>
                            <Field label="Subtítulo">
                                <input className={INPUT} name="section_features_subtitle" value={s.section_features_subtitle || ''} onChange={onChange} placeholder="Calidad y profesionalismo en cada detalle" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Característica {n}</p>
                                    <Field label="Título">
                                        <input className={INPUT} name={`feature${n}_title`} value={s[`feature${n}_title`] || ''} onChange={onChange} placeholder={['Medida a medida', 'Instalación profesional', 'Garantía 5 años', 'Asesoría gratuita'][n-1]} />
                                    </Field>
                                    <Field label="Descripción">
                                        <textarea className={TEXTAREA} name={`feature${n}_text`} rows={2} value={s[`feature${n}_text`] || ''} onChange={onChange} placeholder="Breve descripción de esta característica..." />
                                    </Field>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Cards de Categorías (Inicio)" desc="Las 3 tarjetas de productos que aparecen en la página de inicio.">
                    <div className="space-y-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <p className="text-sm font-semibold text-gray-700">Categoría {n}</p>
                                <ImageUploadField
                                    label="Foto"
                                    hint="Recomendado: 800x600px"
                                    value={s[`cat${n}_image`]}
                                    fieldName={`cat${n}_image`}
                                    onChange={set}
                                />
                                <Field label="Título">
                                    <input className={INPUT} value={s[`cat${n}_title`] || ''} onChange={e => set(`cat${n}_title`, e.target.value)} placeholder="Cortinas Roller" />
                                </Field>
                                <Field label="Enlace">
                                    <input className={INPUT} value={s[`cat${n}_link`] || ''} onChange={e => set(`cat${n}_link`, e.target.value)} placeholder="/catalog?category=Cortinas Roller" />
                                </Field>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Sección Proyectos Destacados" desc="Título y subtítulo de la sección de proyectos en la página de inicio.">
                    <div className="space-y-4">
                        <Field label="Título">
                            <input className={INPUT} name="home_projects_title" value={s.home_projects_title || ''} onChange={onChange} placeholder="Proyectos Destacados" />
                        </Field>
                        <Field label="Subtítulo">
                            <input className={INPUT} name="home_projects_subtitle" value={s.home_projects_subtitle || ''} onChange={onChange} placeholder="Trabajos reales en hogares y empresas de Chile." />
                        </Field>
                        <p className="text-xs text-gray-400">Para agregar o editar los proyectos con fotos, ve a <strong>Proyectos</strong> en el menú lateral.</p>
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

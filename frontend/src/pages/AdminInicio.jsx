import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, CheckCircle, Home, Upload, Loader, X } from 'lucide-react';
import api from '../api';

const Section = ({ title, desc, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
        slide1_url: '', slide1_label: '',
        slide2_url: '', slide2_label: '',
        slide3_url: '', slide3_label: '',
        slide4_url: '', slide4_label: '',
        slide5_url: '', slide5_label: '',
        slide6_url: '', slide6_label: '',
        slide7_url: '', slide7_label: '',
        slide8_url: '', slide8_label: '',
        hero_title: '', hero_subtitle: '',
        hero_cta_primary: '', hero_cta_secondary: '',
        hero_bg_image: '', hero_badge: '',
        section_features_title: '', section_features_subtitle: '',
        feature1_title: '', feature1_text: '',
        feature2_title: '', feature2_text: '',
        feature3_title: '', feature3_text: '',
        feature4_title: '', feature4_text: '',
        stats_section_title: '', stats_section_subtitle: '',
        stat1_num: '', stat1_label: '', stat1_sub: '',
        stat2_num: '', stat2_label: '', stat2_sub: '',
        stat3_num: '', stat3_label: '', stat3_sub: '',
        stat4_num: '', stat4_label: '', stat4_sub: '',
        cat1_image: '', cat1_title: 'Cortinas Roller', cat1_link: '/catalog?category=Cortinas Roller',
        cat2_image: '', cat2_title: 'Blackout', cat2_link: '/catalog?category=Blackout',
        cat3_image: '', cat3_title: 'Persianas', cat3_link: '/catalog?category=Persianas',
        cat4_image: '', cat4_title: 'Toldos', cat4_link: '/catalog?category=Toldos',
        cat5_image: '', cat5_title: 'Cierres Terraza', cat5_link: '/catalog?category=Cierres',
        cat6_image: '', cat6_title: 'Domotica', cat6_link: '/domotica',
        home_projects_title: 'Proyectos Destacados', home_projects_subtitle: 'Trabajos reales en hogares y empresas de Chile.',
        cta_badge: '', cta_title: '', cta_subtitle: '', cta_button: '',
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
                <Section title="Hero — Imágenes del Slider" desc="Las fotos del slider principal. Sube hasta 8 imágenes. Vacío = fotos de ejemplo.">
                    <div className="space-y-4">
                        {[1,2,3,4,5,6,7,8].map(n => {
                            const imgKey = `slide${n}_url`;
                            const lblKey = `slide${n}_label`;
                            return (
                            <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Slide {n}</p>
                                <ImageUploadField
                                    label="Imagen"
                                    hint="Recomendado: 1920x1080px. Vacío = imagen de ejemplo"
                                    value={s[imgKey]}
                                    fieldName={imgKey}
                                    onChange={set}
                                />
                                <Field label="Etiqueta (badge)">
                                    <input className={INPUT} value={s[lblKey] || ''} onChange={e => set(lblKey, e.target.value)} placeholder="Cortinas Roller Blackout" />
                                </Field>
                            </div>
                            );
                        })}
                    </div>
                </Section>

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

                <Section title="Sección de Características" desc="Sección 'Por qué elegirnos' con las ventajas del servicio.">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Título de la sección" hint="Texto grande del encabezado. Ej: 'Calidad que transforma espacios'">
                                <input className={INPUT} name="section_features_title" value={s.section_features_title || ''} onChange={onChange} placeholder="Calidad que transforma espacios" />
                            </Field>
                            <Field label="Subtítulo (opcional)">
                                <input className={INPUT} name="section_features_subtitle" value={s.section_features_subtitle || ''} onChange={onChange} placeholder="Descripción adicional de la sección" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Característica {n}</p>
                                    <Field label="Título">
                                        <input className={INPUT} name={`feature${n}_title`} value={s[`feature${n}_title`] || ''} onChange={onChange} placeholder={['A Medida', 'Calidad Premium', 'Rapidez', 'Garantía'][n-1]} />
                                    </Field>
                                    <Field label="Descripción">
                                        <textarea className={TEXTAREA} name={`feature${n}_text`} rows={2} value={s[`feature${n}_text`] || ''} onChange={onChange} placeholder="Breve descripción de esta característica..." />
                                    </Field>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Estadísticas (sección oscura)" desc="Los números destacados y el encabezado de la sección 'Por qué TerraBlinds'.">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Título de la sección" hint="Ej: 'Por qué TerraBlinds'">
                                <input className={INPUT} name="stats_section_title" value={s.stats_section_title || ''} onChange={onChange} placeholder="Por qué TerraBlinds" />
                            </Field>
                            <Field label="Subtítulo">
                                <input className={INPUT} name="stats_section_subtitle" value={s.stats_section_subtitle || ''} onChange={onChange} placeholder="Números que respaldan nuestra trayectoria" />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estadística {n}</p>
                                    <Field label="Número / Valor">
                                        <input className={INPUT} name={`stat${n}_num`} value={s[`stat${n}_num`] || ''} onChange={onChange} placeholder={['+500', '10', 'Stgo', '100%'][n-1]} />
                                    </Field>
                                    <Field label="Etiqueta">
                                        <input className={INPUT} name={`stat${n}_label`} value={s[`stat${n}_label`] || ''} onChange={onChange} placeholder={['Instalaciones', 'Años', 'y Regiones', 'Garantía'][n-1]} />
                                    </Field>
                                    <Field label="Sub-etiqueta (línea pequeña)">
                                        <input className={INPUT} name={`stat${n}_sub`} value={s[`stat${n}_sub`] || ''} onChange={onChange} placeholder={['proyectos completados', 'de experiencia', 'cobertura nacional', 'incluida en todos los productos'][n-1]} />
                                    </Field>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Cards de Categorías (Inicio)" desc="Las 6 tarjetas de productos que aparecen en la página de inicio (grid de 3 columnas).">
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5, 6].map(n => (
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

                <Section title="Sección CTA (llamada a la acción final)" desc="La sección oscura al final de la página con el botón de cotizar.">
                    <div className="space-y-4">
                        <Field label="Badge (etiqueta pequeña)" hint="Ej: 'Comienza hoy'">
                            <input className={INPUT} name="cta_badge" value={s.cta_badge || ''} onChange={onChange} placeholder="Comienza hoy" />
                        </Field>
                        <Field label="Título" hint="Texto grande. Usa \\n para separar en dos líneas. Ej: '¿Listo para renovar\\ntus espacios?'">
                            <textarea className={TEXTAREA} name="cta_title" rows={2} value={s.cta_title || ''} onChange={onChange} placeholder="¿Listo para renovar\ntus espacios?" />
                        </Field>
                        <Field label="Subtítulo / Descripción">
                            <textarea className={TEXTAREA} name="cta_subtitle" rows={2} value={s.cta_subtitle || ''} onChange={onChange} placeholder="Cotiza online en segundos y recibe asesoría personalizada de nuestros expertos." />
                        </Field>
                        <Field label="Texto del botón">
                            <input className={INPUT} name="cta_button" value={s.cta_button || ''} onChange={onChange} placeholder="Solicitar Cotización Gratuita" />
                        </Field>
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

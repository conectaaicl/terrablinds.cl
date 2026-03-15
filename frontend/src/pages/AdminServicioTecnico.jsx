import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Loader, CheckCircle, Wrench, Upload, X } from 'lucide-react';
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

function PhotoUpload({ label, name, value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const ref = useRef();
    const baseUrl = import.meta.env.VITE_API_URL;

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data.url.startsWith('http') ? res.data.url : `${baseUrl}${res.data.url}`;
            onChange({ target: { name, value: url } });
        } catch { alert('Error al subir la imagen'); }
        finally { setUploading(false); }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {value ? (
                <div className="relative">
                    <img src={value} alt={label} className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => onChange({ target: { name, value: '' } })}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <div onClick={() => ref.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploading
                        ? <Loader className="w-6 h-6 animate-spin text-blue-500" />
                        : <><Upload className="w-6 h-6 text-gray-400 mb-1" /><p className="text-xs text-gray-500">Subir foto</p></>
                    }
                </div>
            )}
            <input type="file" ref={ref} accept="image/*" className="hidden" onChange={handleFile} />
            <input type="text" name={name} value={value || ''} onChange={onChange}
                placeholder="O pega una URL de imagen..."
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none" />
        </div>
    );
}

const DEFAULTS = {
    stech_title: 'Servicio Técnico para Persianas',
    stech_subtitle: 'Mantención profesional de persianas exteriores',
    stech_description: 'Nuestro servicio de mantención prolonga la vida útil de tus persianas exteriores. Realizamos limpieza profunda, lubricación de mecanismos y revisión completa. Además ofrecemos revisión y cambio de piezas desgastadas para dejar tus persianas como nuevas.',
    stech_price: '60000',
    stech_photo1: '', stech_photo2: '', stech_photo3: '', stech_photo4: '',
    stech_include1: 'Lavado y limpieza de lamas con producto especializado',
    stech_include2: 'Limpieza completa del cajón y mecanismos internos',
    stech_include3: 'Lubricación de resortes y engranajes con aceite multiusos WD-40',
    stech_include4: 'Lubricación de guías y correderas con grasa silicona',
    stech_include5: 'Ajuste y regulación de tensión del resorte',
    stech_include6: 'Revisión de funcionamiento y diagnóstico completo',
};

export default function AdminServicioTecnico() {
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

    const formatCLP = n => `$${parseInt(n || 0).toLocaleString('es-CL')}`;

    if (loading) return (
        <AdminLayout>
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-600" /> Servicio Técnico
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    Edita el contenido de la página de mantención de persianas exteriores.{' '}
                    <a href="/servicio-tecnico" target="_blank" className="text-blue-600 hover:underline">Ver página →</a>
                </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-5">{error}</div>}
            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm mb-5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Guardado correctamente.
                </div>
            )}

            <form onSubmit={save} className="space-y-5">

                {/* Header */}
                <Section title="Encabezado de la página">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Título principal">
                            <input className={INPUT} name="stech_title" value={s.stech_title || ''} onChange={onChange} />
                        </Field>
                        <Field label="Subtítulo">
                            <input className={INPUT} name="stech_subtitle" value={s.stech_subtitle || ''} onChange={onChange} />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Descripción del servicio" hint="Texto introductorio visible en la página">
                                <textarea rows={4} className={TEXTAREA} name="stech_description" value={s.stech_description || ''} onChange={onChange} />
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Price */}
                <Section title="Precio del servicio">
                    <div className="max-w-xs">
                        <Field label="Precio por persiana (CLP)" hint="Sin puntos ni símbolos, solo el número">
                            <input type="number" className={INPUT} name="stech_price" value={s.stech_price || ''} onChange={onChange} />
                        </Field>
                        {s.stech_price && (
                            <p className="mt-2 text-sm text-gray-500">Vista previa: <strong className="text-blue-700">{formatCLP(s.stech_price)} por persiana</strong></p>
                        )}
                    </div>
                </Section>

                {/* Photos */}
                <Section title="Fotos del servicio" desc="Sube hasta 4 fotos del servicio técnico o mantención">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <PhotoUpload
                                key={i}
                                label={`Foto ${i}`}
                                name={`stech_photo${i}`}
                                value={s[`stech_photo${i}`] || ''}
                                onChange={onChange}
                            />
                        ))}
                    </div>
                </Section>

                {/* What's included */}
                <Section title="¿Qué incluye la mantención?" desc="Lista de servicios que forman parte de la mantención estándar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Field key={i} label={`Ítem ${i}`}>
                                <input className={INPUT} name={`stech_include${i}`} value={s[`stech_include${i}`] || ''} onChange={onChange}
                                    placeholder={`Descripción del ítem ${i}...`} />
                            </Field>
                        ))}
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

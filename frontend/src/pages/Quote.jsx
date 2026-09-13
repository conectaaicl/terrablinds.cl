import React, { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ChevronDown, ChevronUp, Send, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import api from '../api';

// ─── Opciones del formulario ───────────────────────────────────────────────
const PRODUCTOS = [
    { value: '',                          label: 'Elige un producto...' },
    { value: 'Cortinas Roller Blackout',  label: '🌑 Roller Blackout — oscurecimiento total' },
    { value: 'Cortinas Roller Sunscreen', label: '☀️ Roller Sunscreen — filtro solar + vista exterior' },
    { value: 'Cortinas Roller Duo',       label: '🔲 Roller Duo — doble tela (blackout + screen)' },
    { value: 'Persianas Venecianas',      label: '🪟 Persianas Venecianas' },
    { value: 'Persianas Exteriores',      label: '🏠 Persianas Exteriores — protección fachada' },
    { value: 'Toldos Retráctiles',        label: '⛱ Toldos Retráctiles — para terrazas y balcones' },
    { value: 'Toldos Verticales',         label: '📐 Toldos Verticales — lona vertical fachada' },
    { value: 'Cortinas Metálicas',        label: '🔩 Cortinas Metálicas / Enrollables' },
    { value: 'Motorización / Domótica',   label: '⚡ Motorización / Domótica — automatización' },
    { value: 'No sé / Necesito asesoría', label: '💬 No sé — quiero asesoría' },
];

const VENTANAS = [
    { value: '',                label: '¿Cuántas ventanas / espacios?' },
    { value: '1-2 ventanas',   label: '1-2 ventanas' },
    { value: '3-5 ventanas',   label: '3-5 ventanas' },
    { value: '6-10 ventanas',  label: '6-10 ventanas' },
    { value: 'Más de 10',      label: 'Más de 10 ventanas' },
    { value: 'No sé todavía',  label: 'No sé todavía' },
];

// ─── Componente principal ──────────────────────────────────────────────────
export default function Quote() {
    const [form, setForm] = useState({
        nombre: '', telefono: '', producto: '', ventanas: '', comuna: '', comentario: '',
    });
    const [comentarioVisible, setComentarioVisible] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState(false);
    const [errors, setErrors]     = useState({});

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }));
        if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.nombre.trim() || form.nombre.trim().length < 2) e.nombre = 'Ingresa tu nombre';
        if (!form.telefono.trim() || form.telefono.replace(/[^0-9]/g, '').length < 8) e.telefono = 'Ingresa tu WhatsApp / teléfono';
        if (!form.producto) e.producto = 'Elige un producto';
        if (!form.ventanas) e.ventanas = 'Elige la cantidad aproximada';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            await api.post('/api/quotes/rapida', {
                nombre:     form.nombre.trim(),
                telefono:   form.telefono.trim(),
                producto:   form.producto,
                ventanas:   form.ventanas,
                comuna:     form.comuna.trim() || null,
                comentario: form.comentario.trim() || null,
            });
            // Copia del lead a Ventas Terreno (ventas.conectaai.cl): avisa por WhatsApp al vendedor. Best-effort.
            try {
                fetch('https://ventas.conectaai.cl/api/ventas-terreno/cortinas/publico/lead', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
                    body: JSON.stringify({ nombre: form.nombre.trim(), telefono: form.telefono.trim(), comuna: form.comuna.trim() || null, producto: form.producto, ventanas: form.ventanas, comentario: form.comentario.trim() || null, origen: 'terrablinds.cl' }),
                }).catch(() => {});
            } catch (_) {}
            setSuccess(true);
        } catch (err) {
            setErrors({ general: err.response?.data?.error || 'Error al enviar. Intenta nuevamente.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Estado de éxito ────────────────────────────────────────────────────
    if (success) {
        return (
            <Layout>
                <SEO title="¡Cotización enviada! — TerraBlinds" />
                <div className="min-h-[80vh] flex items-center justify-center px-4">
                    <div className="max-w-sm w-full text-center space-y-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">¡Listo, {form.nombre.split(' ')[0]}!</h1>
                            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                                Te contactamos por WhatsApp en las próximas horas con un presupuesto personalizado.
                            </p>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left text-sm space-y-1">
                            <p className="text-slate-400"><span className="text-slate-300 font-medium">Producto:</span> {form.producto}</p>
                            <p className="text-slate-400"><span className="text-slate-300 font-medium">Ventanas:</span> {form.ventanas}</p>
                            {form.comuna && <p className="text-slate-400"><span className="text-slate-300 font-medium">Comuna:</span> {form.comuna}</p>}
                        </div>
                        <a
                            href={`https://wa.me/56998101891?text=${encodeURIComponent(`Hola, acabo de cotizar ${form.producto} en terrablinds.cl. Soy ${form.nombre}.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 wa-pulse hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Escribir por WhatsApp ahora
                        </a>
                        <p className="text-xs text-slate-500">
                            ¿Mientras tanto, quieres ver nuestro catálogo?{' '}
                            <a href="/catalog" className="text-amber-400 hover:underline">Ver productos</a>
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Formulario ─────────────────────────────────────────────────────────
    return (
        <Layout>
            <SEO
                title="Cotizar cortinas y persianas — TerraBlinds"
                description="Cotiza tus cortinas, persianas o toldos en 30 segundos. Sin medidas, sin complicaciones — te contactamos por WhatsApp."
            />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12 px-4">
                <div className="max-w-xl mx-auto text-center space-y-3">
                    <span className="inline-block text-xs font-bold tracking-widest text-amber-400 uppercase">
                        Respuesta en horas · Sin compromiso
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                        Cotiza en <span className="text-amber-400">30 segundos</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Sin medidas exactas. Sin email. Solo tu WhatsApp y te armamos un presupuesto a medida.
                    </p>
                </div>
            </section>

            {/* Formulario */}
            <section className="px-4 pb-20 -mt-6">
                <div className="max-w-lg mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
                    >

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Nombre <span className="text-amber-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={set('nombre')}
                                placeholder="Tu nombre completo"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${errors.nombre ? 'border-red-500' : 'border-slate-600'}`}
                            />
                            {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                WhatsApp / Teléfono <span className="text-amber-400">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={set('telefono')}
                                placeholder="+56 9 1234 5678"
                                className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${errors.telefono ? 'border-red-500' : 'border-slate-600'}`}
                            />
                            {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono}</p>}
                        </div>

                        {/* Producto */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                ¿Qué necesitas? <span className="text-amber-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={form.producto}
                                    onChange={set('producto')}
                                    className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none transition-colors ${form.producto ? 'text-white' : 'text-slate-500'} ${errors.producto ? 'border-red-500' : 'border-slate-600'}`}
                                >
                                    {PRODUCTOS.map(p => (
                                        <option key={p.value} value={p.value} disabled={!p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.producto && <p className="text-red-400 text-xs mt-1">{errors.producto}</p>}
                        </div>

                        {/* Cantidad ventanas */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Cantidad de ventanas / espacios <span className="text-amber-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={form.ventanas}
                                    onChange={set('ventanas')}
                                    className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none transition-colors ${form.ventanas ? 'text-white' : 'text-slate-500'} ${errors.ventanas ? 'border-red-500' : 'border-slate-600'}`}
                                >
                                    {VENTANAS.map(v => (
                                        <option key={v.value} value={v.value} disabled={!v.value}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.ventanas && <p className="text-red-400 text-xs mt-1">{errors.ventanas}</p>}
                        </div>

                        {/* Comuna */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Comuna
                                <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={form.comuna}
                                onChange={set('comuna')}
                                placeholder="Ej: Las Condes, La Serena, Providencia..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                            />
                        </div>

                        {/* Comentario colapsado */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setComentarioVisible(v => !v)}
                                className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                {comentarioVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                ¿Algo más que contarnos?
                            </button>
                            {comentarioVisible && (
                                <textarea
                                    value={form.comentario}
                                    onChange={set('comentario')}
                                    rows={3}
                                    placeholder="Color, material preferido, si es para un local o casa, tamaños aproximados, etc."
                                    className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                                />
                            )}
                        </div>

                        {/* Error general */}
                        {errors.general && (
                            <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
                                {errors.general}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold text-base rounded-xl transition-colors shadow-lg shadow-amber-900/30"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Enviar consulta</>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-500">
                            Te respondemos por WhatsApp · Sin spam · Sin compromiso
                        </p>
                    </form>

                    {/* Social proof bajo el form */}
                    <div className="mt-6 flex items-center justify-center gap-6 text-center">
                        <div>
                            <p className="text-2xl font-extrabold text-white">200+</p>
                            <p className="text-xs text-slate-500">clientes</p>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div>
                            <p className="text-2xl font-extrabold text-white">5 años</p>
                            <p className="text-xs text-slate-500">experiencia</p>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div>
                            <p className="text-2xl font-extrabold text-white">100%</p>
                            <p className="text-xs text-slate-500">garantía</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

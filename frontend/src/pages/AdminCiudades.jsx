import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, MapPin, Image, X } from 'lucide-react';

const EMPTY_CITY = {
  slug: '', nombre: '', zona: '', region: 'Región Metropolitana',
  descripcion: '',
  destacados: ['', '', '', ''],
  faq: [{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }],
  waMsg: '',
  heroImg: '',
};

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim('-');
}

export default function AdminCiudades() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/api/cities');
      setCities(r.data || []);
    } catch { setCities([]); }
    setLoading(false);
  }

  async function save(list) {
    setSaving(true);
    try {
      await api.put('/api/cities', list);
      setMsg('✓ Guardado');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Error al guardar'); }
    setSaving(false);
  }

  async function uploadHero(cityIdx, file) {
    setUploading(cityIdx);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = cities.map((c, i) => i === cityIdx ? { ...c, heroImg: r.data.filePath } : c);
      setCities(updated);
    } catch { setMsg('Error al subir imagen'); }
    setUploading(null);
  }

  function addCity() {
    const newCity = { ...EMPTY_CITY, destacados: ['', '', '', ''], faq: [{ q: '', a: '' }, { q: '', a: '' }] };
    const updated = [...cities, newCity];
    setCities(updated);
    setExpanded(updated.length - 1);
  }

  function removeCity(i) {
    if (!confirm(`¿Eliminar la página de ${cities[i].nombre || 'esta ciudad'}?`)) return;
    const updated = cities.filter((_, idx) => idx !== i);
    setCities(updated);
    save(updated);
  }

  function updateCity(i, field, value) {
    const updated = cities.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setCities(updated);
  }

  function updateDestacado(cityIdx, itemIdx, value) {
    const updated = cities.map((c, i) => {
      if (i !== cityIdx) return c;
      const dest = [...c.destacados];
      dest[itemIdx] = value;
      return { ...c, destacados: dest };
    });
    setCities(updated);
  }

  function addDestacado(cityIdx) {
    const updated = cities.map((c, i) => i === cityIdx ? { ...c, destacados: [...c.destacados, ''] } : c);
    setCities(updated);
  }

  function removeDestacado(cityIdx, itemIdx) {
    const updated = cities.map((c, i) => {
      if (i !== cityIdx) return c;
      return { ...c, destacados: c.destacados.filter((_, j) => j !== itemIdx) };
    });
    setCities(updated);
  }

  function updateFaq(cityIdx, faqIdx, field, value) {
    const updated = cities.map((c, i) => {
      if (i !== cityIdx) return c;
      const faq = c.faq.map((f, j) => j === faqIdx ? { ...f, [field]: value } : f);
      return { ...c, faq };
    });
    setCities(updated);
  }

  function addFaq(cityIdx) {
    const updated = cities.map((c, i) => i === cityIdx ? { ...c, faq: [...c.faq, { q: '', a: '' }] } : c);
    setCities(updated);
  }

  function removeFaq(cityIdx, faqIdx) {
    const updated = cities.map((c, i) => {
      if (i !== cityIdx) return c;
      return { ...c, faq: c.faq.filter((_, j) => j !== faqIdx) };
    });
    setCities(updated);
  }

  function handleNombreChange(i, value) {
    const updated = cities.map((c, idx) => {
      if (idx !== i) return c;
      return { ...c, nombre: value, slug: slugify(value), waMsg: `Hola! Quisiera cotizar cortinas en ${value}` };
    });
    setCities(updated);
  }

  if (loading) return <AdminLayout><div className="p-8 text-gray-400">Cargando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Páginas SEO por Ciudad</h1>
            <p className="text-gray-500 text-sm mt-1">Cada ciudad genera una página en <code className="bg-gray-100 px-1 rounded">/cortinas-roller/[slug]</code></p>
          </div>
          <div className="flex gap-3 items-center">
            {msg && <span className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</span>}
            <button onClick={addCity}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={16} /> Nueva ciudad
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {cities.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <MapPin size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay ciudades. Agrega la primera.</p>
            </div>
          )}

          {cities.map((city, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                   onClick={() => setExpanded(expanded === i ? null : i)}>
                {city.heroImg
                  ? <img src={city.heroImg} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-primary-600" />
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{city.nombre || <span className="text-gray-400 font-normal">Nueva ciudad</span>}</div>
                  {city.slug && <div className="text-xs text-gray-400">/cortinas-roller/{city.slug}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); removeCity(i); }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                  {expanded === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded form */}
              {expanded === i && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nombre de la ciudad *</label>
                      <input value={city.nombre} onChange={e => handleNombreChange(i, e.target.value)}
                        placeholder="ej: San Bernardo"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Slug (URL) *</label>
                      <input value={city.slug} onChange={e => updateCity(i, 'slug', e.target.value)}
                        placeholder="san-bernardo"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary-400" />
                      <p className="text-xs text-gray-400 mt-1">/cortinas-roller/{city.slug || '...'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Zona / Sectores</label>
                      <input value={city.zona} onChange={e => updateCity(i, 'zona', e.target.value)}
                        placeholder="ej: San Bernardo, El Bosque y sector sur"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Región</label>
                      <input value={city.region} onChange={e => updateCity(i, 'region', e.target.value)}
                        placeholder="Región Metropolitana"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Descripción (párrafo introductorio)</label>
                    <textarea value={city.descripcion} onChange={e => updateCity(i, 'descripcion', e.target.value)}
                      rows={3} placeholder="Describe la cobertura y propuesta de valor en esta ciudad..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 resize-none" />
                  </div>

                  {/* Foto Hero */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Foto Hero (fondo del encabezado)</label>
                    {city.heroImg ? (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-gray-100">
                        <img src={city.heroImg} alt="Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                          <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Image size={13} /> Cambiar
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => e.target.files[0] && uploadHero(i, e.target.files[0])} />
                          </label>
                          <button onClick={() => updateCity(i, 'heroImg', '')}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <X size={13} /> Quitar
                          </button>
                        </div>
                        {uploading === i && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        {uploading === i
                          ? <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                          : <>
                              <Image size={24} className="text-gray-300 mb-2" />
                              <span className="text-sm text-gray-400">Click para subir foto</span>
                              <span className="text-xs text-gray-300 mt-0.5">JPG, PNG, WebP</span>
                            </>
                        }
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => e.target.files[0] && uploadHero(i, e.target.files[0])} />
                      </label>
                    )}
                  </div>

                  {/* Destacados */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destacados (por qué elegirnos)</label>
                      <button onClick={() => addDestacado(i)} className="text-xs text-primary-600 hover:underline">+ Agregar</button>
                    </div>
                    <div className="space-y-2">
                      {city.destacados.map((d, di) => (
                        <div key={di} className="flex gap-2">
                          <input value={d} onChange={e => updateDestacado(i, di, e.target.value)}
                            placeholder={`Punto destacado ${di + 1}`}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
                          {city.destacados.length > 2 && (
                            <button onClick={() => removeDestacado(i, di)} className="text-red-400 hover:text-red-600 px-2">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preguntas frecuentes</label>
                      <button onClick={() => addFaq(i)} className="text-xs text-primary-600 hover:underline">+ Agregar</button>
                    </div>
                    <div className="space-y-3">
                      {city.faq.map((f, fi) => (
                        <div key={fi} className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input value={f.q} onChange={e => updateFaq(i, fi, 'q', e.target.value)}
                              placeholder="Pregunta..."
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-primary-400" />
                            {city.faq.length > 1 && (
                              <button onClick={() => removeFaq(i, fi)} className="text-red-400 hover:text-red-600 px-2">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <textarea value={f.a} onChange={e => updateFaq(i, fi, 'a', e.target.value)}
                            rows={2} placeholder="Respuesta..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-primary-400 resize-none" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Mensaje WhatsApp</label>
                    <input value={city.waMsg} onChange={e => updateCity(i, 'waMsg', e.target.value)}
                      placeholder="Hola! Quisiera cotizar cortinas en..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <a href={`/cortinas-roller/${city.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline">
                      Ver página →
                    </a>
                    <button onClick={() => save(cities)} disabled={saving}
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors">
                      <Save size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {cities.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button onClick={() => save(cities)} disabled={saving}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
              <Save size={16} /> {saving ? 'Guardando...' : `Guardar todas (${cities.length})`}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

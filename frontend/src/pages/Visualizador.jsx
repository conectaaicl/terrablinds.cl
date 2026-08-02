import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Upload, Download, Eye, Sliders, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const CURTAIN_OVERLAYS = [
  { id: 'roller-white', name: 'Roller Blanco', color: '#f5f5f0', opacity: 0.75 },
  { id: 'roller-gray', name: 'Roller Gris', color: '#9ca3af', opacity: 0.75 },
  { id: 'roller-beige', name: 'Roller Beige', color: '#d4c5a9', opacity: 0.75 },
  { id: 'blackout-black', name: 'Blackout Negro', color: '#1f2937', opacity: 0.85 },
  { id: 'blackout-navy', name: 'Blackout Azul', color: '#1e3a5f', opacity: 0.85 },
  { id: 'blackout-wine', name: 'Blackout Vino', color: '#7c1d3e', opacity: 0.82 },
  { id: 'sunscreen-beige', name: 'Sunscreen Beige', color: '#c9b49a', opacity: 0.55 },
  { id: 'sunscreen-white', name: 'Sunscreen Blanco', color: '#e8e8e0', opacity: 0.55 },
  { id: 'lino-natural', name: 'Lino Natural', color: '#c8b89a', opacity: 0.80 },
  { id: 'terciopelo-verde', name: 'Terciopelo Verde', color: '#2d5a4b', opacity: 0.88 },
];

export default function Visualizador() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [selected, setSelected] = useState(CURTAIN_OVERLAYS[0]);
  const [coverage, setCoverage] = useState(0.6);
  const [opacity, setOpacity] = useState(selected.opacity);
  const [position, setPosition] = useState(0.05);
  const [dragging, setDragging] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw curtain overlay (vertical stripe from top, covering coverage % of width from position)
    const cW = Math.round(canvas.width * coverage);
    const cX = Math.round(canvas.width * position);
    const cH = canvas.height;

    ctx.globalAlpha = opacity;
    ctx.fillStyle = selected.color;

    // Realistic curtain: vertical gradient + subtle texture
    const grad = ctx.createLinearGradient(cX, 0, cX + cW, 0);
    grad.addColorStop(0, selected.color + 'CC');
    grad.addColorStop(0.15, selected.color);
    grad.addColorStop(0.85, selected.color);
    grad.addColorStop(1, selected.color + 'AA');
    ctx.fillStyle = grad;
    ctx.fillRect(cX, 0, cW, cH);

    // Curtain folds effect
    ctx.globalAlpha = opacity * 0.15;
    const foldW = Math.max(12, Math.floor(cW / 10));
    for (let i = 0; i < cW; i += foldW * 2) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(cX + i, 0, foldW * 0.4, cH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cX + i + foldW * 0.7, 0, foldW * 0.3, cH);
    }

    // Header bar (curtain rod)
    ctx.globalAlpha = opacity * 1.2;
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(cX - 4, 0, cW + 8, 12);

    ctx.globalAlpha = 1.0;
  }, [image, selected, coverage, opacity, position]);

  useEffect(() => { draw(); }, [draw]);

  function loadImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const maxW = 800;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      setImage(img);
    };
    img.src = url;
  }

  function downloadResult() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `terrablinds-visualizador-${selected.id}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  }

  return (
    <Layout>
      <SEO description="Visualizador de cortinas TerraBlinds — ve cómo quedarían las cortinas en tu habitación." path="/visualizador" />

      <div className="bg-gray-950 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-0">Herramienta gratuita</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Visualizador de Ambientes</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Sube una foto de tu habitación y ve cómo quedarían nuestras cortinas antes de comprar.
          </p>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

            {/* Controls panel */}
            <div className="space-y-5">
              {/* Upload */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Upload className="w-4 h-4" />Tu habitación</h3>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Sube una foto</span>
                  <span className="text-xs text-gray-400">JPG, PNG — máx 10MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && loadImage(e.target.files[0])} />
                </label>
              </div>

              {/* Style picker */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Estilo de cortina</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CURTAIN_OVERLAYS.map(c => (
                    <button key={c.id} onClick={() => { setSelected(c); setOpacity(c.opacity); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${selected.id === c.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}>
                      <div className="w-5 h-5 rounded-md flex-shrink-0 border border-gray-300 shadow-sm" style={{ background: c.color }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjustments */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Sliders className="w-4 h-4" />Ajustes</h3>
                {[
                  { label: 'Cobertura de ancho', value: coverage, min: 0.1, max: 1, step: 0.05, set: setCoverage, pct: true },
                  { label: 'Opacidad / Oscuridad', value: opacity, min: 0.1, max: 1, step: 0.05, set: setOpacity, pct: true },
                  { label: 'Posición horizontal', value: position, min: 0, max: 0.7, step: 0.05, set: setPosition, pct: true },
                ].map(s => (
                  <div key={s.label} className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                      <span>{s.label}</span>
                      <span>{s.pct ? Math.round(s.value * 100) + '%' : s.value}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                      onChange={e => s.set(parseFloat(e.target.value))}
                      className="w-full accent-primary-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {!image ? (
                  <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                    <Eye className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-600 mb-2">Sube una foto para comenzar</h3>
                    <p className="text-gray-400 text-sm max-w-xs">Toma una foto de tu ventana o habitación y verás el resultado en segundos</p>
                  </div>
                ) : null}
                <canvas ref={canvasRef} className="w-full h-auto display-block" style={{ display: image ? 'block' : 'none' }} />
              </div>

              {image && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={downloadResult}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all text-sm">
                    <Download className="w-4 h-4" /> Descargar imagen
                  </button>
                  <Link to="/quote"
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all text-sm">
                    Me gusta — Cotizar <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <strong>Consejo:</strong> Funciona mejor con fotos de ventanas amplias con buena iluminación natural. El resultado es una simulación orientativa — los colores reales pueden variar levemente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

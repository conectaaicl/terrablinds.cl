import React, { useState, useEffect } from 'react';
import { Calculator, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const FALLBACK_CATEGORIES = ['Cortinas Roller','Blackout','Persianas','Toldos','Cierres Terraza','Domótica'];

export default function PriceCalculatorWidget() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [form, setForm] = useState({ category: '', width: '', height: '', quantity: 1 });
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/api/products?limit=50').then(r => {
      const cats = [...new Set((r.data?.products || r.data || []).map(p => p.category).filter(Boolean))];
      if (cats.length) setCategories(cats);
    }).catch(() => {});
  }, []);

  function calculate() {
    const w = parseFloat(form.width);
    const h = parseFloat(form.height);
    const q = parseInt(form.quantity) || 1;
    if (!w || !h || w < 0.3 || h < 0.3) {
      setResult({ error: 'Ingresa dimensiones válidas (mín 0.3m)' });
      return;
    }
    const area = w * h;
    // Price per m² by category (approximate)
    const PRICES = {
      'Cortinas Roller': 28000,
      'Blackout': 35000,
      'Persianas': 42000,
      'Toldos': 65000,
      'Cierres Terraza': 120000,
      'Domótica': 85000,
    };
    const base = PRICES[form.category] || 30000;
    const min = Math.round(base * area * q * 0.9);
    const max = Math.round(base * area * q * 1.2);
    setResult({ min, max, area: area.toFixed(2), q, category: form.category || 'producto' });
  }

  const clp = n => `$${n.toLocaleString('es-CL')}`;

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold rounded-full shadow-lg shadow-primary-700/40 transition-all hover:scale-105 text-sm"
      >
        <Calculator className="w-4 h-4" />
        <span className="hidden sm:inline">Calcular precio</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <h2 className="font-bold text-lg">Calculadora de Precio</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Producto</label>
                <div className="relative">
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Selecciona categoría...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'width', label: 'Ancho (m)', ph: '1.20' },
                  { key: 'height', label: 'Alto (m)', ph: '2.00' },
                  { key: 'quantity', label: 'Cantidad', ph: '1' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>

              <button onClick={calculate}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm">
                Calcular estimado
              </button>

              {/* Result */}
              {result && (
                result.error ? (
                  <p className="text-red-500 text-sm text-center">{result.error}</p>
                ) : (
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
                    <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Estimado para {result.category}</p>
                    <p className="text-2xl font-bold text-primary-700">{clp(result.min)} — {clp(result.max)}</p>
                    <p className="text-xs text-gray-500 mt-1">{result.area}m² × {result.q} unidad{result.q > 1 ? 'es' : ''} · Precio referencial sin instalación</p>
                    <Link to="/quote" onClick={() => setOpen(false)}
                      className="mt-3 inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      Cotización exacta gratis <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )
              )}

              <p className="text-xs text-gray-400 text-center">Precio estimado. La cotización final incluye instalación, materiales y visita técnica.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

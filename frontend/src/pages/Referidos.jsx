import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Gift, CheckCircle2, Tag, ArrowRight, Copy, Check } from 'lucide-react';
import api from '../api';

export default function Referidos() {
  const [params] = useSearchParams();
  const codeParam = (params.get('code') || '').toUpperCase();
  const [code, setCode] = useState(codeParam);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeParam) handleValidate(codeParam);
  }, []);

  async function handleValidate(c = code) {
    if (!c.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await api.get(`/api/referrals/validate/${c.trim().toUpperCase()}`);
      setInfo(r.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Código no válido');
      setInfo(null);
    } finally { setLoading(false); }
  }

  function copyLink() {
    const url = `https://terrablinds.cl/referidos?code=${info.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Layout>
      <SEO description="Programa de referidos TerraBlinds — descuentos exclusivos para ti y tus amigos." path="/referidos" />
      <div className="min-h-screen py-20" style={{ background: '#f8f7f5' }}>
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/30">
              <Gift className="w-8 h-8" />
            </div>
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Programa de Referidos</h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Ingresa tu código de descuento y aplícalo en tu próxima compra. ¡Comparte con amigos y ganen juntos!
            </p>
          </div>

          {/* Code input */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Código de descuento</label>
            <div className="flex gap-3">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder="Ej: AMIGO15"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
              />
              <button
                onClick={() => handleValidate()}
                disabled={loading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Validar'}
              </button>
            </div>
            {error && <p className="mt-3 text-red-500 text-sm font-medium">{error}</p>}
          </div>

          {/* Valid code result */}
          {info?.valid && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-green-800 mb-1">¡Código válido!</h2>
                  <p className="text-green-700 mb-4">
                    Este código te da un <strong>{info.discount_pct}% de descuento</strong> en tu compra.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/catalog`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all text-sm">
                      <Tag className="w-4 h-4" /> Ir al catálogo
                    </Link>
                    <button onClick={copyLink}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-green-300 text-green-700 hover:bg-green-50 font-semibold rounded-xl transition-all text-sm">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '¡Copiado!' : 'Copiar enlace'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-6">¿Cómo funciona?</h3>
            <div className="space-y-5">
              {[
                { n: '01', title: 'Recibe tu código', desc: 'Obtén un código de descuento exclusivo al comprar o al ser referido por un amigo.' },
                { n: '02', title: 'Comparte', desc: 'Comparte tu enlace con amigos. Ellos también obtendrán un descuento al usarlo.' },
                { n: '03', title: 'Aplica al pagar', desc: 'Ingresa el código al cotizar o en el carrito antes de confirmar tu pedido.' },
              ].map(s => (
                <div key={s.n} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary-600/10 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.n}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{s.title}</div>
                    <div className="text-gray-500 text-sm mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm mb-4">¿No tienes código? ¡Cotiza hoy y te enviamos uno!</p>
              <Link to="/quote" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all text-sm">
                Cotizar gratis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import {
  ExternalLink, CheckCircle, Wrench, Users, ClipboardList,
  BarChart3, MessageSquare, Package, Zap, Globe, Headphones,
  ArrowRight, Star, ChevronRight
} from 'lucide-react';
import api from '../api';

/* ── Default config ─────────────────────────────────────────────────── */
const DEFAULT = {
  software_title: 'ConectaWork',
  software_subtitle: 'Gestiona tu taller con inteligencia',
  software_description: 'El sistema SaaS todo-en-uno para talleres y empresas de instalación. Cotizaciones, producción, equipo y clientes desde un solo lugar — en la nube, sin instalación.',
  software_badge: 'Desarrollado por Conecta AI',
  software_cta_label: 'Solicitar Demo',
  software_cta_url: 'https://working.conectaai.cl',
  software_alt_label: 'Ingresar al sistema',
  software_alt_url: 'https://working.conectaai.cl',
  software_image_url: '',
  software_enabled: 'true',
};

/* ── Feature cards ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Ordenes de Trabajo',
    desc: 'Crea, asigna y sigue cada orden en tiempo real. Flujo completo desde recepcion hasta entrega.',
    gradFrom: '#6366f1',
    gradTo: '#4f46e5',
  },
  {
    icon: Star,
    title: 'Cotizaciones',
    desc: 'Genera presupuestos profesionales con calculo automatico de medidas, materiales y mano de obra.',
    gradFrom: '#8b5cf6',
    gradTo: '#7c3aed',
  },
  {
    icon: Users,
    title: 'Equipo — 6 Roles',
    desc: 'Jefe de taller, vendedor, fabricante, instalador, coordinador y cliente. Cada uno con su vista.',
    gradFrom: '#a855f7',
    gradTo: '#9333ea',
  },
  {
    icon: MessageSquare,
    title: 'Emails Automaticos',
    desc: 'Notificaciones automaticas al cliente en cada etapa: confirmacion, produccion, despacho y entrega.',
    gradFrom: '#3b82f6',
    gradTo: '#2563eb',
  },
  {
    icon: Package,
    title: 'Inventario / Bodegas',
    desc: 'Control de stock en tiempo real. Alertas de reposicion y trazabilidad de materiales por orden.',
    gradFrom: '#06b6d4',
    gradTo: '#0891b2',
  },
  {
    icon: BarChart3,
    title: 'Reportes y Dashboard',
    desc: 'Panel ejecutivo con metricas de ventas, produccion e instalaciones. Exporta en PDF o Excel.',
    gradFrom: '#14b8a6',
    gradTo: '#0d9488',
  },
];

/* ── Trust badges ───────────────────────────────────────────────────── */
const TRUST = [
  { icon: Globe,      label: 'Multi-tenant',  sub: 'Para cualquier taller' },
  { icon: Zap,        label: 'En la nube',     sub: 'Sin instalacion local' },
  { icon: Headphones, label: 'Soporte 24/7',   sub: 'Equipo siempre disponible' },
];

/* ── Abstract UI mockup ─────────────────────────────────────────────── */
function UIMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: 'rgba(10,16,32,0.95)',
        borderColor: 'rgba(99,102,241,0.2)',
        boxShadow: '0 0 80px rgba(99,102,241,0.2)',
      }}
    >
      {/* Fake toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(248,113,113,0.6)' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(250,204,21,0.6)' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(74,222,128,0.6)' }} />
        <div
          className="flex-1 mx-3 h-5 rounded flex items-center px-3"
          style={{ background: 'rgba(255,255,255,0.05)', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}
        >
          working.conectaai.cl
        </div>
      </div>
      {/* Fake sidebar + content */}
      <div className="flex" style={{ minHeight: 240 }}>
        {/* sidebar */}
        <div
          className="w-14 flex flex-col items-center gap-3 py-4 border-r"
          style={{ background: 'rgba(30,27,75,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          {[ClipboardList, Users, Package, BarChart3].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={i === 0
                ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }
                : { color: 'rgba(255,255,255,0.2)' }
              }
            >
              <Icon className="w-4 h-4" />
            </div>
          ))}
        </div>
        {/* content area */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div
              className="h-7 w-24 rounded-lg border"
              style={{ background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.25)' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)', 'rgba(59,130,246,0.1)'].map((bg, i) => (
              <div
                key={i}
                className="rounded-xl p-2.5 border"
                style={{ background: bg, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="h-2 w-8 rounded mb-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="h-5 w-12 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[90, 75, 60, 45].map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2 pb-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="w-5 h-5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div
                  className="h-2 rounded"
                  style={{ width: w + '%', background: 'rgba(255,255,255,0.08)' }}
                />
                <div
                  className="ml-auto w-12 h-4 rounded"
                  style={{ background: 'rgba(99,102,241,0.2)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Glow overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full blur-3xl"
          style={{ background: 'rgba(99,102,241,0.08)' }}
        />
        <div
          className="absolute top-10 left-20 w-32 h-32 rounded-full blur-2xl"
          style={{ background: 'rgba(139,92,246,0.05)' }}
        />
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
const Software = () => {
  const [cfg, setCfg] = useState(DEFAULT);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get('/api/config/public')
      .then(res => {
        const nonEmpty = Object.fromEntries(
          Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );
        // Remap old name if not overridden
        if (nonEmpty.software_title === 'WorkShopOS') {
          nonEmpty.software_title = 'ConectaWork';
        }
        setCfg(prev => ({ ...prev, ...nonEmpty }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (cfg.software_enabled === 'false') {
    return (
      <Layout>
        <SEO title="ConectaWork" description="Software SaaS de gestion para talleres." path="/software" />
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
          Esta seccion no esta disponible aun.
        </div>
      </Layout>
    );
  }

  const productTitle = cfg.software_title || 'ConectaWork';

  return (
    <Layout>
      <SEO
        title={productTitle + ' — Software SaaS para talleres'}
        description={cfg.software_subtitle}
        path="/software"
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#070b14' }} className="relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -left-32 rounded-full"
            style={{ width: 600, height: 600, background: 'rgba(67,56,202,0.08)', filter: 'blur(120px)' }}
          />
          <div
            className="absolute -bottom-40 right-0 rounded-full"
            style={{ width: 500, height: 500, background: 'rgba(109,40,217,0.08)', filter: 'blur(120px)' }}
          />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.5,
          }}
        />

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

            {/* Left: copy */}
            <div>
              {/* Badge */}
              <div className="mb-6">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#818cf8', animation: 'cwPulse 2s infinite' }}
                  />
                  {cfg.software_badge || 'Desarrollado por Conecta AI'}
                </span>
              </div>

              {/* Brand name */}
              <h1
                className="font-black mb-2 leading-none tracking-tight"
                style={{
                  fontSize: 'clamp(2.8rem, 6vw, 4rem)',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {productTitle}
              </h1>

              {/* Tagline */}
              <h2
                className="font-semibold mb-5 leading-snug"
                style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#cbd5e1' }}
              >
                {cfg.software_subtitle || 'Gestiona tu taller con inteligencia'}
              </h2>

              <p style={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: 480 }} className="mb-10 text-base">
                {cfg.software_description}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {cfg.software_cta_url && (
                  <a
                    href={cfg.software_cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-xl text-white text-base transition-transform hover:scale-[1.03]"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                    }}
                  >
                    {cfg.software_cta_label || 'Solicitar Demo'}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
                {cfg.software_alt_url && cfg.software_alt_label && (
                  <a
                    href={cfg.software_alt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-xl text-base transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#cbd5e1',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    {cfg.software_alt_label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5 mt-10">
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#e2e8f0' }}>{label}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: UI mockup */}
            <div className="hidden md:block">
              {cfg.software_image_url ? (
                <img
                  src={cfg.software_image_url}
                  alt={productTitle}
                  className="rounded-2xl w-full object-cover"
                  style={{
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: '0 0 80px rgba(99,102,241,0.25)',
                  }}
                />
              ) : (
                <UIMockup />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, #070b14, rgba(99,102,241,0.2), #070b14)' }} />

      {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
      <section ref={sectionRef} style={{ background: '#070b14' }} className="py-24 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none rounded-full"
          style={{ width: 900, height: 300, background: 'rgba(67,56,202,0.08)', filter: 'blur(100px)' }}
        />

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: '#818cf8' }}
            >
              Funcionalidades
            </span>
            <h2 className="font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
              Todo lo que necesitas para operar tu taller
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#94a3b8' }}>
              Disenado por quienes conocen la industria. Sin curva de aprendizaje, sin servidores que mantener.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {FEATURES.map(({ icon: Icon, title: ft, desc, gradFrom, gradTo }, i) => (
              <div
                key={ft}
                className="group relative rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: 'rgba(10,16,32,0.9)',
                  border: '1px solid rgba(99,102,241,0.12)',
                  backdropFilter: 'blur(12px)',
                  animation: visible ? ('cwFadeUp 0.5s ease ' + i * 80 + 'ms both') : 'none',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)';
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, ' + gradFrom + ', ' + gradTo + ')',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#e2e8f0' }}>{ft}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{desc}</p>
                <div
                  className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#818cf8' }}
                >
                  Ver mas <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section style={{ background: '#070b14' }} className="pb-24 relative">
        <div
          className="mb-16"
          style={{ height: 1, background: 'linear-gradient(90deg, #070b14, rgba(99,102,241,0.2), #070b14)' }}
        />
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div
            className="relative rounded-3xl px-8 py-14"
            style={{
              background: 'rgba(10,16,32,0.9)',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12), transparent 70%)' }}
            />

            {/* Icon */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <Wrench className="w-8 h-8" style={{ color: '#a5b4fc' }} />
            </div>

            <h2
              className="relative font-black text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}
            >
              Listo para modernizar tu taller?
            </h2>
            <p className="relative mb-8 text-base leading-relaxed" style={{ color: '#94a3b8' }}>
              Sin instalacion. Desde cualquier dispositivo. Empieza hoy con una demo gratuita.
            </p>

            <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
              {cfg.software_cta_url && (
                <a
                  href={cfg.software_cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl text-white transition-transform hover:scale-[1.03]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                  }}
                >
                  {cfg.software_cta_label || 'Solicitar Demo'}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
              {cfg.software_alt_url && (
                <a
                  href={cfg.software_alt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  {cfg.software_alt_label || 'Ingresar al sistema'}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Checkmarks */}
            <div className="relative flex flex-wrap justify-center gap-x-8 gap-y-2 mt-8">
              {['Sin tarjeta requerida', 'Demo en 24 horas', 'Onboarding incluido'].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: 'rgba(99,102,241,0.7)' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes cwFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cwPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>
    </Layout>
  );
};

export default Software;

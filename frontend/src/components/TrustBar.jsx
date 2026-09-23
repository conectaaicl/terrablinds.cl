import { useEffect, useState } from 'react';
import api from '../api';

// TrustBar — carga los mismos stats que el admin configura en /admin/paginas/inicio
export function TrustBar() {
  const [cfg, setCfg] = useState({});

  useEffect(() => {
    api.get('/api/config/public').then(r => setCfg(r.data || {})).catch(() => {});
  }, []);

  // Usa los mismos valores que el bloque de stats del Home
  const stat1 = { num: cfg.stat1_num || '+500',  label: cfg.stat1_label || 'Proyectos instalados' };
  const stat2 = { num: cfg.stat2_num || '5.0★',  label: cfg.stat2_label || 'Calificación Google' };
  const stat3 = { num: cfg.stat3_num || '48 meses', label: cfg.stat3_label || 'Garantía incluida' };

  return (
    <div className="bg-white border-b border-gray-100 py-4 px-4">
      <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-x-8 gap-y-3">

        {/* Google rating */}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-bold text-gray-800 text-sm">{stat2.num}</span>
              <span className="text-yellow-400 text-xs">★★★★★</span>
            </div>
            <div className="text-xs text-gray-400">{stat2.label}</div>
          </div>
        </div>

        <div className="h-7 w-px bg-gray-200 hidden sm:block" />
        <div className="text-center">
          <div className="text-base font-bold text-gray-800">{stat1.num}</div>
          <div className="text-xs text-gray-400">{stat1.label}</div>
        </div>

        <div className="h-7 w-px bg-gray-200 hidden sm:block" />
        <div className="text-center">
          <div className="text-base font-bold text-gray-800">{stat3.num}</div>
          <div className="text-xs text-gray-400">{stat3.label}</div>
        </div>

        <div className="h-7 w-px bg-gray-200 hidden sm:block" />
        <div className="text-center">
          <div className="text-base font-bold text-gray-800">+10 años</div>
          <div className="text-xs text-gray-400">de experiencia</div>
        </div>
      </div>
    </div>
  );
}

// Proceso en 3 pasos — estilo Rolzzo
export function ProcessSteps() {
  const steps = [
    { emoji: "💬", title: "Cotiza por WhatsApp", desc: "Cuéntanos qué necesitas y te asesoramos según tu espacio. Respuesta en minutos." },
    { emoji: "📐", title: "Te visitamos",        desc: "Tomamos medidas exactas y te mostramos muestras de telas en tu hogar. Sin costo." },
    { emoji: "🔧", title: "Fabricamos e instalamos", desc: "Producción propia y montaje profesional. Listo en pocos días." },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6C5CE7]">Simple y rápido</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">¿Cuál es el siguiente paso?</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-3xl">{s.emoji}</div>
              <h3 className="mb-2 text-base font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href={`https://api.whatsapp.com/send?phone=56998101891&text=${encodeURIComponent('¡Hola! Quiero cotizar cortinas roller a medida.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-[#1ebe5d] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.34a9.85 9.85 0 0 0 4.64 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.76 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.64-.6-2.9-1.25-4.79-4.17-4.93-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.21 1.36.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.87.27.14.44.2.51.32.07.11.07.66-.17 1.34z"/>
            </svg>
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

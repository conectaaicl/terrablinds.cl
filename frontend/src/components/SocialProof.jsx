import { useEffect, useRef, useState } from 'react';

const STATS = [
  { prefix: '+', value: 500,  suffix: '',        label: 'Proyectos instalados',  decimals: 0 },
  { prefix: '',  value: 5.0,  suffix: '★',       label: 'Calificación Google',   decimals: 1 },
  { prefix: '',  value: 48,   suffix: ' meses',  label: 'Garantía incluida',     decimals: 0 },
  { prefix: '+', value: 10,   suffix: ' años',   label: 'De experiencia',        decimals: 0 },
];

function useCountUp(target, decimals, duration, active) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((ease * target).toFixed(decimals)));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [active, target, decimals, duration]);
  return count;
}

function StatCard({ prefix, value, suffix, label, decimals, active }) {
  const count = useCountUp(value, decimals, 1800, active);
  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('es-CL');
  return (
    <div className="text-center px-4">
      <p className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
        {prefix}{display}{suffix}
      </p>
      <p className="mt-2 text-sm text-blue-200 uppercase tracking-widest font-medium">{label}</p>
    </div>
  );
}

export function StatsCounter() {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0d2a5e] py-16">
      {/* subtle grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return null;
}

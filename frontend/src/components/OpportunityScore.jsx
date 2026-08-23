import { useState } from 'react';
import { Target } from 'lucide-react';

const scoreColor = (score) => {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const factorColor = (delta) =>
  delta >= 0 ? 'text-green-600' : 'text-red-600';

export default function OpportunityScore({ score, factors = [], size = 'sm' }) {
  const [open, setOpen] = useState(false);

  if (score == null) return null;

  const isLg = size === 'lg';

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        onClick={() => setOpen((p) => !p)}
        title="Ver desglose de puntaje"
        className={`inline-flex items-center gap-1 border rounded-full font-semibold cursor-pointer select-none transition-opacity hover:opacity-80 ${scoreColor(score)} ${isLg ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'}`}
      >
        <Target className={isLg ? 'w-4 h-4' : 'w-3 h-3'} />
        {score}
      </button>

      {open && factors.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Desglose</p>
            {factors.map((f, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-0.5">
                <span className="text-gray-700 truncate">{f.label}</span>
                <span className={`font-semibold ml-2 ${factorColor(f.delta)}`}>
                  {f.delta > 0 ? `+${f.delta}` : f.delta}
                </span>
              </div>
            ))}
            <div className="border-t mt-2 pt-1 flex justify-between text-xs font-bold">
              <span>Total</span>
              <span>{score}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

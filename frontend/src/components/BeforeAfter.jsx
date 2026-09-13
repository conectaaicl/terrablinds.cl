import { useState, useRef, useCallback, useEffect } from 'react';

export default function BeforeAfter({ before, after, beforeLabel = 'Sin cortina', afterLabel = 'Con cortina TerraBlinds' }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const getX = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    setPos(getX(e));
  }, [dragging, getX]);

  const onUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, onMove, onUp]);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl shadow-xl cursor-col-resize"
      style={{ aspectRatio: '16/9', maxHeight: 480 }}
      onMouseDown={(e) => { setDragging(true); setPos(getX(e)); }}
      onTouchStart={(e) => { setDragging(true); setPos(getX(e)); }}
    >
      {/* AFTER (full width, clipped on left) */}
      <img
        src={after}
        alt="después con cortina"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* BEFORE (clipped on right via clipPath) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={before}
          alt="antes sin cortina"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ filter: 'brightness(1.35) saturate(0.6) contrast(1.1)' }}
          draggable={false}
        />
        {/* Harsh light overlay for "before" */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,240,180,0.35) 0%, transparent 60%)' }}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none z-10"
        style={{ left: `${pos}%` }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 10l-4-4m0 0l4-4M2 6h16M14 10l4 4m0 0l-4 4m4-4H2" stroke="#0d2a5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 pointer-events-none" style={{ opacity: pos < 15 ? 0 : 1, transition: 'opacity 0.2s' }}>
        <span className="text-xs font-bold uppercase tracking-wide bg-black/50 text-white px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute bottom-4 right-4 pointer-events-none" style={{ opacity: pos > 85 ? 0 : 1, transition: 'opacity 0.2s' }}>
        <span className="text-xs font-bold uppercase tracking-wide bg-[#0d2a5e]/80 text-white px-2 py-1 rounded">
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

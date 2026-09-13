import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

// Precios de marketing — mostrar siempre estos valores en el home
const FEATURED = [
  { name: "Roller Sunscreen",     match: "screen",   category: "Cortinas Roller", origPrice: 45715, price: 32000, tag: "Más elegido" },
  { name: "Roller Blackout",      match: "blackout",    category: "Cortinas Roller", origPrice: 45715, price: 32000 },
  { name: "Roller Duo",           match: "duo",         category: "Cortinas Roller", origPrice: 60000, price: 42000 },
  { name: "Roller Motorizado",    match: "dual",        category: "Cortinas Roller", origPrice: 95000, price: 68000, tag: "Smart Home" },
  { name: "Toldo Retráctil",      match: "toldo",       category: "Toldos",          origPrice: 180000, price: 129000 },
  { name: "Malla de Seguridad",   match: "malla",       category: "Mallas",          origPrice: 65000, price: 45000 },
];

function clp(v) {
  return Number(v).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function FeaturedProducts() {
  const [imgMap, setImgMap] = useState({});

  useEffect(() => {
    api.get('/api/products').then(r => {
      const list = Array.isArray(r.data) ? r.data : r.data?.products || [];
      const map = {};
      FEATURED.forEach(f => {
        const found = list.find(p =>
          p.name?.toLowerCase().includes(f.match) ||
          p.slug?.toLowerCase().includes(f.match)
        );
        if (found?.images?.[0]) map[f.match] = found.images[0];
      });
      setImgMap(map);
    }).catch(() => {});
  }, []);

  return (
    <section className="bg-[#0B1220] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6C5CE7]">Precios directos de fábrica</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Nuestros productos más elegidos</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((p) => {
            const off = Math.round(((p.origPrice - p.price) / p.origPrice) * 100);
            const imgSrc = imgMap[p.match];
            return (
              <Link
                key={p.match}
                to={`/catalog?category=${encodeURIComponent(p.category)}`}
                className="group relative rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-lg block"
              >
                {p.tag && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-[#0B1220] px-3 py-1 text-xs font-semibold text-white">{p.tag}</span>
                )}
                <span className="absolute right-4 top-4 z-10 rounded-full bg-[#6C5CE7] px-3 py-1 text-xs font-semibold text-white">{off}% OFF</span>

                {imgSrc ? (
                  <div className="mt-2 h-44 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={`https://terrablinds.cl${imgSrc}`}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="mt-2 h-44 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-sm font-medium">{p.name}</span>
                  </div>
                )}

                <h3 className="mt-4 text-base font-semibold text-[#0B1220]">{p.name}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm text-gray-400 line-through">{clp(p.origPrice)}</span>
                  <span className="text-lg font-bold text-[#0B1220]">{clp(p.price)}</span>
                </div>
                <span className="mt-3 inline-block text-sm font-medium text-[#6C5CE7] group-hover:underline">Ver detalle →</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link to="/catalog" className="inline-block rounded-full border border-[#6C5CE7] px-6 py-3 text-sm font-semibold text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-colors">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  );
}

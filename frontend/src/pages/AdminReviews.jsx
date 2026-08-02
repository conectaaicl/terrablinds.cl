import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import api from '../api';

function Stars({ n }) {
  return <span className="text-amber-400">{[...Array(5)].map((_, i) => i < n ? '★' : '☆').join('')}</span>;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/api/reviews/admin?status=${filter}`).then(r => setReviews(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  async function approve(id) {
    await api.patch(`/api/reviews/admin/${id}`, { approved: true });
    load();
  }

  async function reject(id) {
    await api.patch(`/api/reviews/admin/${id}`, { approved: false });
    load();
  }

  async function del(id) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    await api.delete(`/api/reviews/admin/${id}`);
    load();
  }

  const pending = reviews.filter(r => !r.approved).length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900">Reseñas de Clientes</h1>
          {pending > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pending} pendientes</span>}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['pending','approved','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Todas'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Cargando...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No hay reseñas en esta categoría</div>
          ) : reviews.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl border p-5 ${!r.approved ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-bold text-gray-900">{r.customer_name}</span>
                    <Stars n={r.rating} />
                    {!r.approved && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pendiente</span>}
                    {r.approved && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Aprobada</span>}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">"{r.text}"</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>{r.customer_email}</span>
                    {r.product_id && <span>Producto #{r.product_id}</span>}
                    <span>{new Date(r.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!r.approved && (
                    <button onClick={() => approve(r.id)} className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors" title="Aprobar">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {r.approved && (
                    <button onClick={() => reject(r.id)} className="p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors" title="Desaprobar">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => del(r.id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

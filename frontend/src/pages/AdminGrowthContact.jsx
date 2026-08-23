import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../api';
import { ArrowLeft, User, Phone, Mail, AlertTriangle, ExternalLink } from 'lucide-react';

const STATUS_LABELS = {
    new: 'Nueva', contacted: 'Contactada', qualified: 'Calificada',
    quoted: 'Cotizada', won: 'Ganada', lost: 'Perdida',
    spam: 'Spam', duplicate: 'Duplicada', out_of_coverage: 'Sin cobertura',
};

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    qualified: 'bg-violet-100 text-violet-700',
    quoted: 'bg-teal-100 text-teal-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-gray-100 text-gray-500',
    spam: 'bg-red-100 text-red-600',
    duplicate: 'bg-orange-100 text-orange-700',
    out_of_coverage: 'bg-slate-100 text-slate-500',
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CL', { dateStyle: 'medium' });
}

export default function AdminGrowthContact() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/growth/contacts/${id}`)
            .then(r => { setContact(r.data); setError(null); })
            .catch(() => setError('No se pudo cargar el contacto.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-24 text-gray-400">Cargando…</div>
            </AdminLayout>
        );
    }

    if (error || !contact) {
        return (
            <AdminLayout>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error || 'No encontrado.'}</div>
                    <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} /> Volver
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={15} /> Volver
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3a8a] via-[#1a56c4] to-[#0d3a8a] rounded-2xl px-6 py-5">
                    <h1 className="text-white text-xl font-bold">{contact.name || 'Sin nombre'}</h1>
                    <p className="text-blue-200 text-sm mt-1">Contacto #{contact.id}</p>
                </div>

                {/* Phone match warning */}
                {contact.phone_match_count > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
                        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-amber-800">Teléfono compartido:</strong>
                            <span className="text-amber-700">
                                {' '}Hay {contact.phone_match_count} otro{contact.phone_match_count > 1 ? 's' : ''} contacto{contact.phone_match_count > 1 ? 's' : ''} con el mismo número normalizado.
                                No se fusionaron automáticamente.
                            </span>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <User size={15} className="text-gray-400" />
                        Información
                    </h2>
                    <div className="space-y-3 text-sm">
                        {contact.email && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail size={13} className="text-gray-400 shrink-0" />
                                {contact.email}
                            </div>
                        )}
                        {contact.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone size={13} className="text-gray-400 shrink-0" />
                                {contact.phone}
                                {contact.phone_normalized && contact.phone !== contact.phone_normalized && (
                                    <span className="text-xs text-gray-400">({contact.phone_normalized})</span>
                                )}
                            </div>
                        )}
                        <div className="text-gray-500 text-xs">Registrado: {fmtDate(contact.created_at)}</div>
                        {contact.notes && (
                            <div className="bg-gray-50 rounded-xl p-3 text-gray-600 text-xs">{contact.notes}</div>
                        )}
                    </div>
                </div>

                {/* Opportunities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">
                        Oportunidades ({contact.opportunities?.length || 0})
                    </h2>
                    {(!contact.opportunities || contact.opportunities.length === 0) ? (
                        <p className="text-sm text-gray-400">Sin oportunidades.</p>
                    ) : (
                        <div className="space-y-2">
                            {contact.opportunities.map(opp => (
                                <div
                                    key={opp.id}
                                    className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
                                    onClick={() => navigate(`/admin/growth/opportunities/${opp.id}`)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{opp.product_interest || 'Opp #' + opp.id}</p>
                                        <p className="text-xs text-gray-400 tabular-nums">{fmtDate(opp.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[opp.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {STATUS_LABELS[opp.status] || opp.status}
                                        </span>
                                        <ExternalLink size={13} className="text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

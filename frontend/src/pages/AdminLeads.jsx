import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, Loader, Trash2, MessageCircle, Mail, Phone, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../api';

const STATUS_LABELS = {
    new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
    contacted: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-700' },
    converted: { label: 'Convertido', color: 'bg-green-100 text-green-700' },
    lost: { label: 'Perdido', color: 'bg-gray-100 text-gray-500' },
};

const fmtDate = d => new Date(d).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const fetchLeads = () => {
        setLoading(true);
        api.get('/api/leads').then(r => setLeads(r.data)).catch(() => {}).finally(() => setLoading(false));
    };

    useEffect(() => { fetchLeads(); }, []);

    const updateStatus = async (id, status) => {
        await api.patch(`/api/leads/${id}`, { status });
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    const deleteLead = async (id) => {
        if (!confirm('¿Eliminar este lead?')) return;
        await api.delete(`/api/leads/${id}`);
        setLeads(prev => prev.filter(l => l.id !== id));
        if (selected?.id === id) setSelected(null);
    };

    const counts = {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        converted: leads.filter(l => l.status === 'converted').length,
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" /> Leads del Chat
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Contactos captados automáticamente por el asistente IA</p>
                </div>
                <button onClick={fetchLeads} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { key: 'new', label: 'Nuevos', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { key: 'contacted', label: 'Contactados', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { key: 'converted', label: 'Convertidos', color: 'bg-green-50 border-green-200 text-green-700' },
                ].map(s => (
                    <div key={s.key} className={`${s.color} border rounded-xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{counts[s.key]}</p>
                        <p className="text-xs font-medium mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : leads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aún no hay leads captados</p>
                    <p className="text-gray-400 text-sm mt-1">Los contactos del chat aparecerán aquí automáticamente</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-900">{lead.name || <span className="text-gray-400 italic">Sin nombre</span>}</p>
                                        {lead.notes && (
                                            <button onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                                                className="text-xs text-blue-600 hover:underline mt-0.5">
                                                Ver conversación
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {lead.email && (
                                                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors">
                                                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate max-w-[160px]">{lead.email}</span>
                                                </a>
                                            )}
                                            {lead.phone && (
                                                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors">
                                                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {lead.phone}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{fmtDate(lead.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={lead.status}
                                            onChange={e => updateStatus(lead.id, e.target.value)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_LABELS[lead.status]?.color}`}
                                        >
                                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {lead.phone && (
                                                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                    title="Contactar por WhatsApp"
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {lead.email && (
                                                <a href={`mailto:${lead.email}`} title="Enviar email"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button onClick={() => deleteLead(lead.id)} title="Eliminar"
                                                className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Conversation preview */}
                    {selected && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Fragmento de conversación — {selected.name}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

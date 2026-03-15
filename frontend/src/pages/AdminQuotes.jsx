import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Eye, X, ChevronDown, MessageCircle, Mail, RefreshCw, Phone } from 'lucide-react';
import api from '../api';

const STATUS_MAP = {
    pending:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    contacted: { label: 'Contactado',  cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    accepted:  { label: 'Aceptada',    cls: 'bg-green-100 text-green-800 border-green-200' },
    rejected:  { label: 'Rechazada',   cls: 'bg-red-100 text-red-800 border-red-200' },
    completed: { label: 'Completada',  cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

const AdminQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => { fetchQuotes(); }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/quotes');
            setQuotes(res.data);
        } catch (err) {
            setError('No se pudieron cargar las cotizaciones.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (quoteId, newStatus) => {
        setUpdatingStatus(quoteId);
        try {
            await api.put(`/api/quotes/${quoteId}/status`, { status: newStatus });
            setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
            if (selectedQuote?.id === quoteId) setSelectedQuote({ ...selectedQuote, status: newStatus });
        } catch {
            alert('Error al actualizar el estado.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const parseItems = (quote) => {
        if (Array.isArray(quote.items)) return quote.items;
        try { return JSON.parse(quote.items || '[]'); } catch { return []; }
    };

    const whatsappLink = (quote) => {
        const phone = (quote.customer_phone || '').replace(/\D/g, '');
        if (!phone) return null;
        const num = phone.startsWith('56') ? phone : '56' + phone;
        const msg = encodeURIComponent(`Hola ${quote.customer_name}, te contactamos de TerraBlinds sobre tu cotización #${quote.id} por $${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}. ¿Cómo podemos ayudarte?`);
        return `https://wa.me/${num}?text=${msg}`;
    };

    const emailLink = (quote) => {
        const subject = encodeURIComponent(`Cotización #${quote.id} - TerraBlinds`);
        const body = encodeURIComponent(`Hola ${quote.customer_name},\n\nTe contactamos por tu cotización #${quote.id}.\n\nSaludos,\nTerraBlinds`);
        return `mailto:${quote.customer_email}?subject=${subject}&body=${body}`;
    };

    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
                    <p className="text-gray-500 text-sm">{quotes.length} cotizaciones en total</p>
                </div>
                <button onClick={fetchQuotes} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Todos los estados</option>
                        {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Cargando cotizaciones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredQuotes.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-400">No hay cotizaciones para mostrar.</td></tr>
                                ) : filteredQuotes.map(quote => {
                                    const st = STATUS_MAP[quote.status] || { label: quote.status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
                                    const wa = whatsappLink(quote);
                                    return (
                                        <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{quote.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 text-sm">{quote.customer_name}</div>
                                                <div className="text-xs text-gray-400">{quote.customer_email}</div>
                                                {quote.customer_phone && <div className="text-xs text-gray-400">{quote.customer_phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString('es-CL')}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}</td>
                                            <td className="px-6 py-4">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={quote.status}
                                                        onChange={e => handleStatusChange(quote.id, e.target.value)}
                                                        disabled={updatingStatus === quote.id}
                                                        className={`appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer outline-none ${st.cls}`}
                                                    >
                                                        {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {wa && (
                                                        <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <a href={emailLink(quote)} title="Enviar email" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => setSelectedQuote(quote)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Cotización #{selectedQuote.id}</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{new Date(selectedQuote.created_at).toLocaleString('es-CL')}</p>
                            </div>
                            <button onClick={() => setSelectedQuote(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Client info */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Cliente', value: selectedQuote.customer_name },
                                    { label: 'Email', value: selectedQuote.customer_email },
                                    { label: 'Teléfono', value: selectedQuote.customer_phone || '-' },
                                    { label: 'Estado', value: STATUS_MAP[selectedQuote.status]?.label || selectedQuote.status },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{label}</p>
                                        <p className="font-semibold text-gray-900 text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedQuote.notes && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Notas del cliente</p>
                                    <p className="text-gray-700 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">{selectedQuote.notes}</p>
                                </div>
                            )}

                            {/* Products */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Productos solicitados</p>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Producto</th>
                                                <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">Detalle</th>
                                                <th className="px-4 py-2 text-center text-xs text-gray-500 font-semibold">Cant.</th>
                                                <th className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {parseItems(selectedQuote).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{item.productName || item.product || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {item.width && item.height ? `${item.width}×${item.height} cm` : 'Unidad'}
                                                        {item.color && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.color}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.quantity || 1}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">${(item.price || 0).toLocaleString('es-CL')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-500 font-medium">Total estimado</span>
                                <span className="text-2xl font-bold text-gray-900">${parseFloat(selectedQuote.total_amount || 0).toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        {/* Action footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3">
                            {whatsappLink(selectedQuote) && (
                                <a href={whatsappLink(selectedQuote)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </a>
                            )}
                            <a href={emailLink(selectedQuote)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                                <Mail className="w-4 h-4" /> Email
                            </a>
                            {selectedQuote.customer_phone && (
                                <a href={`tel:${selectedQuote.customer_phone}`}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors">
                                    <Phone className="w-4 h-4" /> Llamar
                                </a>
                            )}
                            <select
                                value={selectedQuote.status}
                                onChange={e => handleStatusChange(selectedQuote.id, e.target.value)}
                                className="ml-auto px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminQuotes;

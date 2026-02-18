import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Eye, X, ChevronDown } from 'lucide-react';
import api from '../api';

const STATUS_MAP = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    contacted: { label: 'Contactado', color: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
    completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800' }
};

const AdminQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/quotes');
            setQuotes(res.data);
        } catch (err) {
            console.error('Error fetching quotes:', err);
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
            if (selectedQuote?.id === quoteId) {
                setSelectedQuote({ ...selectedQuote, status: newStatus });
            }
        } catch (err) {
            console.error('Error updating quote status:', err);
            alert('Error al actualizar el estado.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredQuotes = quotes.filter(q =>
        (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parseItems = (quote) => {
        if (Array.isArray(quote.items)) return quote.items;
        if (typeof quote.items === 'string') {
            try { return JSON.parse(quote.items); } catch { return []; }
        }
        return [];
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
                    <p className="text-gray-500">Gestiona las solicitudes de tus clientes.</p>
                </div>
                <button onClick={fetchQuotes} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Actualizar
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-gray-500 mt-3">Cargando cotizaciones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">ID</th>
                                    <th className="px-6 py-3 font-medium">Cliente</th>
                                    <th className="px-6 py-3 font-medium">Fecha</th>
                                    <th className="px-6 py-3 font-medium">Total</th>
                                    <th className="px-6 py-3 font-medium">Estado</th>
                                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No hay cotizaciones para mostrar.
                                        </td>
                                    </tr>
                                ) : filteredQuotes.map(quote => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">#{quote.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{quote.customer_name}</div>
                                            <div className="text-xs text-gray-500">{quote.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(quote.created_at).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ${parseFloat(quote.total_amount || 0).toLocaleString('es-CL')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative inline-block">
                                                <select
                                                    value={quote.status}
                                                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                                                    disabled={updatingStatus === quote.id}
                                                    className={`appearance-none pr-8 pl-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_MAP[quote.status]?.color || 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    {Object.entries(STATUS_MAP).map(([value, { label }]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedQuote(quote)}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center ml-auto"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Cotización #{selectedQuote.id}</h2>
                            <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Cliente</p>
                                    <p className="font-semibold text-gray-900">{selectedQuote.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                                    <p className="text-gray-700">{selectedQuote.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Teléfono</p>
                                    <p className="text-gray-700">{selectedQuote.customer_phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Fecha</p>
                                    <p className="text-gray-700">{new Date(selectedQuote.created_at).toLocaleString('es-CL')}</p>
                                </div>
                            </div>

                            {selectedQuote.notes && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Notas</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{selectedQuote.notes}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Productos</p>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Producto</th>
                                            <th className="px-3 py-2 text-left">Detalle</th>
                                            <th className="px-3 py-2 text-center">Cant.</th>
                                            <th className="px-3 py-2 text-right">Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parseItems(selectedQuote).map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 font-medium">{item.productName || item.product || '-'}</td>
                                                <td className="px-3 py-2 text-gray-500">
                                                    {item.width && item.height ? `${item.width}x${item.height} cm` : 'Unidad'}
                                                </td>
                                                <td className="px-3 py-2 text-center">{item.quantity || 1}</td>
                                                <td className="px-3 py-2 text-right font-bold">${(item.price || 0).toLocaleString('es-CL')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-right pt-4 border-t border-gray-100">
                                <span className="text-gray-500 mr-4">Total:</span>
                                <span className="text-2xl font-bold text-gray-900">${parseFloat(selectedQuote.total_amount || 0).toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminQuotes;

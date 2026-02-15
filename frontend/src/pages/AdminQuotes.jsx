import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AdminQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch quotes (mock for now or real endpoint)
        setLoading(true);
        // axios.get('http://localhost:5000/api/quotes', ...)
        setTimeout(() => {
            setQuotes([
                { id: 1, customer_name: 'Juan Pérez', date: '2026-02-14', total: 150000, status: 'pending' },
                { id: 2, customer_name: 'Maria Silva', date: '2026-02-13', total: 280000, status: 'completed' },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
                <p className="text-gray-500">Gestiona las solicitudes de tus clientes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                        {quotes.map(quote => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">#{quote.id}</td>
                                <td className="px-6 py-4 font-medium">{quote.customer_name}</td>
                                <td className="px-6 py-4">{quote.date}</td>
                                <td className="px-6 py-4">${quote.total.toLocaleString('es-CL')}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {quote.status === 'pending' ? 'Pendiente' : 'Completada'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Ver Detalle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminQuotes;

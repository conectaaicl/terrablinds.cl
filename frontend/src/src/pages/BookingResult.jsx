import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, Wrench } from 'lucide-react';
import api from '../api';

export default function BookingResult() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) { setError('Parámetro de pago no encontrado.'); setLoading(false); return; }

        // Poll up to 10 times (30 seconds) waiting for webhook to arrive
        let attempts = 0;
        const poll = async () => {
            try {
                const res = await api.get(`/api/bookings/resultado?token=${token}`);
                const booking = res.data;
                if (booking.status === 'pending_payment' && attempts < 10) {
                    attempts++;
                    setTimeout(poll, 3000);
                } else {
                    setData(booking);
                    setLoading(false);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'No se encontró la reserva.');
                setLoading(false);
            }
        };
        poll();
    }, [token]);

    const parseLocalDate = (str) => {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600">Verificando tu pago...</p>
                    <p className="text-xs text-gray-400">Esto puede tomar unos segundos</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center space-y-4 max-w-sm">
                    <XCircle className="w-14 h-14 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">No pudimos verificar tu reserva</h2>
                    <p className="text-gray-500 text-sm">{error}</p>
                    <Link to="/agendar" className="inline-block px-6 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
                        Intentar de nuevo
                    </Link>
                </div>
            </div>
        );
    }

    const confirmed = data?.status === 'confirmed';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
                    {confirmed ? (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">¡Reserva confirmada!</h1>
                                <p className="text-gray-500 text-sm mt-2">Hemos enviado la confirmación a <strong>{data.client_email}</strong></p>
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Pago no completado</h1>
                                <p className="text-gray-500 text-sm mt-2">Tu reserva no fue confirmada. Puedes intentarlo de nuevo.</p>
                            </div>
                        </>
                    )}

                    {confirmed && data && (
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-3">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>{data.service_label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>{parseLocalDate(data.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>{data.time_slot} hrs</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Link to="/" className="block w-full py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors text-center">
                            Volver al inicio
                        </Link>
                        {!confirmed && (
                            <Link to="/agendar" className="block w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-center">
                                Intentar de nuevo
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

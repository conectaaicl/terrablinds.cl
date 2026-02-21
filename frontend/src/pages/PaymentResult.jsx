import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        // Flow.cl returns ?status=<code> in the redirect URL
        // Status codes: 1=pending, 2=paid, 3=rejected, 4=cancelled
        const flowStatus = searchParams.get('status');
        const token = searchParams.get('token');

        if (!token && !flowStatus) {
            // No params — direct access, show neutral page
            setStatus('unknown');
            return;
        }

        const code = parseInt(flowStatus);
        if (code === 2) {
            setStatus('success');
        } else if (code === 1) {
            setStatus('pending');
        } else {
            setStatus('failed');
        }
    }, [searchParams]);

    const views = {
        loading: null,
        success: {
            icon: <CheckCircle className="w-16 h-16 text-green-500" />,
            bg: 'bg-green-50',
            title: 'Pago Aprobado',
            message: 'Tu pago fue procesado exitosamente. Recibirás una confirmación en tu correo electrónico y un ejecutivo te contactará para coordinar la instalación.',
        },
        pending: {
            icon: <Clock className="w-16 h-16 text-yellow-500" />,
            bg: 'bg-yellow-50',
            title: 'Pago en Proceso',
            message: 'Tu pago está siendo procesado. Te notificaremos por correo cuando sea confirmado.',
        },
        failed: {
            icon: <XCircle className="w-16 h-16 text-red-500" />,
            bg: 'bg-red-50',
            title: 'Pago No Completado',
            message: 'El pago no pudo completarse. Puedes intentarlo nuevamente o contactarnos para asistencia.',
        },
        unknown: {
            icon: <CheckCircle className="w-16 h-16 text-gray-400" />,
            bg: 'bg-gray-50',
            title: 'Resultado de Pago',
            message: 'Si realizaste un pago, recibirás la confirmación en tu correo electrónico.',
        },
    };

    const view = views[status];
    if (!view) return null;

    return (
        <Layout>
            <SEO
                title="Resultado del Pago"
                description="Estado de tu pago en TerraBlinds."
                path="/payment/result"
            />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
                <div className={`max-w-md w-full ${view.bg} rounded-2xl shadow-sm border border-gray-100 p-10 text-center`}>
                    <div className="flex justify-center mb-6">
                        {view.icon}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{view.title}</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">{view.message}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/"
                            className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors"
                        >
                            Volver al Inicio
                        </Link>
                        <Link
                            to="/contact"
                            className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                        >
                            Contactar Soporte
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentResult;

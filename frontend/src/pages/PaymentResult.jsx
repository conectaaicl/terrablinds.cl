import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, Clock, XCircle, ArrowRight, Phone, Mail, Home } from 'lucide-react';

export default function PaymentResult() {
    const [params] = useSearchParams();

    // Flow uses ?status=2 (paid), ?status=1 (pending), ?status=3 (failed)
    // MercadoPago uses ?method=mp&status=success|pending|failure&quote={id}
    const method = params.get('method');
    const mpStatus = params.get('status');
    const flowStatus = params.get('status');
    const quoteId = params.get('quote');

    let state = 'success';
    if (method === 'mp') {
        if (mpStatus === 'failure') state = 'failed';
        else if (mpStatus === 'pending') state = 'pending';
        else state = 'success';
    } else {
        const s = parseInt(flowStatus);
        if (s === 2) state = 'success';
        else if (s === 1) state = 'pending';
        else if (s === 3 || s === 4) state = 'failed';
        else if (!flowStatus) state = 'success'; // default after redirect
    }

    const config = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            badgeBg: 'bg-green-100',
            badgeText: 'text-green-700',
            badge: 'Pago confirmado',
            title: '¡Tu pago fue exitoso!',
            subtitle: quoteId
                ? `Pedido #${quoteId} procesado correctamente`
                : 'Tu pedido fue procesado correctamente',
            message: 'Recibirás un correo de confirmación con el detalle de tu pedido. Nuestro equipo coordinará contigo los próximos pasos.',
            steps: [
                { n: '1', text: 'Revisamos tus medidas y confirmamos los detalles contigo' },
                { n: '2', text: 'Fabricamos tus cortinas/persianas a medida en nuestro taller' },
                { n: '3', text: 'Agendamos la instalación en tu domicilio con técnicos certificados' },
            ],
        },
        pending: {
            icon: Clock,
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            badgeBg: 'bg-amber-100',
            badgeText: 'text-amber-700',
            badge: 'Pago en proceso',
            title: 'Pago en proceso',
            subtitle: quoteId ? `Pedido #${quoteId}` : 'Tu pago está siendo verificado',
            message: 'Tu pago está siendo procesado. Puede tardar unos minutos. Te notificaremos por correo cuando sea confirmado.',
            steps: [],
        },
        failed: {
            icon: XCircle,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
            badge: 'Pago no completado',
            title: 'El pago no se completó',
            subtitle: 'No se realizó ningún cargo',
            message: 'Hubo un problema al procesar tu pago. No se realizó ningún cobro. Puedes intentarlo nuevamente o contactarnos.',
            steps: [],
        },
    };

    const { icon: Icon, iconColor, bgColor, borderColor, badgeBg, badgeText, badge, title, subtitle, message, steps } = config[state];

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
                <div className="max-w-lg w-full">

                    {/* Card principal */}
                    <div className={`bg-white rounded-2xl shadow-sm border ${borderColor} overflow-hidden`}>

                        {/* Header */}
                        <div className={`${bgColor} px-8 py-8 text-center`}>
                            <Icon className={`w-16 h-16 ${iconColor} mx-auto mb-4`} />
                            <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${badgeBg} ${badgeText} mb-3`}>
                                {badge}
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
                            <p className="text-gray-500 text-sm">{subtitle}</p>
                        </div>

                        {/* Cuerpo */}
                        <div className="px-8 py-6">
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{message}</p>

                            {/* Número de pedido destacado */}
                            {quoteId && state === 'success' && (
                                <div className="bg-gray-50 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Número de pedido</p>
                                        <p className="text-2xl font-bold text-gray-900">#{quoteId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-0.5">Guarda este número</p>
                                        <p className="text-xs text-gray-500">para seguimiento</p>
                                    </div>
                                </div>
                            )}

                            {/* Próximos pasos */}
                            {steps.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Próximos pasos</p>
                                    <div className="space-y-3">
                                        {steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    {step.n}
                                                </span>
                                                <p className="text-sm text-gray-600">{step.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="space-y-3">
                                {state === 'failed' && (
                                    <Link to="/cart"
                                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                                        Intentar nuevamente
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <Link to="/"
                                    className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors">
                                    <Home className="w-4 h-4" />
                                    Volver al inicio
                                </Link>
                                <Link to="/contact"
                                    className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors text-sm">
                                    <Phone className="w-4 h-4" />
                                    Contactar soporte
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Nota de correo */}
                    {state === 'success' && (
                        <div className="flex items-center gap-2 justify-center mt-4 text-xs text-gray-400">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Recibirás la confirmación en tu correo electrónico</span>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}

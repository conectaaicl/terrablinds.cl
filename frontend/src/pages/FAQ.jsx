import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ChevronDown } from 'lucide-react';
import api from '../api';

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                className="w-full text-left flex justify-between items-center px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <span className="font-semibold text-gray-900 pr-4">{q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-6 pb-5 bg-white border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed pt-4">{a}</p>
                </div>
            )}
        </div>
    );
};

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cfg, setCfg] = useState({});

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});
        api.get('/api/faqs')
            .then(res => setFaqs(res.data))
            .catch(() => setFaqs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <SEO
                title="Preguntas Frecuentes"
                description="Resuelve tus dudas sobre cortinas roller, persianas y toldos a medida de TerraBlinds."
                path="/faq"
            />

            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">{cfg.faq_title || 'Preguntas Frecuentes'}</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    {cfg.faq_subtitle || 'Todo lo que necesitas saber antes de cotizar.'}
                </p>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : faqs.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No hay preguntas frecuentes aún.</p>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <FAQItem key={faq.id} q={faq.question} a={faq.answer} />
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center bg-primary-50 border border-primary-100 rounded-2xl p-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">¿No encontraste tu respuesta?</h2>
                    <p className="text-gray-600 mb-6">Escríbenos por WhatsApp o al formulario de contacto.</p>
                    <a href="/contact" className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                        Contactarnos
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default FAQ;

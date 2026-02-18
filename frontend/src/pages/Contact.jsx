import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import api from '../api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/api/contact', formData);
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            const message = err.response?.data?.error || 'Hubo un error al enviar el mensaje. Por favor intente nuevamente.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-gray-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Estamos para ayudarte. Escríbenos para resolver tus dudas, agendar una visita técnica o solicitar asesoría personalizada.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 -mt-10">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-primary-600 p-10 text-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
                            <p className="text-primary-100 mb-8">
                                Completa el formulario y nos pondremos en contacto contigo dentro de 24 horas.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <Phone className="w-6 h-6 mr-4 mt-1 text-primary-200" />
                                    <div>
                                        <p className="font-semibold">Teléfono</p>
                                        <p className="text-primary-100">Consulte en WhatsApp</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Mail className="w-6 h-6 mr-4 mt-1 text-primary-200" />
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <p className="text-primary-100">contacto@terrablinds.cl</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="w-6 h-6 mr-4 mt-1 text-primary-200" />
                                    <div>
                                        <p className="font-semibold">Ubicación</p>
                                        <p className="text-primary-100">Santiago, Chile</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Clock className="w-6 h-6 mr-4 mt-1 text-primary-200" />
                                    <div>
                                        <p className="font-semibold">Horario</p>
                                        <p className="text-primary-100">Lun - Vie: 9:00 - 18:00 hrs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-2/3 p-10">
                        {success ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensaje Enviado</h3>
                                <p className="text-gray-600">
                                    Gracias por contactarnos. Te responderemos a la brevedad posible.
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-8 text-primary-600 hover:text-primary-700 font-semibold"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                                        <select name="subject" value={formData.subject} onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                            <option value="">Selecciona una opción</option>
                                            <option value="cotizacion">Solicitar Cotización</option>
                                            <option value="visita">Agendar Visita Técnica</option>
                                            <option value="consulta">Consulta General</option>
                                            <option value="postventa">Servicio Post-Venta</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                    <textarea name="message" required rows="4" value={formData.message} onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"></textarea>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-colors flex justify-center items-center">
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>Enviar Mensaje <Send className="w-4 h-4 ml-2" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;

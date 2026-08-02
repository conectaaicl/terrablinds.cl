import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { UserPlus, CheckCircle } from 'lucide-react';
import api from '../api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la cuenta. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cuenta creada!</h1>
                        <p className="text-gray-600 mb-8">Tu cuenta ha sido registrada exitosamente. Ya puedes cotizar y hacer seguimiento de tus pedidos.</p>
                        <Link to="/quote" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                            Cotizar Ahora
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title="Crear Cuenta"
                description="Regístrate en TerraBlinds para cotizar y hacer seguimiento de tus pedidos."
                path="/register"
            />
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                            <UserPlus className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
                        <p className="text-gray-500 mt-1">Regístrate gratis en TerraBlinds</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Tu nombre completo" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="tu@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="+56 9 1234 5678" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Mínimo 8 caracteres" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Repite tu contraseña" />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors mt-2">
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/quote" className="text-primary-600 hover:underline font-medium">
                            Cotizar directamente
                        </Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // If URL has ?token=..., go to reset mode automatically
    React.useEffect(() => {
        const token = searchParams.get('token');
        if (token) setMode('reset');
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('terrablinds_token', res.data.token);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            setSuccess(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar el correo.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const token = searchParams.get('token');
            await api.post('/api/auth/reset-password', { token, password: newPassword });
            setSuccess('Contraseña actualizada. Ahora puedes iniciar sesión.');
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.error || 'El enlace ha expirado o es inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">TerraAdmin</h1>
                        <p className="text-gray-500 mt-2">
                            {mode === 'login' && 'Acceso restringido a administradores'}
                            {mode === 'forgot' && 'Recuperar contraseña'}
                            {mode === 'reset' && 'Crear nueva contraseña'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm border border-green-200">
                            {success}
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@terrablinds.cl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword
                                            ? <EyeOff className="h-5 w-5 text-gray-400" />
                                            : <Eye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: loading ? '#9ca3af' : '#2563eb' }}
                                className="w-full py-3 text-white font-bold rounded-lg transition-colors flex justify-center items-center hover:opacity-90 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    : 'Iniciar Sesión'}
                            </button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </form>
                    )}

                    {/* FORGOT PASSWORD FORM */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgot} className="space-y-6">
                            <p className="text-sm text-gray-600">
                                Ingresa tu email de administrador y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@terrablinds.cl"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: loading ? '#9ca3af' : '#2563eb' }}
                                className="w-full py-3 text-white font-bold rounded-lg transition-colors flex justify-center items-center hover:opacity-90"
                            >
                                {loading
                                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    : 'Enviar enlace'}
                            </button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Volver al login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* RESET PASSWORD FORM */}
                    {mode === 'reset' && (
                        <form onSubmit={handleReset} className="space-y-6">
                            <p className="text-sm text-gray-600">Ingresa tu nueva contraseña (mínimo 8 caracteres).</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: loading ? '#9ca3af' : '#2563eb' }}
                                className="w-full py-3 text-white font-bold rounded-lg transition-colors flex justify-center items-center hover:opacity-90"
                            >
                                {loading
                                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    : 'Actualizar contraseña'}
                            </button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Volver al login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} TerraBlinds.cl</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

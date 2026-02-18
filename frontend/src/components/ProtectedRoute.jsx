import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = () => {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('terrablinds_token');
            if (!token) {
                setStatus('unauthorized');
                return;
            }

            try {
                await api.get('/api/auth/verify');
                setStatus('authorized');
            } catch {
                localStorage.removeItem('terrablinds_token');
                setStatus('unauthorized');
            }
        };

        verifyToken();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (status === 'unauthorized') {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

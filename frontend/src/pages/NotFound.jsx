import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <Layout>
            <SEO title="Página no encontrada" description="La página que buscas no existe." path="/404" />
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
                <div className="text-9xl font-black text-gray-100 select-none mb-4">404</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
                <p className="text-gray-500 mb-8 max-w-md">
                    Lo sentimos, la página que buscas no existe o fue movida.
                </p>
                <div className="flex gap-4">
                    <Link to="/" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                        Ir al Inicio
                    </Link>
                    <Link to="/catalog" className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors">
                        Ver Catálogo
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default NotFound;

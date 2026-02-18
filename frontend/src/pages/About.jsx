import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Award, Users, PenTool, Smile } from 'lucide-react';

const About = () => {
    return (
        <Layout>
            <SEO
                title="Quiénes Somos"
                description="Conoce a TerraBlinds, especialistas en cortinas y persianas a medida en Chile."
                path="/about"
            />
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre Nosotros</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        En TerraBlinds nos dedicamos a transformar tus espacios con soluciones de control solar de alta calidad y diseño.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"
                            alt="Nuestro Taller"
                            className="rounded-xl shadow-lg"
                        />
                    </div>
                    <div>
                        <span className="text-primary-600 font-bold uppercase tracking-wide text-sm">Nuestra Historia</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Expertos en cortinas y persianas desde 2010</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Nacimos con la misión de ofrecer productos de calidad superior a un precio justo, eliminando intermediarios y entregando un servicio personalizado.
                            Hoy somos líderes en el mercado, reconocidos por nuestra atención al detalle y compromiso con la satisfacción del cliente.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Contamos con un equipo de profesionales altamente capacitados que te asesorarán en todo el proceso, desde la elección de la tela perfecta hasta la instalación final.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Calidad</h3>
                            <p className="text-gray-500">Materiales certificados y duraderos.</p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Equipo</h3>
                            <p className="text-gray-500">Profesionales expertos a tu servicio.</p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PenTool className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Diseño</h3>
                            <p className="text-gray-500">Tendencias actuales y funcionales.</p>
                        </div>
                        <div className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-md transition">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Smile className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Servicio</h3>
                            <p className="text-gray-500">Post-venta y garantía real.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;

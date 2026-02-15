import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import { Shield, Clock, Award, PenTool } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-6 text-primary-600">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">
            {description}
        </p>
    </div>
);

const Home = () => {
    return (
        <Layout>
            <Hero />

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm">Por qué elegirnos</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Calidad que transforma espacios</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={PenTool}
                            title="A Medida"
                            description="Fabricamos cada cortina según las dimensiones exactas de tus ventanas para un ajuste perfecto."
                        />
                        <FeatureCard
                            icon={Award}
                            title="Calidad Premium"
                            description="Utilizamos telas y mecanismos de alta durabilidad, garantizando una larga vida útil."
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Rapidez"
                            description="Tiempos de entrega optimizados sin sacrificar la calidad de la confección."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Garantía"
                            description="Todos nuestros productos cuentan con garantía para tu total tranquilidad."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Categories Preview (Static for now) */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Nuestras Categorías</h2>
                            <p className="text-gray-600 mt-2">Encuentra el estilo perfecto para cada ambiente.</p>
                        </div>
                        {/* Link to full catalog could go here */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Placeholders for category cards */}
                        <div className="group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1505691938895-1758d7bab58d?auto=format&fit=crop&w=800&q=80" alt="Cortinas Roller" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                                <h3 className="text-white text-2xl font-bold">Cortinas Roller</h3>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80" alt="Blackout" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                                <h3 className="text-white text-2xl font-bold">Blackout</h3>
                            </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl h-80 cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" alt="Persianas" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                                <h3 className="text-white text-2xl font-bold">Persianas</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para renovar tus espacios?</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Cotiza online en segundos y recibe asesoría personalizada de nuestros expertos.
                    </p>
                    <Link to="/catalog">
                        <button className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full text-lg transition-transform hover:scale-105 shadow-lg">
                            Solicitar Cotización Gratuita
                        </button>
                    </Link>
                </div>
            </section>
        </Layout>
    );
};

export default Home;

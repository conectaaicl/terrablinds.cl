import React, { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: '¿Cómo funciona el cotizador online?',
        a: 'Selecciona la categoría de producto, el modelo, ingresa las medidas de tu ventana (ancho x alto en cm) y obtienes el precio estimado al instante. Luego completas tus datos y enviamos tu cotización formal en menos de 24 horas.'
    },
    {
        q: '¿Cuáles son las medidas mínimas y máximas de fabricación?',
        a: 'Para cortinas roller, fabricamos desde 30 cm hasta 500 cm de ancho, y desde 30 cm hasta 400 cm de alto. Para toldos y persianas de exterior, las medidas varían según el modelo. Consúltanos por casos especiales.'
    },
    {
        q: '¿Cuánto tiempo demora la fabricación e instalación?',
        a: 'El plazo estándar es de 5 a 10 días hábiles desde la confirmación del pedido. Para proyectos grandes o temporadas de alta demanda puede extenderse. Te informaremos el plazo exacto al confirmar tu cotización.'
    },
    {
        q: '¿Tienen servicio de instalación incluido?',
        a: 'Sí, contamos con equipo de instalación en Santiago y principales ciudades. El costo de instalación se cotiza de forma separada según la cantidad de piezas y la complejidad del proyecto.'
    },
    {
        q: '¿Qué garantía tienen los productos?',
        a: 'Todos nuestros productos cuentan con garantía de 12 meses contra defectos de fabricación. La motorización y accesorios tienen garantía del fabricante (generalmente 2 años).'
    },
    {
        q: '¿Puedo ver muestras de telas antes de comprar?',
        a: 'Sí, enviamos muestras de tela sin costo a tu domicilio dentro de la Región Metropolitana. Para otras regiones coordinamos el envío con cargo. Escríbenos por WhatsApp o al correo de contacto.'
    },
    {
        q: '¿Hacen despacho a regiones?',
        a: 'Sí, despachamos a todo Chile mediante empresas de transporte. El costo de envío se calcula según el peso, dimensiones y destino. Para instalación en regiones, coordinamos con instaladores locales.'
    },
    {
        q: '¿Cómo puedo pagar?',
        a: 'Aceptamos transferencia bancaria, tarjeta de crédito/débito vía WebPay (Flow.cl) y Mercado Pago. También puedes solicitar tu cotización y pagar al momento de la instalación con un abono previo.'
    },
    {
        q: '¿Fabrican cortinas para proyectos comerciales o inmobiliarias?',
        a: 'Sí, tenemos amplia experiencia en proyectos comerciales: oficinas, hoteles, restaurantes, clínicas y proyectos inmobiliarios. Ofrecemos precios especiales por volumen. Consúltanos.'
    },
    {
        q: '¿Qué pasa si las medidas que tomé están incorrectas?',
        a: 'Te recomendamos siempre medir dos veces y verificar antes de confirmar el pedido. Puedes solicitar que nuestro equipo vaya a medir sin costo en Santiago. Si hay un error de medida del cliente, se cobra la diferencia de fabricación.'
    }
];

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
    return (
        <Layout>
            <SEO
                title="Preguntas Frecuentes"
                description="Resuelve tus dudas sobre cortinas roller, persianas y toldos a medida de TerraBlinds."
                path="/faq"
            />

            <div className="bg-gray-900 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Todo lo que necesitas saber antes de cotizar.
                </p>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <FAQItem key={idx} q={faq.q} a={faq.a} />
                    ))}
                </div>

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

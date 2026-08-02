-- Migración: Proyectos y FAQs dinámicos
-- Ejecutar en producción: psql -U terrablinds -d terrablinds -f migrate_projects_faqs.sql

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    location VARCHAR(200) NOT NULL DEFAULT '',
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed: proyectos iniciales (reemplazando los hardcodeados)
INSERT INTO projects (title, category, location, sort_order) VALUES
('Departamento Providencia', 'Roller Blackout', 'Santiago', 1),
('Casa Las Condes', 'Roller Sunscreen', 'Santiago', 2),
('Oficina Corporativa', 'Persianas Exterior', 'Santiago Centro', 3),
('Hotel Boutique', 'Roller Duo Blackout', 'Viña del Mar', 4),
('Clínica Dental', 'Domotica Motor Roller', 'Ñuñoa', 5),
('Restaurante Moderno', 'Toldos Exterior', 'Vitacura', 6)
ON CONFLICT DO NOTHING;

-- Seed: FAQs iniciales (reemplazando las hardcodeadas)
INSERT INTO faqs (question, answer, sort_order) VALUES
('¿Cómo funciona el cotizador online?', 'Selecciona la categoría de producto, el modelo, ingresa las medidas de tu ventana (ancho x alto en cm) y obtienes el precio estimado al instante. Luego completas tus datos y enviamos tu cotización formal en menos de 24 horas.', 1),
('¿Cuáles son las medidas mínimas y máximas de fabricación?', 'Para cortinas roller, fabricamos desde 30 cm hasta 500 cm de ancho, y desde 30 cm hasta 400 cm de alto. Para toldos y persianas de exterior, las medidas varían según el modelo. Consúltanos por casos especiales.', 2),
('¿Cuánto tiempo demora la fabricación e instalación?', 'El plazo estándar es de 5 a 10 días hábiles desde la confirmación del pedido. Para proyectos grandes o temporadas de alta demanda puede extenderse. Te informaremos el plazo exacto al confirmar tu cotización.', 3),
('¿Tienen servicio de instalación incluido?', 'Sí, contamos con equipo de instalación en Santiago y principales ciudades. El costo de instalación se cotiza de forma separada según la cantidad de piezas y la complejidad del proyecto.', 4),
('¿Qué garantía tienen los productos?', 'Todos nuestros productos cuentan con garantía de 12 meses contra defectos de fabricación. La motorización y accesorios tienen garantía del fabricante (generalmente 2 años).', 5),
('¿Puedo ver muestras de telas antes de comprar?', 'Sí, enviamos muestras de tela sin costo a tu domicilio dentro de la Región Metropolitana. Para otras regiones coordinamos el envío con cargo. Escríbenos por WhatsApp o al correo de contacto.', 6),
('¿Hacen despacho a regiones?', 'Sí, despachamos a todo Chile mediante empresas de transporte. El costo de envío se calcula según el peso, dimensiones y destino. Para instalación en regiones, coordinamos con instaladores locales.', 7),
('¿Cómo puedo pagar?', 'Aceptamos transferencia bancaria, tarjeta de crédito/débito vía WebPay (Flow.cl) y Mercado Pago. También puedes solicitar tu cotización y pagar al momento de la instalación con un abono previo.', 8),
('¿Fabrican cortinas para proyectos comerciales o inmobiliarias?', 'Sí, tenemos amplia experiencia en proyectos comerciales: oficinas, hoteles, restaurantes, clínicas y proyectos inmobiliarios. Ofrecemos precios especiales por volumen. Consúltanos.', 9),
('¿Qué pasa si las medidas que tomé están incorrectas?', 'Te recomendamos siempre medir dos veces y verificar antes de confirmar el pedido. Puedes solicitar que nuestro equipo vaya a medir sin costo en Santiago. Si hay un error de medida del cliente, se cobra la diferencia de fabricación.', 10)
ON CONFLICT DO NOTHING;

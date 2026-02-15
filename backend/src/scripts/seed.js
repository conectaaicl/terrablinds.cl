require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Product, User, Config } = require('../models');

const seedData = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Sync database (create tables)
        await sequelize.sync({ force: true }); // WARNING: This drops all tables
        console.log('✅ Database synced');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            email: 'admin@terrablinds.cl',
            password: hashedPassword,
            name: 'Admin',
            role: 'admin'
        });
        console.log('✅ Admin user created');

        // Create products - COMPREHENSIVE CATALOG (31 products)
        const products = [
            // Roller Blackout (5 products)
            {
                name: 'Roller Blackout Premium White',
                slug: 'roller-blackout-premium-white',
                category: 'Roller Blackout',
                description: 'Cortina roller blackout de alta calidad que bloquea 100% la luz. Color blanco puro que combina con cualquier decoración.',
                short_description: 'Bloqueo total de luz, color blanco',
                is_unit_price: false,
                base_price_m2: 25000,
                images: ['/uploads/roller-white.jpg'],
                features: ['Bloqueo 100% de luz', 'Aislación térmica', 'Fácil instalación', 'Blanco puro'],
                stock: 45,
                is_active: true
            },
            {
                name: 'Roller Blackout Grey Storm',
                slug: 'roller-blackout-grey-storm',
                category: 'Roller Blackout',
                description: 'Blackout premium en tono gris tormenta. Elegancia y privacidad absoluta para tu hogar.',
                short_description: 'Privacidad total en gris elegante',
                is_unit_price: false,
                base_price_m2: 26000,
                images: ['/uploads/roller-grey.jpg'],
                features: ['Color Gris Storm', 'Bloqueo 100% luz', 'Térmica', 'Resistente'],
                stock: 38,
                is_active: true
            },
            {
                name: 'Roller Blackout Beige Sand',
                slug: 'roller-blackout-beige-sand',
                category: 'Roller Blackout',
                description: 'Tono arena cálido que aporta suavidad a los ambientes sin sacrificar el bloqueo de luz.',
                short_description: 'Bloqueo total en tono arena',
                is_unit_price: false,
                base_price_m2: 25500,
                images: ['/uploads/roller-beige.jpg'],
                features: ['Tono Beige Sand', '100% Blackout', 'Fácil limpieza', 'Moderno'],
                stock: 42,
                is_active: true
            },
            {
                name: 'Roller Blackout Kids Stars',
                slug: 'roller-blackout-kids-stars',
                category: 'Roller Blackout',
                description: 'Diseño infantil con estrellas, perfecto para el dormitorio de los más pequeños.',
                short_description: 'Diseño infantil con estrellas',
                is_unit_price: false,
                base_price_m2: 29000,
                images: ['/uploads/roller-kids.jpg'],
                features: ['Diseño Estrellas', 'Total Blackout', 'Seguridad infantil', 'Lavable'],
                stock: 25,
                is_active: true
            },
            {
                name: 'Roller Blackout Charcoal',
                slug: 'roller-blackout-charcoal',
                category: 'Roller Blackout',
                description: 'Tono carbón profundo para espacios modernos y minimalistas.',
                short_description: 'Negro carbón minimalista',
                is_unit_price: false,
                base_price_m2: 27000,
                images: ['/uploads/roller-charcoal.jpg'],
                features: ['Color Charcoal', 'Bloqueo solar total', 'Minimalista', 'Premium'],
                stock: 30,
                is_active: true
            },
            // Roller Sunscreen (6 products)
            {
                name: 'Roller Sunscreen 5% Silver',
                slug: 'roller-sunscreen-5-silver',
                category: 'Roller Sunscreen',
                description: 'Sunscreen con hilos plateados que reflejan el calor de forma extra eficiente.',
                short_description: 'Reflejo de calor eficiente',
                is_unit_price: false,
                base_price_m2: 28000,
                images: ['/uploads/sunscreen-silver.jpg'],
                features: ['Reflejo térmico silver', 'Visibilidad 5%', 'Protección UV', 'Moderno'],
                stock: 20,
                is_active: true
            },
            {
                name: 'Roller Sunscreen 5% Cream',
                slug: 'roller-sunscreen-5-cream',
                category: 'Roller Sunscreen',
                description: 'Clásico sunscreen color crema para una luz cálida y natural.',
                short_description: 'Luz cálida y protección solar',
                is_unit_price: false,
                base_price_m2: 23000,
                images: ['/uploads/sunscreen-cream.jpg'],
                features: ['Color Crema', '5% Apertura', 'Luz difusa', 'Elegante'],
                stock: 50,
                is_active: true
            },
            {
                name: 'Roller Sunscreen 10% Office',
                slug: 'roller-sunscreen-10-office',
                category: 'Roller Sunscreen',
                description: 'Mayor apertura para oficinas que requieren mucha luz natural pero sin reflejos.',
                short_description: 'Máxima luz con protección',
                is_unit_price: false,
                base_price_m2: 21000,
                images: ['/uploads/sunscreen-10.jpg'],
                features: ['10% Apertura', 'Ideal oficinas', 'Control de brillo', 'Gran visibilidad'],
                stock: 45,
                is_active: true
            },
            {
                name: 'Roller Sunscreen Black 5%',
                slug: 'roller-sunscreen-black-5',
                category: 'Roller Sunscreen',
                description: 'Sunscreen negro para una visibilidad exterior superior y control de reflejos extremos.',
                short_description: 'Visibilidad superior en color negro',
                is_unit_price: false,
                base_price_m2: 24500,
                images: ['/uploads/sunscreen-black.jpg'],
                features: ['Color Negro', 'Mejor visibilidad exterior', 'Control de reflejos', 'Moderno'],
                stock: 35,
                is_active: true
            },
            {
                name: 'Sunscreen Lino Premium 5%',
                slug: 'sunscreen-lino-premium-5',
                category: 'Roller Sunscreen',
                description: 'Textura de lino real aplicada a una tela técnica de alto rendimiento.',
                short_description: 'Estética natural, tecnología técnica',
                is_unit_price: false,
                base_price_m2: 31000,
                images: ['/uploads/sunscreen-lino-premium.jpg'],
                features: ['Textura lino real', 'Técnica 5%', 'Alta gama', 'Decorativo'],
                stock: 18,
                is_active: true
            },
            {
                name: 'Roller Sunscreen Gris 3%',
                slug: 'roller-sunscreen-gris-3',
                category: 'Roller Sunscreen',
                description: 'Equilibrio perfecto entre visibilidad y privacidad en tono gris neutro.',
                short_description: 'Equilibrio y neutralidad',
                is_unit_price: false,
                base_price_m2: 25000,
                images: ['/uploads/sunscreen-gris-3.jpg'],
                features: ['3% Apertura', 'Gris Neutro', 'Privacidad media', 'Resistente'],
                stock: 40,
                is_active: true
            },
            // Roller Duo (5 products)
            {
                name: 'Roller Duo Noche y Día Wood',
                slug: 'roller-duo-wood',
                category: 'Roller Duo Blackout',
                description: 'Diseño que imita la madera para un toque rústico y elegante.',
                short_description: 'Efecto madera rústico',
                is_unit_price: false,
                base_price_m2: 38000,
                images: ['/uploads/duo-wood.jpg'],
                features: ['Efecto madera', 'Dúo versátil', 'Cálido', 'Robusto'],
                stock: 15,
                is_active: true
            },
            {
                name: 'Roller Duo Black & White',
                slug: 'roller-duo-black-white',
                category: 'Roller Duo Blackout',
                description: 'Contraste máximo para decoraciones vanguardistas.',
                short_description: 'Contraste moderno',
                is_unit_price: false,
                base_price_m2: 36000,
                images: ['/uploads/duo-bw.jpg'],
                features: ['Bicolor', 'Control de luz', 'Llamativo', 'Diseño'],
                stock: 12,
                is_active: true
            },
            {
                name: 'Roller Duo Soft Grey',
                slug: 'roller-duo-soft-grey',
                category: 'Roller Duo Blackout',
                description: 'Gris suave para una transición delicada entre luz y sombra.',
                short_description: 'Transición suave de luz',
                is_unit_price: false,
                base_price_m2: 34000,
                images: ['/uploads/duo-soft-grey.jpg'],
                features: ['Gris suave', 'Mecanismo ultra suave', 'Decorativo', 'Funcional'],
                stock: 22,
                is_active: true
            },
            {
                name: 'Roller Duo Chocolate',
                slug: 'roller-duo-chocolate',
                category: 'Roller Duo Blackout',
                description: 'Color chocolate profundo, ideal para combinar con muebles de madera oscura.',
                short_description: 'Tono chocolate elegante',
                is_unit_price: false,
                base_price_m2: 35500,
                images: ['/uploads/duo-chocolate.jpg'],
                features: ['Color Chocolate', 'Privacidad total/parcial', 'Resistente', 'Fácil uso'],
                stock: 18,
                is_active: true
            },
            {
                name: 'Roller Duo XL Large',
                slug: 'roller-duo-xl',
                category: 'Roller Duo Blackout',
                description: 'Sistema reforzado para ventanales de hasta 3 metros de ancho.',
                short_description: 'Para grandes ventanales',
                is_unit_price: false,
                base_price_m2: 45000,
                images: ['/uploads/duo-xl.jpg'],
                features: ['Estructura reforzada', 'Telas XL', 'Hasta 3m ancho', 'Garantía 3 años'],
                stock: 10,
                is_active: true
            },
            // Domótica (6 products)
            {
                name: 'Motor Somfy Sonesse 40',
                slug: 'motor-somfy-sonesse-40',
                category: 'Domotica Motor Roller',
                description: 'El motor más silencioso del mercado. Ideal para dormitorios y salas de estar.',
                short_description: 'Ultra silencioso Somfy',
                is_unit_price: true,
                price_unit: 220000,
                images: ['/uploads/somfy-sonesse.jpg'],
                features: ['Ultra silencioso', 'RTS', 'Frenado suave', 'Gama alta'],
                stock: 15,
                is_active: true
            },
            {
                name: 'Motor a Batería Li-ion',
                slug: 'motor-bateria-liion',
                category: 'Domotica Motor Roller',
                description: 'No requiere cableado. Se recarga cada 6 meses. La solución más limpia para tu casa.',
                short_description: 'Sin cables, recargable',
                is_unit_price: true,
                price_unit: 185000,
                images: ['/uploads/motor-bateria.jpg'],
                features: ['Batería Li-ion', 'Sin cables', 'Fácil de instalar', 'Ecológico'],
                stock: 25,
                is_active: true
            },
            {
                name: 'Módulo Smart Home Zigbee',
                slug: 'modulo-zigbee',
                category: 'Domotica Motor Roller',
                description: 'Integra tus cortinas a tu red Zigbee para una automatización total.',
                short_description: 'Integración Zigbee total',
                is_unit_price: true,
                price_unit: 45000,
                images: ['/uploads/zigbee-module.jpg'],
                features: ['Protocolo Zigbee', 'Compatible Tuya/SmartLife', 'Escenas automatizadas', 'Malla estable'],
                stock: 40,
                is_active: true
            },
            {
                name: 'Pulsador de Pared Radiofrecuencia',
                slug: 'pulsador-rf',
                category: 'Domotica Motor Roller',
                description: 'Interruptor de pared inalámbrico para un control cómodo y manual.',
                short_description: 'Interruptor inalámbrico',
                is_unit_price: true,
                price_unit: 28000,
                images: ['/uploads/pulsador-rf.jpg'],
                features: ['Inalámbrico', 'Fácil montaje', 'Diseño sobrio', 'Batería larga duración'],
                stock: 50,
                is_active: true
            },
            {
                name: 'Motor Solar Panel Kit',
                slug: 'motor-solar',
                category: 'Domotica Motor Roller',
                description: 'Kit de motor alimentado por panel solar. Máxima eficiencia energética.',
                short_description: 'Energía solar para tus cortinas',
                is_unit_price: true,
                price_unit: 250000,
                images: ['/uploads/solar-motor.jpg'],
                features: ['Panel solar incluido', 'Eco-friendly', 'Ahorro luz', 'Instalación remota'],
                stock: 8,
                is_active: true
            },
            {
                name: 'Smart Bridge Multi-Protocolo',
                slug: 'smart-bridge',
                category: 'Domotica Motor Roller',
                description: 'Puente que une RF, WiFi y Zigbee para controlar todo desde una sola App.',
                short_description: 'Control universal total',
                is_unit_price: true,
                price_unit: 85000,
                images: ['/uploads/bridge.jpg'],
                features: ['RF/WiFi/Zigbee', 'App unificada', 'Múltiples marcas', 'Fácil config'],
                stock: 20,
                is_active: true
            },
            // Persianas Exterior (4 products)
            {
                name: 'Persiana Exterior de Seguridad Pro',
                slug: 'persiana-seguridad-pro',
                category: 'Persianas Exterior',
                description: 'Láminas de aluminio extruido de alta seguridad. Casi impenetrables.',
                short_description: 'Seguridad máxima certificada',
                is_unit_price: false,
                base_price_m2: 85000,
                images: ['/uploads/persiana-pro.jpg'],
                features: ['Anti-palanca', 'Aluminio extruido', 'Cierre hermético', 'Seguridad pro'],
                stock: 5,
                is_active: true
            },
            {
                name: 'Persiana Micromalla Termic',
                slug: 'persiana-micromalla',
                category: 'Persianas Exterior',
                description: 'Diseño especial que permite la entrada de aire manteniendo la privacidad.',
                short_description: 'Ventilación y sombra',
                is_unit_price: false,
                base_price_m2: 55000,
                images: ['/uploads/persiana-malla.jpg'],
                features: ['Entrada de aire', 'Visión graduada', 'Térmica', 'Anti-insectos'],
                stock: 12,
                is_active: true
            },
            {
                name: 'Cajón Exterior Compacto',
                slug: 'cajon-exterior',
                category: 'Persianas Exterior',
                description: 'Sistema de cajón exterior para instalaciones donde no hay dintel.',
                short_description: 'Instalación sin obra',
                is_unit_price: false,
                base_price_m2: 48000,
                images: ['/uploads/cajon-compacto.jpg'],
                features: ['Cajón compacto', 'Sin obra', 'Aluminio alta gala', 'Varios colores'],
                stock: 20,
                is_active: true
            },
            {
                name: 'Repuesto Eje Persiana Exterior',
                slug: 'eje-persiana',
                category: 'Persianas Exterior',
                description: 'Eje octogonal de acero galvanizado para persianas de exterior.',
                short_description: 'Repuesto eje acero',
                is_unit_price: true,
                price_unit: 35000,
                images: ['/uploads/eje-repuesto.jpg'],
                features: ['Acero galvanizado', 'Universal', 'Alta resistencia', 'Durable'],
                stock: 15,
                is_active: true
            },
            // Accesorios (5 products)
            {
                name: 'Cinta Decorativa Luxury',
                slug: 'cinta-decorativa',
                category: 'Accesorios',
                description: 'Cintas laterales para cortinas roller que ocultan el mecanismo.',
                short_description: 'Acabado estético superior',
                is_unit_price: true,
                price_unit: 15000,
                images: ['/uploads/cinta-deco.jpg'],
                features: ['Varios diseños', 'Fácil pegado', 'Textil premium', 'Estético'],
                stock: 60,
                is_active: true
            },
            {
                name: 'Limpiador de Telas Técnico',
                slug: 'limpiador-telas',
                category: 'Accesorios',
                description: 'Spray especial para limpiar telas blackout y sunscreen sin dañarlas.',
                short_description: 'Cuidado profesional de telas',
                is_unit_price: true,
                price_unit: 12500,
                images: ['/uploads/limpiador.jpg'],
                features: ['No abrasivo', 'Secado rápido', 'Anti-manchas', 'Especial cortinas'],
                stock: 100,
                is_active: true
            },
            {
                name: 'Contrapeso de Lujo Metálico',
                slug: 'contrapeso-lujo',
                category: 'Accesorios',
                description: 'Contrapeso inferior pesado y elegante para una caída perfecta.',
                short_description: 'Caída perfecta garantizada',
                is_unit_price: true,
                price_unit: 18000,
                images: ['/uploads/contrapeso.jpg'],
                features: ['Acero inox', 'Diseño slim', 'Fácil instalación', 'Premium'],
                stock: 45,
                is_active: true
            },
            {
                name: 'Suplicador de Seguridad Infantil',
                slug: 'seguridad-infantil-kit',
                category: 'Accesorios',
                description: 'Kit para fijar cadenas y evitar accidentes con niños.',
                short_description: 'Hogar seguro para niños',
                is_unit_price: true,
                price_unit: 5500,
                images: ['/uploads/seguridad-ninos.jpg'],
                features: ['Norma internacional', 'Invisible', 'Fácil uso', 'Seguridad'],
                stock: 200,
                is_active: true
            },
            {
                name: 'Freno de Cadena Automático',
                slug: 'freno-cadena',
                category: 'Accesorios',
                description: 'Mecanismo que evita que la cortina se baje sola por el peso.',
                short_description: 'Detención precisa',
                is_unit_price: true,
                price_unit: 9000,
                images: ['/uploads/freno-cadena.jpg'],
                features: ['Frenado suave', 'Garantía 1 año', 'Universal', 'Resistente'],
                stock: 80,
                is_active: true
            }
        ];

        await Product.bulkCreate(products);
        console.log(`✅ ${products.length} products created`);

        // Create config
        await Config.bulkCreate([
            { key: 'whatsapp_number', value: '56912345678', type: 'string' },
            { key: 'company_email', value: 'contacto@terrablinds.cl', type: 'string' },
            { key: 'logo_url', value: '', type: 'string' }
        ]);
        console.log('✅ Config created');

        console.log('🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedData();

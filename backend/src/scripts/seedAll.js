const { sequelize, Product, Config } = require('../models');

const seedData = async () => {
    try {
        await sequelize.sync({ force: true }); // WARNING: This wipes the DB. Good for dev reset.
        console.log('Database synced (force: true)');

        // 1. Seed Configs
        const configs = [
            { key: 'flow_api_key', value: 'F8D5F66-2673-4569-8263-596956272304', type: 'string' }, // Sandbox Key
            { key: 'flow_secret_key', value: '9211c4c36093414578037142145e549117397940', type: 'string' }, // Sandbox Secret
            { key: 'flow_api_url', value: 'https://www.flow.cl/api', type: 'string' },
            { key: 'resend_api_key', value: 're_123456789', type: 'string' },
            { key: 'whatsapp_number', value: '56912345678', type: 'string' },
            { key: 'company_email', value: 'contacto@terrablinds.cl', type: 'string' },
            { key: 'company_phone', value: '+56 9 1234 5678', type: 'string' },
            { key: 'company_address', value: 'Av. Providencia 1234, Santiago', type: 'string' },
        ];

        await Config.bulkCreate(configs);
        console.log('Configs seeded');

        // 2. Seed Products
        const categories = [
            'Roller', 'Blackout', 'Sunscreen', 'Vertical', 'Duo',
            'Persianas Exterior', 'Persianas Interior', 'Toldos Retractil',
            'Toldos Verticales', 'Domotica'
        ];

        const products = [];

        // Helper to get image based on category
        const getImages = (cat) => {
            const map = {
                'Roller': ['/uploads/roller1.jpg'],
                'Blackout': ['/uploads/blackout1.jpg'],
                'Sunscreen': ['/uploads/sunscreen1.jpg'],
                'Vertical': ['/uploads/vertical1.jpg'],
                'Duo': ['/uploads/duo1.jpg'],
                'Persianas Exterior': ['/uploads/exterior1.jpg'],
                'Persianas Interior': ['/uploads/interior1.jpg'],
                'Toldos Retractil': ['/uploads/toldo1.jpg'],
                'Toldos Verticales': ['/uploads/toldo_v1.jpg'],
                'Domotica': ['/uploads/domotica1.jpg'],
            };
            // Return placeholder if we don't have real files yet, but frontend handles URLs.
            // We'll use external URLs for now to ensure they show up without local file upload needed immediately.
            const extMap = {
                'Roller': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
                'Blackout': 'https://images.unsplash.com/photo-1505691938895-1758d7bab58d?auto=format&fit=crop&w=800&q=80',
                'Sunscreen': 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
                'Vertical': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80',
                'Duo': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80',
                'Persianas Exterior': 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80', // Reuse
                'Persianas Interior': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Reuse
                'Toldos Retractil': 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
                'Toldos Verticales': 'https://images.unsplash.com/photo-1617104424032-b91c9add3ffa?auto=format&fit=crop&w=800&q=80',
                'Domotica': 'https://images.unsplash.com/photo-1558002038-1091a1661116?auto=format&fit=crop&w=800&q=80'
            };
            return [extMap[cat] || extMap['Roller']];
        };

        categories.forEach(cat => {
            for (let i = 1; i <= 3; i++) {
                const name = `${cat} Modelo ${i}`;
                const slug = `${cat.toLowerCase().replace(/\s+/g, '-')}-modelo-${i}`;
                products.push({
                    name,
                    slug,
                    category: cat,
                    short_description: `Descripción corta para ${cat} ${i}. Alta calidad y durabilidad.`,
                    description: `Esta es una descripción completa y detallada para el producto ${cat} ${i}. Fabricado con los mejores materiales del mercado, ofrece garantía y satisfacción total. Ideal para renovar tus espacios.`,
                    base_price_m2: 20000 + (i * 2500),
                    is_active: true,
                    images: getImages(cat)
                });
            }
        });

        await Product.bulkCreate(products);
        console.log(`Seeded ${products.length} products`);

        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seedData();

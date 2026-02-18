require('dotenv').config();
const { sequelize, Product, Config } = require('../models');

const seedData = async () => {
    try {
        await sequelize.sync({ force: true }); // WARNING: This wipes the DB. Good for dev reset.
        console.log('Database synced (force: true)');

        // 1. Seed Configs (no sensitive keys - those must be set via admin panel or env vars)
        const configs = [
            { key: 'flow_api_key', value: '', type: 'string' },
            { key: 'flow_secret_key', value: '', type: 'string' },
            { key: 'flow_api_url', value: 'https://www.flow.cl/api', type: 'string' },
            { key: 'resend_api_key', value: '', type: 'string' },
            { key: 'whatsapp_number', value: '', type: 'string' },
            { key: 'company_email', value: 'contacto@terrablinds.cl', type: 'string' },
            { key: 'company_phone', value: '', type: 'string' },
            { key: 'company_address', value: '', type: 'string' },
        ];

        await Config.bulkCreate(configs);
        console.log('Configs seeded (empty placeholders - configure via admin panel)');

        // 2. Seed Products
        const categories = [
            'Roller', 'Blackout', 'Sunscreen', 'Vertical', 'Duo',
            'Persianas Exterior', 'Persianas Interior', 'Toldos Retractil',
            'Toldos Verticales', 'Domotica'
        ];

        const products = [];

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
                    images: []
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

const { Config, sequelize } = require('../models');

const seedConfigs = async () => {
    try {
        await sequelize.sync();

        const defaults = [
            // Integrations
            { key: 'flow_api_key', value: '', group: 'payment' },
            { key: 'flow_secret_key', value: '', group: 'payment' },
            { key: 'flow_api_url', value: 'https://www.flow.cl/api', group: 'payment' },
            { key: 'resend_api_key', value: '', group: 'email' },
            { key: 'whatsapp_number', value: '56912345678', group: 'contact', isPublic: true },

            // Company Info
            { key: 'company_email', value: 'contacto@terrablinds.cl', group: 'contact', isPublic: true },
            { key: 'company_phone', value: '+56 9 1234 5678', group: 'contact', isPublic: true },
            { key: 'company_address', value: 'Av. Providencia 1234, Santiago', group: 'contact', isPublic: true },
        ];

        for (const conf of defaults) {
            await Config.findOrCreate({
                where: { key: conf.key },
                defaults: conf
            });
        }

        console.log('Default configurations seeded.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding configs:', error);
        process.exit(1);
    }
};

seedConfigs();

const { User, sequelize } = require('../models');

const seedAdmin = async () => {
    try {
        await sequelize.sync(); // Ensure tables exist

        const adminEmail = 'admin@terrablinds.cl';
        const adminPassword = 'admin123'; // Temporary password

        const existingUser = await User.findOne({ where: { email: adminEmail } });

        if (existingUser) {
            console.log('Admin user already exists.');
        } else {
            await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'Administrador',
                role: 'admin'
            });
            console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

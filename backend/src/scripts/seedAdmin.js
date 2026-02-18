require('dotenv').config();
const { User, sequelize } = require('../models');

const seedAdmin = async () => {
    try {
        await sequelize.sync();

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@terrablinds.cl';
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword || adminPassword.length < 8) {
            console.error('ADMIN_PASSWORD env variable must be set (min 8 characters)');
            process.exit(1);
        }

        const existingUser = await User.findOne({ where: { email: adminEmail } });

        if (existingUser) {
            console.log('Admin user already exists.');
        } else {
            // Password is hashed automatically by the User model beforeCreate hook
            await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'Administrador',
                role: 'admin'
            });
            console.log(`Admin user created: ${adminEmail}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Validate critical env vars at startup
if (isProduction) {
    const required = ['JWT_SECRET', 'DB_HOST', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
        process.exit(1);
    }
}

const blocked = 'your-super-secret-jwt-key-change-this-in-production';
if (process.env.JWT_SECRET === blocked) {
    console.error('FATAL: JWT_SECRET must be changed from the default insecure value.');
    process.exit(1);
}

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('Starting TerraBlinds Backend Server...');

        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        if (!isProduction) {
            await sequelize.sync({ alter: true });
            console.log('Database models synchronized (development mode).');
        } else {
            console.log('Production mode: skipping auto-sync. Use migrations.');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();

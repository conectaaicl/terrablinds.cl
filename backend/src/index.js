require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
    try {
        console.log('Starting TerraBlinds Backend Server...');

        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // In development, sync models automatically
        // In production, use migrations instead
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

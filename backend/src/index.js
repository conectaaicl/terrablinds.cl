require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('🚀 Starting TerraBlinds Backend Server...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync models (create tables if they don't exist)
        await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
        console.log('✅ Database models synchronized.');

        app.listen(PORT, () => {
            console.log(`✅ Server is running on http://localhost:${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
            console.log(`🗄️  Database: ${process.env.DB_NAME || 'terrablinds_db'}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();

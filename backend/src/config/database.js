const { Sequelize } = require('sequelize');

if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('FATAL: DB_HOST and DB_PASSWORD must be set');
    process.exit(1);
}

const sequelize = new Sequelize(
    process.env.DB_NAME || 'terrablinds_db',
    process.env.DB_USER || 'terrablinds',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;

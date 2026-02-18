const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction && (!process.env.DB_HOST || !process.env.DB_PASSWORD)) {
    console.error('FATAL: DB_HOST and DB_PASSWORD must be set in production');
    process.exit(1);
}

if (process.env.DB_HOST) {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'terrablinds_db',
        process.env.DB_USER || 'terrablinds',
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: isProduction ? false : console.log,
            pool: {
                max: isProduction ? 10 : 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
} else {
    if (isProduction) {
        console.error('FATAL: SQLite is not allowed in production. Set DB_HOST.');
        process.exit(1);
    }
    console.warn('Using SQLite for development. Set DB_HOST for PostgreSQL.');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: false
    });
}

module.exports = sequelize;

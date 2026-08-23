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

// Non-fatal warnings for optional integrations
const optionalMissing = [];
if (!process.env.TG_TOKEN || !process.env.TG_CHAT_ID) {
    optionalMissing.push('TG_TOKEN / TG_CHAT_ID — Telegram notifications disabled');
}
if (!process.env.MAILSAAS_API_KEY) {
    optionalMissing.push('MAILSAAS_API_KEY — email delivery disabled');
}
if (process.env.GE_WORKER_ENABLED !== 'true') {
    optionalMissing.push('GE_WORKER_ENABLED — Growth Engine outbox worker disabled. ' +
        'Set GE_WORKER_ENABLED=true after running ge_outbox migration to enable.');
}
optionalMissing.forEach(w => console.warn(`WARNING: ${w}`));

const app = require('./app');
const { sequelize } = require('./models');
const geWorker = require('./services/ge_worker.service');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('Starting TerraBlinds Backend Server...');

        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        if (!isProduction && process.env.ALLOW_DB_SYNC === 'true') {
            // Opt-in only: sync() does not create partial unique indexes and can ALTER
            // column types if model types diverge from SQL migrations. Use only for
            // rapid prototyping on a throwaway dev DB.
            await sequelize.sync({ alter: true });
            console.log('Database models synchronized (ALLOW_DB_SYNC=true — SQL migrations are authoritative).');
        } else {
            // Default: schema is managed exclusively by SQL migrations.
            // Init: docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db < src/scripts/migrate_growth_engine.sql
            //        docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db < src/scripts/migrate_quotes_leads_ext.sql
            console.log(isProduction
                ? 'Production mode: schema managed via SQL migrations.'
                : 'Development mode: sync() disabled. Set ALLOW_DB_SYNC=true to enable (not recommended).');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Start Growth Engine outbox worker (degrades gracefully if table not yet migrated)
        geWorker.start();
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();

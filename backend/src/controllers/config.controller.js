const { Config } = require('../models');

// Sensitive keys that should be masked in admin view
const SENSITIVE_KEYS = ['flow_secret_key', 'resend_api_key'];

// Keys allowed for public access
const PUBLIC_KEYS = ['whatsapp_number', 'company_email', 'company_phone', 'company_address', 'logo_url'];

// Keys allowed to be updated via admin panel
const ALLOWED_CONFIG_KEYS = [
    'flow_api_key', 'flow_secret_key', 'flow_api_url',
    'resend_api_key', 'whatsapp_number', 'company_email',
    'company_phone', 'company_address', 'logo_url'
];

// Get all config (admin only - masks sensitive values)
exports.getAllConfig = async (req, res) => {
    try {
        const configs = await Config.findAll();
        const configObj = {};

        configs.forEach(config => {
            let value = config.value;

            if (config.type === 'number') {
                value = parseFloat(value);
            } else if (config.type === 'boolean') {
                value = value === 'true';
            } else if (config.type === 'json') {
                try { value = JSON.parse(value); } catch (e) { /* keep as string */ }
            }

            // Mask sensitive values - show only last 4 chars
            if (SENSITIVE_KEYS.includes(config.key) && typeof value === 'string' && value.length > 4) {
                configObj[config.key] = '••••••••' + value.slice(-4);
                configObj[`${config.key}_set`] = true;
            } else {
                configObj[config.key] = value;
            }
        });

        res.json(configObj);
    } catch (error) {
        console.error('Error fetching config:', error.message);
        res.status(500).json({ error: 'Error fetching config' });
    }
};

// Get public config (no auth required)
exports.getPublicConfig = async (req, res) => {
    try {
        const configs = await Config.findAll({
            where: { key: PUBLIC_KEYS }
        });

        const configObj = {};
        configs.forEach(config => {
            configObj[config.key] = config.value;
        });

        res.json(configObj);
    } catch (error) {
        console.error('Error fetching public config:', error.message);
        res.status(500).json({ error: 'Error fetching config' });
    }
};

// Update config (admin only)
exports.updateConfig = async (req, res) => {
    try {
        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            // Only allow whitelisted keys
            if (!ALLOWED_CONFIG_KEYS.includes(key)) {
                continue;
            }

            // Skip masked values (user didn't change them)
            if (typeof value === 'string' && value.startsWith('••••••••')) {
                continue;
            }

            let type = 'string';
            let stringValue = String(value);

            if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (typeof value === 'object') {
                type = 'json';
                stringValue = JSON.stringify(value);
            }

            await Config.upsert({ key, value: stringValue, type });
        }

        res.json({ message: 'Config updated successfully' });
    } catch (error) {
        console.error('Error updating config:', error.message);
        res.status(500).json({ error: 'Error updating config' });
    }
};

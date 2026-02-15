const { Config } = require('../models');

// Get all config
exports.getAllConfig = async (req, res) => {
    try {
        const configs = await Config.findAll();

        // Convert to key-value object
        const configObj = {};
        configs.forEach(config => {
            let value = config.value;

            // Parse based on type
            if (config.type === 'number') {
                value = parseFloat(value);
            } else if (config.type === 'boolean') {
                value = value === 'true';
            } else if (config.type === 'json') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // Keep as string if parse fails
                }
            }

            configObj[config.key] = value;
        });

        res.json(configObj);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Error fetching config' });
    }
};

// Get public config (no auth required)
exports.getPublicConfig = async (req, res) => {
    try {
        const publicKeys = ['whatsapp_number', 'company_email', 'logo_url'];

        const configs = await Config.findAll({
            where: {
                key: publicKeys
            }
        });

        const configObj = {};
        configs.forEach(config => {
            configObj[config.key] = config.value;
        });

        res.json(configObj);
    } catch (error) {
        console.error('Error fetching public config:', error);
        res.status(500).json({ error: 'Error fetching config' });
    }
};

// Update config
exports.updateConfig = async (req, res) => {
    try {
        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            let type = 'string';
            let stringValue = String(value);

            // Determine type
            if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (typeof value === 'object') {
                type = 'json';
                stringValue = JSON.stringify(value);
            }

            await Config.upsert({
                key,
                value: stringValue,
                type
            });
        }

        res.json({ message: 'Config updated successfully' });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Error updating config' });
    }
};

const { Config } = require('../models');

// Sensitive keys that should be masked in admin view
const SENSITIVE_KEYS = ['flow_secret_key', 'resend_api_key', 'groq_api_key'];

// Keys allowed for public access
const PUBLIC_KEYS = [
    'whatsapp_number', 'company_email', 'company_phone', 'company_address', 'logo_url',
    'favicon_url', 'brand_name', 'brand_slogan',
    'hero_title', 'hero_subtitle', 'hero_cta_primary', 'hero_cta_secondary', 'hero_bg_image', 'hero_badge',
    'social_facebook', 'social_instagram', 'social_tiktok', 'social_youtube', 'social_twitter',
    'about_title', 'about_subtitle', 'about_history_title', 'about_history_text1', 'about_history_text2',
    'about_image_url', 'about_cta_title', 'about_cta_text', 'about_cta_label',
    'about_val1_title', 'about_val1_text',
    'about_val2_title', 'about_val2_text',
    'about_val3_title', 'about_val3_text',
    'about_val4_title', 'about_val4_text',
    'software_title', 'software_subtitle', 'software_description',
    'software_cta_label', 'software_cta_url', 'software_alt_label', 'software_alt_url',
    'software_badge', 'software_image_url', 'software_enabled',
    'software_feature1', 'software_feature2', 'software_feature3', 'software_feature4',
    'software_price', 'software_price_period',
    'contact_title', 'contact_subtitle', 'contact_hours', 'contact_map_embed',
    'company_city', 'company_region',
    'stat1_num', 'stat1_label', 'stat2_num', 'stat2_label', 'stat3_num', 'stat3_label',
    'section_features_title', 'section_features_subtitle',
    'feature1_title', 'feature1_text', 'feature2_title', 'feature2_text',
    'feature3_title', 'feature3_text', 'feature4_title', 'feature4_text',
    'theme_primary', 'theme_secondary', 'theme_accent',
    'stech_title', 'stech_subtitle', 'stech_description', 'stech_price',
    'stech_photo1', 'stech_photo2', 'stech_photo3', 'stech_photo4',
    'stech_include1', 'stech_include2', 'stech_include3',
    'stech_include4', 'stech_include5', 'stech_include6',
    'domotica_title', 'domotica_subtitle',
    'domotica_feat1_title', 'domotica_feat1_desc',
    'domotica_feat2_title', 'domotica_feat2_desc',
    'domotica_feat3_title', 'domotica_feat3_desc',
    'domotica_feat4_title', 'domotica_feat4_desc',
    'domotica_feat5_title', 'domotica_feat5_desc',
    'domotica_feat6_title', 'domotica_feat6_desc',
    'cat1_image', 'cat1_title', 'cat1_link',
    'cat2_image', 'cat2_title', 'cat2_link',
    'cat3_image', 'cat3_title', 'cat3_link',
    'home_projects_title', 'home_projects_subtitle',
    'slide1_url', 'slide1_label', 'slide2_url', 'slide2_label',
    'slide3_url', 'slide3_label', 'slide4_url', 'slide4_label',
    'slide5_url', 'slide5_label', 'slide6_url', 'slide6_label',
    // Cámaras
    'camaras_title', 'camaras_subtitle',
    'camaras_feat1_title', 'camaras_feat1_desc',
    'camaras_feat2_title', 'camaras_feat2_desc',
    'camaras_feat3_title', 'camaras_feat3_desc',
    'camaras_feat4_title', 'camaras_feat4_desc',
    'camaras_feat5_title', 'camaras_feat5_desc',
    'camaras_feat6_title', 'camaras_feat6_desc',
    'camaras_photo1', 'camaras_photo2', 'camaras_photo3', 'camaras_photo4',
    // Paneles Solares
    'solar_title', 'solar_subtitle',
    'solar_feat1_title', 'solar_feat1_desc',
    'solar_feat2_title', 'solar_feat2_desc',
    'solar_feat3_title', 'solar_feat3_desc',
    'solar_feat4_title', 'solar_feat4_desc',
    'solar_feat5_title', 'solar_feat5_desc',
    'solar_feat6_title', 'solar_feat6_desc',
    'solar_photo1', 'solar_photo2', 'solar_photo3', 'solar_photo4',
    // Control de Acceso
    'acceso_title', 'acceso_subtitle',
    'acceso_feat1_title', 'acceso_feat1_desc',
    'acceso_feat2_title', 'acceso_feat2_desc',
    'acceso_feat3_title', 'acceso_feat3_desc',
    'acceso_feat4_title', 'acceso_feat4_desc',
    'acceso_feat5_title', 'acceso_feat5_desc',
    'acceso_feat6_title', 'acceso_feat6_desc',
    'acceso_photo1', 'acceso_photo2', 'acceso_photo3', 'acceso_photo4',
    // Cortinas Metálicas
    'metalicas_title', 'metalicas_subtitle', 'metalicas_cta_title', 'metalicas_cta_desc',
    'metalicas_feat1_title', 'metalicas_feat1_desc',
    'metalicas_feat2_title', 'metalicas_feat2_desc',
    'metalicas_feat3_title', 'metalicas_feat3_desc',
    'metalicas_feat4_title', 'metalicas_feat4_desc',
    'metalicas_feat5_title', 'metalicas_feat5_desc',
    'metalicas_feat6_title', 'metalicas_feat6_desc',
    'metalicas_photo1', 'metalicas_photo2', 'metalicas_photo3', 'metalicas_photo4',
    // Automatización
    'auto_title', 'auto_subtitle',
    'auto_feat1_title', 'auto_feat1_desc',
    'auto_feat2_title', 'auto_feat2_desc',
    'auto_feat3_title', 'auto_feat3_desc',
    'auto_feat4_title', 'auto_feat4_desc',
    'auto_feat5_title', 'auto_feat5_desc',
    'auto_feat6_title', 'auto_feat6_desc',
    'auto_photo1', 'auto_photo2', 'auto_photo3', 'auto_photo4',
];

// Keys allowed to be updated via admin panel
const ALLOWED_CONFIG_KEYS = [
    'flow_api_key', 'flow_secret_key', 'flow_api_url',
    'mercadopago_access_token', 'mercadopago_public_key',
    'resend_api_key', 'admin_notification_email',
    'whatsapp_number', 'company_email', 'company_phone', 'company_address', 'logo_url',
    'favicon_url', 'brand_name', 'brand_slogan',
    'hero_title', 'hero_subtitle', 'hero_cta_primary', 'hero_cta_secondary', 'hero_bg_image', 'hero_badge',
    'social_facebook', 'social_instagram', 'social_tiktok', 'social_youtube', 'social_twitter',
    'about_title', 'about_subtitle', 'about_history_title', 'about_history_text1', 'about_history_text2',
    'about_image_url', 'about_cta_title', 'about_cta_text', 'about_cta_label',
    'about_val1_title', 'about_val1_text',
    'about_val2_title', 'about_val2_text',
    'about_val3_title', 'about_val3_text',
    'about_val4_title', 'about_val4_text',
    'software_title', 'software_subtitle', 'software_description',
    'software_cta_label', 'software_cta_url', 'software_alt_label', 'software_alt_url',
    'software_badge', 'software_image_url', 'software_enabled',
    'software_feature1', 'software_feature2', 'software_feature3', 'software_feature4',
    'software_price', 'software_price_period',
    'contact_title', 'contact_subtitle', 'contact_hours', 'contact_map_embed',
    'company_city', 'company_region',
    'stat1_num', 'stat1_label', 'stat2_num', 'stat2_label', 'stat3_num', 'stat3_label',
    'section_features_title', 'section_features_subtitle',
    'feature1_title', 'feature1_text', 'feature2_title', 'feature2_text',
    'feature3_title', 'feature3_text', 'feature4_title', 'feature4_text',
    'theme_primary', 'theme_secondary', 'theme_accent',
    'webhook_url',
    'groq_api_key',
    'stech_title', 'stech_subtitle', 'stech_description', 'stech_price',
    'stech_photo1', 'stech_photo2', 'stech_photo3', 'stech_photo4',
    'stech_include1', 'stech_include2', 'stech_include3',
    'stech_include4', 'stech_include5', 'stech_include6',
    'domotica_title', 'domotica_subtitle',
    'domotica_feat1_title', 'domotica_feat1_desc',
    'domotica_feat2_title', 'domotica_feat2_desc',
    'domotica_feat3_title', 'domotica_feat3_desc',
    'domotica_feat4_title', 'domotica_feat4_desc',
    'domotica_feat5_title', 'domotica_feat5_desc',
    'domotica_feat6_title', 'domotica_feat6_desc',
    'cat1_image', 'cat1_title', 'cat1_link',
    'cat2_image', 'cat2_title', 'cat2_link',
    'cat3_image', 'cat3_title', 'cat3_link',
    'home_projects_title', 'home_projects_subtitle',
    'slide1_url', 'slide1_label', 'slide2_url', 'slide2_label',
    'slide3_url', 'slide3_label', 'slide4_url', 'slide4_label',
    'slide5_url', 'slide5_label', 'slide6_url', 'slide6_label',
    // Cámaras
    'camaras_title', 'camaras_subtitle',
    'camaras_feat1_title', 'camaras_feat1_desc',
    'camaras_feat2_title', 'camaras_feat2_desc',
    'camaras_feat3_title', 'camaras_feat3_desc',
    'camaras_feat4_title', 'camaras_feat4_desc',
    'camaras_feat5_title', 'camaras_feat5_desc',
    'camaras_feat6_title', 'camaras_feat6_desc',
    'camaras_photo1', 'camaras_photo2', 'camaras_photo3', 'camaras_photo4',
    // Paneles Solares
    'solar_title', 'solar_subtitle',
    'solar_feat1_title', 'solar_feat1_desc',
    'solar_feat2_title', 'solar_feat2_desc',
    'solar_feat3_title', 'solar_feat3_desc',
    'solar_feat4_title', 'solar_feat4_desc',
    'solar_feat5_title', 'solar_feat5_desc',
    'solar_feat6_title', 'solar_feat6_desc',
    'solar_photo1', 'solar_photo2', 'solar_photo3', 'solar_photo4',
    // Control de Acceso
    'acceso_title', 'acceso_subtitle',
    'acceso_feat1_title', 'acceso_feat1_desc',
    'acceso_feat2_title', 'acceso_feat2_desc',
    'acceso_feat3_title', 'acceso_feat3_desc',
    'acceso_feat4_title', 'acceso_feat4_desc',
    'acceso_feat5_title', 'acceso_feat5_desc',
    'acceso_feat6_title', 'acceso_feat6_desc',
    'acceso_photo1', 'acceso_photo2', 'acceso_photo3', 'acceso_photo4',
    // Cortinas Metálicas
    'cortinas_title', 'cortinas_subtitle',
    'cortinas_feat1_title', 'cortinas_feat1_desc',
    'cortinas_feat2_title', 'cortinas_feat2_desc',
    'cortinas_feat3_title', 'cortinas_feat3_desc',
    'cortinas_feat4_title', 'cortinas_feat4_desc',
    'cortinas_feat5_title', 'cortinas_feat5_desc',
    'cortinas_feat6_title', 'cortinas_feat6_desc',
    'cortinas_photo1', 'cortinas_photo2', 'cortinas_photo3', 'cortinas_photo4',
    // Automatización
    'auto_title', 'auto_subtitle',
    'auto_feat1_title', 'auto_feat1_desc',
    'auto_feat2_title', 'auto_feat2_desc',
    'auto_feat3_title', 'auto_feat3_desc',
    'auto_feat4_title', 'auto_feat4_desc',
    'auto_feat5_title', 'auto_feat5_desc',
    'auto_feat6_title', 'auto_feat6_desc',
    'auto_photo1', 'auto_photo2', 'auto_photo3', 'auto_photo4',
    // Cortinas Metálicas
    'metalicas_title', 'metalicas_subtitle', 'metalicas_cta_title', 'metalicas_cta_desc',
    'metalicas_feat1_title', 'metalicas_feat1_desc',
    'metalicas_feat2_title', 'metalicas_feat2_desc',
    'metalicas_feat3_title', 'metalicas_feat3_desc',
    'metalicas_feat4_title', 'metalicas_feat4_desc',
    'metalicas_feat5_title', 'metalicas_feat5_desc',
    'metalicas_feat6_title', 'metalicas_feat6_desc',
    'metalicas_photo1', 'metalicas_photo2', 'metalicas_photo3', 'metalicas_photo4',
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

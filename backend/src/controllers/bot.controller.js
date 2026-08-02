/**
 * WhatsApp Bot API — called by n8n workflow on incoming messages.
 * Responds with product info and creates draft quotes.
 */
const { Product, Quote, Config } = require('../models');
const { Op } = require('sequelize');

const BOT_TOKEN = process.env.BOT_SECRET || 'terrablinds-bot-2026';

function authorize(req) {
    const auth = req.headers['x-bot-token'] || req.query.token;
    return auth === BOT_TOKEN;
}

// Search products by keyword — called by n8n to get prices
exports.searchProducts = async (req, res) => {
    if (!authorize(req)) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { q = '' } = req.query;
        const products = await Product.findAll({
            where: {
                active: true,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { category: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } },
                ]
            },
            attributes: ['id', 'name', 'category', 'base_price', 'short_description'],
            limit: 5,
        });
        res.json({ products: products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.base_price ? `Desde $${Number(p.base_price).toLocaleString('es-CL')} CLP` : 'A cotizar',
            description: p.short_description || '',
        }))});
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};

// Create quote from bot — n8n calls this after collecting all info
exports.createBotQuote = async (req, res) => {
    if (!authorize(req)) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { customer_name, customer_phone, product_name, width, height, notes } = req.body;
        if (!customer_name || !product_name)
            return res.status(400).json({ error: 'customer_name y product_name requeridos' });

        // Find product price
        const product = await Product.findOne({
            where: { name: { [Op.iLike]: `%${product_name}%` } },
            attributes: ['id', 'name', 'base_price'],
        });
        const unitPrice = product?.base_price || 0;
        const w = parseFloat(width) || 1.0;
        const h = parseFloat(height) || 1.0;
        const area = w * h;
        const price = unitPrice > 0 ? Math.round(unitPrice * area) : 0;

        const quote = await Quote.create({
            customer_name: customer_name.trim(),
            customer_email: 'whatsapp@bot.terrablinds.cl',
            customer_phone: customer_phone || null,
            notes: `[Bot WhatsApp] ${notes || ''}`,
            items: [{ productId: product?.id, productName: product?.name || product_name, width: w, height: h, quantity: 1, price }],
            total_amount: price,
            status: 'pending',
        });
        res.json({ ok: true, quote_id: quote.id, estimated_price: price > 0 ? `$${price.toLocaleString('es-CL')} CLP` : 'A cotizar' });
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};

// Get config values for bot messages
exports.getBotConfig = async (req, res) => {
    if (!authorize(req)) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const configs = await Config.findAll({ attributes: ['key', 'value'] });
        const cfg = {};
        configs.forEach(c => { cfg[c.key] = c.value; });
        res.json({
            whatsapp: cfg.social_whatsapp || '',
            site_url: process.env.SITE_URL || 'https://terrablinds.cl',
            catalog_url: `${process.env.SITE_URL || 'https://terrablinds.cl'}/catalog`,
            quote_url: `${process.env.SITE_URL || 'https://terrablinds.cl'}/quote`,
        });
    } catch (err) { res.status(500).json({ error: 'Error' }); }
};

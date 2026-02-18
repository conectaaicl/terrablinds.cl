const { Product } = require('../models');
const { Op } = require('sequelize');

// Whitelist of fields allowed for product creation/update
const ALLOWED_FIELDS = [
    'name', 'slug', 'category', 'description', 'short_description',
    'is_unit_price', 'price_unit', 'base_price_m2', 'images',
    'features', 'stock', 'is_active'
];

const sanitizeProductData = (body) => {
    const data = {};
    ALLOWED_FIELDS.forEach(field => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });
    return data;
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, is_active } = req.query;
        const where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            const searchTerm = String(search).substring(0, 100);
            const searchOperator = Product.sequelize.options.dialect === 'sqlite' ? Op.like : Op.iLike;
            where[Op.or] = [
                { name: { [searchOperator]: `%${searchTerm}%` } },
                { description: { [searchOperator]: `%${searchTerm}%` } }
            ];
        }

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        } else {
            // Public requests only see active products by default
            if (!req.user) {
                where.is_active = true;
            }
        }

        const products = await Product.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Error fetching products' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).json({ error: 'Error fetching product' });
    }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const data = sanitizeProductData(req.body);

        if (!data.name || !data.category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }

        if (!data.slug) {
            data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const product = await Product.create(data);
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A product with this slug already exists' });
        }
        console.error('Error creating product:', error.message);
        res.status(500).json({ error: 'Error creating product' });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const data = sanitizeProductData(req.body);
        await product.update(data);
        res.json(product);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A product with this slug already exists' });
        }
        console.error('Error updating product:', error.message);
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).json({ error: 'Error deleting product' });
    }
};

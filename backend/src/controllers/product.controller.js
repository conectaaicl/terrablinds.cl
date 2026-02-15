const { Product } = require('../models');
const { Op } = require('sequelize');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, is_active } = req.query;

        const where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            const searchOperator = Product.sequelize.options.dialect === 'sqlite' ? Op.like : Op.iLike;
            where[Op.or] = [
                { name: { [searchOperator]: `%${search}%` } },
                { description: { [searchOperator]: `%${search}%` } }
            ];
        }

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        const products = await Product.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error creating product' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.update(req.body);
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
};

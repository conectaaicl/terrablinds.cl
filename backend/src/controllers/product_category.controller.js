const { ProductCategory } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const where = {};
        if (!req.user) where.is_active = true; // public only sees active categories
        const categories = await ProductCategory.findAll({
            where,
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, slug, is_active, sort_order } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const autoSlug = slug || name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const cat = await ProductCategory.create({ name, slug: autoSlug, is_active: is_active ?? true, sort_order: sort_order ?? 0 });
        res.status(201).json(cat);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A category with this slug already exists' });
        }
        console.error('Error creating category:', err.message);
        res.status(500).json({ error: 'Error creating category' });
    }
};

exports.update = async (req, res) => {
    try {
        const cat = await ProductCategory.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        const { name, slug, is_active, sort_order } = req.body;
        await cat.update({ name: name ?? cat.name, slug: slug ?? cat.slug, is_active: is_active ?? cat.is_active, sort_order: sort_order ?? cat.sort_order });
        res.json(cat);
    } catch (err) {
        console.error('Error updating category:', err.message);
        res.status(500).json({ error: 'Error updating category' });
    }
};

exports.remove = async (req, res) => {
    try {
        const cat = await ProductCategory.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        await cat.destroy();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('Error deleting category:', err.message);
        res.status(500).json({ error: 'Error deleting category' });
    }
};

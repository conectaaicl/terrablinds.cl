const { FAQ } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const faqs = await FAQ.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
        });
        res.json(faqs);
    } catch (err) {
        console.error('Error fetching FAQs:', err.message);
        res.status(500).json({ error: 'Error fetching FAQs' });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const faqs = await FAQ.findAll({
            order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
        });
        res.json(faqs);
    } catch (err) {
        console.error('Error fetching FAQs:', err.message);
        res.status(500).json({ error: 'Error fetching FAQs' });
    }
};

exports.create = async (req, res) => {
    try {
        const { question, answer, sort_order } = req.body;
        if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });
        const faq = await FAQ.create({ question, answer, sort_order: sort_order || 0 });
        res.status(201).json(faq);
    } catch (err) {
        console.error('Error creating FAQ:', err.message);
        res.status(500).json({ error: 'Error creating FAQ' });
    }
};

exports.update = async (req, res) => {
    try {
        const faq = await FAQ.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        const { question, answer, is_active, sort_order } = req.body;
        await faq.update({ question, answer, is_active, sort_order });
        res.json(faq);
    } catch (err) {
        console.error('Error updating FAQ:', err.message);
        res.status(500).json({ error: 'Error updating FAQ' });
    }
};

exports.remove = async (req, res) => {
    try {
        const faq = await FAQ.findByPk(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        await faq.destroy();
        res.json({ message: 'FAQ deleted' });
    } catch (err) {
        console.error('Error deleting FAQ:', err.message);
        res.status(500).json({ error: 'Error deleting FAQ' });
    }
};

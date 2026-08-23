const { Review } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const reviews = await Review.findAll({ order: [['created_at', 'DESC']] });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
};

exports.getActive = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
};

exports.create = async (req, res) => {
    try {
        const { author_name, author_role, rating, content, avatar_url } = req.body;
        if (!author_name || !content) {
            return res.status(400).json({ error: 'author_name and content are required' });
        }
        const review = await Review.create({
            author_name: String(author_name).substring(0, 200),
            author_role: author_role ? String(author_role).substring(0, 200) : 'Cliente',
            rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
            content: String(content).substring(0, 2000),
            avatar_url: avatar_url ? String(avatar_url).substring(0, 500) : null,
            is_active: true,
        });
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: 'Error creating review' });
    }
};

exports.update = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        const { author_name, author_role, rating, content, avatar_url, is_active } = req.body;
        await review.update({
            ...(author_name != null && { author_name: String(author_name).substring(0, 200) }),
            ...(author_role != null && { author_role: String(author_role).substring(0, 200) }),
            ...(rating != null && { rating: Math.min(5, Math.max(1, parseInt(rating) || 5)) }),
            ...(content != null && { content: String(content).substring(0, 2000) }),
            ...(avatar_url !== undefined && { avatar_url: avatar_url ? String(avatar_url).substring(0, 500) : null }),
            ...(is_active != null && { is_active: Boolean(is_active) }),
        });
        res.json(review);
    } catch (err) {
        res.status(500).json({ error: 'Error updating review' });
    }
};

exports.remove = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        await review.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting review' });
    }
};

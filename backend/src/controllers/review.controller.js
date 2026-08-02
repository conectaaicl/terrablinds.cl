const { Review, Product } = require('../models');
const { Op } = require('sequelize');

// PUBLIC: submit review (rate-limited in routes)
exports.createReview = async (req, res) => {
    try {
        const { product_id, customer_name, customer_email, rating, text, photo_url } = req.body;
        if (!customer_name?.trim() || customer_name.trim().length < 2)
            return res.status(400).json({ error: 'Nombre requerido (mín 2 caracteres)' });
        if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email))
            return res.status(400).json({ error: 'Email válido requerido' });
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ error: 'Calificación entre 1 y 5 requerida' });
        if (!text?.trim() || text.trim().length < 10)
            return res.status(400).json({ error: 'Reseña requerida (mín 10 caracteres)' });

        const review = await Review.create({
            product_id: product_id ? parseInt(product_id) : null,
            customer_name: customer_name.trim().substring(0, 200),
            customer_email: customer_email.trim().toLowerCase(),
            rating: parseInt(rating),
            text: text.trim().substring(0, 2000),
            photo_url: photo_url ? String(photo_url).substring(0, 500) : null,
            approved: false,
        });
        res.status(201).json({ ok: true, id: review.id, message: 'Reseña recibida, pendiente de aprobación.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar reseña' });
    }
};

// PUBLIC: get approved reviews (optionally filter by product_id)
exports.getPublicReviews = async (req, res) => {
    try {
        const { product_id, limit = 20 } = req.query;
        const where = { approved: true };
        if (product_id) where.product_id = parseInt(product_id);
        const reviews = await Review.findAll({
            where,
            order: [['created_at', 'DESC']],
            limit: Math.min(parseInt(limit) || 20, 50),
            attributes: ['id', 'product_id', 'customer_name', 'rating', 'text', 'photo_url', 'created_at'],
        });
        // Add product name
        const withProduct = await Promise.all(reviews.map(async r => {
            const data = r.toJSON();
            if (r.product_id) {
                const p = await Product.findByPk(r.product_id, { attributes: ['name'] });
                data.product_name = p?.name || null;
            }
            return data;
        }));
        const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
        res.json({ reviews: withProduct, total: reviews.length, avg_rating: avg ? parseFloat(avg) : null });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
};

// ADMIN: get all reviews
exports.getAdminReviews = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status === 'pending') where.approved = false;
        else if (status === 'approved') where.approved = true;
        const reviews = await Review.findAll({
            where,
            order: [['created_at', 'DESC']],
        });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};

// ADMIN: approve or reject
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;
        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ error: 'No encontrada' });
        await review.update({ approved: !!approved });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};

// ADMIN: delete review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ error: 'No encontrada' });
        await review.destroy();
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};

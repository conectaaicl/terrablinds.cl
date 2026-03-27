const { Blog } = require('../models');
const { Op } = require('sequelize');

const ALLOWED_FIELDS = [
    'title', 'slug', 'excerpt', 'content', 'meta_description',
    'meta_keywords', 'cover_image', 'author', 'is_published', 'published_at'
];

const sanitize = (body) => {
    const data = {};
    ALLOWED_FIELDS.forEach(f => { if (body[f] !== undefined) data[f] = body[f]; });
    return data;
};

// GET /api/blogs — public, only published
exports.getAll = async (req, res) => {
    try {
        const { search } = req.query;
        const where = { is_published: true };
        if (search) {
            const s = String(search).substring(0, 100);
            where[Op.or] = [
                { title: { [Op.iLike]: `%${s}%` } },
                { excerpt: { [Op.iLike]: `%${s}%` } }
            ];
        }
        const posts = await Blog.findAll({
            where,
            attributes: ['id', 'title', 'slug', 'excerpt', 'cover_image', 'author', 'published_at'],
            order: [['published_at', 'DESC']]
        });
        res.json(posts);
    } catch (err) {
        console.error('Error fetching blogs:', err.message);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

// GET /api/blogs/:slug — public
exports.getBySlug = async (req, res) => {
    try {
        const post = await Blog.findOne({
            where: { slug: req.params.slug, is_published: true }
        });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching post' });
    }
};

// POST /api/blogs — admin only
exports.create = async (req, res) => {
    try {
        const data = sanitize(req.body);
        if (!data.title || !data.slug || !data.content) {
            return res.status(400).json({ error: 'title, slug and content are required' });
        }
        const post = await Blog.create(data);
        res.status(201).json(post);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        res.status(500).json({ error: 'Error creating post' });
    }
};

// PUT /api/blogs/:id — admin only
exports.update = async (req, res) => {
    try {
        const post = await Blog.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        await post.update(sanitize(req.body));
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Error updating post' });
    }
};

// DELETE /api/blogs/:id — admin only
exports.remove = async (req, res) => {
    try {
        const post = await Blog.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        await post.destroy();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting post' });
    }
};

// GET /api/blogs/admin/all — admin: all posts including unpublished
exports.getAllAdmin = async (req, res) => {
    try {
        const posts = await Blog.findAll({ order: [['published_at', 'DESC']] });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

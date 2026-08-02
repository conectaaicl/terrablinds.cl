const { Blog, Config } = require('../models');
const { Op } = require('sequelize');
const https = require('https');

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function estimateReadTime(content) {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

// ─── Public endpoints ────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 9 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Blog.findAndCountAll({
            where: { is_published: true },
            order: [['published_at', 'DESC']],
            limit: parseInt(limit),
            offset,
            attributes: ['id','title','slug','excerpt','meta_description','featured_image','author','published_at','read_time','views','keywords'],
        });
        res.json({ posts: rows, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) });
    } catch (err) {
        console.error('Blog getAll error:', err.message);
        res.status(500).json({ error: 'Error loading posts' });
    }
};

exports.getBySlug = async (req, res) => {
    try {
        const post = await Blog.findOne({ where: { slug: req.params.slug, is_published: true } });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        await post.increment('views');
        res.json(post);
    } catch (err) {
        console.error('Blog getBySlug error:', err.message);
        res.status(500).json({ error: 'Error loading post' });
    }
};

// ─── Admin endpoints ─────────────────────────────────────────────────────────

exports.getAllAdmin = async (req, res) => {
    try {
        const posts = await Blog.findAll({ order: [['created_at', 'DESC']] });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Error loading posts' });
    }
};

exports.getOne = async (req, res) => {
    try {
        const post = await Blog.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Error loading post' });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, excerpt, content, meta_title, meta_description, keywords, featured_image, author, is_published } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

        let slug = slugify(title);
        // ensure unique slug
        const existing = await Blog.findOne({ where: { slug } });
        if (existing) slug = slug + '-' + Date.now();

        const post = await Blog.create({
            title, slug, excerpt, content,
            meta_title: meta_title || title,
            meta_description: meta_description || excerpt || '',
            keywords, featured_image,
            author: author || 'TerraBlinds',
            is_published: !!is_published,
            published_at: is_published ? new Date() : null,
            read_time: estimateReadTime(content),
        });
        res.status(201).json(post);
    } catch (err) {
        console.error('Blog create error:', err.message);
        res.status(500).json({ error: 'Error creating post' });
    }
};

exports.update = async (req, res) => {
    try {
        const post = await Blog.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const { title, excerpt, content, meta_title, meta_description, keywords, featured_image, author, is_published } = req.body;
        const wasPublished = post.is_published;

        await post.update({
            title:            title            ?? post.title,
            excerpt:          excerpt          ?? post.excerpt,
            content:          content          ?? post.content,
            meta_title:       meta_title       ?? post.meta_title,
            meta_description: meta_description ?? post.meta_description,
            keywords:         keywords         ?? post.keywords,
            featured_image:   featured_image   ?? post.featured_image,
            author:           author           ?? post.author,
            is_published:     is_published     !== undefined ? !!is_published : post.is_published,
            published_at:     is_published && !wasPublished ? new Date() : post.published_at,
            read_time:        content ? estimateReadTime(content) : post.read_time,
        });
        res.json(post);
    } catch (err) {
        console.error('Blog update error:', err.message);
        res.status(500).json({ error: 'Error updating post' });
    }
};

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

// ─── AI SEO Generator (uses Groq via Config) ─────────────────────────────────

exports.generateSEO = async (req, res) => {
    try {
        const { type, input } = req.body;
        // type: 'product' | 'blog' | 'page'
        // input: product name, topic, etc.
        if (!input) return res.status(400).json({ error: 'input is required' });

        const cfgs = await Config.findAll({ where: { key: 'groq_api_key' } });
        const cfg = cfgs.reduce((acc, c) => { acc[c.key] = c.value; return acc; }, {});
        const apiKey = cfg.groq_api_key;
        if (!apiKey || apiKey.length < 10) return res.status(503).json({ error: 'Groq API key not configured' });

        const prompts = {
            product: `Eres un experto SEO para e-commerce chileno especializado en cortinas y persianas.
Genera metadata SEO optimizada para Google Chile para el producto: "${input}"
Responde SOLO JSON válido con este formato exacto:
{
  "meta_title": "título SEO máximo 60 caracteres, incluye keyword principal y marca TerraBlinds",
  "meta_description": "meta descripción máximo 155 caracteres, incluye CTA y keyword",
  "keywords": "5 keywords separadas por coma, ordenadas por volumen de búsqueda",
  "h1": "título H1 para la página del producto",
  "excerpt": "descripción corta de 2 oraciones para cards y listados",
  "url_slug": "slug URL sin tildes ni caracteres especiales"
}`,
            blog: `Eres un experto en marketing de contenidos y SEO para el mercado chileno.
Genera un artículo de blog completo y optimizado para SEO sobre el tema: "${input}"
El artículo es para TerraBlinds.cl, empresa de cortinas y persianas a medida en Chile.
Responde SOLO JSON válido con este formato exacto:
{
  "title": "título H1 atractivo y optimizado SEO",
  "meta_title": "meta title máximo 60 caracteres",
  "meta_description": "meta descripción máximo 155 caracteres con CTA",
  "keywords": "5 keywords principales separadas por coma",
  "excerpt": "resumen de 2-3 oraciones para el listado del blog",
  "url_slug": "slug URL sin tildes",
  "content": "artículo completo en HTML básico (h2, p, ul, li, strong). Mínimo 800 palabras. Incluir introducción, 3-4 secciones con H2, tabla de datos si aplica, conclusión con CTA hacia TerraBlinds.cl"
}`,
        };

        const prompt = prompts[type] || prompts.product;
        const payload = JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.4,
        });

        const data = await new Promise((resolve, reject) => {
            const req2 = https.request({
                hostname: 'api.groq.com',
                path: '/openai/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': Buffer.byteLength(payload),
                },
            }, (response) => {
                let raw = '';
                response.on('data', chunk => raw += chunk);
                response.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid Groq response')); } });
            });
            req2.on('error', reject);
            req2.setTimeout(20000, () => { req2.destroy(); reject(new Error('Groq timeout')); });
            req2.write(payload);
            req2.end();
        });

        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return res.status(500).json({ error: 'Could not parse AI response' });
        const result = JSON.parse(jsonMatch[0]);
        res.json(result);
    } catch (err) {
        console.error('SEO generate error:', err.message);
        res.status(500).json({ error: 'Error generating SEO content' });
    }
};

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getBySlug);

// Admin
router.get('/admin/all', protect, ctrl.getAllAdmin);
router.get('/admin/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.create);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

// AI SEO Generator (admin)
router.post('/generate/seo', protect, ctrl.generateSEO);

module.exports = router;

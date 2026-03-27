const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/', ctrl.getAll);
router.get('/slug/:slug', ctrl.getBySlug);

// Admin only
router.get('/admin/all', protect, ctrl.getAllAdmin);
router.post('/', protect, ctrl.create);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;

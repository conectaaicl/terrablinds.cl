const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public
router.get('/', ctrl.getAll);
router.get('/slug/:slug', ctrl.getBySlug);

// Admin only
router.get('/admin/all', protect, restrictTo('admin'), ctrl.getAllAdmin);
router.post('/', protect, restrictTo('admin'), ctrl.create);
router.put('/:id', protect, restrictTo('admin'), ctrl.update);
router.delete('/:id', protect, restrictTo('admin'), ctrl.remove);

module.exports = router;

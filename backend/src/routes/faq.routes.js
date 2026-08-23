const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public
router.get('/', ctrl.getAll);

// Admin only
router.get('/admin', protect, restrictTo('admin'), ctrl.getAllAdmin);
router.post('/', protect, restrictTo('admin'), ctrl.create);
router.put('/:id', protect, restrictTo('admin'), ctrl.update);
router.delete('/:id', protect, restrictTo('admin'), ctrl.remove);

module.exports = router;

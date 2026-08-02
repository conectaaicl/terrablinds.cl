const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/', ctrl.getAll);

// Admin only
router.get('/admin', protect, ctrl.getAllAdmin);
router.post('/', protect, ctrl.create);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public route - only safe, non-sensitive config
router.get('/public', configController.getPublicConfig);

// Admin-only routes
router.get('/', protect, restrictTo('admin'), configController.getAllConfig);
router.put('/', protect, restrictTo('admin'), configController.updateConfig);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Demasiadas reseñas, espera un momento.' } });

// Public
router.get('/', ctrl.getPublicReviews);
router.post('/', reviewLimiter, ctrl.createReview);

// Admin
router.get('/admin', protect, ctrl.getAdminReviews);
router.patch('/admin/:id', protect, ctrl.updateReview);
router.delete('/admin/:id', protect, ctrl.deleteReview);

module.exports = router;

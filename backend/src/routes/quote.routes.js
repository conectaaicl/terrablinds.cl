const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const quoteController = require('../controllers/quote.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Rate limit for quote creation (public endpoint)
const quoteCreateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many quote requests, please try again later.' }
});

// Public route - create quote (rate limited)
router.post('/', quoteCreateLimiter, quoteController.createQuote);

// Admin-only routes
router.get('/', protect, restrictTo('admin'), quoteController.getAllQuotes);
router.get('/:id', protect, restrictTo('admin'), quoteController.getQuoteById);
router.put('/:id/status', protect, restrictTo('admin'), quoteController.updateQuoteStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quote.controller');

router.post('/', quoteController.createQuote);
router.get('/', quoteController.getAllQuotes); // TODO: Add auth middleware
router.get('/:id', quoteController.getQuoteById); // TODO: Add auth middleware
router.put('/:id/status', quoteController.updateQuoteStatus); // TODO: Add auth middleware

module.exports = router;

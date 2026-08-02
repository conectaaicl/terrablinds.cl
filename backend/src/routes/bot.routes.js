const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bot.controller');

router.get('/products', ctrl.searchProducts);
router.post('/quote', ctrl.createBotQuote);
router.get('/config', ctrl.getBotConfig);

module.exports = router;

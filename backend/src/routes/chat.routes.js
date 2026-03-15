const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/chat.controller');

const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 messages per minute per IP
    message: { error: 'Demasiadas consultas. Espera un momento.' },
});

router.post('/', chatLimiter, chat);

module.exports = router;

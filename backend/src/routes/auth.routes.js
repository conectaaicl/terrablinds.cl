const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rate limit for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

router.post('/login', loginLimiter, authController.login);
router.get('/verify', authController.verifyToken);

module.exports = router;

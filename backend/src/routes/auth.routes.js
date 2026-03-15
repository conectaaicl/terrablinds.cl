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

// Rate limit for password reset attempts
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos. Espera 15 minutos.' }
});

router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);
router.get('/verify', authController.verifyToken);

module.exports = router;

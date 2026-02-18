const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitContact } = require('../controllers/contact.controller');

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados mensajes enviados. Intente nuevamente en unos minutos.' }
});

router.post('/', contactLimiter, submitContact);

module.exports = router;

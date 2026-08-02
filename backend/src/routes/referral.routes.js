const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/referral.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/validate/:code', ctrl.validate);
router.post('/use/:code', ctrl.recordUse);

// Admin
router.get('/admin', protect, ctrl.list);
router.post('/admin', protect, ctrl.create);
router.patch('/admin/:id', protect, ctrl.update);
router.delete('/admin/:id', protect, ctrl.remove);

module.exports = router;

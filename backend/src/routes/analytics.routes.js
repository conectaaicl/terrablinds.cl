const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const analyticsCtrl = require('../controllers/analytics.controller');

router.use(protect, restrictTo('admin'));

router.get('/summary', analyticsCtrl.getSummary);

module.exports = router;

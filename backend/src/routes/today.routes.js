'use strict';

const router = require('express').Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { getToday } = require('../controllers/today.controller');

router.use(protect, restrictTo('admin'));
router.get('/', getToday);

module.exports = router;

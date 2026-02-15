const express = require('express');
const router = express.Router();
const flowController = require('../controllers/flow.controller');

router.post('/create', flowController.createPayment);
router.post('/confirm', flowController.confirmPayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

router.get('/', configController.getAllConfig);
router.get('/public', configController.getPublicConfig);
router.put('/', configController.updateConfig); // TODO: Add auth middleware

module.exports = router;

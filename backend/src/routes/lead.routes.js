const express = require('express');
const router = express.Router();
const { saveLead, getLeads, updateLead, deleteLead } = require('../controllers/lead.controller');
const { authenticateToken } = require('../middleware/auth');

// Public: save lead from chat widget
router.post('/', saveLead);

// Admin only
router.get('/', authenticateToken, getLeads);
router.patch('/:id', authenticateToken, updateLead);
router.delete('/:id', authenticateToken, deleteLead);

module.exports = router;

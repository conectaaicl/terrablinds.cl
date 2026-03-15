const express = require('express');
const router = express.Router();
const { saveLead, getLeads, updateLead, deleteLead } = require('../controllers/lead.controller');
const { protect } = require('../middleware/auth.middleware');

// Public: save lead from chat widget
router.post('/', saveLead);

// Admin only
router.get('/', protect, getLeads);
router.patch('/:id', protect, updateLead);
router.delete('/:id', protect, deleteLead);

module.exports = router;

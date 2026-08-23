const express = require('express');
const router = express.Router();
const { saveLead, getLeads, updateLead, deleteLead } = require('../controllers/lead.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public: save lead from chat widget
router.post('/', saveLead);

// Admin only
router.get('/', protect, restrictTo('admin'), getLeads);
router.patch('/:id', protect, restrictTo('admin'), updateLead);
router.delete('/:id', protect, restrictTo('admin'), deleteLead);

module.exports = router;

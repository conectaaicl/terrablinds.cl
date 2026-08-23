'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
    createFollowUp,
    listFollowUps,
    updateFollowUp,
    deleteFollowUp,
    listAllFollowUps,
} = require('../controllers/followup.controller');

const router = Router();

// All follow-up routes require admin
router.use(protect, restrictTo('admin'));

// Nested under opportunities
router.post('/opportunities/:id/follow-ups',  createFollowUp);
router.get('/opportunities/:id/follow-ups',   listFollowUps);

// Standalone follow-up operations
router.get('/follow-ups',          listAllFollowUps);
router.put('/follow-ups/:id',      updateFollowUp);
router.delete('/follow-ups/:id',   deleteFollowUp);

module.exports = router;

'use strict';

const router  = require('express').Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
    getDashboard,
    getPipeline,
    listOpportunities,
    getOpportunity,
    transitionOpp,
    listContacts,
    getContact,
    listActivity,
    getScore,
    listStale,
    getGrowthConfig,
    getHealth,
    getAlerts,
} = require('../controllers/growth.controller');

// All growth routes require an authenticated admin
router.use(protect, restrictTo('admin'));

router.get('/config',                        getGrowthConfig);
router.get('/dashboard',                     getDashboard);
router.get('/pipeline',                      getPipeline);
router.get('/health',                        getHealth);
router.get('/alerts',                        getAlerts);
router.get('/opportunities/stale',           listStale);
router.get('/opportunities',                 listOpportunities);
router.get('/opportunities/:id',             getOpportunity);
router.post('/opportunities/:id/transition', transitionOpp);
router.get('/opportunities/:id/score',       getScore);
router.get('/contacts',                      listContacts);
router.get('/contacts/:id',                  getContact);
router.get('/activity',                      listActivity);

module.exports = router;

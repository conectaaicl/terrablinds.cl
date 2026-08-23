const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/booking.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public
router.get('/availability', ctrl.getAvailability);
router.get('/blocked-days', ctrl.getBlockedDays);
router.get('/resultado', ctrl.getPaymentResult);
router.post('/', ctrl.createBooking);
router.post('/payment/confirm', ctrl.confirmPayment);
router.post('/suggest', ctrl.suggestService);

// Admin (protected)
router.get('/stats', protect, restrictTo('admin'), ctrl.getStats);
router.get('/admin', protect, restrictTo('admin'), ctrl.listBookings);
router.patch('/:id', protect, restrictTo('admin'), ctrl.updateBooking);
router.post('/blocked-days', protect, restrictTo('admin'), ctrl.blockDay);
router.delete('/blocked-days/:id', protect, restrictTo('admin'), ctrl.unblockDay);

module.exports = router;

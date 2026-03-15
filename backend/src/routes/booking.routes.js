const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/availability', ctrl.getAvailability);
router.get('/blocked-days', ctrl.getBlockedDays);
router.get('/resultado', ctrl.getPaymentResult);
router.post('/', ctrl.createBooking);
router.post('/payment/confirm', ctrl.confirmPayment);
router.post('/suggest', ctrl.suggestService);

// Admin (protected)
router.get('/stats', protect, ctrl.getStats);
router.get('/admin', protect, ctrl.listBookings);
router.patch('/:id', protect, ctrl.updateBooking);
router.post('/blocked-days', protect, ctrl.blockDay);
router.delete('/blocked-days/:id', protect, ctrl.unblockDay);

module.exports = router;

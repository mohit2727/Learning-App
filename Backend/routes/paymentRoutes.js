const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getMyPayments, razorpayCheck } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/razorpay-check', protect, razorpayCheck);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyPayments);

module.exports = router;

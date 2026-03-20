const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const Course = require('../models/courseModel');
const Test = require('../models/testModel');
const User = require('../models/userModel');
const QuizPlaylist = require('../models/quizPlaylistModel');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn('WARNING: Razorpay keys are not configured as environment variables. Payment features will not work.');
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    if (!razorpay) {
        res.status(500);
        throw new Error('Razorpay is not configured on the server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
    }

    const { itemId, itemType } = req.body;

    let item;
    if (itemType === 'Course') {
        item = await Course.findById(itemId);
    } else if (itemType === 'Test') {
        item = await Test.findById(itemId);
    } else if (itemType === 'QuizPlaylist') {
        item = await QuizPlaylist.findById(itemId);
    }

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    if (isNaN(item.price) || item.price <= 0) {
        res.status(400);
        throw new Error('This item does not have a valid price and cannot be purchased.');
    }

    const amount = Math.round(item.price * 100);

    if (amount < 100) {
        res.status(400);
        throw new Error('The item price must be at least ₹1 for online payment.');
    }

    // ─── Idempotency: return existing pending order if created < 10 min ago ──
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingPayment = await Payment.findOne({
        user: req.user._id,
        itemId,
        status: 'pending',
        createdAt: { $gte: tenMinutesAgo },
    });
    if (existingPayment) {
        return res.status(200).json({ id: existingPayment.razorpayOrderId, amount: Math.round(amount), currency: 'INR', _idempotent: true });
    }

    const options = {
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}_${itemId.toString().slice(-4)}`,
    };

    try {
        const order = await razorpay.orders.create(options);

        if (!order) {
            res.status(500);
            throw new Error('Failed to create Razorpay order');
        }

        await Payment.create({
            user: req.user._id,
            itemModel: itemType,
            itemId,
            amount: item.price,
            razorpayOrderId: order.id,
            status: 'pending',
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('RAZORPAY ERROR:', error);
        res.status(500);
        const errorMessage = error.error?.description || error.description || error.message || 'Error creating Razorpay order';
        throw new Error(errorMessage);
    }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    console.log('--- VERIFY PAYMENT DEBUG ---');
    console.log('Order ID:', razorpay_order_id);
    console.log('Payment ID:', razorpay_payment_id);
    console.log('Key Secret length:', keySecret.length);
    console.log('Expected sig:', expectedSignature);
    console.log('Received sig:', razorpay_signature);
    console.log('Match:', expectedSignature === razorpay_signature);

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) {
            res.status(404);
            throw new Error('Payment record not found');
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'completed';
        await payment.save();

        // Enroll user in course or quiz
        const user = await User.findById(req.user._id);
        if (payment.itemModel === 'Course') {
            if (!user.enrolledCourses.includes(payment.itemId)) {
                user.enrolledCourses.push(payment.itemId);
            }
        } else if (payment.itemModel === 'Test') {
            if (!user.purchasedQuizzes.includes(payment.itemId)) {
                user.purchasedQuizzes.push(payment.itemId);
            }
        } else if (payment.itemModel === 'QuizPlaylist') {
            if (!user.purchasedPlaylists.includes(payment.itemId)) {
                user.purchasedPlaylists.push(payment.itemId);
            }
        }
        await user.save();

        res.json({ success: true, message: 'Payment verified successfully' });
    } else {
        // Update payment record to failed
        await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: 'failed' }
        );

        res.status(400);
        throw new Error('Invalid payment signature');
    }
});

// @desc    Get user's payment history
// @route   GET /api/payments/my-orders
// @access  Private
const getMyPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ user: req.user._id })
        .populate({
            path: 'itemId',
            select: 'title description image price',
        })
        .sort({ createdAt: -1 });

    res.json(payments);
});

module.exports = {
    createOrder,
    verifyPayment,
    getMyPayments,
};

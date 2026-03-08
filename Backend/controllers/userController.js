const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Test = require('../models/testModel');
const Announcement = require('../models/announcementModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Clerk protected)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            age: user.age,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            role: user.role,
            enrolledCourses: user.enrolledCourses || [],
            purchasedQuizzes: user.purchasedQuizzes || [],
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Sync user after Clerk login (called by client after first sign-in)
// @route   POST /api/users/sync
// @access  Private (Clerk protected)
const syncUser = asyncHandler(async (req, res) => {
    // The authMiddleware already creates or finds the user
    // Just return the profile
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        role: req.user.role,
        enrolledCourses: req.user.enrolledCourses || [],
        purchasedQuizzes: req.user.purchasedQuizzes || [],
    });
});

// @desc    Get leaderboard (top 10 active students by totalScore)
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    // We only want students on the leaderboard, not admins
    const topUsers = await User.find({ role: 'student' })
        .sort({ totalScore: -1 })
        .limit(10)
        .select('name totalScore');

    res.json(topUsers);
});

const TestAttempt = require('../models/testAttemptModel');

// @desc    Get admin dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const studentCount = await User.countDocuments({ role: 'student' });
    const paidUserCount = await User.countDocuments({ role: 'student', isPaid: true });
    const activeCourseCount = await Course.countDocuments({ isActive: true });
    const quizCount = await Test.countDocuments({});

    // Fetch recent admin activities
    const [recentQuizzes, recentCourses, recentAnnouncements] = await Promise.all([
        Test.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
        Course.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
        Announcement.find().sort({ createdAt: -1 }).limit(5).select('title createdAt')
    ]);

    const activities = [
        ...recentQuizzes.map(q => ({
            title: `Quiz Generated: "${q.title}"`,
            time: q.createdAt,
            type: 'quiz',
            color: 'bg-purple-500'
        })),
        ...recentCourses.map(c => ({
            title: `Course Uploaded: "${c.title}"`,
            time: c.createdAt,
            type: 'course',
            color: 'bg-amber-500'
        })),
        ...recentAnnouncements.map(a => ({
            title: `Announcement Posted: "${a.title}"`,
            time: a.createdAt,
            type: 'announcement',
            color: 'bg-blue-500'
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    res.json({
        students: studentCount,
        paidUsers: paidUserCount,
        courses: activeCourseCount,
        quizzes: quizCount,
        recentActivities: activities,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.mobile = req.body.mobile ?? user.mobile;
        user.age = req.body.age ?? user.age;
        user.city = req.body.city ?? user.city;
        user.state = req.body.state ?? user.state;
        user.pincode = req.body.pincode ?? user.pincode;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            age: updatedUser.age,
            city: updatedUser.city,
            state: updatedUser.state,
            pincode: updatedUser.pincode,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user's enrolled courses
// @route   GET /api/users/my-courses
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
    // Currently relying on all active courses being accessible
    // In a fully developed app with payments, you'd filter by enrollments
    const courses = await Course.find({ isActive: true })
        .populate('instructor', 'name');
    res.json(courses);
});

// @desc    Get user's test attempts
// @route   GET /api/users/my-attempts
// @access  Private
const getMyAttempts = asyncHandler(async (req, res) => {
    const TestAttempt = require('../models/testAttemptModel');
    const attempts = await TestAttempt.find({ user: req.user._id })
        .populate('test', 'title duration')
        .sort({ createdAt: -1 });
    res.json(attempts);
});

module.exports = {
    getUserProfile,
    syncUser,
    getLeaderboard,
    getDashboardStats,
    updateUserProfile,
    getMyCourses,
    getMyAttempts,
};

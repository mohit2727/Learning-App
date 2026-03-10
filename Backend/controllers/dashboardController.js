const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    // Return specific user stats rather than global stats for the dashboard
    const user = await User.findById(req.user._id);
    const enrolledCoursesCount = user ? (user.enrolledCourses?.length || 0) : 0;

    const TestAttempt = require('../models/testAttemptModel');
    const uniqueTests = await TestAttempt.distinct('test', { user: req.user._id });
    const quizzesTakenCount = uniqueTests.length;

    // Get newest courses
    const newestCourses = await Course.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('instructor', 'name');

    res.json({
        stats: {
            enrolled: enrolledCoursesCount,
            quizzesTaken: quizzesTakenCount,
        },
        newestCourses,
    });
});

module.exports = {
    getDashboardStats,
};

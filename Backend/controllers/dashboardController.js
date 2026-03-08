const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const courseCount = await Course.countDocuments({ isActive: true });
    const studentCount = await User.countDocuments({ role: 'student' });

    // Get newest courses
    const newestCourses = await Course.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('instructor', 'name');

    res.json({
        stats: {
            courses: courseCount,
            students: studentCount,
        },
        newestCourses,
    });
});

module.exports = {
    getDashboardStats,
};

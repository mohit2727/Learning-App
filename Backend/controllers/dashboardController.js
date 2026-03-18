const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const QuizPlaylist = require('../models/quizPlaylistModel');
const TestAttempt = require('../models/testAttemptModel');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    // 1. Total Enrolled Items (Courses + QuizPlaylists)
    const enrolledCoursesCount = user ? (user.enrolledCourses?.length || 0) : 0;
    const purchasedPlaylistsCount = user ? (user.purchasedQuizzes?.length || 0) : 0; // assuming this field stores QuizPlaylist IDs as per userController
    const totalEnrolled = enrolledCoursesCount + purchasedPlaylistsCount;

    // 2. Total Available Playlists (Active)
    const activeCoursesCount = await Course.countDocuments({ isActive: true });
    const activeQuizPlaylistsCount = await QuizPlaylist.countDocuments({ isActive: true });
    const totalPlaylistsAvailable = activeCoursesCount + activeQuizPlaylistsCount;

    // 3. Quizzes Taken (Unique tests attempted)
    const uniqueTests = await TestAttempt.distinct('test', { user: req.user._id });
    const quizzesTakenCount = uniqueTests.length;

    // 4. Latest Content (Merged newest Courses and QuizPlaylists)
    const newestCourses = await Course.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    
    const newestQuizPlaylists = await QuizPlaylist.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    // Map types for frontend differentiation
    const coursesMapped = newestCourses.map(c => ({ ...c, contentType: 'video' }));
    const quizPlaylistsMapped = newestQuizPlaylists.map(q => ({ ...q, contentType: 'quiz' }));

    const latestContent = [...coursesMapped, ...quizPlaylistsMapped]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    res.json({
        stats: {
            totalPlaylists: totalPlaylistsAvailable,
            enrolled: totalEnrolled,
            quizzesTaken: quizzesTakenCount,
        },
        latestContent,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

module.exports = {
    getDashboardStats,
};

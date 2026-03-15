const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Test = require('../models/testModel');
const Announcement = require('../models/announcementModel');
const admin = require('../config/firebase-admin');

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Delete from Firebase Auth if firebaseUid exists
        if (user.firebaseUid) {
            try {
                await admin.auth().deleteUser(user.firebaseUid);
                console.log('User deleted from Firebase Auth:', user.firebaseUid);
            } catch (fbError) {
                // If user is already deleted from Firebase, we can ignore and continue
                console.error('Error deleting user from Firebase:', fbError.message);
            }
        }

        // Delete their test attempts
        await TestAttempt.deleteMany({ user: user._id });
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
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

// @desc    Sync user after Clerk/Firebase login (called by client after first sign-in)
// @route   POST /api/users/sync
// @access  Private (Requires Firebase Auth token)
const syncUser = asyncHandler(async (req, res) => {
    let user = req.user;

    // If user doesn't exist in DB but they have a valid Firebase UID (attached by authMiddleware)
    // Create the user explicitly here.
    if (!user && req.firebaseUid) {
        user = await User.create({
            firebaseUid: req.firebaseUid,
            name: 'New User',
            email: `${req.firebaseUid}@placeholder.com`,
            mobile: req.firebaseMobile || '',
            role: 'student'
        });
        console.log('Successfully auto-created missing user via /sync:', user.firebaseUid);
    } else if (!user) {
         res.status(401);
         throw new Error('Not authorized');
    }

    // Return the profile
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        enrolledCourses: user.enrolledCourses || [],
        purchasedQuizzes: user.purchasedQuizzes || [],
    });
});

// @desc    Get leaderboard (top students for the currently active quiz)
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    // 1. Find the test marking "isLeaderboardActive"
    const activeTest = await Test.findOne({ isLeaderboardActive: true });

    if (!activeTest) {
        // Fallback to global total score if no quiz is specific
        const topUsers = await User.find({ role: 'student' })
            .sort({ totalScore: -1 })
            .limit(10)
            .select('name totalScore');
        return res.json({ quizTitle: 'Global Leaderboard', rankings: topUsers });
    }

    // 2. Fetch all attempts for this test
    const TestAttempt = require('../models/testAttemptModel');
    const attempts = await TestAttempt.find({ test: activeTest._id })
        .populate('user', 'name')
        .sort({ score: -1 });

    // 3. Filter to only show each student once (unique student with highest score)
    const uniqueRankings = [];
    const seenUsers = new Set();

    for (const attempt of attempts) {
        if (attempt.user && !seenUsers.has(attempt.user._id.toString())) {
            uniqueRankings.push({
                _id: attempt.user._id,
                name: attempt.user.name,
                score: attempt.score,
                timeSpent: attempt.timeSpent
            });
            seenUsers.add(attempt.user._id.toString());
        }
        if (uniqueRankings.length >= 20) break; // Top 20 for specific quiz
    }

    res.json({
        quizTitle: activeTest.title,
        rankings: uniqueRankings
    });
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
        user.name = req.body.name ?? user.name;
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'student' })
        .sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Get detailed user info for admin
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('enrolledCourses', 'title')
        .populate('purchasedQuizzes', 'title')
        .populate('purchasedPlaylists', 'title');

    if (user) {
        // Fetch all attempts sorted oldest to newest to find the FIRST attempt easily
        const allAttempts = await TestAttempt.find({ user: user._id })
            .populate('test', 'title totalMarks')
            .sort({ createdAt: 1 });

        // Filter to keep only the FIRST attempt per test
        const firstAttemptsMap = new Map();
        for (const attempt of allAttempts) {
            if (attempt.test && !firstAttemptsMap.has(attempt.test._id.toString())) {
                firstAttemptsMap.set(attempt.test._id.toString(), attempt);
            }
        }
        
        // Convert map back to array and sort newest first for display
        const attempts = Array.from(firstAttemptsMap.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Calculate if user is paid
        const isPaid = (user.purchasedQuizzes && user.purchasedQuizzes.length > 0) || 
                       (user.purchasedPlaylists && user.purchasedPlaylists.length > 0) ||
                       (user.enrolledCourses && user.enrolledCourses.length > 0);

        res.json({
            ...user._doc,
            isPaid,
            attempts
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update any user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserAdmin = asyncHandler(async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    email: req.body.email,
                    age: req.body.age,
                    city: req.body.city,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    role: req.body.role,
                }
            },
            { new: true, runValidators: true }
        );

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(error.name === 'ValidationError' ? 400 : 500);
        throw new Error(error.message);
    }
});

// @desc    Grant access to a specific item (Course/Quiz/Playlist)
// @route   PUT /api/users/:id/access
// @access  Private/Admin
const grantUserAccess = asyncHandler(async (req, res) => {
    const { itemId, type } = req.body;
    // type should be 'course', 'quiz', or 'playlist'

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'course') {
        if (!user.enrolledCourses.includes(itemId)) {
            user.enrolledCourses.push(itemId);
        }
    } else if (type === 'quiz') {
        if (!user.purchasedQuizzes.includes(itemId)) {
            user.purchasedQuizzes.push(itemId);
        }
    } else if (type === 'playlist') {
        if (!user.purchasedPlaylists.includes(itemId)) {
            user.purchasedPlaylists.push(itemId);
        }
    } else {
        res.status(400);
        throw new Error('Invalid item type specified');
    }

    const updatedUser = await user.save();
    
    // Return updated populated arrays for the frontend
    const populatedUser = await User.findById(updatedUser._id)
        .populate('enrolledCourses', 'title')
        .populate('purchasedQuizzes', 'title')
        .populate('purchasedPlaylists', 'title');

    res.json(populatedUser);
});

module.exports = {
    getUserProfile,
    syncUser,
    getLeaderboard,
    getDashboardStats,
    updateUserProfile,
    getMyCourses,
    getMyAttempts,
    getUsers,
    getUserById,
    updateUserAdmin,
    deleteUser,
    grantUserAccess,
};

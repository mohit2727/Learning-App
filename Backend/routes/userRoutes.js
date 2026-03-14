const express = require('express');
const router = express.Router();
const {
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
    grantUserAccess
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/sync', protect, syncUser);
router.get('/leaderboard', getLeaderboard);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.get('/my-courses', protect, getMyCourses);
router.get('/my-attempts', protect, getMyAttempts);
router.get('/dashboard-stats', protect, admin, getDashboardStats);

// Admin routes
router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUserAdmin)
    .delete(protect, admin, deleteUser);

router.put('/:id/access', protect, admin, grantUserAccess);

module.exports = router;

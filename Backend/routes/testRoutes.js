const express = require('express');
const router = express.Router();
const {
    getTests,
    getTestById,
    createTest,
    updateTestStatus,
    updateLeaderboardStatus,
    updateTestLockStatus,
    updateTest,
    submitTest,
    deleteTest,
    getTestLeaderboardAdmin,
    getMergedTestLeaderboardsAdmin
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getTests);
router.post('/submit', protect, submitTest);
router.get('/:id', protect, getTestById);
router.post('/', protect, admin, createTest);
router.put('/:id', protect, admin, updateTest);
router.put('/:id/status', protect, admin, updateTestStatus);
router.put('/:id/lock', protect, admin, updateTestLockStatus);
router.put('/:id/leaderboard', protect, admin, updateLeaderboardStatus);
router.get('/:id/leaderboard', protect, admin, getTestLeaderboardAdmin);
router.post('/merged-leaderboard', protect, admin, getMergedTestLeaderboardsAdmin);
router.delete('/:id', protect, admin, deleteTest);

module.exports = router;

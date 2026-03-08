const express = require('express');
const router = express.Router();
const {
    getTests,
    getTestById,
    createTest,
    updateTestStatus,
    updateTest,
    submitTest,
    deleteTest,
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getTests);
router.post('/submit', protect, submitTest);
router.get('/:id', protect, getTestById);
router.post('/', protect, admin, createTest);
router.put('/:id', protect, admin, updateTest);
router.put('/:id/status', protect, admin, updateTestStatus);
router.delete('/:id', protect, admin, deleteTest);

module.exports = router;

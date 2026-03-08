const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourseStatus,
    addLesson,
    deleteLesson,
    deleteCourse,
    updateCourse,
    updateLesson,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourseById);
router.post('/', protect, admin, createCourse);
router.put('/:id/status', protect, admin, updateCourseStatus);
router.post('/:id/lessons', protect, admin, addLesson);
router.delete('/:id/lessons/:lessonId', protect, admin, deleteLesson);
router.put('/:id/lessons/:lessonId', protect, admin, updateLesson);
router.delete('/:id', protect, admin, deleteCourse);
router.put('/:id', protect, admin, updateCourse);

module.exports = router;

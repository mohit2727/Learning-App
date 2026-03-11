const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const { invalidateCache } = require('../middleware/cacheMiddleware');

// @desc    Get all courses (Active only for students)
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
    let query = {};
    // If not admin, only show active courses
    if (!req.user || req.user.role !== 'admin') {
        query.isActive = true;
    }
    const courses = await Course.find(query).populate('instructor', 'name');
    res.json(courses);
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name')
        .lean();

    if (course) {
        // Check if current user is enrolled
        const isEnrolled = req.user && req.user.enrolledCourses
            ? req.user.enrolledCourses.some(id => id.toString() === req.params.id)
            : false;

        res.json({ ...course, isEnrolled });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Create a course (Playlist)
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, image, price } = req.body;

    const course = new Course({
        title,
        description,
        instructor: req.user._id,
        image,
        price,
        isActive: false, // Default to false
    });

    const createdCourse = await course.save();
    invalidateCache('/courses');
    res.status(201).json(createdCourse);
});

// @desc    Update course status
// @route   PUT /api/courses/:id/status
// @access  Private/Admin
const updateCourseStatus = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        course.isActive = req.body.isActive !== undefined ? req.body.isActive : !course.isActive;
        const updatedCourse = await course.save();
        invalidateCache('/courses');
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Add lesson (Video) to course
// @route   POST /api/courses/:id/lessons
// @access  Private/Admin
const addLesson = asyncHandler(async (req, res) => {
    const { title, content, videoUrl, image, order } = req.body;
    const course = await Course.findById(req.params.id);

    if (course) {
        const lesson = {
            title,
            content,
            videoUrl,
            image,
            order: order || course.lessons.length,
            isActive: true,
        };

        course.lessons.push(lesson);
        await course.save();
        invalidateCache('/courses');
        res.status(201).json(course);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        await course.deleteOne();
        invalidateCache('/courses');
        res.json({ message: 'Course removed' });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Delete a lesson (Video) from course
// @route   DELETE /api/courses/:id/lessons/:lessonId
// @access  Private/Admin
const deleteLesson = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        course.lessons = course.lessons.filter(
            (lesson) => lesson._id.toString() !== req.params.lessonId
        );
        await course.save();
        invalidateCache('/courses');
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Update a course (Playlist)
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
    const { title, description, image, price } = req.body;
    const course = await Course.findById(req.params.id);

    if (course) {
        course.title = title || course.title;
        course.description = description || course.description;
        course.image = image || course.image;
        course.price = price !== undefined ? price : course.price;

        const updatedCourse = await course.save();
        invalidateCache('/courses');
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Update a lesson (Video) in course
// @route   PUT /api/courses/:id/lessons/:lessonId
// @access  Private/Admin
const updateLesson = asyncHandler(async (req, res) => {
    const { title, content, videoUrl, image, order, isActive } = req.body;
    const course = await Course.findById(req.params.id);

    if (course) {
        const lesson = course.lessons.id(req.params.lessonId);

        if (lesson) {
            lesson.title = title || lesson.title;
            lesson.content = content || lesson.content;
            lesson.videoUrl = videoUrl || lesson.videoUrl;
            lesson.image = image || lesson.image;
            lesson.order = order !== undefined ? order : lesson.order;
            lesson.isActive = isActive !== undefined ? isActive : lesson.isActive;

            await course.save();
            invalidateCache('/courses');
            res.json(course);
        } else {
            res.status(404);
            throw new Error('Lesson not found');
        }
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourseStatus,
    addLesson,
    deleteLesson,
    deleteCourse,
    updateCourse,
    updateLesson,
};

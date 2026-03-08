const asyncHandler = require('express-async-handler');
const Test = require('../models/testModel');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
const getTests = asyncHandler(async (req, res) => {
    let query = {};
    if (!req.user || req.user.role !== 'admin') {
        query.isActive = true;
    }
    const tests = await Test.find(query).populate('course', 'title');
    res.json(tests);
});

// @desc    Get test by ID
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id).populate('course', 'title');

    if (test) {
        res.json(test);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Create a test
// @route   POST /api/tests
// @access  Private/Admin
const createTest = asyncHandler(async (req, res) => {
    const {
        title,
        course,
        questions,
        duration,
        totalMarks,
        totalQuestions,
        negativeMarkingEnabled,
        negativeRatio
    } = req.body;

    const test = new Test({
        title,
        course,
        questions,
        duration,
        totalMarks: totalMarks || 0,
        totalQuestions: totalQuestions || questions?.length || 0,
        negativeMarkingEnabled: negativeMarkingEnabled || false,
        negativeRatio: negativeRatio || 0.25,
        isActive: false,
    });

    const createdTest = await test.save();
    res.status(201).json(createdTest);
});

// @desc    Update test status
// @route   PUT /api/tests/:id/status
// @access  Private/Admin
const updateTestStatus = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        test.isActive = req.body.isActive !== undefined ? req.body.isActive : !test.isActive;
        const updatedTest = await test.save();
        res.json(updatedTest);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Submit test score
// @route   POST /api/tests/submit
// @access  Private
const submitTest = asyncHandler(async (req, res) => {
    const { testId, answers } = req.body; // answers: [{ questionId, selectedOption }]

    if (!testId || !answers || !Array.isArray(answers)) {
        res.status(400);
        throw new Error('Please provide testId and an array of answers');
    }

    const test = await Test.findById(testId);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const marksPerQuestion = test.marksPerQuestion;
    const negRatio = test.negativeRatio || 0;
    const isNegativeEnabled = test.negativeMarkingEnabled;

    let totalScore = 0;
    const formattedAnswers = [];

    // Map questions for quick lookup
    const questionMap = {};
    test.questions.forEach(q => {
        questionMap[q._id.toString()] = q;
    });

    // Calculate score
    answers.forEach(ans => {
        const question = questionMap[ans.questionId];
        if (question) {
            if (ans.selectedOption === question.correctOption) {
                totalScore += marksPerQuestion;
            } else if (ans.selectedOption !== null && ans.selectedOption !== undefined && isNegativeEnabled) {
                totalScore -= (marksPerQuestion * negRatio);
            }

            formattedAnswers.push({
                questionId: ans.questionId,
                selectedOption: ans.selectedOption
            });
        }
    });

    // Ensure score doesn't go below 0 if that's a requirement (optional)
    // totalScore = Math.max(0, totalScore);

    const user = req.user;
    user.totalScore += totalScore;
    await user.save();

    const TestAttempt = require('../models/testAttemptModel');
    const attempt = await TestAttempt.create({
        user: user._id,
        test: testId,
        score: totalScore,
        totalMarks: test.totalMarks,
        answers: formattedAnswers
    });

    res.json({
        message: 'Test score submitted successfully',
        score: totalScore,
        totalMarks: test.totalMarks,
        newTotalUserScore: user.totalScore,
        attemptId: attempt._id
    });
});

// @desc    Update a test
// @route   PUT /api/tests/:id
// @access  Private/Admin
const updateTest = asyncHandler(async (req, res) => {
    const {
        title,
        duration,
        totalMarks,
        totalQuestions,
        negativeMarkingEnabled,
        negativeRatio,
        isActive
    } = req.body;

    const test = await Test.findById(req.params.id);

    if (test) {
        test.title = title || test.title;
        test.duration = duration !== undefined ? Number(duration) : test.duration;
        test.totalMarks = totalMarks !== undefined ? Number(totalMarks) : test.totalMarks;
        test.totalQuestions = totalQuestions !== undefined ? Number(totalQuestions) : test.totalQuestions;
        test.negativeMarkingEnabled = negativeMarkingEnabled !== undefined ? negativeMarkingEnabled : test.negativeMarkingEnabled;
        test.negativeRatio = negativeRatio !== undefined ? Number(negativeRatio) : test.negativeRatio;
        test.isActive = isActive !== undefined ? isActive : test.isActive;

        const updatedTest = await test.save();
        res.json(updatedTest);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
const deleteTest = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        await test.deleteOne();
        res.json({ message: 'Test removed' });
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

module.exports = {
    getTests,
    getTestById,
    createTest,
    updateTestStatus,
    updateTest,
    submitTest,
    deleteTest,
};

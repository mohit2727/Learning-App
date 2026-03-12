const asyncHandler = require('express-async-handler');
const Test = require('../models/testModel');
const { invalidateCache } = require('../middleware/cacheMiddleware');

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
        negativeRatio,
        price
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
        price: Number(price) || 0,
        isActive: false,
    });

    const createdTest = await test.save();
    invalidateCache('/tests');
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
        invalidateCache('/tests');
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

    const totalMarks = test.totalMarks > 0 ? test.totalMarks : (test.questions?.length || 1);
    const totalQuestions = test.totalQuestions || test.questions.length || 1; // Prevent division by zero
    const marksPerQuestion = totalMarks / totalQuestions;

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

    // Time Bonus Logic: Reward students who finish faster
    // Only if they got at least 50% of the questions right to avoid rushing
    const { timeSpent } = req.body; // In seconds
    const totalTimeAllowed = (test.duration || 0) * 60;

    if (timeSpent && timeSpent < totalTimeAllowed && totalScore >= (totalMarks / 2)) {
        // Bonus = (Percent of time saved) * (Total Marks) * 0.1
        // Example: Saved 50% of time -> 5% bonus points.
        const timeSavedRatio = (totalTimeAllowed - timeSpent) / totalTimeAllowed;
        const timeBonus = totalMarks * 0.1 * timeSavedRatio;
        totalScore += timeBonus;
    }

    // Round to 2 decimal places
    totalScore = Math.round(totalScore * 100) / 100;

    try {
        const user = req.user;
        const TestAttempt = require('../models/testAttemptModel');

        // Check past attempts to prevent infinite score farming
        const pastAttempts = await TestAttempt.find({ user: user._id, test: testId });

        // Calculate how many points to add to the user's leaderboard total
        let scoreDelta = 0;
        if (pastAttempts.length === 0) {
            scoreDelta = totalScore; // Only first time taking the test adds to leaderboard
        } else {
            // Retries do not add points to the leaderboard totalScore
            scoreDelta = 0;
        }

        if (scoreDelta > 0) {
            user.totalScore = (user.totalScore || 0) + scoreDelta;
            await user.save();
        }

        const attempt = await TestAttempt.create({
            user: user._id,
            test: testId,
            score: totalScore,
            totalMarks: test.totalMarks,
            answers: formattedAnswers,
            timeSpent: timeSpent || 0
        });

        res.json({
            message: 'Test score submitted successfully',
            score: totalScore,
            totalMarks: test.totalMarks,
            newTotalUserScore: user.totalScore,
            attemptId: attempt._id
        });
    } catch (error) {
        res.status(500);
        throw new Error('Error saving test attempt: ' + error.message);
    }
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
        isActive,
        price
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
        test.price = price !== undefined ? Number(price) : test.price;

        const updatedTest = await test.save();
        invalidateCache('/tests');
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
        invalidateCache('/tests');
        res.json({ message: 'Test removed' });
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Update test leaderboard status (toggle isLeaderboardActive)
// @route   PUT /api/tests/:id/leaderboard
// @access  Private/Admin
const updateLeaderboardStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    // If we are activating this one, deactivate all others
    if (isActive) {
        await Test.updateMany({}, { isLeaderboardActive: false });
    }

    const test = await Test.findById(req.params.id);

    if (test) {
        test.isLeaderboardActive = isActive;
        const updatedTest = await test.save();
        res.json(updatedTest);
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
    updateLeaderboardStatus,
    updateTest,
    submitTest,
    deleteTest,
};

const asyncHandler = require('express-async-handler');
const Test = require('../models/testModel');
const { invalidateCache } = require('../middleware/cacheMiddleware');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
const getTests = asyncHandler(async (req, res) => {
    let query = {};
    if (!req.user || req.user.role !== 'admin') {
        query.isActive = true;
    }
    const tests = await Test.find(query).populate('course', 'title');

    // If student, check purchase status and handle locking
    if (req.user && req.user.role !== 'admin') {
        const QuizPlaylist = require('../models/quizPlaylistModel');
        const userPlaylists = await QuizPlaylist.find({
            _id: { $in: req.user.purchasedPlaylists || [] }
        });
        const playlistQuizIds = userPlaylists.reduce((acc, p) => acc.concat(p.quizzes.map(id => id.toString())), []);

        const processedTests = tests.map(t => {
            const testObj = t.toObject();
            testObj.isPurchased = req.user.purchasedQuizzes?.some(id => id.toString() === testObj._id.toString()) || 
                                 playlistQuizIds.includes(testObj._id.toString());
            
            // Hide questions always for student in list view
            delete testObj.questions;
            return testObj;
        });
        return res.json(processedTests);
    }

    res.json(tests);
});

// @desc    Get test by ID
// @route   GET /api/tests/:id
// @access  Private
const getTestById = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id).populate('course', 'title');

    if (test) {
        // Access Control: Check if test is FREE or user is ADMIN or user has PURCHASED it
        let hasAccess = false;
        
        if (test.price === 0 || (req.user && req.user.role === 'admin')) {
            hasAccess = true;
        } else if (req.user) {
            // Check individual purchase
            if (req.user.purchasedQuizzes && req.user.purchasedQuizzes.some(id => id.toString() === test._id.toString())) {
                hasAccess = true;
            } else {
                // Check if any of user's purchased playlists contain this test
                const QuizPlaylist = require('../models/quizPlaylistModel');
                const playlists = await QuizPlaylist.find({
                    _id: { $in: req.user.purchasedPlaylists || [] },
                    quizzes: test._id
                });
                if (playlists.length > 0) {
                    hasAccess = true;
                }
            }
        }

        if (hasAccess) {
            // STRICT LOCK ENFORCEMENT: Even if purchased, if it's locked by admin, students can't fetch it
            if (test.isLocked && (!req.user || req.user.role !== 'admin')) {
                res.status(403);
                throw new Error('This quiz is currently locked by the admin. Please wait for it to be unlocked.');
            }
            res.json(test);
        } else {
            res.status(403);
            throw new Error('You do not have access to this quiz. Please purchase it or the corresponding playlist.');
        }
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
        isLocked: true, // Default to locked
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

    const { timeSpent } = req.body; // In seconds

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
        test.isLocked = req.body.isLocked !== undefined ? req.body.isLocked : test.isLocked;
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

// @desc    Update test lock status
// @route   PUT /api/tests/:id/lock
// @access  Private/Admin
const updateTestLockStatus = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);

    if (test) {
        test.isLocked = req.body.isLocked !== undefined ? req.body.isLocked : !test.isLocked;
        const updatedTest = await test.save();
        invalidateCache('/tests');
        res.json(updatedTest);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Get leaderboard for a specific test (Admin)
// @route   GET /api/tests/:id/leaderboard
// @access  Private/Admin
const getTestLeaderboardAdmin = asyncHandler(async (req, res) => {
    const testId = req.params.id;
    const test = await Test.findById(testId);

    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const TestAttempt = require('../models/testAttemptModel');
    const attempts = await TestAttempt.find({ test: testId })
        .populate('user', 'name email role')
        .sort({ score: -1, timeSpent: 1 }); // Sort by score DESC, then timeSpent ASC for ties

    const uniqueRankings = [];
    const seenUsers = new Set();

    for (const attempt of attempts) {
        if (attempt.user && attempt.user.role === 'student' && !seenUsers.has(attempt.user._id.toString())) {
            uniqueRankings.push({
                _id: attempt.user._id,
                name: attempt.user.name,
                email: attempt.user.email,
                score: attempt.score,
                timeSpent: attempt.timeSpent,
                submittedAt: attempt.createdAt
            });
            seenUsers.add(attempt.user._id.toString());
        }
    }

    res.json({
        quizTitle: test.title,
        totalMarks: test.totalMarks,
        rankings: uniqueRankings
    });
});

module.exports = {
    getTests,
    getTestById,
    createTest,
    updateTestStatus,
    updateLeaderboardStatus,
    updateTestLockStatus,
    updateTest,
    submitTest,
    deleteTest,
    getTestLeaderboardAdmin
};

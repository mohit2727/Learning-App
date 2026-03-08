const asyncHandler = require('express-async-handler');
const Test = require('../models/testModel');
const { extractTextFromFile } = require('../utils/fileParser');
const { generateQuestionsFromText } = require('../services/quizGeneratorService');
const fs = require('fs');

// @desc    Upload file and generate quiz
// @route   POST /api/upload/quiz
// @access  Private/Admin
const uploadAndGenerateQuiz = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const {
        title,
        duration,
        totalMarks,
        negativeMarkingEnabled,
        negativeRatio
    } = req.body;

    if (!title || !duration) {
        // Cleanup uploaded file if validation fails
        if (req.file.path) fs.unlinkSync(req.file.path);
        res.status(400);
        throw new Error('Please provide title and duration for the quiz');
    }

    try {
        // 1. Extract text from file
        const text = await extractTextFromFile(req.file);

        // 2. Generate questions via AI
        const questions = await generateQuestionsFromText(text);

        // 3. Save to database
        const test = new Test({
            title,
            questions,
            duration: Number(duration),
            totalMarks: Number(totalMarks) || 0,
            totalQuestions: questions.length,
            negativeMarkingEnabled: negativeMarkingEnabled === 'true' || negativeMarkingEnabled === true,
            negativeRatio: Number(negativeRatio) || 0.25,
            fileSource: req.file.originalname,
            isActive: false, // Admin needs to manually turn it ON
        });

        const createdTest = await test.save();

        // Cleanup: remove the uploaded file from server after processing
        if (req.file.path) fs.unlinkSync(req.file.path);

        res.status(201).json(createdTest);
    } catch (error) {
        // Cleanup on error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload Process Complete Error:', error);
        console.error('Error Stack:', error.stack);
        res.status(500);
        throw new Error(error.message || 'Failed to process file and generate quiz');
    }
});

module.exports = { uploadAndGenerateQuiz };

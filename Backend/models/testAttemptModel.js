const mongoose = require('mongoose');

const testAttemptSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        test: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Test',
        },
        score: {
            type: Number,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId },
                selectedOption: { type: Number }, // Index of the option
            }
        ],
    },
    {
        timestamps: true,
    }
);

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;

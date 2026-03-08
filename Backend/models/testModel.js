const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true }, // Index of the correct option
});

const testSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Course',
        },
        questions: [questionSchema],
        totalQuestions: {
            type: Number,
            required: true,
            default: 0,
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 0,
        },
        marksPerQuestion: {
            type: Number,
            required: true,
            default: 0,
        },
        negativeMarkingEnabled: {
            type: Boolean,
            default: false,
        },
        negativeRatio: {
            type: Number,
            default: 0.25, // 1/4, 1/3, 1/2 etc
        },
        duration: {
            type: Number, // In minutes
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        fileSource: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

testSchema.pre('save', function () {
    if (this.totalQuestions > 0) {
        this.marksPerQuestion = this.totalMarks / this.totalQuestions;
    }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;

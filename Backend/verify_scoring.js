const mongoose = require('mongoose');
const Test = require('./models/testModel');
const User = require('./models/userModel');
const TestAttempt = require('./models/testAttemptModel');

const runTest = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ravina_app');
        console.log('Connected to DB');

        // 1. Create a dummy user if not exists
        let user = await User.findOne({ email: 'test_scorer@example.com' });
        if (!user) {
            user = await User.create({
                firebaseUid: 'test_scorer_firebase',
                name: 'Test Scorer',
                email: 'test_scorer@example.com',
                role: 'student'
            });
        }
        const initialUserScore = user.totalScore;

        // 2. Create a test with negative marking
        // totalQuestions = 4, totalMarks = 8 -> marksPerQuestion = 2
        // negativeRatio = 0.5 -> negativeMarks = 1
        const test = new Test({
            title: "Verification Negative Marking Test",
            duration: 10,
            totalQuestions: 4,
            totalMarks: 8,
            negativeMarkingEnabled: true,
            negativeRatio: 0.5,
            questions: [
                { text: "Q1", options: ["A", "B"], correctOption: 0 },
                { text: "Q2", options: ["A", "B"], correctOption: 0 },
                { text: "Q3", options: ["A", "B"], correctOption: 0 },
                { text: "Q4", options: ["A", "B"], correctOption: 0 },
            ]
        });
        await test.save();
        console.log('Created Test:', test.title, 'MarksPerQuestion:', test.marksPerQuestion);

        // 3. Simulate Submission
        // 2 Correct (Q1, Q2) -> 2 * 2 = 4
        // 1 Wrong (Q3) -> - (2 * 0.5) = -1
        // 1 Unattempted (Q4 omitted) -> 0
        // Expected totalScore = 4 - 1 = 3
        const answers = [
            { questionId: test.questions[0]._id, selectedOption: 0 }, // Correct
            { questionId: test.questions[1]._id, selectedOption: 0 }, // Correct
            { questionId: test.questions[2]._id, selectedOption: 1 }, // Wrong
            // Q4 unattempted
        ];

        // Mocking the logic from submitTest controller segment
        const marksPerQuestion = test.marksPerQuestion;
        const negRatio = test.negativeRatio;
        let calculatedScore = 0;

        const questionMap = {};
        test.questions.forEach(q => questionMap[q._id.toString()] = q);

        answers.forEach(ans => {
            const question = questionMap[ans.questionId.toString()];
            if (question) {
                if (ans.selectedOption === question.correctOption) {
                    calculatedScore += marksPerQuestion;
                } else if (ans.selectedOption !== null && ans.selectedOption !== undefined) {
                    calculatedScore -= (marksPerQuestion * negRatio);
                }
            }
        });

        console.log('Calculated Score:', calculatedScore);
        if (calculatedScore === 3) {
            console.log('✅ VERIFICATION SUCCESSFUL: Score is exactly 3 (2*2 - 1*1)');
        } else {
            console.error('❌ VERIFICATION FAILED: Expected 3, got', calculatedScore);
        }

        // Clean up
        await Test.findByIdAndDelete(test._id);
        // await User.findByIdAndDelete(user._id);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTest();

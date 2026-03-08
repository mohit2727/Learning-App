const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = "mongodb://localhost:27017/ravina";

const dummyStudents = [
    { clerkId: 'dummy_1', name: 'Alice Smith', email: 'alice@example.com', role: 'student', totalScore: 85 },
    { clerkId: 'dummy_2', name: 'Bob Johnson', email: 'bob@example.com', role: 'student', totalScore: 92 },
    { clerkId: 'dummy_3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'student', totalScore: 78 },
    { clerkId: 'dummy_4', name: 'Diana Prince', email: 'diana@example.com', role: 'student', totalScore: 95 },
    { clerkId: 'dummy_5', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'student', totalScore: 88 }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Check if dummies exist to prevent duplicates
        const exist = await User.findOne({ clerkId: 'dummy_1' });
        if (!exist) {
            await User.insertMany(dummyStudents);
            console.log('Dummy students added successfully.');
        } else {
            console.log('Dummy students already exist.');
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

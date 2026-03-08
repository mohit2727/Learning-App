const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = "mongodb://localhost:27017/ravina_app";

const dummyStudents = [
    { clerkId: 'dummy_1_app', name: 'Alice Smith', email: 'alice.app@example.com', role: 'student', totalScore: 85 },
    { clerkId: 'dummy_2_app', name: 'Bob Johnson', email: 'bob.app@example.com', role: 'student', totalScore: 92 },
    { clerkId: 'dummy_3_app', name: 'Charlie Brown', email: 'charlie.app@example.com', role: 'student', totalScore: 78 },
    { clerkId: 'dummy_4_app', name: 'Diana Prince', email: 'diana.app@example.com', role: 'student', totalScore: 95 },
    { clerkId: 'dummy_5_app', name: 'Ethan Hunt', email: 'ethan.app@example.com', role: 'student', totalScore: 88 }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(`Connected to DB: ${MONGO_URI}`);

        const exist = await User.findOne({ clerkId: 'dummy_1_app' });
        if (!exist) {
            await User.insertMany(dummyStudents);
            console.log('Dummy students added successfully to ravina_app.');
        } else {
            console.log('Dummy students already exist in ravina_app.');
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

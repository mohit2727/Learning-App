const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const studentCount = await User.countDocuments({ role: 'student' });
        console.log(`Total students: ${studentCount}`);

        const scoredStudents = await User.find({ role: 'student', totalScore: { $gt: 0 } });
        console.log(`Students with score > 0: ${scoredStudents.length}`);

        const allUsers = await User.find({});
        console.log('All users:');
        console.log(allUsers);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Course = require('./models/courseModel');
const Class = require('./models/classModel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Course.deleteMany();
        await Class.deleteMany();

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            mobile: '1234567890',
            role: 'admin',
        });

        const instructorUser = await User.create({
            name: 'Instructor John',
            email: 'john@example.com',
            mobile: '9876543210',
            role: 'instructor',
        });

        const courses = await Course.insertMany([
            {
                title: 'Maths 101',
                description: 'Basic mathematics for beginners',
                instructor: instructorUser._id,
                price: 100,
            },
            {
                title: 'Physics Advanced',
                description: 'Deep dive into quantum physics',
                instructor: instructorUser._id,
                price: 200,
            },
        ]);

        await Class.create({
            subject: 'Maths',
            teacher: instructorUser._id,
            schedule: 'Monday 10:00 AM',
            className: 'Grade 10 - A',
            link: 'https://zoom.us/j/123456789',
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Course.deleteMany();
        await Class.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

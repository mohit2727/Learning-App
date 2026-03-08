const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = "mongodb://localhost:27017/ravina";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log(`Total users in DB: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} | Role: ${u.role} | Score: ${u.totalScore}`));
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

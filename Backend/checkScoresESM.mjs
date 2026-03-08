import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/userModel.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('All Users:', users);
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const adminEmail = 'ravinaaacharya2345@gmail.com';
const firebaseUid = 'zZCFE2MPWvhc7bucCcbepvO4YIz1';

async function setAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOneAndUpdate(
            {
                $or: [
                    { firebaseUid: firebaseUid },
                    { email: adminEmail }
                ]
            },
            {
                $set: {
                    firebaseUid: firebaseUid,
                    email: adminEmail,
                    role: 'admin',
                    name: 'Admin'
                }
            },
            { upsert: true, new: true }
        );

        console.log('Successfully set admin role for:', user.email);
        console.log('User UID:', user.firebaseUid);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setAdmin();

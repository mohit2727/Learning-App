const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = "mongodb://localhost:27017/ravina_app";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Find all users with the role 'admin'
        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admins.`);

        if (admins.length > 1) {
            // Keep the first one, downgrade the rest
            console.log(`Keeping ${admins[0].email} as admin. Downgrading others to student.`);
            for (let i = 1; i < admins.length; i++) {
                admins[i].role = 'student';
                await admins[i].save();
                console.log(`Downgraded ${admins[i].email} to student.`);
            }
        } else if (admins.length === 1) {
            console.log(`Verified only 1 admin exists: ${admins[0].email}`);
        } else {
            console.log('No admins found in the database. You may want to create or promote one.');
        }

        // Fallback: Ensure any users with roles other than 'student' or 'admin' are set to 'student'
        const invalidRoles = await User.find({ role: { $nin: ['student', 'admin'] } });
        if (invalidRoles.length > 0) {
            console.log(`Found ${invalidRoles.length} users with invalid roles. Fixing...`);
            for (const user of invalidRoles) {
                user.role = 'student';
                await user.save();
            }
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

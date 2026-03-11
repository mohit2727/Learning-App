const admin = require('../config/firebase-admin');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedToken.uid;

        // Mobile numbers are normally included in the Firebase OTP token payload as phone_number
        const mobile = decodedToken.phone_number || '';

        console.log('--- AUTH DEBUG ---');
        console.log('Incoming Token Firebase UID:', firebaseUid);

        // Find user in DB
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            console.log('User not found in DB by Firebase UID. Auto-creating...');
            try {
                // Determine a fallback name and an email stub (required fields historically)
                const fallbackName = mobile ? `Student ${mobile.slice(-4)}` : 'Student';
                const fallbackEmail = `${firebaseUid}@firebase-auth.local`;

                user = await User.create({
                    firebaseUid,
                    name: fallbackName,
                    email: fallbackEmail,
                    mobile: mobile,
                    role: 'student',
                });
                console.log('User created:', user._id);
            } catch (createErr) {
                console.error('Failed to auto-create user from Firebase:', createErr.message);
                res.status(503).set('Cache-Control', 'no-store');
                throw new Error('Auth service temporarily unavailable. Please try again.');
            }
        } else {
            console.log('User found in DB with role:', user.role);
            // If the user didn't have a mobile saved yet (due to migration), save it
            if (mobile && !user.mobile) {
                user.mobile = mobile;
                await user.save();
            }
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Firebase auth error:', error.message);
        res.set('Cache-Control', 'no-store');
        if (!res.statusCode || res.statusCode === 200) res.status(401);
        throw new Error('Not authorized: Invalid token');
    }
});

const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin: adminCheck };

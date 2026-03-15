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

        // IMPORTANT: We do NOT auto-create users here anymore.
        // Instead, we attach the UID and mobile to req so the /sync endpoint can create them if needed.
        if (!user) {
            console.log('User not found in DB by Firebase UID:', firebaseUid);
            // We set these on req so that specific endpoints (like /sync) can handle user creation explicitly.
            req.firebaseUid = firebaseUid;
            req.firebaseMobile = mobile;
            
            // Note: If the missing user hits a regular protected route, the controller should check for `req.user`
            // But to avoid changing every single controller to check `if (!req.user)`, 
            // we will STILL throw a 401 error EXCEPT for the '/sync' route.
            // A more robust way is checking req.originalUrl
            if (req.originalUrl && !req.originalUrl.includes('/users/sync')) {
                res.status(401).set('Cache-Control', 'no-store');
                throw new Error('User not found in database');
            }
            
            // If it IS the sync route, we let it pass through to the controller
            // The controller will see req.user is undefined, but req.firebaseUid is present.
            req.user = null;
        } else {
            console.log('User found in DB with role:', user.role);
            // If the user didn't have a mobile saved yet (due to migration), save it
            if (mobile && !user.mobile) {
                user.mobile = mobile;
                await user.save();
            }
            req.user = user;
        }

        next();
    } catch (error) {
        console.error('Firebase auth error:', error.message);
        res.set('Cache-Control', 'no-store');
        if (!res.statusCode || res.statusCode === 200) res.status(401);
        throw new Error(error.message || 'Not authorized: Invalid token');
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

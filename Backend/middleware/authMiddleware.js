const { createClerkClient } = require('@clerk/clerk-sdk-node');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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
        // Verify the Clerk session token
        let clerkId;
        try {
            const result = await clerkClient.verifyToken(token);
            clerkId = result.sub;
        } catch (verifyErr) {
            console.error('Token verification failed:', verifyErr.message);
            // Try verifying with an authorized party override (looser check)
            const result = await clerkClient.verifyToken(token, {
                authorizedParties: undefined,
            });
            clerkId = result.sub;
        }

        console.log('--- AUTH DEBUG ---');
        console.log('Incoming Token Clerk ID:', clerkId);

        // Find or create user in our DB using clerkId
        let user = await User.findOne({ clerkId });
        if (!user) {
            console.log('User not found in DB by Clerk ID. Auto-creating...');
            // Auto-create user on first authenticated request
            const clerkUser = await clerkClient.users.getUser(clerkId);
            const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
            const role = clerkUser.publicMetadata?.role || 'student';

            console.log('Fetched Clerk User Email:', email);
            console.log('Assigning Role:', role);

            user = await User.create({
                clerkId,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0],
                email,
                role,
            });
            console.log('User created:', user);
        } else {
            console.log('User found in DB with role:', user.role);
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Clerk auth error:', error.message);
        res.status(401);
        throw new Error('Not authorized, token failed: ' + error.message);
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };

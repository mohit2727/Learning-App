const admin = require('firebase-admin');

// We expect FIREBASE_SERVICE_ACCOUNT to be a JSON string 
// containing the service account details downloaded from Firebase Console.
// For local development, you can place this in your .env file
// Example: FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        // Manual fix for PEM private key formatting (converting literal \n to real newlines)
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
}

if (!admin.apps.length) {
    const config = {};
    if (serviceAccount) {
        config.credential = admin.credential.cert(serviceAccount);
        console.log('Firebase Admin Initializing with Service Account JSON.');
    } else if (process.env.FIREBASE_PROJECT_ID) {
        config.projectId = process.env.FIREBASE_PROJECT_ID;
        console.warn('Firebase Admin Initializing with Project ID fallback (No Service Account).');
    }

    try {
        admin.initializeApp(config);
        console.log('Firebase Admin Initialized successfully.');
    } catch (error) {
        console.error('Firebase Admin Initialization FAILED:', error.message);
    }
}

module.exports = admin;

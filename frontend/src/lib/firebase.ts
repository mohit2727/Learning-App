import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Platform } from 'react-native';

// Using Expo-specific environment variables for better integration with Expo Go
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// App Check For Mobile
// Note: While mobile uses Play Integrity, it can also use reCAPTCHA v3 as a fallback 
// or for Web (Expo Go / Web build).
// App Check - ONLY for Web
if (Platform.OS === 'web') {
    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LcLeIwsAAAAAII1F4KVhPyoKTS0lx-TLzQdW-AY'),
        isTokenAutoRefreshEnabled: true
    });
}

export const auth = getAuth(app);

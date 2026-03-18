import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    User,
    signOut as firebaseSignOut,
    signInWithCredential,
    PhoneAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import apiClient from '../api/apiClient';
import Toast from 'react-native-toast-message';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithPhone: (phoneNumber: string, recaptchaVerifier: any) => Promise<string>;
    verifyOtp: (verificationId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Pre-fetch token to ensure interceptors are ready
                try {
                    await firebaseUser.getIdToken();
                } catch (error) {
                    console.error("Error refreshing token:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: any) => {
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            return await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Sign In Failed',
                text2: error.message || 'Could not send OTP'
            });
            throw error;
        }
    };

    const verifyOtp = async (verificationId: string, code: string) => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            await signInWithCredential(auth, credential);
            Toast.show({
                type: 'success',
                text1: 'Welcome!',
                text2: 'Sign in successful'
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'OTP Failed',
                text2: error.message || 'Invalid verification code'
            });
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            Toast.show({
                type: 'info',
                text1: 'Signed Out',
                text2: 'You have been logged out'
            });
        } catch (error: any) {
            console.error("Sign out error:", error);
            Toast.show({
                type: 'error',
                text1: 'Sign Out Error',
                text2: error.message || 'Could not sign out'
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, signInWithPhone, verifyOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { dataService } from '../api/dataService';
import Toast from 'react-native-toast-message';

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    dbUser: any | null;
    loading: boolean;
    isOnboarded: boolean;
    signOut: () => Promise<void>;
    signInWithPhone: (phoneNumber: string) => Promise<FirebaseAuthTypes.ConfirmationResult>;
    verifyOtp: (confirmation: FirebaseAuthTypes.ConfirmationResult, code: string) => Promise<void>;
    refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [dbUser, setDbUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(false);

    const refreshDbUser = async () => {
        try {
            const profile = await dataService.getProfile();
            setDbUser(profile);
            const isNameSet = profile.name && profile.name !== 'New User' && !profile.name.startsWith('Student ') && profile.name !== 'Student';
            setIsOnboarded(!!isNameSet);
        } catch (error) {
            console.error("Error fetching DB user:", error);
            setDbUser(null);
            setIsOnboarded(false);
        }
    };

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await refreshDbUser();
            } else {
                setDbUser(null);
                setIsOnboarded(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithPhone = async (phoneNumber: string) => {
        try {
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
            return confirmation;
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Sign In Failed',
                text2: error.message || 'Could not send OTP'
            });
            throw error;
        }
    };

    const verifyOtp = async (confirmation: FirebaseAuthTypes.ConfirmationResult, code: string) => {
        try {
            await confirmation.confirm(code);
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
            await auth().signOut();
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
        <AuthContext.Provider value={{ user, dbUser, loading, isOnboarded, signOut, signInWithPhone, verifyOtp, refreshDbUser }}>
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

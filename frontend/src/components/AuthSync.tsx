import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthStore } from '../store/useAuthStore';
import { setGlobalTokenProvider } from '../api/tokenProvider';

export const AuthSync = () => {
    const { user, loading: authLoading } = useAuth();

    // Extract only the actions so we don't trigger re-renders on state changes
    const login = useAuthStore(state => state.login);
    const logout = useAuthStore(state => state.logout);

    useEffect(() => {
        // Set up the global token hook for Axios
        setGlobalTokenProvider(async () => {
            if (user) {
                return await user.getIdToken();
            }
            return null;
        });

        const syncAuth = async () => {
            console.log(`AuthSync -> authLoading: ${authLoading}, user: ${!!user}`);
            if (!authLoading && user) {
                try {
                    login({
                        id: user.uid,
                        name: user.displayName || 'User',
                        email: user.email || '',
                        mobile: user.phoneNumber || '',
                        role: 'student' // Default role for mobile users
                    });
                    console.log("AuthSync -> Zustand user synced successfully.");
                } catch (error) {
                    console.error("Failed to sync Firebase user to Zustand:", error);
                }
            } else if (!authLoading && !user) {
                console.log("AuthSync -> User is signed out. Clearing Zustand.");
                logout();
            }
        };

        syncAuth();
    }, [authLoading, user, login, logout]);

    return null; // Headless component
};

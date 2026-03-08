import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '../store/useAuthStore';
import { setGlobalTokenProvider } from '../api/tokenProvider';

export const AuthSync = () => {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();

    // Extract only the actions so we don't trigger re-renders on state changes
    const login = useAuthStore(state => state.login);
    const logout = useAuthStore(state => state.logout);

    useEffect(() => {
        // Set up the global token hook for Axios
        setGlobalTokenProvider(async () => {
            return await getToken();
        });

        const syncAuth = async () => {
            console.log(`AuthSync -> isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}, user: ${!!user}`);
            if (isLoaded && isSignedIn && user) {
                try {
                    login({
                        id: user.id,
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                        email: user.primaryEmailAddress?.emailAddress,
                        mobile: user.primaryPhoneNumber?.phoneNumber || '',
                        role: user.publicMetadata?.role as string || 'student'
                    });
                    console.log("AuthSync -> Zustand user synced successfully.");
                } catch (error) {
                    console.error("Failed to sync Clerk token to Zustand:", error);
                }
            } else if (isLoaded && !isSignedIn) {
                console.log("AuthSync -> User is signed out. Clearing Zustand.");
                logout();
            }
        };

        syncAuth();
    }, [isLoaded, isSignedIn, user, getToken, login, logout]);

    return null; // Headless component
};

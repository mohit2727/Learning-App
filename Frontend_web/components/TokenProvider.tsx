'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthToken, setTokenRefresher } from '@/lib/api';

/**
 * Runs on the client to grab the Clerk JWT and inject it into axios.
 * Also registers the token refresher so the API client always sends fresh tokens.
 * Renders nothing – purely a side-effect component.
 */
export default function TokenProvider() {
    const { getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isSignedIn) {
            setAuthToken(null);
            setTokenRefresher(async () => null);
            return;
        }
        // Set initial token
        getToken().then(t => setAuthToken(t));
        // Register refresher — called automatically before each API request
        setTokenRefresher(() => getToken());
    }, [isSignedIn, getToken]);

    return null;
}


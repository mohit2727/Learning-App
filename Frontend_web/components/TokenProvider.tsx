'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api';

/**
 * Runs on the client to grab the Clerk JWT and inject it into axios.
 * Renders nothing – purely a side-effect component.
 */
export default function TokenProvider() {
    const { getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isSignedIn) {
            setAuthToken(null);
            return;
        }
        getToken().then(t => setAuthToken(t));
    }, [isSignedIn, getToken]);

    return null;
}

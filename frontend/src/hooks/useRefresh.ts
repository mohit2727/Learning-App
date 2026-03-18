import { useState, useCallback, useRef } from 'react';
import { toast } from '../utils/toast';

const COOLDOWN_MS = 30000; // 30 seconds cooldown

export const useRefresh = (refreshFunc: () => Promise<void>) => {
    const [refreshing, setRefreshing] = useState(false);
    const lastRefreshTime = useRef<number>(0);

    const onRefresh = useCallback(async () => {
        const now = Date.now();
        if (now - lastRefreshTime.current < COOLDOWN_MS) {
            toast.info('Too many refreshes', 'Please wait a few seconds before refreshing again.');
            return;
        }

        setRefreshing(true);
        try {
            await refreshFunc();
            lastRefreshTime.current = Date.now();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refreshFunc]);

    return { refreshing, onRefresh };
};

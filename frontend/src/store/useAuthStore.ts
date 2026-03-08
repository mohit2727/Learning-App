import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/storage';

interface User {
    id: string;
    name: string;
    email?: string;
    mobile: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const secureStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return await getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await deleteItemAsync(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage-secure',
            storage: createJSONStorage(() => secureStorage),
        }
    )
);

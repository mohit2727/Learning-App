import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#f3f4f6',
    },
};
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';
import { AuthSync } from '../components/AuthSync';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

export const RootNavigator = () => {
    const { user, loading, isOnboarded } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <NavigationContainer theme={lightTheme}>
            <AuthSync />
            {user ? (
                isOnboarded ? <MainNavigator /> : <OnboardingScreen />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

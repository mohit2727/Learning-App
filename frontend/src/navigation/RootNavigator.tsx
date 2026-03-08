import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ActivityIndicator, View } from 'react-native';
import { AuthSync } from '../components/AuthSync';

export const RootNavigator = () => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <AuthSync />
            {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

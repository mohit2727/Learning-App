import "./src/global.css";
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { View, Platform, StyleSheet } from 'react-native';
import { getItemAsync, setItemAsync } from './src/utils/storage';
import { RootNavigator } from './src/navigation/RootNavigator';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await setItemAsync(key, value);
    } catch {
      // Ignore
    }
  },
};

const PUBLISHABLE_KEY = 'pk_test_ZHluYW1pYy1tb29zZS04Mi5jbGVyay5hY2NvdW50cy5kZXYk';

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <View style={styles.container}>
          <View style={styles.appWrapper}>
            <RootNavigator />
          </View>
        </View>
        <StatusBar style="auto" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light gray background for web desktop
    alignItems: 'center',
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Mobile app width constraint
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
    } as any),
  }
});

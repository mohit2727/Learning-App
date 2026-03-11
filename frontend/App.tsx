import "./src/global.css";
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <View style={styles.appWrapper}>
          <RootNavigator />
        </View>
      </View>
      <StatusBar style="auto" />
    </AuthProvider>
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

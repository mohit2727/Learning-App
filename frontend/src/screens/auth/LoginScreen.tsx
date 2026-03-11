import React, { useState, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../../lib/firebase';

export const LoginScreen = () => {
    const { signInWithPhone, verifyOtp } = useAuth();
    const recaptchaVerifier = useRef<any>(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number with country code (e.g., +91...)');
            return;
        }

        setIsLoading(true);
        try {
            const vid = await signInWithPhone(phoneNumber, recaptchaVerifier.current);
            setVerificationId(vid);
            setIsOtpSent(true);
            Alert.alert('OTP Sent', `A 6-digit code has been sent to ${phoneNumber}`);
        } catch (error: any) {
            console.error("OTP Error:", error);
            Alert.alert('Error', error.message || 'Failed to send OTP. Ensure the phone number is correct and has a country code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP sent to your phone');
            return;
        }
        setIsLoading(true);
        try {
            await verifyOtp(verificationId, otp);
            // Redirection is handled by RootNavigator
        } catch (error: any) {
            console.error("Verification error:", error);
            Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white dark:bg-gray-900"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                attemptInvisibleRetaptcha={true}
            />

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

                <View className="mb-10 items-center">
                    <Text variant="h1" className="text-blue-600 mb-2 font-bold">
                        Welcome Back
                    </Text>
                    <Text variant="body" className="text-gray-500 text-center">
                        Sign in with your phone number to continue.
                    </Text>
                </View>

                <View>
                    {!isOtpSent ? (
                        <Input
                            label="Phone Number"
                            placeholder="+91 00000 00000"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    ) : (
                        <>
                            <Text className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Phone Number</Text>
                            <Text className="text-lg font-bold text-gray-900 mb-6">{phoneNumber}</Text>
                            <Input
                                label="Verification Code"
                                placeholder="Enter 6-digit code"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                            />
                        </>
                    )}

                    <Button
                        label={isOtpSent ? "Verify & Sign In" : "Send Code"}
                        className="mt-6"
                        isLoading={isLoading}
                        onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                    />

                    {isOtpSent && (
                        <Button
                            label="Change Phone Number"
                            variant="ghost"
                            className="mt-2"
                            onPress={() => { setIsOtpSent(false); setOtp(''); }}
                        />
                    )}

                    {!isOtpSent && (
                        <View className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <Text className="text-blue-600 text-xs text-center font-bold">
                                We'll send a 6-digit verification code to this number. Standard rates may apply.
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

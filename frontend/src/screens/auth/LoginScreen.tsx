import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';

export const LoginScreen = () => {
    const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
    const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isSignInLoaded || !isSignUpLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const switchMode = () => {
        setMode(mode === 'signIn' ? 'signUp' : 'signIn');
        setEmail('');
        setFirstName('');
        setLastName('');
        setOtp('');
        setIsOtpSent(false);
    };

    const handleSendOtp = async () => {
        if (!email.includes('@') || !email.includes('.')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (mode === 'signUp' && (!firstName.trim() || !lastName.trim())) {
            Alert.alert('Error', 'Please enter your first and last name');
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'signIn') {
                try {
                    await signIn.create({ identifier: email });
                } catch (err: any) {
                    if (err.errors?.[0]?.code === 'form_identifier_not_found') {
                        setIsLoading(false);
                        Alert.alert('Account Not Found', 'This email is not registered. Please switch to Sign Up.');
                        return;
                    }
                    throw err;
                }

                await signIn.prepareFirstFactor({
                    strategy: 'email_code',
                    emailAddressId: signIn.supportedFirstFactors?.find(
                        (f) => f.strategy === 'email_code'
                    )?.emailAddressId ?? '',
                });
            } else {
                try {
                    await signUp.create({
                        emailAddress: email,
                        firstName,
                        lastName
                    });
                } catch (createErr: any) {
                    if (createErr.errors?.[0]?.code === 'form_identifier_exists') {
                        setIsLoading(false);
                        Alert.alert('Account Exists', 'This email is already registered. Please switch to Sign In.');
                        return;
                    }
                    throw createErr;
                }

                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            }
            setIsOtpSent(true);
            Alert.alert('OTP Sent', `A 6-digit code has been sent to ${email}`);
        } catch (error: any) {
            console.error("OTP Error:", error);
            Alert.alert('Error', error.errors?.[0]?.longMessage || error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            Alert.alert('Error', 'Please enter the OTP from your email');
            return;
        }
        setIsLoading(true);
        try {
            console.log("Verifying mode:", mode, "code:", otp);
            if (mode === 'signIn') {
                const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code: otp });
                console.log("SignIn result:", JSON.stringify(result, null, 2));
                if (result.status === 'complete') {
                    console.log("Setting active session:", result.createdSessionId);
                    await setSignInActive({ session: result.createdSessionId });
                    console.log("Active session set successfully");
                } else {
                    console.log("SignIn status not complete:", result.status);
                    Alert.alert('Incomplete Login', 'Please complete the remaining login steps.');
                }
            } else {
                const result = await signUp.attemptEmailAddressVerification({ code: otp });
                console.log("SignUp result:", JSON.stringify(result, null, 2));
                if (result.status === 'complete') {
                    console.log("Setting active session:", result.createdSessionId);
                    await setSignUpActive({ session: result.createdSessionId });
                    console.log("Active session set successfully");
                } else {
                    console.log("SignUp status not complete:", result.status);
                    Alert.alert('Incomplete Sign Up', 'Please complete the remaining registration steps.');
                }
            }
        } catch (error: any) {
            console.error("Verification error:", JSON.stringify(error, null, 2));
            Alert.alert('Error', error.errors?.[0]?.longMessage || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white dark:bg-gray-900"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

                <View className="mb-10 items-center">
                    <Text variant="h1" className="text-blue-600 mb-2 font-bold">
                        {mode === 'signIn' ? 'Welcome Back' : 'Create Account'}
                    </Text>
                    <Text variant="body" className="text-gray-500 text-center">
                        {mode === 'signIn'
                            ? 'Sign in with your email to continue.'
                            : 'Sign up with your email to get started.'}
                    </Text>
                </View>

                <View>
                    {mode === 'signUp' && !isOtpSent && (
                        <>
                            <Input
                                label="First Name"
                                placeholder="Enter your first name"
                                autoCapitalize="words"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Enter your last name"
                                autoCapitalize="words"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </>
                    )}
                    <Input
                        label="Email Address"
                        placeholder="Enter your email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!isOtpSent}
                    />
                    {isOtpSent && (
                        <Input
                            label="Verification Code"
                            placeholder="Enter the code from your email"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                    )}

                    <Button
                        label={isOtpSent ? (mode === 'signIn' ? "Verify & Sign In" : "Verify & Sign Up") : "Send Code"}
                        className="mt-6"
                        isLoading={isLoading}
                        onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                    />

                    {isOtpSent && (
                        <Button
                            label="Change Email"
                            variant="ghost"
                            className="mt-2"
                            onPress={() => { setIsOtpSent(false); setOtp(''); }}
                        />
                    )}

                    {!isOtpSent && (
                        <View className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6 items-center">
                            <Text className="text-gray-500 mb-2">
                                {mode === 'signIn' ? "Don't have an account?" : "Already have an account?"}
                            </Text>
                            <Button
                                label={mode === 'signIn' ? "Sign Up" : "Sign In"}
                                variant="outline"
                                className="w-full"
                                onPress={switchMode}
                            />
                        </View>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

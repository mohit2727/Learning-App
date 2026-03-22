import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '../../components/Text';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, User, MapPin, Hash, Calendar } from 'lucide-react-native';

export const OnboardingScreen = () => {
    const { refreshDbUser, dbUser } = useAuth();
    const [name, setName] = useState(dbUser?.name && !dbUser?.name.startsWith('Student ') ? dbUser.name : '');
    const [age, setAge] = useState(dbUser?.age || '');
    const [city, setCity] = useState(dbUser?.city || '');
    const [state, setState] = useState(dbUser?.state || '');
    const [pincode, setPincode] = useState(dbUser?.pincode || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleGetStarted = async () => {
        if (!name.trim() || !age || !city) {
            Alert.alert('Incomplete Profile', 'Please enter your Name, Age, and City at minimum.');
            return;
        }

        setIsSaving(true);
        try {
            await dataService.updateProfile({
                name: name.trim(),
                age,
                city,
                state,
                pincode
            });
            await refreshDbUser();
        } catch (error) {
            console.error('Onboarding update failed:', error);
            Alert.alert('Error', 'Could not save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="rounded-b-[4rem] overflow-hidden shadow-2xl">
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        className="pt-20 pb-12 px-8 items-center"
                    >
                        <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30 backdrop-blur-md">
                            <Sparkles size={40} color="white" />
                        </View>
                        <Text variant="h2" className="text-white font-black text-3xl tracking-tighter text-center">Almost There!</Text>
                        <Text className="text-indigo-100 font-medium text-center mt-2 px-8">Please complete your profile to access all features.</Text>
                    </LinearGradient>
                </View>

                <View className="p-8 space-y-6">
                    <Input 
                        label="Full Name" 
                        placeholder="Enter your name" 
                        value={name} 
                        onChangeText={setName} 
                        icon={<User size={18} color="#94A3B8" />}
                    />

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input 
                                label="Age" 
                                placeholder="Age" 
                                value={age} 
                                onChangeText={setAge} 
                                keyboardType="numeric"
                                icon={<Calendar size={18} color="#94A3B8" />}
                            />
                        </View>
                        <View className="flex-1">
                            <Input 
                                label="Pincode" 
                                placeholder="Pincode" 
                                value={pincode} 
                                onChangeText={setPincode} 
                                keyboardType="numeric"
                                icon={<Hash size={18} color="#94A3B8" />}
                            />
                        </View>
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input 
                                label="City" 
                                placeholder="City" 
                                value={city} 
                                onChangeText={setCity} 
                                icon={<MapPin size={18} color="#94A3B8" />}
                            />
                        </View>
                        <View className="flex-1">
                            <Input 
                                label="State" 
                                placeholder="State" 
                                value={state} 
                                onChangeText={setState} 
                                icon={<MapPin size={18} color="#94A3B8" />}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleGetStarted}
                        disabled={isSaving}
                        className="mt-8 bg-indigo-600 py-5 rounded-2xl shadow-xl shadow-indigo-200 items-center overflow-hidden"
                    >
                        <LinearGradient
                            colors={['#6366F1', '#4F46E5']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            className="absolute inset-0"
                        />
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black uppercase tracking-[2px]">Get Started</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

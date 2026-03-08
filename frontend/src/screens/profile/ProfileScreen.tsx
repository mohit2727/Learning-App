import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, ChevronRight, LogOut, ShieldCheck, Star, Zap, BookOpen, ClipboardList } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
    const { user } = useUser();
    const { signOut } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [mobile, setMobile] = useState('');
    const [age, setAge] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await dataService.getProfile();
                setProfile(data);
                setMobile(data.mobile || '');
                setAge(data.age || '');
                setCity(data.city || '');
                setState(data.state || '');
                setPincode(data.pincode || '');
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedProfile = await dataService.updateProfile({
                mobile, age, city, state, pincode,
            });
            setProfile(updatedProfile);
            setMobile(updatedProfile.mobile || '');
            setAge(updatedProfile.age || '');
            setCity(updatedProfile.city || '');
            setState(updatedProfile.state || '');
            setPincode(updatedProfile.pincode || '');
            setShowEdit(false);
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (error) {
            console.error('Update failed:', error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (profile?.name || 'Student');
    const email = user?.primaryEmailAddress?.emailAddress || profile?.email || 'Not set';
    const initials = displayName.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header with Skewed Gradient */}
                <LinearGradient
                    colors={['#6366F1', '#4F46E5', '#3730A3']}
                    className="pt-20 pb-16 px-6 rounded-b-[4rem] items-center mb-10 shadow-2xl"
                >
                    <View className="relative mb-6">
                        <View className="w-24 h-24 rounded-[30%] bg-white p-1.5 shadow-2xl rotate-3">
                            {user?.imageUrl ? (
                                <View className="w-full h-full rounded-[25%] overflow-hidden -rotate-3 bg-indigo-50">
                                    <ActivityIndicator size="small" color="#6366F1" style={{ position: 'absolute', top: '40%', left: '40%' }} />
                                    <View style={{ width: '100%', height: '100%' }}>
                                        {/* React Native Image equivalent for Tailwind mapping */}
                                        <View className="w-full h-full bg-indigo-100 items-center justify-center">
                                            <Text className="text-indigo-600 font-black text-2xl">{initials}</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View className="w-full h-full rounded-[25%] bg-indigo-50 items-center justify-center -rotate-3">
                                    <Text className="text-indigo-600 font-black text-2xl">{initials}</Text>
                                </View>
                            )}
                        </View>
                        <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white shadow-lg items-center justify-center">
                            <ShieldCheck size={14} color="white" strokeWidth={3} />
                        </View>
                    </View>

                    <Text variant="h2" className="text-white font-black text-xl tracking-tight leading-none mb-1">{displayName}</Text>
                    <View className="flex-row items-center bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        <Mail size={10} color="#C7D2FE" />
                        <Text className="text-indigo-100 text-[9px] font-black uppercase tracking-wider ml-1.5">{email}</Text>
                    </View>
                </LinearGradient>

                {/* Personal Info Card */}
                <View className="mx-6 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-50 mb-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-2">
                            <User size={16} color="#4F46E5" />
                            <Text className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em]">Personal Details</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowEdit(true)} className="bg-indigo-50 px-3 py-1.5 rounded-xl">
                            <Text className="text-indigo-600 text-[8px] font-black uppercase tracking-widest">Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap gap-x-8 gap-y-6">
                        <View className="w-[40%]">
                            <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest mb-1.5 text-center">Mobile</Text>
                            <Text className="text-gray-800 font-black text-xs text-center">{profile?.mobile || '---'}</Text>
                        </View>
                        <View className="w-[40%]">
                            <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest mb-1.5 text-center">Age</Text>
                            <Text className="text-gray-800 font-black text-xs text-center">{profile?.age || '--'}</Text>
                        </View>
                        <View className="w-full pt-4 border-t border-gray-50">
                            <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest mb-1.5">Location</Text>
                            <View className="flex-row items-center gap-2">
                                <MapPin size={12} color="#6366F1" />
                                <Text className="text-gray-800 font-black text-[11px] uppercase tracking-tight flex-1" numberOfLines={1}>
                                    {profile?.city ? `${profile.city}, ${profile.state}` : 'Not provided yet'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Links */}
                <View className="mx-6 space-y-3 mb-10">
                    <Text className="text-gray-400 font-black text-[9px] uppercase tracking-[0.3em] ml-4 mb-2">Learning Progress</Text>

                    <View className="bg-white rounded-[2.5rem] shadow-lg border border-gray-50 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5 border-b border-gray-50"
                            onPress={() => navigation?.navigate('MyTests')}
                        >
                            <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center mr-4">
                                <ClipboardList size={20} color="#D97706" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Test Attempts</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Performance history</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5"
                            onPress={() => navigation?.navigate('MyCourses')}
                        >
                            <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
                                <BookOpen size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">My Courses</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Premium Library</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="mt-8 bg-rose-50 rounded-2xl py-5 shadow-lg border border-rose-100 flex-row items-center justify-center gap-3"
                        onPress={() =>
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                { text: 'Stay', style: 'cancel' },
                                { text: 'Logout', style: 'destructive', onPress: () => signOut() },
                            ])
                        }
                    >
                        <LogOut size={16} color="#E11D48" />
                        <Text className="text-rose-600 font-black text-xs uppercase tracking-[0.2em]">Logout Session</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Premium Edit Profile Modal */}
            <Modal visible={showEdit} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[3rem] p-8 shadow-2xl">
                        <View className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                        <View className="flex-row justify-between items-center mb-8">
                            <Text variant="h2" className="font-black text-gray-800 text-2xl tracking-tighter">Update Profile</Text>
                            <TouchableOpacity onPress={() => setShowEdit(false)} className="bg-gray-50 p-3 rounded-full">
                                <Text className="text-gray-400 font-black text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="mb-6">
                            <Input label="Mobile Number" placeholder="e.g. 9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input label="Age" placeholder="22" value={age} onChangeText={setAge} keyboardType="numeric" />
                                </View>
                                <View className="flex-1">
                                    <Input label="Pincode" placeholder="400001" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
                                </View>
                            </View>
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input label="City" placeholder="Mumbai" value={city} onChangeText={setCity} />
                                </View>
                                <View className="flex-1">
                                    <Input label="State" placeholder="Maharashtra" value={state} onChangeText={setState} />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={isSaving}
                                className="mt-6 bg-indigo-600 rounded-2xl py-5 shadow-2xl shadow-indigo-200 items-center"
                            >
                                <Text className="text-white font-black text-xs uppercase tracking-widest">{isSaving ? 'Saving...' : 'Update Records'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    Linking
} from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../api/dataService';
import { useRefresh } from '../../hooks/useRefresh';
import { toast } from '../../utils/toast';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, ChevronRight, LogOut, ShieldCheck, Star, Zap, BookOpen, ClipboardList, ShoppingBag, MessageCircle, Send, HelpCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
    const { user, signOut } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [name, setName] = useState('');
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
                setName(data.name || '');
                setMobile(data.mobile || '');
                setAge(data.age || '');
                setCity(data.city || '');
                setState(data.state || '');
                setPincode(data.pincode || '');

                // Automatically show name prompt if user has a default name
                if (data.name && (data.name.startsWith('Student ') || data.name === 'Student' || data.name === 'User')) {
                    setShowEdit(true);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        setIsSaving(true);
        try {
            const updatedProfile = await dataService.updateProfile({
                name: name.trim(), mobile, age, city, state, pincode,
            });
            setProfile(updatedProfile);
            setName(updatedProfile.name || '');
            setMobile(updatedProfile.mobile || '');
            setAge(updatedProfile.age || '');
            setCity(updatedProfile.city || '');
            setState(updatedProfile.state || '');
            setPincode(updatedProfile.pincode || '');
            setShowEdit(false);
            toast.success('Success', 'Profile updated successfully.');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Error', 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchUserData = async () => {
        try {
            await dataService.getDashboard();
        } catch (error) {
            console.error('Profile refresh failed:', error);
            throw error;
        }
    };

    const { refreshing, onRefresh } = useRefresh(fetchUserData);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    const displayName = profile?.name || user?.displayName || 'Student';
    const email = user?.email || profile?.email || 'Not set';
    const isPlaceholderEmail = email.includes('@firebase-auth.local');
    const initials = displayName.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
                }
            >

                {/* Header with Skewed Gradient */}
                <View className="rounded-b-[4rem] overflow-hidden shadow-2xl mb-8">
                    <View className="overflow-hidden rounded-b-[4rem]">
                        <LinearGradient
                            colors={['#6366F1', '#4F46E5', '#3730A3']}
                            className="pt-20 pb-16 px-6 items-center"
                        >
                            <View className="relative mb-6">
                                <View className="w-24 h-24 rounded-[30%] bg-white p-1.5 shadow-2xl rotate-3">
                                    <View className="w-full h-full rounded-[25%] bg-indigo-50 items-center justify-center -rotate-3">
                                        <Text className="text-indigo-600 font-black text-2xl">{initials}</Text>
                                    </View>
                                </View>
                                <View className="absolute -bottom-1 -right-1 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white shadow-lg items-center justify-center">
                                    <ShieldCheck size={14} color="white" strokeWidth={3} />
                                </View>
                            </View>

                            <Text variant="h2" className="text-white font-black text-xl tracking-tight leading-none mb-1">{displayName}</Text>
                            {/* {!isPlaceholderEmail && (
                                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-[2px]">{email}</Text>
                            )} */}
                        </LinearGradient>
                    </View>
                </View>

                {/* Quick Stats Row */}
                <View className="flex-row mx-6 gap-3 -mt-14 mb-8">
                    <View className="flex-1 bg-white rounded-3xl p-4 shadow-xl shadow-indigo-100/50 border border-gray-50 items-center">
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-gray-800 font-black text-xs mt-1">Student</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Rank</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-3xl p-4 shadow-xl shadow-indigo-100/50 border border-gray-50 items-center">
                        <Zap size={16} color="#6366F1" fill="#6366F1" />
                        <Text className="text-gray-800 font-black text-xs mt-1">Active</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Status</Text>
                    </View>
                </View>

                {/* Personal Info Card */}
                <View className="mx-6 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-50 mb-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-2">
                            <User size={16} color="#4F46E5" />
                            <Text className="font-black text-gray-800 text-[10px] uppercase tracking-[2px]">Personal Details</Text>
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
                <View className="mx-6 space-y-3 mb-8">
                    <Text className="text-gray-400 font-black text-[9px] uppercase tracking-[3px] ml-4 mb-2">My Library</Text>

                    <View className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-50 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5 border-b border-gray-50"
                            onPress={() => navigation?.navigate('MyCourses')}
                        >
                            <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
                                <BookOpen size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Video Playlists</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Purchased Content</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5 border-b border-gray-50"
                            onPress={() => navigation?.navigate('MyTests')}
                        >
                            <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center mr-4">
                                <ClipboardList size={20} color="#D97706" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Quiz Playlists</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Mock Tests & Quizzes</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5"
                            onPress={() => navigation?.navigate('OrderHistory')}
                        >
                            <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
                                <ShoppingBag size={20} color="#059669" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Billing History</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Receipts & Payments</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Help & Support Section */}
                <View className="mx-6 space-y-3 mb-10">
                    <Text className="text-gray-400 font-black text-[9px] uppercase tracking-[3px] ml-4 mb-2">Help & Support</Text>

                    <View className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-50 overflow-hidden">
                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5 border-b border-gray-50"
                            onPress={() => Linking.openURL('whatsapp://send?phone=91XXXXXXXXXX')}
                        >
                            <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
                                <MessageCircle size={20} color="#059669" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">WhatsApp Support</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Instant Chat</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5 border-b border-gray-50"
                            onPress={() => Linking.openURL('https://t.me/')}
                        >
                            <View className="w-10 h-10 bg-sky-50 rounded-2xl items-center justify-center mr-4">
                                <Send size={20} color="#0284C7" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Telegram Community</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Latest Updates</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-6 py-5"
                            onPress={() => Alert.alert('Contact Us', 'Our official email: support@physicaleducation.com')}
                        >
                            <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
                                <Mail size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-xs uppercase tracking-tight">Email Support</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Formal queries</Text>
                            </View>
                            <ChevronRight size={18} color="#E2E8F0" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="mt-6 bg-rose-50 rounded-3xl py-5 shadow-lg shadow-rose-100 border border-rose-100 flex-row items-center justify-center gap-3"
                        onPress={() =>
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                { text: 'Stay', style: 'cancel' },
                                { text: 'Logout', style: 'destructive', onPress: () => signOut() },
                            ])
                        }
                    >
                        <LogOut size={16} color="#E11D48" />
                        <Text className="text-rose-600 font-black text-xs uppercase tracking-[2px]">Logout Session</Text>
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
                            <Input label="Full Name" placeholder="e.g. John Doe" value={name} onChangeText={setName} />
                            <Input label="Mobile Number" placeholder="e.g. 9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} />
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

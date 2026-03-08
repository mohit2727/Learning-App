import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { dataService } from '../../api/dataService';

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
                mobile,
                age,
                city,
                state,
                pincode,
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
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : (profile?.name || 'Student');
    const email = user?.primaryEmailAddress?.emailAddress || profile?.email || 'Not set';

    const infoRows = [
        { label: 'Full Name', value: displayName },
        { label: 'Email', value: email },
        { label: 'Mobile', value: profile?.mobile || 'Not provided' },
        { label: 'Age', value: profile?.age || 'Not provided' },
        { label: 'City', value: profile?.city || 'Not provided' },
        { label: 'State', value: profile?.state || 'Not provided' },
        { label: 'Pincode', value: profile?.pincode || 'Not provided' },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View className="bg-blue-600 pt-14 pb-10 px-4 rounded-b-3xl items-center mb-6">
                    <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3 border-2 border-white/40">
                        <Text style={{ fontSize: 36 }}>👤</Text>
                    </View>
                    <Text variant="h3" className="text-white font-bold">{displayName}</Text>
                    <Text variant="caption" className="text-blue-200 mt-0.5">{email}</Text>
                </View>

                {/* Info Card */}
                <View className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
                    <Text variant="h3" className="font-bold text-gray-800 dark:text-white mb-3">Personal Info</Text>
                    {infoRows.map((row, i) => (
                        <View key={row.label} className={`flex-row justify-between py-3 ${i < infoRows.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
                            <Text variant="caption" className="text-gray-500 font-medium">{row.label}</Text>
                            <Text variant="body" className="text-gray-800 dark:text-white flex-1 text-right ml-4" numberOfLines={1}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Links */}
                <View className="mx-4 bg-white dark:bg-gray-800 rounded-2xl mb-4 shadow-sm overflow-hidden">
                    {[
                        { icon: '✏️', label: 'Edit Profile', action: () => setShowEdit(true) },
                        { icon: '📋', label: 'My Test Attempts', action: () => navigation?.navigate('MyTests') },
                        { icon: '📚', label: 'My Enrolled Courses', action: () => navigation?.navigate('MyCourses') },
                    ].map((opt, i, arr) => (
                        <TouchableOpacity
                            key={opt.label}
                            className={`flex-row items-center px-4 py-4 ${i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                            onPress={opt.action}
                        >
                            <Text style={{ fontSize: 20 }} className="mr-3">{opt.icon}</Text>
                            <Text variant="body" className="flex-1 text-gray-800 dark:text-white">{opt.label}</Text>
                            <Text className="text-gray-400">›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <View className="mx-4 mb-10">
                    <Button
                        label="Log Out"
                        variant="outline"
                        onPress={() =>
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Logout', style: 'destructive', onPress: () => signOut() },
                            ])
                        }
                    />
                </View>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={showEdit} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text variant="h2" className="font-bold text-gray-800 dark:text-white">Edit Profile</Text>
                            <TouchableOpacity onPress={() => setShowEdit(false)} className="p-2">
                                <Text className="text-gray-500 font-bold text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Input label="Mobile Number" placeholder="e.g. 9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
                            <Input label="Age" placeholder="e.g. 22" value={age} onChangeText={setAge} keyboardType="numeric" />
                            <Input label="City" placeholder="e.g. Mumbai" value={city} onChangeText={setCity} />
                            <Input label="State" placeholder="e.g. Maharashtra" value={state} onChangeText={setState} />
                            <Input label="Pincode" placeholder="e.g. 400001" value={pincode} onChangeText={setPincode} keyboardType="numeric" />

                            <Button
                                label={isSaving ? 'Saving...' : 'Save Changes'}
                                onPress={handleSave}
                                disabled={isSaving}
                                className="mt-2 mb-6"
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

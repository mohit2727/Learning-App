import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Linking,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Text } from '../../components/Text';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Video, BookOpen, PenTool as Tool, User, Award, MessageCircle, Send } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AnnouncementCarousel = ({ data }: { data: any[] }) => {
    const [current, setCurrent] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!data || data.length === 0) return;
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setCurrent(c => (c + 1) % data.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [data, fadeAnim]);

    if (!data || data.length === 0) return null;

    const item = data[current];

    return (
        <Animated.View style={{ opacity: fadeAnim }} className="mx-4 mb-6 overflow-hidden rounded-[2.5rem] shadow-xl bg-white border border-gray-100">
            {item.image ? (
                <View className="relative h-44">
                    <Animated.Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0 p-6 justify-end"
                    >
                        <Text className="text-white/70 text-[10px] font-black uppercase tracking-[2] mb-1">Update</Text>
                        <Text variant="h3" className="text-white font-black text-xl mb-1" numberOfLines={1}>{item.title}</Text>
                        <Text variant="caption" className="text-white/80 font-medium" numberOfLines={2}>{item.body}</Text>
                    </LinearGradient>
                </View>
            ) : (
                <View className="p-6">
                    <LinearGradient
                        colors={['#7C3AED', '#4F46E5']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, padding: 20 }}
                    >
                        <Text className="text-white/60 text-[10px] font-black uppercase tracking-[2] mb-1">Official News</Text>
                        <Text variant="h3" className="text-white font-black text-lg mb-2" numberOfLines={1}>{item.title}</Text>
                        <Text variant="caption" className="text-white/80 font-semibold" numberOfLines={2}>{item.body}</Text>
                    </LinearGradient>
                </View>
            )}
            <View className="flex-row absolute bottom-4 right-6">
                {data.map((_, i) => (
                    <View key={i} className={`h-1.5 rounded-full mr-1.5 ${i === current ? 'bg-white w-4' : 'bg-white/30 w-1.5'}`} />
                ))}
            </View>
        </Animated.View>
    );
};

const CourseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
        className="rounded-[2rem] overflow-hidden mr-4 w-48 bg-white shadow-xl shadow-black/10 border border-gray-50"
        activeOpacity={0.9}
    >
        {item.image ? (
            <View className="h-28 relative">
                <Animated.Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                    <Text className="text-white text-[8px] font-black uppercase tracking-widest">Premium</Text>
                </View>
            </View>
        ) : (
            <LinearGradient colors={['#6366F1', '#4338CA']} className="h-28 items-center justify-center">
                <BookOpen size={32} color="white" opacity={0.3} />
            </LinearGradient>
        )}
        <View className="p-4">
            <Text className="text-gray-800 font-black text-sm uppercase tracking-tight mb-1" numberOfLines={1}>{item.title}</Text>
            <View className="flex-row items-center gap-1.5">
                <Play size={10} color="#6366F1" fill="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    {item.lessons?.length || 0} Lessons
                </Text>
            </View>
            <TouchableOpacity className="mt-3 bg-indigo-50 rounded-xl py-2 items-center flex-row justify-center gap-2">
                <Text className="text-indigo-600 text-[9px] font-black uppercase tracking-[2]">Play Now</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

export const HomeScreen = ({ navigation }: any) => {
    const { user } = useUser();
    const { isLoaded, isSignedIn } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isLoaded || !isSignedIn) return;
            setIsLoading(true);
            try {
                const [dashboardRes, announcementsRes] = await Promise.all([
                    dataService.getDashboard(),
                    dataService.getAnnouncements()
                ]);
                setDashboardData(dashboardRes);
                setAnnouncements(announcementsRes);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [isLoaded, isSignedIn]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2]">LOADING DATA...</Text>
            </View>
        );
    }

    const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
    const init = displayName.charAt(0).toUpperCase();

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>

            {/* Gradient Header */}
            <View className="rounded-b-[3rem] overflow-hidden mb-6 shadow-2xl shadow-indigo-200">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5', '#3730A3']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    className="pt-16 pb-12 px-6"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3] mb-1">Welcome back!</Text>
                            <Text variant="h2" className="text-white font-black text-2xl tracking-tighter">{displayName}</Text>
                        </View>
                        <View className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 items-center justify-center">
                            <Text className="text-white font-black text-lg">{init}</Text>
                        </View>
                    </View>

                    {/* Embedded Stats in Header */}
                    <View className="flex-row gap-3 mt-4">
                        <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Text className="text-white font-black text-lg leading-none">{dashboardData?.stats?.courses || 0}</Text>
                            <Text className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mt-1">Courses</Text>
                        </View>
                        <View className="flex-1 bg-white/15 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Text className="text-white font-black text-lg leading-none">{dashboardData?.stats?.enrolled || 0}</Text>
                            <Text className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mt-1">Enrolled</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <AnnouncementCarousel data={announcements} />

            {/* Video Playlists */}
            <View className="flex-row items-center justify-between px-6 mb-4">
                <Text className="font-black text-gray-800 text-sm tracking-widest uppercase">Latest Content</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                    <Text className="text-indigo-600 text-[10px] font-black uppercase">View All</Text>
                </TouchableOpacity>
            </View>

            {dashboardData?.newestCourses?.length > 0 ? (
                <FlatList
                    data={dashboardData.newestCourses}
                    keyExtractor={i => i._id}
                    renderItem={({ item }) => <CourseCard item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                    className="mb-6"
                />
            ) : (
                <View className="px-6 mb-8">
                    <View className="bg-white rounded-[2rem] p-8 items-center border border-gray-50 shadow-sm">
                        <Video size={40} color="#E5E7EB" strokeWidth={1.5} />
                        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mt-4">New content coming soon</Text>
                    </View>
                </View>
            )}

            {/* Premium Quick Access Tiles */}
            <View className="px-6 mb-8">
                <Text className="font-black text-gray-800 text-sm tracking-widest uppercase mb-4">Your Toolbox</Text>
                <View className="flex-row gap-4">
                    {[
                        { icon: <BookOpen color="#4F46E5" size={24} />, label: 'COURSES', color: 'bg-indigo-50', target: 'Courses' },
                        { icon: <Tool color="#F59E0B" size={24} />, label: 'QUIZZES', color: 'bg-amber-50', target: 'Tests' },
                    ].map(tile => (
                        <TouchableOpacity
                            key={tile.label}
                            className={`${tile.color} flex-1 rounded-[2rem] p-6 items-center border border-white shadow-sm`}
                            onPress={() => navigation?.navigate(tile.target)}
                        >
                            <View className="mb-2">{tile.icon}</View>
                            <Text className="text-gray-800 font-black text-[10px] tracking-[2]">{tile.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity
                    className="mt-4 bg-rose-50 rounded-[2rem] p-6 flex-row items-center justify-between border border-white"
                    onPress={() => navigation?.navigate('Profile')}
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 bg-rose-200 rounded-xl items-center justify-center">
                            <User color="#E11D48" size={20} />
                        </View>
                        <View>
                            <Text className="text-gray-800 font-black text-[10px] tracking-[2]">STUDENT PROFILE</Text>
                            <Text className="text-rose-400 text-[8px] font-black">Manage your settings</Text>
                        </View>
                    </View>
                    <Text className="text-rose-300 font-black text-xl">›</Text>
                </TouchableOpacity>
            </View>

            {/* Community Buttons */}
            <View className="px-6 pb-20">
                <Text className="font-black text-gray-800 text-sm tracking-widest uppercase mb-4">Official Channels</Text>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 bg-emerald-500 rounded-2xl py-4 items-center flex-row justify-center gap-2 shadow-lg shadow-emerald-200"
                        onPress={() => Linking.openURL('https://whatsapp.com')}
                    >
                        <MessageCircle color="white" size={18} />
                        <Text className="text-white font-black text-xs uppercase tracking-widest">WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-sky-500 rounded-2xl py-4 items-center flex-row justify-center gap-2 shadow-lg shadow-sky-200"
                        onPress={() => Linking.openURL('https://t.me/')}
                    >
                        <Send color="white" size={18} />
                        <Text className="text-white font-black text-xs uppercase tracking-widest">Telegram</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    );
};

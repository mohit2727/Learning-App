import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ChevronLeft, Play, ShieldCheck, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const MyCoursesScreen = ({ navigation }: any) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await dataService.getMyCourses();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                className="pt-16 pb-12 px-6 rounded-b-[3rem] shadow-xl"
            >
                <TouchableOpacity onPress={() => navigation?.goBack()} className="mb-4 flex-row items-center gap-1">
                    <ChevronLeft size={20} color="#C7D2FE" />
                    <Text className="text-indigo-100 font-black text-[10px] uppercase tracking-widest">BACK</Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-3">
                    <View className="bg-white/10 p-2 rounded-xl border border-white/20">
                        <BookOpen size={22} color="white" />
                    </View>
                    <View>
                        <Text variant="h2" className="text-white font-black text-xl tracking-tight uppercase">My Learning</Text>
                        <Text className="text-indigo-100 text-[9px] font-black tracking-widest uppercase">Your Enrolled Playlists</Text>
                    </View>
                </View>
            </LinearGradient>

            {courses.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-20 h-20 rounded-[2rem] bg-indigo-50 items-center justify-center mb-6">
                        <Sparkles size={36} color="#818CF8" />
                    </View>
                    <Text className="font-black text-gray-800 text-base uppercase tracking-tight text-center">Library is Empty</Text>
                    <Text className="text-gray-400 text-xs text-center mt-2 leading-relaxed font-semibold">
                        You haven't enrolled in any courses yet. Start your journey today!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation?.navigate('Courses')}
                        className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl shadow-xl shadow-indigo-200"
                    >
                        <Text className="text-white font-black text-xs uppercase tracking-widest">Browse Courses</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation?.navigate('CourseDetail', { courseId: item._id })}
                            activeOpacity={0.9}
                            className="bg-white rounded-[2.5rem] mb-6 shadow-xl shadow-black/5 overflow-hidden border border-gray-50"
                        >
                            <View className="h-32 relative">
                                {item.image ? (
                                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <LinearGradient colors={['#6366F1', '#4F46E5']} className="w-full h-full items-center justify-center">
                                        <BookOpen size={40} color="white" opacity={0.2} />
                                    </LinearGradient>
                                )}
                                <View className="absolute inset-0 bg-black/30 px-5 pt-4">
                                    <View className="flex-row justify-between items-start">
                                        <View className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex-row items-center gap-1.5">
                                            <Play size={10} color="white" fill="white" />
                                            <Text className="text-white text-[9px] font-black uppercase tracking-widest">{item.lessons?.length || 0} VIDEOS</Text>
                                        </View>
                                        <View className="bg-emerald-500 p-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                                            <ShieldCheck size={12} color="white" strokeWidth={3} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="p-6 flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="font-black text-gray-800 text-sm uppercase tracking-tight mb-1" numberOfLines={1}>{item.title}</Text>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em] italic">Full Access Unlocked</Text>
                                </View>
                                <View className="w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center">
                                    <Text className="text-gray-300 font-black text-2xl">›</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

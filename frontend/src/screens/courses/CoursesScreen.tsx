import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Video, ChevronRight, BookOpen, Star, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CourseCard = ({ course, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-[2.5rem] mb-6 overflow-hidden shadow-xl shadow-black/5 border border-gray-50"
        activeOpacity={0.9}
    >
        <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            className="h-32 flex-row items-end p-5"
        >
            <View className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1.5">
                <Play size={10} color="white" fill="white" />
                <Text className="text-white text-[9px] font-black uppercase tracking-widest">{course.lessons?.length || 0} VIDEOS</Text>
            </View>
            <View className="bg-emerald-500 p-1.5 rounded-full absolute top-4 right-4 shadow-lg shadow-emerald-500/30">
                <ShieldCheck size={12} color="white" strokeWidth={3} />
            </View>
        </LinearGradient>

        <View className="p-6">
            <Text className="text-gray-800 font-black text-base uppercase tracking-tight mb-1" numberOfLines={1}>{course.title}</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1] mb-4 italic">Exclusive Learning Path</Text>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                <View className="flex-row items-center gap-2">
                    <Text className="text-indigo-600 font-black text-xl tracking-tighter">{course.price ? `₹${course.price}` : 'FREE'}</Text>
                    {course.price > 0 && <Text className="text-gray-300 text-[10px] font-bold line-through">₹{Math.round(course.price * 1.5)}</Text>}
                </View>
                <View className="bg-indigo-600 rounded-2xl px-6 py-2.5 shadow-lg shadow-indigo-200">
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Enroll Now</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

import { useAuth } from '@clerk/clerk-expo';
import { ComingSoon } from '../../components/ComingSoon';

export const CoursesScreen = ({ navigation }: any) => {
    const { isLoaded, isSignedIn } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!isLoaded || !isSignedIn) return;
            setIsLoading(true);
            try {
                const data = await dataService.getCourses();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, [isLoaded, isSignedIn]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2]">FETCHING COURSES...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="rounded-b-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 mb-8">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    className="pt-16 pb-12 px-6"
                >
                    <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3] mb-1">Knowledge Library</Text>
                    <Text variant="h2" className="text-white font-black text-2xl tracking-tighter">Premium Playlists</Text>
                    <Text variant="caption" className="text-indigo-200 mt-0.5">Learn from the best educators</Text>
                </LinearGradient>
            </View>

            <View className="px-6 pb-20">
                {courses.length > 0 ? (
                    courses.map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onPress={() => navigation?.navigate?.('CourseDetail', { courseId: course._id })}
                        />
                    ))
                ) : (
                    <View className="bg-white rounded-[2.5rem] p-10 items-center border border-gray-50 shadow-sm mt-4">
                        <Video size={56} color="#E5E7EB" strokeWidth={1} />
                        <Text className="text-gray-400 font-black text-sm uppercase tracking-widest mt-6">Courses Coming Soon</Text>
                        <Text className="text-gray-300 text-xs text-center font-medium mt-2 px-6">We're curating advanced learning material for your preparation.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

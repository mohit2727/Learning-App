import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ChevronLeft, Clock, BookOpen, Info, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CourseDetailScreen = ({ route, navigation }: any) => {
    const { courseId } = route.params;
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourseDetail = async () => {
            setIsLoading(true);
            try {
                const data = await dataService.getCourseDetail(courseId);
                setCourse(data);
            } catch (error) {
                console.error('Error fetching course detail:', error);
                Alert.alert('Error', 'Failed to load course details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseDetail();
    }, [courseId]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <LinearGradient
                    colors={['#6366F1', '#4F46E5', '#3730A3']}
                    className="pt-16 pb-12 px-6 rounded-b-[4rem] shadow-2xl items-center"
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-16 left-6 flex-row items-center gap-1">
                        <ChevronLeft size={18} color="#C7D2FE" />
                        <Text className="text-indigo-100 font-black text-[10px] uppercase tracking-widest">BACK</Text>
                    </TouchableOpacity>

                    <View className="w-24 h-24 rounded-[2rem] overflow-hidden mb-6 border-2 border-white/30 shadow-2xl mt-4">
                        {course?.image ? (
                            <View className="w-full h-full bg-indigo-50 items-center justify-center">
                                {/* Image rendering omitted for brevity, assuming standard component usage */}
                                <BookOpen size={40} color="#6366F1" opacity={0.2} />
                            </View>
                        ) : (
                            <View className="w-full h-full bg-white/20 items-center justify-center">
                                <BookOpen size={40} color="white" opacity={0.4} />
                            </View>
                        )}
                    </View>

                    <Text className="text-white font-black text-xl text-center uppercase tracking-tight leading-7 px-4">{course?.title}</Text>

                    <View className="flex-row items-center gap-3 mt-4">
                        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20 flex-row items-center gap-2">
                            <Play size={10} color="white" fill="white" />
                            <Text className="text-white text-[9px] font-black uppercase tracking-widest">{course?.lessons?.length || 0} VIDEOS</Text>
                        </View>
                        <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 flex-row items-center gap-2">
                            <ShieldCheck size={12} color="#34D399" />
                            <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">ENROLLED</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View className="px-6 -mt-8 pt-12 pb-32">
                    {/* About Card */}
                    <View className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-50 mb-8">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Info size={16} color="#6366F1" />
                            <Text className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em]">Course Syllabus</Text>
                        </View>
                        <Text className="text-gray-400 text-xs font-medium leading-relaxed">
                            {course?.description || 'Comprehensive learning module designed for top preparation performance.'}
                        </Text>
                    </View>

                    {/* Lessons */}
                    <Text className="font-black text-gray-400 text-[9px] uppercase tracking-[0.3em] ml-4 mb-4">Lessons list</Text>
                    {course?.lessons?.map((lesson: any, i: number) => (
                        <TouchableOpacity
                            key={lesson._id || i}
                            className="bg-white rounded-[1.75rem] p-4 mb-4 shadow-lg shadow-black/5 border border-transparent active:border-indigo-100 flex-row items-center gap-4"
                            onPress={() => navigation.navigate('VideoPlayer', { videoUrl: lesson.videoUrl })}
                        >
                            <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center">
                                <Text className="text-indigo-600 font-black text-lg">{i + 1}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-black text-[11px] uppercase tracking-tight" numberOfLines={1}>{lesson.title}</Text>
                                <View className="flex-row items-center gap-1.5 mt-0.5">
                                    <Clock size={10} color="#CBD5E1" />
                                    <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest">Premium Lesson</Text>
                                </View>
                            </View>
                            <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-100">
                                <Play size={10} color="white" fill="white" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Play All Sticky Button */}
            <View className="absolute bottom-10 left-6 right-6">
                <TouchableOpacity
                    className="bg-indigo-600 rounded-3xl py-5 shadow-2xl shadow-indigo-300 flex-row items-center justify-center gap-3"
                    onPress={() => { if (course?.lessons?.[0]) navigation.navigate('VideoPlayer', { videoUrl: course.lessons[0].videoUrl }) }}
                >
                    <Play size={18} color="white" fill="white" />
                    <Text className="text-white font-black text-xs uppercase tracking-[0.2em]">Start Learning Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

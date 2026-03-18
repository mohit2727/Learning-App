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
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-4 italic">Exclusive Learning Path</Text>

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

import { useAuth } from '../../context/AuthContext';
import { ComingSoon } from '../../components/ComingSoon';

export const CoursesScreen = ({ navigation }: any) => {
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [quizPlaylists, setQuizPlaylists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'videos' | 'quizzes'>('videos');

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading || !user) return;
            setIsLoading(true);
            try {
                const [coursesData, playlistsData] = await Promise.all([
                    dataService.getCourses(),
                    dataService.getQuizPlaylists()
                ]);
                setCourses(coursesData);
                setQuizPlaylists(playlistsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [authLoading, user]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2px]">FETCHING PLAYLISTS...</Text>
            </View>
        );
    }

    const currentItems = activeTab === 'videos' ? courses : quizPlaylists;
    const itemLabel = activeTab === 'videos' ? 'VIDEOS' : 'QUIZZES';

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="rounded-b-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 mb-6">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    className="pt-16 pb-8 px-6"
                >
                    <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mb-1">Knowledge Library</Text>
                    <Text variant="h2" className="text-white font-black text-2xl tracking-tighter">Premium Playlists</Text>
                    
                    <View className="flex-row bg-white/10 p-1 rounded-2xl mt-6 border border-white/10">
                        <TouchableOpacity 
                            onPress={() => setActiveTab('videos')}
                            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'videos' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'videos' ? 'text-indigo-600' : 'text-white'}`}>Video Playlists</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setActiveTab('quizzes')}
                            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'quizzes' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'quizzes' ? 'text-indigo-600' : 'text-white'}`}>Quiz Playlists</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <View className="px-6 pb-20">
                {currentItems.length > 0 ? (
                    currentItems.map((item: any) => (
                        <TouchableOpacity
                            key={item._id}
                            onPress={() => activeTab === 'videos' 
                                ? navigation?.navigate?.('CourseDetail', { courseId: item._id })
                                : navigation?.navigate?.('QuizPlaylistDetail', { playlistId: item._id })
                            }
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
                                    <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                                        {activeTab === 'videos' ? `${item.lessons?.length || 0} VIDEOS` : `${item.quizzes?.length || 0} QUIZZES`}
                                    </Text>
                                </View>
                                <View className="bg-emerald-500 p-1.5 rounded-full absolute top-4 right-4 shadow-lg shadow-emerald-500/30">
                                    <ShieldCheck size={12} color="white" strokeWidth={3} />
                                </View>
                            </LinearGradient>

                            <View className="p-6">
                                <Text className="text-gray-800 font-black text-base uppercase tracking-tight mb-1" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-4 italic">Exclusive {activeTab === 'videos' ? 'LearningPath' : 'Test Series'}</Text>

                                <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-indigo-600 font-black text-xl tracking-tighter">{item.price ? `₹${item.price}` : 'FREE'}</Text>
                                        {item.price > 0 && <Text className="text-gray-300 text-[10px] font-bold line-through">₹{Math.round(item.price * 1.5)}</Text>}
                                    </View>
                                    <View className="bg-indigo-600 rounded-2xl px-6 py-2.5 shadow-lg shadow-indigo-200">
                                        <Text className="text-white font-black text-[10px] uppercase tracking-widest">Enroll Now</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="bg-white rounded-[2.5rem] p-10 items-center border border-gray-50 shadow-sm mt-4">
                        <Video size={56} color="#E5E7EB" strokeWidth={1} />
                        <Text className="text-gray-400 font-black text-sm uppercase tracking-widest mt-6">{activeTab === 'videos' ? 'Courses' : 'Quiz Playlists'} Coming Soon</Text>
                        <Text className="text-gray-300 text-xs text-center font-medium mt-2 px-6">We're curating advanced learning material for your preparation.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

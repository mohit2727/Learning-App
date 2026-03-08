import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';

const CourseCard = ({ course, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden shadow-sm"
        activeOpacity={0.85}
    >
        <View style={{ backgroundColor: '#2563EB', height: 100 }} className="items-end p-2">
            <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-bold">Playlist</Text>
            </View>
        </View>
        <View className="p-4">
            <Text variant="body" className="font-bold text-gray-800 dark:text-white mb-1">{course.title}</Text>
            <View className="flex-row items-center mb-2 mt-1">
                <Text variant="caption" className="text-gray-500">📹 {course.lessons?.length || 0} videos</Text>
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Text className="text-blue-600 font-bold text-lg">{course.price ? `₹${course.price}` : 'Free'}</Text>
                </View>
                <View className="bg-blue-600 rounded-xl px-4 py-1.5">
                    <Text className="text-white font-semibold text-sm">Watch</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

import { useAuth } from '@clerk/clerk-expo';
import { ComingSoon } from '../../components/ComingSoon';
import { Video } from 'lucide-react-native';

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
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" showsVerticalScrollIndicator={false}>
            <View className="bg-blue-600 pt-14 pb-8 px-4 rounded-b-3xl mb-6">
                <Text variant="h2" className="text-white font-bold">▶️ Video Playlists</Text>
                <Text variant="caption" className="text-blue-200 mt-1">Watch and learn from expert curated playlists</Text>
            </View>

            <View className="px-4">
                {courses.length > 0 ? (
                    courses.map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onPress={() => navigation?.navigate?.('CourseDetail', { courseId: course._id })}
                        />
                    ))
                ) : (
                    <ComingSoon
                        title="No Playlists Yet"
                        message="We are currently crafting new video playlists for you. Check back soon!"
                        icon={<Video size={48} color="#2563EB" />}
                    />
                )}
            </View>
        </ScrollView>
    );
};

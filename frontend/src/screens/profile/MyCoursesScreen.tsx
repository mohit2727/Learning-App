import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { BookOpen } from 'lucide-react-native';

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
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-blue-600 pt-14 pb-6 px-4 rounded-b-3xl mb-4">
                <TouchableOpacity onPress={() => navigation?.goBack()} className="mb-3">
                    <Text className="text-blue-200 font-bold">← Back</Text>
                </TouchableOpacity>
                <Text variant="h2" className="text-white font-bold">📚 My Enrolled Courses</Text>
                <Text variant="caption" className="text-blue-200 mt-1">Courses you have access to</Text>
            </View>

            {courses.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
                        <BookOpen size={36} color="#93C5FD" />
                    </View>
                    <Text variant="h3" className="font-bold text-gray-700 text-center">No Courses Enrolled</Text>
                    <Text variant="caption" className="text-gray-500 text-center mt-2">
                        You haven't enrolled in any courses yet. Browse our playlists!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation?.navigate('Courses')}
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-bold">Browse Courses</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation?.navigate('CourseDetail', { courseId: item._id })}
                            activeOpacity={0.8}
                            className="bg-white dark:bg-gray-800 rounded-2xl mb-4 shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={{ width: '100%', height: 100 }} resizeMode="cover" />
                            ) : (
                                <View style={{ height: 100 }} className="bg-blue-600 items-center justify-center">
                                    <Text style={{ fontSize: 40 }}>📚</Text>
                                </View>
                            )}
                            <View className="p-4 flex-row items-center">
                                <View className="flex-1">
                                    <Text variant="h3" className="font-bold text-gray-800 dark:text-white mb-1" numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded self-start">
                                            <Text className="text-blue-600 font-semibold text-xs">{item.lessons?.length || 0} Videos</Text>
                                        </View>
                                        <View className="bg-green-50 px-2 py-1 rounded self-start">
                                            <Text className="text-green-600 font-semibold text-xs">Enrolled</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 24 }} className="text-gray-400 pl-2">›</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

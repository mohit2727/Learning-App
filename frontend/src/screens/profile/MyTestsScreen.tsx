import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { ClipboardList } from 'lucide-react-native';

export const MyTestsScreen = ({ navigation }: any) => {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await dataService.getMyAttempts();
                setAttempts(data);
            } catch (error) {
                console.error('Error fetching attempts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempts();
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
                <Text variant="h2" className="text-white font-bold">📋 My Attempted Tests</Text>
                <Text variant="caption" className="text-blue-200 mt-1">Your quiz history and scores</Text>
            </View>

            {attempts.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
                        <ClipboardList size={36} color="#93C5FD" />
                    </View>
                    <Text variant="h3" className="font-bold text-gray-700 text-center">No Attempts Yet</Text>
                    <Text variant="caption" className="text-gray-500 text-center mt-2">
                        You haven't attempted any quizzes yet. Go take a test!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation?.navigate('Tests')}
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-bold">Browse Quizzes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={attempts}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    renderItem={({ item }) => {
                        const pct = item.totalMarks > 0 ? Math.round((item.score / item.totalMarks) * 100) : 0;
                        const passed = pct >= 60;
                        return (
                            <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1">
                                        <Text variant="body" className="font-bold text-gray-800 dark:text-white">
                                            {item.test?.title || 'Unknown Test'}
                                        </Text>
                                        <Text variant="caption" className="text-gray-500 mt-0.5">
                                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs font-bold ${passed ? 'text-green-700' : 'text-red-600'}`}>
                                            {passed ? 'Passed' : 'Failed'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <Text variant="h3" className={`font-black ${passed ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.score}<Text className="text-gray-400 text-base">/{item.totalMarks || '?'}</Text>
                                    </Text>
                                    <View className="flex-1 bg-gray-100 rounded-full h-2">
                                        <View
                                            className={`h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </View>
                                    <Text className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

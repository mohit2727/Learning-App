import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { Trophy, Medal, Award } from 'lucide-react-native';

import { useAuth } from '@clerk/clerk-expo';

export const LeaderboardScreen = () => {
    const { isLoaded, isSignedIn } = useAuth();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        try {
            const data = await dataService.getLeaderboard();
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [isLoaded, isSignedIn]);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy size={24} color="#FBBF24" />; // Gold
        if (index === 1) return <Medal size={24} color="#9CA3AF" />; // Silver
        if (index === 2) return <Award size={24} color="#D97706" />; // Bronze
        return <Text className="font-bold text-gray-400 text-lg w-6 text-center">{index + 1}</Text>;
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-6 shadow-sm z-10">
                <Text variant="h1" className="text-gray-800 dark:text-white font-bold">🏆 Leaderboard</Text>
                <Text variant="body" className="text-gray-500 mt-1">Top 10 Students by Score</Text>
            </View>

            {/* List */}
            <ScrollView
                className="flex-1 px-4 mt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeaderboard} />}
            >
                {leaderboard.length === 0 && !loading ? (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-500 italic">No scores recorded yet.</Text>
                    </View>
                ) : (
                    leaderboard.map((student, index) => (
                        <View
                            key={student._id || index}
                            className={`flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 shadow-sm border ${index === 0 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' :
                                index === 1 ? 'border-gray-300 dark:border-gray-600' :
                                    index === 2 ? 'border-amber-600 dark:border-amber-900' : 'border-transparent'
                                }`}
                        >
                            {/* Rank Info */}
                            <View className="w-12 items-center justify-center">
                                {getRankIcon(index)}
                            </View>

                            {/* Avatar */}
                            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${index === 0 ? 'bg-yellow-100' :
                                index === 1 ? 'bg-gray-100' :
                                    index === 2 ? 'bg-amber-100' : 'bg-blue-50 dark:bg-blue-900/30'
                                }`}>
                                <Text className={`font-bold text-lg ${index === 0 ? 'text-yellow-600' :
                                    index === 1 ? 'text-gray-600' :
                                        index === 2 ? 'text-amber-700' : 'text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {student.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            {/* Details */}
                            <View className="flex-1">
                                <Text className={`font-bold text-lg ${index < 3 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {student.name}
                                </Text>
                            </View>

                            {/* Score */}
                            <View className="items-end justify-center">
                                <Text className={`font-black text-xl ${index === 0 ? 'text-yellow-600' :
                                    index === 1 ? 'text-gray-600' :
                                        index === 2 ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {student.totalScore}
                                </Text>
                                <Text className="text-xs text-gray-500 font-semibold tracking-wider">PTS</Text>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
};

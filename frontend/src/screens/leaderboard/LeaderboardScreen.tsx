import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Trophy, Award, Medal } from 'lucide-react-native';

import { useAuth } from '@clerk/clerk-expo';

const { width } = Dimensions.get('window');

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

    const top3 = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with Podium Area */}
            <LinearGradient
                colors={['#6366F1', '#4F46E5', '#3730A3']}
                className="pt-16 pb-12 px-6 rounded-b-[4rem] shadow-2xl shadow-indigo-100"
            >
                <View className="flex-row items-center justify-center gap-2 mb-8">
                    <Trophy size={20} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-white font-black text-xl tracking-tight uppercase">Leaderboard</Text>
                </View>

                {/* Podium */}
                {top3.length > 0 && (
                    <View className="flex-row items-end justify-center px-4 mb-2">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <View className="items-center w-[30%] -mr-1">
                                <View className="relative mb-3">
                                    <View className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 items-center justify-center">
                                        <Text className="text-white font-black text-lg">{top3[1].name.charAt(0)}</Text>
                                    </View>
                                    <View className="absolute -top-1 -right-1 w-6 h-6 bg-slate-300 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                                        <Text className="text-indigo-900 text-[10px] font-black">2</Text>
                                    </View>
                                </View>
                                <Text className="text-white text-[9px] font-black truncate w-full text-center mb-2">{top3[1].name.split(' ')[0]}</Text>
                                <View className="h-16 w-full bg-white/10 rounded-t-2xl border-x border-t border-white/10 items-center justify-center">
                                    <Text className="text-white font-black text-xs leading-none">{top3[1].totalScore}</Text>
                                    <Text className="text-indigo-200 text-[6px] font-black uppercase tracking-widest mt-1">PTS</Text>
                                </View>
                            </View>
                        )}

                        {/* 1st Place */}
                        <View className="items-center w-[38%] z-10">
                            <View className="relative mb-4 scale-110">
                                <View className="absolute -top-6 left-1/2 -ml-3">
                                    <Crown size={24} color="#FBBF24" fill="#FBBF24" />
                                </View>
                                <View className="w-16 h-16 rounded-[1.75rem] bg-white border-2 border-yellow-400 items-center justify-center shadow-2xl">
                                    <Text className="text-indigo-600 font-black text-2xl">{top3[0].name.charAt(0)}</Text>
                                </View>
                                <View className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <Text className="text-white text-xs font-black">1</Text>
                                </View>
                            </View>
                            <Text className="text-white text-[11px] font-black truncate w-full text-center mb-2 uppercase">{top3[0].name.split(' ')[0]}</Text>
                            <View className="h-24 w-full bg-white/20 rounded-t-[2rem] border-x border-t border-white/20 items-center justify-center shadow-lg">
                                <Text className="text-white font-black text-sm leading-none">{top3[0].totalScore}</Text>
                                <Text className="text-indigo-100 text-[8px] font-black uppercase tracking-widest mt-1">POINTS</Text>
                            </View>
                        </View>

                        {/* 3rd Place */}
                        {top3[2] && (
                            <View className="items-center w-[30%] -ml-1">
                                <View className="relative mb-3">
                                    <View className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 items-center justify-center">
                                        <Text className="text-white font-black text-lg opacity-80">{top3[2].name.charAt(0)}</Text>
                                    </View>
                                    <View className="absolute -top-1 -right-1 w-6 h-6 bg-amber-600 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                                        <Text className="text-white text-[10px] font-black">3</Text>
                                    </View>
                                </View>
                                <Text className="text-white text-[9px] font-black truncate w-full text-center mb-2">{top3[2].name.split(' ')[0]}</Text>
                                <View className="h-12 w-full bg-white/5 rounded-t-2xl border-x border-t border-white/5 items-center justify-center">
                                    <Text className="text-white font-black text-[10px] leading-none opacity-80">{top3[2].totalScore}</Text>
                                    <Text className="text-indigo-300 text-[6px] font-black uppercase tracking-widest mt-1">PTS</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </LinearGradient>

            <View className="px-6 -mt-8 pt-10">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeaderboard} />}
                >
                    {others.map((student, i) => {
                        const rank = i + 4;
                        const maxScore = top3[0]?.totalScore || 1;
                        const progress = (student.totalScore / maxScore) * 100;

                        return (
                            <View key={student._id || i} className="bg-white rounded-[2rem] p-4 mb-3 flex-row items-center border border-gray-50 shadow-sm">
                                <View className="w-8 items-center">
                                    <Text className="text-gray-300 font-black text-xs">#{rank}</Text>
                                </View>

                                <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center mr-4">
                                    <Text className="text-indigo-600 font-black text-sm">{student.name.charAt(0)}</Text>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-800 font-black text-[11px] uppercase tracking-tight mb-1">{student.name}</Text>
                                    <View className="h-1 bg-gray-100 rounded-full overflow-hidden w-[80%]">
                                        <View className="h-full bg-indigo-200 rounded-full" style={{ width: `${progress}%` }} />
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-indigo-600 font-black text-sm leading-none">{student.totalScore}</Text>
                                    <Text className="text-gray-300 text-[7px] font-black uppercase tracking-widest mt-1">PTS</Text>
                                </View>
                            </View>
                        );
                    })}

                    {leaderboard.length === 0 && !loading && (
                        <View className="items-center justify-center py-20">
                            <Award size={40} color="#E5E7EB" />
                            <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mt-4">Rankings loading...</Text>
                        </View>
                    )}
                    <View className="h-40" />
                </ScrollView>
            </View>
        </View>
    );
};

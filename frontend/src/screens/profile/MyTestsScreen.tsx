import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { ClipboardList, ChevronLeft, Award, Star, Target, ShieldCheck } from 'lucide-react-native';

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
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="rounded-b-[3rem] overflow-hidden shadow-xl">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    className="pt-16 pb-12 px-6"
                >
                    <TouchableOpacity onPress={() => navigation?.goBack()} className="mb-4 flex-row items-center gap-1">
                        <ChevronLeft size={20} color="#C7D2FE" />
                        <Text className="text-indigo-100 font-black text-[10px] uppercase tracking-widest">BACK</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-3">
                        <View className="bg-white/10 p-2 rounded-xl border border-white/20">
                            <ClipboardList size={22} color="white" />
                        </View>
                        <View>
                            <Text variant="h2" className="text-white font-black text-xl tracking-tight uppercase">Test History</Text>
                            <Text className="text-indigo-100 text-[9px] font-black tracking-widest uppercase">Performance Archives</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {attempts.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-20 h-20 rounded-[2rem] bg-indigo-50 items-center justify-center mb-6">
                        <Target size={36} color="#818CF8" />
                    </View>
                    <Text className="font-black text-gray-800 text-base uppercase tracking-tight text-center">No Attempts Recorded</Text>
                    <Text className="text-gray-400 text-xs text-center mt-2 leading-relaxed font-semibold">
                        You haven't challenged yourself yet. Pick a quiz and start learning!
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation?.navigate('Tests')}
                        className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl shadow-xl shadow-indigo-200"
                    >
                        <Text className="text-white font-black text-xs uppercase tracking-widest">Browse Quizzes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={attempts}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 }}
                    renderItem={({ item }) => {
                        const pct = item.totalMarks > 0 ? Math.round((item.score / item.totalMarks) * 100) : 0;
                        const passed = pct >= 60;
                        return (
                            <View className="bg-white p-5 rounded-[2rem] mb-4 shadow-xl shadow-black/5 border border-gray-50">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <Star size={10} color={passed ? '#10B981' : '#94A3B8'} fill={passed ? '#10B981' : 'transparent'} />
                                            <Text className="font-black text-gray-800 text-xs uppercase tracking-tight" numberOfLines={1}>
                                                {item.test?.title || item.quiz?.title || 'Unknown Test'}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest mt-0.5">
                                            Attempted on {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5 ${passed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                        {passed ? <ShieldCheck size={10} color="#10B981" strokeWidth={3} /> : <View className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                                        <Text className={`text-[8px] font-black uppercase tracking-widest ${passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {passed ? 'PASSED' : 'RETRY'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-4 pt-4 border-t border-gray-50">
                                    <View className="items-center min-w-[40px]">
                                        <Text className={`text-xl font-black ${passed ? 'text-emerald-600' : 'text-rose-500'}`}>{item.score}<Text className="text-gray-300 text-[9px]">/{item.totalMarks || '?'}</Text></Text>
                                        <Text className="text-gray-400 text-[7px] font-black uppercase tracking-[2] mt-0.5">SCORE</Text>
                                    </View>

                                    <View className="flex-1 bg-gray-50 rounded-full h-2 overflow-hidden shadow-inner">
                                        <View
                                            className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </View>

                                    <View className="items-end">
                                        <Text className={`text-sm font-black ${passed ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</Text>
                                        <Text className="text-gray-400 text-[7px] font-black uppercase tracking-[2] mt-0.5">GRADE</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

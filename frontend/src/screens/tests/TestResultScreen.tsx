import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const TestResultScreen = ({ route, navigation }: any) => {
    const { answers, questions, backendScore, backendTotalMarks } = route?.params ?? { answers: [], questions: [] };

    let correct = 0, wrong = 0, unattempted = 0;
    questions.forEach((q: any, i: number) => {
        if (answers[i] === null) unattempted++;
        else if (answers[i] === q.correctOption) correct++;
        else wrong++;
    });

    const total = questions.length;
    // Prioritize backend calculated score and total marks
    const displayedScore = backendScore !== undefined ? backendScore : correct;
    const displayedTotal = backendTotalMarks !== undefined ? backendTotalMarks : total;
    const pct = displayedTotal > 0 ? Math.round((displayedScore / displayedTotal) * 100) : 0;

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" showsVerticalScrollIndicator={false}>

            {/* Score Header */}
            <View className="bg-blue-600 pt-14 pb-10 px-4 rounded-b-3xl items-center mb-6">
                <Text variant="caption" className="text-blue-200 mb-2">YOUR RESULT</Text>
                <View className="bg-white/20 w-28 h-28 rounded-full items-center justify-center mb-3">
                    <Text className="text-white font-bold text-4xl">{pct}%</Text>
                </View>
                <Text variant="h3" className="text-white font-bold">{displayedScore}/{displayedTotal} Points</Text>
                <Text variant="caption" className="text-blue-200 mt-1">
                    {correct}/{total} Correct Answers
                </Text>
                <Text variant="caption" className="text-blue-200">
                    {pct >= 70 ? '🎉 Excellent Performance!' : pct >= 50 ? '👍 Good effort! Keep going!' : '📚 More practice needed.'}
                </Text>
            </View>

            {/* Stats Row */}
            <View className="flex-row mx-4 gap-3 mb-6">
                {[
                    { label: 'Correct', count: correct, color: 'bg-green-100', textColor: 'text-green-600' },
                    { label: 'Wrong', count: wrong, color: 'bg-red-100', textColor: 'text-red-500' },
                    { label: 'Skipped', count: unattempted, color: 'bg-gray-100', textColor: 'text-gray-500' },
                ].map(s => (
                    <View key={s.label} className={`flex-1 ${s.color} rounded-2xl p-4 items-center`}>
                        <Text className={`text-2xl font-bold ${s.textColor}`}>{s.count}</Text>
                        <Text variant="caption" className={s.textColor}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Detailed Review */}
            <Text variant="h3" className="font-bold px-4 mb-3 text-gray-800 dark:text-white">📋 Answer Review</Text>
            {questions.map((q: any, i: number) => {
                const userAns = answers[i];
                const isCorrect = userAns === q.correctOption;
                const isSkipped = userAns === null;
                const borderColor = isSkipped ? 'border-gray-200' : isCorrect ? 'border-green-400' : 'border-red-400';
                const bgColor = isSkipped ? 'bg-white dark:bg-gray-800' : isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

                return (
                    <View key={q._id || q.id || i} className={`mx-4 mb-4 rounded-2xl p-4 border-2 ${borderColor} ${bgColor}`}>
                        <View className="flex-row items-start mb-3">
                            <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 mt-0.5 ${isSkipped ? 'bg-gray-300' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                <Text className="text-white text-xs font-bold">{isSkipped ? '–' : isCorrect ? '✓' : '✗'}</Text>
                            </View>
                            <Text variant="body" className="flex-1 font-medium text-gray-800 dark:text-white">{q.text}</Text>
                        </View>
                        {q.options.map((opt: string, oi: number) => {
                            const isThisCorrect = oi === q.correctOption;
                            const isUserPick = oi === userAns;
                            let optBg = 'bg-transparent';
                            if (isThisCorrect) optBg = 'bg-green-100 dark:bg-green-800/40';
                            else if (isUserPick && !isCorrect) optBg = 'bg-red-100 dark:bg-red-800/40';
                            return (
                                <View key={`${i}-${oi}`} className={`flex-row items-center p-2 rounded-lg mb-1 ${optBg}`}>
                                    <Text className={`w-6 font-bold mr-2 ${isThisCorrect ? 'text-green-600' : isUserPick && !isCorrect ? 'text-red-500' : 'text-gray-400'}`}>{OPTION_LABELS[oi]}.</Text>
                                    <Text className={`flex-1 ${isThisCorrect ? 'text-green-700 dark:text-green-400 font-semibold' : isUserPick && !isCorrect ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>{opt}</Text>
                                    {isThisCorrect && <Text className="text-green-600 ml-2">✓</Text>}
                                    {isUserPick && !isCorrect && <Text className="text-red-500 ml-2">✗</Text>}
                                </View>
                            );
                        })}
                        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mt-2">
                            <Text variant="caption" className="text-blue-600 dark:text-blue-400">💡 {q.explanation}</Text>
                        </View>
                    </View>
                );
            })}

            <View className="px-4 pb-8 mt-2 gap-3">
                <Button label="Try Another Test" onPress={() => navigation?.navigate?.('Main', { screen: 'Tests' })} />
                <Button label="Go to Home" variant="outline" onPress={() => navigation?.navigate?.('Main', { screen: 'Home' })} />
            </View>

        </ScrollView>
    );
};

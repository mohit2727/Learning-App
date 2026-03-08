import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    BackHandler,
    ActivityIndicator
} from 'react-native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';

import { dataService } from '../../api/dataService';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const STATUS_COLORS = {
    answered: 'bg-green-500',
    marked: 'bg-yellow-400',
    unanswered: 'bg-gray-200 dark:bg-gray-700',
    current: 'bg-blue-600',
};

type QuestionStatus = 'answered' | 'marked' | 'unanswered';

export const ActiveTestScreen = ({ route, navigation }: any) => {
    const { testId } = route.params;

    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [markedReview, setMarkedReview] = useState<boolean[]>([]);
    const [showPalette, setShowPalette] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const timerRef = useRef<any>(null);

    // Fetch live test questions
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const data = await dataService.getTestById(testId);
                const qList = data.questions || [];
                setQuestions(qList);
                setAnswers(Array(qList.length).fill(null));
                setMarkedReview(Array(qList.length).fill(false));
                if (data.duration) setTimeLeft(data.duration * 60);
            } catch (error) {
                console.error("Failed to load test:", error);
                Alert.alert("Error", "Could not load the test.");
                navigation?.goBack();
            } finally {
                setIsLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    // Timer logic
    useEffect(() => {
        if (isLoading) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [isLoading]);

    // Prevent going back during test
    useEffect(() => {
        const back = BackHandler.addEventListener('hardwareBackPress', () => {
            Alert.alert('Exit Test?', 'Are you sure you want to leave? Progress will be lost.', [
                { text: 'Stay', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation?.goBack() },
            ]);
            return true;
        });
        return () => back.remove();
    }, [navigation]);

    const submitFinalScoreAndNavigate = async (finalAnswers: (number | null)[]) => {
        // Prepare formatted answers for the backend
        const formattedAnswers = finalAnswers.map((ans, i) => ({
            questionId: questions[i]?._id,
            selectedOption: ans
        }));

        try {
            const result = await dataService.submitTestScore(testId, formattedAnswers);
            // The result now contains the backend-calculated score
            navigation?.navigate?.('TestResult', {
                answers: finalAnswers,
                questions: questions,
                backendScore: result.score,
                backendTotalMarks: result.totalMarks
            });
        } catch (error) {
            console.error('Failed to submit score via API', error);
            // Fallback navigation in case of error
            navigation?.navigate?.('TestResult', { answers: finalAnswers, questions: questions });
        }
    };

    const handleAutoSubmit = useCallback(() => {
        clearInterval(timerRef.current);
        setSubmitted(true);
        submitFinalScoreAndNavigate(answers);
    }, [answers, questions]);

    const handleSubmit = () => {
        clearInterval(timerRef.current);
        setShowSubmitModal(false);
        setSubmitted(true);
        submitFinalScoreAndNavigate(answers);
    };

    const getQuestionStatus = (index: number): QuestionStatus => {
        if (answers[index] !== null) return 'answered';
        if (markedReview[index]) return 'marked';
        return 'unanswered';
    };

    const answeredCount = answers.filter(a => a !== null).length;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <Text>No questions found for this test.</Text>
                <Button label="Go Back" onPress={() => navigation?.goBack()} className="mt-4" />
            </View>
        );
    }

    const question = questions[current];
    const selectedAnswer = answers[current];

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');
    const timerDanger = timeLeft < 300;

    const handleSelect = (optionIndex: number) => {
        const updated = [...answers];
        updated[current] = optionIndex;
        setAnswers(updated);
    };

    const handleMarkReview = () => {
        const updated = [...markedReview];
        updated[current] = !updated[current];
        setMarkedReview(updated);
    };

    const handleClear = () => {
        const updated = [...answers];
        updated[current] = null;
        setAnswers(updated);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">

            {/* Top Bar */}
            <View className="bg-white dark:bg-gray-800 px-4 pt-12 pb-3 flex-row items-center justify-between shadow-sm">
                <View>
                    <Text variant="caption" className="text-gray-500">Question {current + 1}/{questions.length}</Text>
                    <Text variant="body" className="font-bold text-gray-800 dark:text-white">Mock Test</Text>
                </View>
                <TouchableOpacity
                    className={`px-4 py-2 rounded-xl ${timerDanger ? 'bg-red-100' : 'bg-blue-50'}`}
                    onPress={() => setShowPalette(true)}
                >
                    <Text className={`font-bold text-lg ${timerDanger ? 'text-red-600' : 'text-blue-600'}`}>⏱ {mm}:{ss}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Question */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <Text variant="body" className="text-gray-800 dark:text-white font-medium leading-6">
                        Q{current + 1}. {question.text}
                    </Text>
                </View>

                {/* Options */}
                {question.options.map((opt: string, i: number) => {
                    const isSelected = selectedAnswer === i;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleSelect(i)}
                            className={`flex-row items-center bg-white dark:bg-gray-800 rounded-xl mb-3 p-4 shadow-sm border-2 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent'
                                }`}
                            activeOpacity={0.8}
                        >
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isSelected ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{OPTION_LABELS[i]}</Text>
                            </View>
                            <Text className={`flex-1 ${isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>{opt}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom Controls */}
            <View className="bg-white dark:bg-gray-800 px-4 pt-3 pb-6 shadow-sm">
                <View className="flex-row gap-2 mb-3">
                    <TouchableOpacity
                        onPress={handleMarkReview}
                        className={`flex-1 rounded-xl py-2.5 items-center border ${markedReview[current] ? 'bg-yellow-400 border-yellow-400' : 'border-yellow-400 bg-yellow-50'}`}
                    >
                        <Text className={`text-sm font-semibold ${markedReview[current] ? 'text-white' : 'text-yellow-600'}`}>⭐ Mark Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleClear}
                        className="flex-1 rounded-xl py-2.5 items-center border border-gray-200 bg-gray-50"
                    >
                        <Text className="text-sm font-semibold text-gray-500">✕ Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowPalette(true)}
                        className="flex-1 rounded-xl py-2.5 items-center border border-blue-200 bg-blue-50"
                    >
                        <Text className="text-sm font-semibold text-blue-600">📋 Palette</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row gap-2">
                    <Button
                        label="← Prev"
                        variant="outline"
                        className="flex-1"
                        disabled={current === 0}
                        onPress={() => setCurrent(c => c - 1)}
                    />
                    {current < questions.length - 1 ? (
                        <Button
                            label="Next →"
                            className="flex-1"
                            onPress={() => setCurrent(c => c + 1)}
                        />
                    ) : (
                        <Button
                            label="Submit Test"
                            className="flex-1 bg-green-600"
                            onPress={() => setShowSubmitModal(true)}
                        />
                    )}
                </View>
            </View>

            {/* Question Palette Modal */}
            <Modal visible={showPalette} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                        <View className="flex-row justify-between mb-4">
                            <Text variant="h3" className="font-bold text-gray-800 dark:text-white">Question Palette</Text>
                            <TouchableOpacity onPress={() => setShowPalette(false)}>
                                <Text className="text-gray-500 text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Legend */}
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-row items-center"><View className="w-4 h-4 rounded-full bg-green-500 mr-1" /><Text variant="caption">Answered ({answeredCount})</Text></View>
                            <View className="flex-row items-center"><View className="w-4 h-4 rounded-full bg-yellow-400 mr-1" /><Text variant="caption">Marked</Text></View>
                            <View className="flex-row items-center"><View className="w-4 h-4 rounded-full bg-gray-200 mr-1" /><Text variant="caption">Not Attempted</Text></View>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {questions.map((_: any, i: number) => {
                                const status = getQuestionStatus(i);
                                const isCurrent = i === current;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => { setCurrent(i); setShowPalette(false); }}
                                        className={`w-10 h-10 rounded-xl items-center justify-center ${isCurrent ? STATUS_COLORS.current : STATUS_COLORS[status]}`}
                                    >
                                        <Text className={`font-bold ${isCurrent || status === 'answered' ? 'text-white' : 'text-gray-600'}`}>{i + 1}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Button label="Submit Test" className="bg-green-600" onPress={() => { setShowPalette(false); setShowSubmitModal(true); }} />
                    </View>
                </View>
            </Modal>

            {/* Submit Confirmation Modal */}
            <Modal visible={showSubmitModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full">
                        <Text variant="h3" className="font-bold text-gray-800 dark:text-white mb-2">Submit Test?</Text>
                        <Text variant="body" className="text-gray-500 mb-4">
                            You have answered {answeredCount} of {questions.length} questions.{' '}
                            {questions.length - answeredCount} questions remain unattempted.
                        </Text>
                        <Button label="Yes, Submit" className="mb-2 bg-green-600" onPress={handleSubmit} />
                        <Button label="Continue Exam" variant="outline" onPress={() => setShowSubmitModal(false)} />
                    </View>
                </View>
            </Modal>

        </View>
    );
};

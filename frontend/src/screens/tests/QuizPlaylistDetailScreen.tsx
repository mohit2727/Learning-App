import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { paymentService } from '../../api/paymentService';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Play, Target, Award, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { toast } from '../../utils/toast';

export const QuizPlaylistDetailScreen = ({ route, navigation }: any) => {
    const { playlistId } = route.params;
    const { user, loading: authLoading } = useAuth();
    const [playlist, setPlaylist] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [razorpayKey, setRazorpayKey] = useState<string>('');
    const [activeQuiz, setActiveQuiz] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetchPlaylistDetail();
        }
    }, [authLoading, user, playlistId]);

    const fetchPlaylistDetail = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getQuizPlaylistById(playlistId);
            setPlaylist(data);
            const stats = await dataService.getDashboard();
            if (stats.razorpayKeyId) setRazorpayKey(stats.razorpayKeyId);
        } catch (error: any) {
            console.error('Error fetching playlist:', error);
            toast.error('Error', error.message || 'Failed to load playlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartQuiz = async (quiz: any) => {
        const hasAccess = playlist?.hasAccess || playlist?.price === 0;
        if (hasAccess) {
            if (quiz?._id) {
                navigation.navigate('ActiveTest', { testId: quiz._id });
            }
        } else {
            toast.info('Access Required', 'Please purchase the playlist to unlock this quiz.');
        }
    };

    const onPaymentComplete = async (event: any) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.status === 'success') {
            setShowPayment(false);
            setIsLoading(true);
            try {
                await paymentService.verifyPayment({
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                });
                toast.success('Success', 'Playlist unlocked successfully!');
                fetchPlaylistDetail();
            } catch (error: any) {
                toast.error('Verification Failed', 'Payment verification failed on server.');
            } finally {
                setIsLoading(false);
            }
        } else if (data.status === 'cancel') {
            setShowPayment(false);
        }
    };

    const razorpayHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </head>
            <body>
                <script>
                    var options = {
                        "key": "${razorpayKey}",
                        "amount": "${paymentOrder?.amount}",
                        "currency": "INR",
                        "name": "Physical Education",
                        "description": "Unlock Playlist: ${playlist?.title}",
                        "order_id": "${paymentOrder?.id}",
                        "handler": function (response){
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                status: 'success',
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            }));
                        },
                        "prefill": {
                            "name": "${user?.displayName || ''}",
                            "email": "${user?.email || ''}"
                        },
                        "theme": { "color": "#6366F1" },
                        "modal": {
                            "ondismiss": function() {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancel' }));
                            }
                        }
                    };
                    var rzp1 = new Razorpay(options);
                    rzp1.open();
                </script>
            </body>
        </html>
    `;

    if (isLoading && !playlist) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2px]">PREPARING PLAYLIST...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="relative">
            <View className="rounded-b-[4rem] overflow-hidden">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    className="pt-16 pb-24 px-6"
                >
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="bg-white/10 w-10 h-10 rounded-full items-center justify-center mb-6"
                    >
                        <ChevronLeft color="white" size={24} />
                    </TouchableOpacity>
                    
                    <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mb-2">Quiz Playlist</Text>
                    <Text variant="h2" className="text-white font-black text-3xl tracking-tighter mb-4">{playlist?.title}</Text>
                    <Text className="text-indigo-100/80 leading-relaxed font-medium">{playlist?.description}</Text>
                </LinearGradient>
            </View>

                <View className="px-6 -mt-12">
                    <View className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-indigo-100 border border-gray-50">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Content</Text>
                                <Text className="text-gray-800 font-black text-xl">{playlist?.quizzes?.length || 0} Quizzes</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Playlist Value</Text>
                                <Text className="text-indigo-600 font-black text-2xl tracking-tighter">
                                    {playlist?.price ? `₹${playlist.price}` : 'FREE'}
                                </Text>
                            </View>
                        </View>
                        
                        {!(playlist?.hasAccess || playlist?.price === 0) && (
                            <TouchableOpacity 
                                onPress={() => handleStartQuiz({})} // Trigger purchase logic
                                className="bg-indigo-600 rounded-2xl py-4 mt-6 shadow-lg shadow-indigo-200"
                            >
                                <Text className="text-white text-center font-black text-xs uppercase tracking-[3px]">PAY NOW — ₹{playlist?.price}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <View className="px-6 mt-10 pb-20">
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-6">Playlist Contents</Text>
                
                {playlist?.quizzes?.map((quiz: any, index: number) => {
                    const hasAccess = playlist?.hasAccess || playlist?.price === 0;
                    return (
                        <TouchableOpacity
                            key={quiz._id}
                            onPress={() => handleStartQuiz(quiz)}
                            className="bg-white mb-4 rounded-[2rem] p-5 shadow-xl shadow-black/5 flex-row items-center border border-gray-50"
                        >
                            <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-4">
                                <Text className="text-indigo-600 font-black text-xs">{index + 1}</Text>
                            </View>
                            
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text className="font-black text-gray-800 text-sm uppercase tracking-tight" numberOfLines={1}>{quiz.title}</Text>
                                    {!hasAccess && <Lock size={12} color="#94A3B8" />}
                                    {hasAccess && playlist?.price > 0 && <View className="bg-emerald-500 rounded-full p-1"><ShieldCheck size={9} color="white" strokeWidth={3} /></View>}
                                </View>
                                
                                <View className="flex-row items-center gap-3">
                                    <View className="flex-row items-center gap-1.5">
                                        <Target size={10} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{quiz.duration || 0} MINS</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1.5">
                                        <Award size={10} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{quiz.totalMarks || 0} MARKS</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View className="bg-gray-50 p-2.5 rounded-2xl flex-row items-center gap-2">
                                {!hasAccess && (
                                    <View className="bg-amber-100 px-2 py-1 rounded-lg">
                                        <Text className="text-amber-600 font-black text-[7px] uppercase tracking-widest">Locked</Text>
                                    </View>
                                )}
                                <Play size={14} color={hasAccess ? "#4F46E5" : "#94A3B8"} fill={hasAccess ? "#4F46E5" : "transparent"} />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Modal visible={showPayment} animationType="slide">
                <View className="flex-1 bg-white">
                    <View className="pt-16 pb-6 px-6 flex-row items-center border-b border-gray-50 justify-between">
                        <Text variant="h3" className="font-black text-gray-800 uppercase tracking-widest">Pay Securely</Text>
                        <TouchableOpacity onPress={() => setShowPayment(false)} className="bg-gray-100 p-2 rounded-full">
                            <Text className="text-gray-400 font-black">✕</Text>
                        </TouchableOpacity>
                    </View>
                    {isProcessing ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text className="mt-4 text-gray-400 font-black text-[10px] uppercase tracking-[2px]">Initializing...</Text>
                        </View>
                    ) : (
                        <WebView
                            source={{ html: razorpayHtml }}
                            onMessage={onPaymentComplete}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            style={{ flex: 1 }}
                        />
                    )}
                </View>
            </Modal>
            
        </ScrollView>
    );
};

import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { paymentService } from '../../api/paymentService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Play, ClipboardList, Target, Award, Sparkles, ShieldCheck } from 'lucide-react-native';

export const TestCategoryScreen = ({ navigation }: any) => {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const [tests, setTests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [razorpayKey, setRazorpayKey] = useState<string>('');
    const [activeTest, setActiveTest] = useState<any>(null);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchTests();
        }
    }, [isLoaded, isSignedIn]);

    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getTests();
            setTests(data);
            const stats = await dataService.getDashboard();
            if (stats.razorpayKeyId) setRazorpayKey(stats.razorpayKeyId);
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartTest = async (test: any) => {
        const isPurchased = test.isPurchased || test.price === 0;
        if (isPurchased) {
            navigation?.navigate?.('ActiveTest', { testId: test._id });
        } else {
            setIsProcessing(true);
            try {
                const order = await paymentService.createOrder(test._id, 'Test');
                setPaymentOrder(order);
                setActiveTest(test);
                setShowPayment(true);
            } catch (error: any) {
                Alert.alert('Payment Error', error.message || 'Failed to initialize payment');
            } finally {
                setIsProcessing(false);
            }
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
                Alert.alert('Success', 'Quiz unlocked successfully!');
                fetchTests();
            } catch (error: any) {
                Alert.alert('Verification Failed', 'Payment verification failed on server.');
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
                        "name": "Ravina App",
                        "description": "Unlock Quiz: ${activeTest?.title}",
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
                            "name": "${user?.fullName || ''}",
                            "email": "${user?.primaryEmailAddress?.emailAddress || ''}"
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

    if (isLoading && tests.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[0.2em]">FETCHING QUIZZES...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                className="pt-16 pb-12 px-6 rounded-b-[3rem] shadow-2xl shadow-indigo-100 mb-8"
            >
                <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Practice Suite</Text>
                <Text variant="h2" className="text-white font-black text-2xl tracking-tighter">Quizzes & Tests</Text>
                <Text variant="caption" className="text-indigo-200 mt-0.5">Test your logic and preparation</Text>
            </LinearGradient>

            <View className="px-6 pb-20">
                {tests.length > 0 ? (
                    tests.map((test) => {
                        const isPurchased = test.isPurchased || test.price === 0;
                        return (
                            <TouchableOpacity
                                key={test._id}
                                className="bg-white mb-4 rounded-[2rem] p-6 shadow-xl shadow-black/5 flex-row items-center border border-gray-50"
                                activeOpacity={0.9}
                                onPress={() => handleStartTest(test)}
                            >
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Text className="font-black text-gray-800 text-sm uppercase tracking-tight" numberOfLines={1}>{test.title}</Text>
                                        {!isPurchased && <Lock size={12} color="#94A3B8" />}
                                        {isPurchased && test.price > 0 && <View className="bg-emerald-500 rounded-full p-1"><ShieldCheck size={10} color="white" strokeWidth={3} /></View>}
                                    </View>
                                    <Text className="text-gray-400 text-[10px] font-bold leading-relaxed mb-4" numberOfLines={2}>{test.description || 'Quick assessment for students.'}</Text>

                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-indigo-50 px-2.5 py-1 rounded-xl flex-row items-center gap-1.5">
                                            <Target size={10} color="#4F46E5" />
                                            <Text className="text-indigo-600 text-[8px] font-black uppercase tracking-widest">{test.duration || 0} MINS</Text>
                                        </View>
                                        <View className="bg-amber-50 px-2.5 py-1 rounded-xl flex-row items-center gap-1.5">
                                            <Award size={10} color="#D97706" />
                                            <Text className="text-amber-600 text-[8px] font-black uppercase tracking-widest">{test.totalMarks || 0} MARKS</Text>
                                        </View>

                                        {!isPurchased ? (
                                            <Text className="text-indigo-600 font-black text-lg ml-auto tracking-tighter">₹{test.price}</Text>
                                        ) : (
                                            <Text className="text-emerald-500 font-black text-[9px] ml-auto uppercase tracking-widest">READY</Text>
                                        )}
                                    </View>
                                </View>
                                <View className="pl-4">
                                    <View className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Text className="text-gray-300 font-black text-xl">›</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View className="bg-white rounded-[2.5rem] p-10 items-center border border-gray-50 shadow-sm mt-4">
                        <ClipboardList size={56} color="#E5E7EB" strokeWidth={1} />
                        <Text className="text-gray-400 font-black text-sm uppercase tracking-widest mt-6">Quizzes Coming Soon</Text>
                    </View>
                )}
            </View>

            {/* Razorpay WebView Modal */}
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
                            <Text className="mt-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Initializing...</Text>
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

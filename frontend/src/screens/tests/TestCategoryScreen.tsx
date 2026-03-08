import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { paymentService } from '../../api/paymentService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Lock, Play } from 'lucide-react-native';

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

            // Also fetch razorpay key
            const stats = await dataService.getDashboard();
            if (stats.razorpayKeyId) {
                setRazorpayKey(stats.razorpayKeyId);
            }
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
            // Initiate payment
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
                fetchTests(); // Refresh to update button states
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
                        "theme": {
                            "color": "#2563EB"
                        },
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
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View className="bg-blue-600 pt-14 pb-8 px-4 rounded-b-3xl mb-6">
                <Text variant="h2" className="text-white font-bold">📝 Quizzes & Tests</Text>
                <Text variant="caption" className="text-blue-200 mt-1">Assess your preparation level</Text>
            </View>

            {/* Quizzes List */}
            <Text variant="h3" className="font-bold px-4 mb-3 text-gray-800 dark:text-white">Available Quizzes</Text>
            {tests.length > 0 ? (
                tests.map((test) => {
                    const isPurchased = test.isPurchased || test.price === 0;
                    return (
                        <TouchableOpacity
                            key={test._id}
                            className="bg-white dark:bg-gray-800 mx-4 mb-3 rounded-xl p-4 shadow-sm flex-row items-center border border-gray-100 dark:border-gray-700"
                            activeOpacity={0.8}
                            onPress={() => handleStartTest(test)}
                        >
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Text variant="body" className="font-bold text-gray-800 dark:text-white" numberOfLines={1}>{test.title}</Text>
                                    {!isPurchased && <Lock size={12} color="#6B7280" />}
                                </View>
                                <Text variant="caption" className="text-gray-500" numberOfLines={2}>{test.description || 'No description provided'}</Text>
                                <View className="flex-row items-center mt-2 gap-3">
                                    <Text variant="caption" className="text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                        ⏱️ {test.duration || 0} mins
                                    </Text>
                                    <Text variant="caption" className="text-purple-600 font-semibold bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                                        🎯 {test.totalMarks || 0} Marks
                                    </Text>
                                    {!isPurchased && (
                                        <Text variant="caption" className="text-emerald-600 font-bold ml-auto">
                                            ₹{test.price}
                                        </Text>
                                    )}
                                    {isPurchased && test.price > 0 && (
                                        <Text variant="caption" className="text-emerald-600 font-bold ml-auto">
                                            UNLOCKED
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View className="pl-2">
                                <Text style={{ fontSize: 24, color: '#2563EB' }}>›</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })
            ) : (
                <Text className="text-center text-gray-500 mt-10">No quizzes available right now.</Text>
            )}

            {/* Razorpay WebView Modal */}
            <Modal visible={showPayment} animationType="slide">
                <View className="flex-1 bg-white">
                    <View className="pt-12 pb-4 px-4 flex-row items-center border-b border-gray-100 justify-between">
                        <Text variant="h3" weight="bold">Secure Checkout</Text>
                        <TouchableOpacity onPress={() => setShowPayment(false)}>
                            <Text className="text-blue-600 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    {isProcessing ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text className="mt-4 text-gray-500">Initializing Payment...</Text>
                        </View>
                    ) : (
                        <WebView
                            source={{ html: razorpayHtml }}
                            onMessage={onPaymentComplete}
                            style={{ flex: 1 }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                        />
                    )}
                </View>
            </Modal>

        </ScrollView>
    );
};

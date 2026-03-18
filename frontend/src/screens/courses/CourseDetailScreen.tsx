import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ChevronLeft, Clock, BookOpen, Info, ShieldCheck, Lock } from 'lucide-react-native';
import { paymentService } from '../../api/paymentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';

const { width } = Dimensions.get('window');

export const CourseDetailScreen = ({ route, navigation }: any) => {
    const { courseId } = route.params;
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [razorpayKey, setRazorpayKey] = useState<string>('');

    const fetchCourseDetail = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getCourseById(courseId);
            setCourse(data);
            const stats = await dataService.getDashboard();
            if (stats.razorpayKeyId) setRazorpayKey(stats.razorpayKeyId);
        } catch (error) {
            console.error('Error fetching course detail:', error);
            Alert.alert('Error', 'Failed to load course details.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchCourseDetail();
        }
    }, [authLoading, user, courseId]);

    const handleEnroll = async () => {
        const isEnrolled = course?.isEnrolled || course?.price === 0;
        if (isEnrolled) {
            toast.info('Info', 'You are already enrolled.');
        } else {
            setIsProcessing(true);
            try {
                const order = await paymentService.createOrder(courseId, 'Course');
                setPaymentOrder(order);
                setShowPayment(true);
            } catch (error: any) {
                toast.error('Payment Error', error.message || 'Failed to initialize payment');
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
                toast.success('Success', 'Course unlocked successfully!');
                fetchCourseDetail();
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
                        "description": "Unlock Course: ${course?.title}",
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

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header */}
                <View className="rounded-b-[4rem] overflow-hidden shadow-2xl">
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5', '#3730A3']}
                        className="pt-16 pb-12 px-6 items-center"
                    >
                        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-16 left-6 flex-row items-center gap-1">
                            <ChevronLeft size={18} color="#C7D2FE" />
                            <Text className="text-indigo-100 font-black text-[10px] uppercase tracking-widest">BACK</Text>
                        </TouchableOpacity>

                        <View className="w-24 h-24 rounded-[2rem] overflow-hidden mb-6 border-2 border-white/30 shadow-2xl mt-4">
                            {course?.image ? (
                                <View className="w-full h-full bg-indigo-50 items-center justify-center">
                                    {/* Image rendering omitted for brevity, assuming standard component usage */}
                                    <BookOpen size={40} color="#6366F1" opacity={0.2} />
                                </View>
                            ) : (
                                <View className="w-full h-full bg-white/20 items-center justify-center">
                                    <BookOpen size={40} color="white" opacity={0.4} />
                                </View>
                            )}
                        </View>

                        <Text className="text-white font-black text-xl text-center uppercase tracking-tight leading-7 px-4">{course?.title}</Text>

                        <View className="flex-row items-center gap-3 mt-4">
                            <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/20 flex-row items-center gap-2">
                                <Play size={10} color="white" fill="white" />
                                <Text className="text-white text-[9px] font-black uppercase tracking-widest">{course?.lessons?.length || 0} VIDEOS</Text>
                            </View>
                            {course?.isEnrolled || course?.price === 0 ? (
                                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 flex-row items-center gap-2">
                                    <ShieldCheck size={12} color="#34D399" />
                                    <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">ENROLLED</Text>
                                </View>
                            ) : (
                                <View className="bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30 flex-row items-center gap-2">
                                    <Lock size={12} color="#F59E0B" />
                                    <Text className="text-amber-400 text-[9px] font-black uppercase tracking-widest">LOCKED</Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                <View className="px-6 -mt-8 pt-12 pb-32">
                    {/* About Card */}
                    <View className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-50 mb-8">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Info size={16} color="#6366F1" />
                            <Text className="font-black text-gray-800 text-[10px] uppercase tracking-[2px]">Course Syllabus</Text>
                        </View>
                        <Text className="text-gray-400 text-xs font-medium leading-relaxed">
                            {course?.description || 'Comprehensive learning module designed for top preparation performance.'}
                        </Text>
                    </View>

                    {/* Lessons */}
                    <Text className="font-black text-gray-400 text-[9px] uppercase tracking-[3px] ml-4 mb-4">Lessons list</Text>
                    {course?.lessons?.map((lesson: any, i: number) => {
                        const isEnrolled = course?.isEnrolled || course?.price === 0;
                        return (
                            <TouchableOpacity
                                key={lesson._id || i}
                                className="bg-white rounded-[1.75rem] p-4 mb-4 shadow-lg shadow-black/5 border border-transparent active:border-indigo-100 flex-row items-center gap-4"
                                onPress={() => {
                                    if (isEnrolled) {
                                        navigation.navigate('VideoPlayer', { videoUrl: lesson.videoUrl });
                                    } else {
                                        handleEnroll();
                                    }
                                }}
                            >
                                <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center">
                                    <Text className="text-indigo-600 font-black text-lg">{i + 1}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-black text-[11px] uppercase tracking-tight" numberOfLines={1}>{lesson.title}</Text>
                                    <View className="flex-row items-center gap-1.5 mt-0.5">
                                        {isEnrolled ? <ShieldCheck size={10} color="#10B981" /> : <Lock size={10} color="#CBD5E1" />}
                                        <Text className="text-gray-300 text-[8px] font-black uppercase tracking-widest">
                                            {isEnrolled ? 'Unlocked' : 'Premium Lesson'}
                                        </Text>
                                    </View>
                                </View>
                                <View className={`w-8 h-8 rounded-full items-center justify-center shadow-lg ${isEnrolled ? 'bg-indigo-600 shadow-indigo-100' : 'bg-gray-100 shadow-transparent'}`}>
                                    <Play size={10} color={isEnrolled ? "white" : "#CBD5E1"} fill={isEnrolled ? "white" : "transparent"} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Sticky Action Button */}
            <View className="absolute bottom-10 left-6 right-6">
                {course?.isEnrolled || course?.price === 0 ? (
                    <TouchableOpacity
                        className="bg-indigo-600 rounded-3xl py-5 shadow-2xl shadow-indigo-300 flex-row items-center justify-center gap-3"
                        onPress={() => { if (course?.lessons?.[0]) navigation.navigate('VideoPlayer', { videoUrl: course.lessons[0].videoUrl }) }}
                    >
                        <Play size={18} color="white" fill="white" />
                        <Text className="text-white font-black text-xs uppercase tracking-[2px]">Start Learning Now</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        className="bg-rose-500 rounded-3xl py-6 shadow-2xl shadow-rose-400 flex-row items-center justify-center gap-3"
                        onPress={handleEnroll}
                    >
                        <ShieldCheck size={20} color="white" strokeWidth={3} />
                        <Text className="text-white font-black text-sm uppercase tracking-[3px]">PAY NOW — ₹{course?.price}</Text>
                    </TouchableOpacity>
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
        </View>
    );
};

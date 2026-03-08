import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { paymentService } from '../../api/paymentService';
import { ChevronLeft, Play, Clock, BookOpen, Lock } from 'lucide-react-native';
import { ComingSoon } from '../../components/ComingSoon';
import { useUser } from '@clerk/clerk-expo';

export const CourseDetailScreen = ({ route, navigation }: any) => {
    const { courseId } = route.params;
    const { user } = useUser();
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [razorpayKey, setRazorpayKey] = useState<string>('');

    useEffect(() => {
        fetchCourseDetail();
    }, [courseId]);

    const fetchCourseDetail = async () => {
        try {
            const data = await dataService.getCourseById(courseId);
            setCourse(data);

            // Also fetch razorpay key from dashboard stats for convenience
            const stats = await dataService.getDashboard();
            if (stats.razorpayKeyId) {
                setRazorpayKey(stats.razorpayKeyId);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!course.price) return;

        setIsProcessing(true);
        try {
            const order = await paymentService.createOrder(courseId, 'Course');
            setPaymentOrder(order);
            setShowPayment(true);
        } catch (error: any) {
            Alert.alert('Payment Error', error.message || 'Failed to initialize payment');
        } finally {
            setIsProcessing(false);
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
                Alert.alert('Success', 'You have been enrolled successfully!');
                fetchCourseDetail(); // Refresh to unlock lessons
            } catch (error: any) {
                Alert.alert('Verification Failed', 'Payment verified failed on server.');
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
                        "description": "Enrollment for ${course?.title}",
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

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!course) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-4">
                <ComingSoon title="Course Metadata Missing" message="We couldn't find the details for this course. Please try again later." />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isEnrolled = course.isEnrolled || course.price === 0;

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="pt-14 pb-4 px-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={24} color={course.price > 0 && !isEnrolled ? "#6B7280" : "#1F2937"} />
                </TouchableOpacity>
                <Text variant="h3" weight="bold" className="flex-1 text-gray-800 dark:text-white" numberOfLines={1}>
                    {course.title}
                </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Course Banner/Thumbnail */}
                <View style={{ height: 200 }} className="justify-center items-center bg-gray-100 dark:bg-gray-800">
                    {course.image ? (
                        <Image
                            source={{ uri: course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}` }}
                            className="w-full h-full"
                            style={{ resizeMode: 'cover' }}
                        />
                    ) : (
                        <Play size={48} color="#2563EB" fill="#2563EB" />
                    )}
                </View>

                <View className="p-4">
                    <Text variant="h2" weight="bold" className="text-gray-900 dark:text-white mb-2">
                        {course.title}
                    </Text>

                    <View className="flex-row items-center gap-4 mb-6">
                        <View className="flex-row items-center gap-1">
                            <BookOpen size={16} color="#6B7280" />
                            <Text variant="caption">{course.lessons?.length || 0} Lessons</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Clock size={16} color="#6B7280" />
                            <Text variant="caption">Self-paced</Text>
                        </View>
                        {!isEnrolled && (
                            <Text className="text-blue-600 font-bold ml-auto text-lg">
                                {course.price ? `₹${course.price}` : 'Free'}
                            </Text>
                        )}
                        {isEnrolled && course.price > 0 && (
                            <View className="ml-auto bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                                <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">Enrolled</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                        <Text variant="h3" weight="bold" className="text-gray-800 dark:text-white">
                            Curriculum
                        </Text>
                        {!isEnrolled && (
                            <View className="flex-row items-center gap-1">
                                <Lock size={12} color="#6B7280" />
                                <Text variant="caption" className="text-gray-500 italic">Locked content</Text>
                            </View>
                        )}
                    </View>

                    {course.lessons && course.lessons.length > 0 ? (
                        course.lessons.map((lesson: any, index: number) => (
                            <TouchableOpacity
                                key={lesson._id || index}
                                onPress={() => {
                                    if (isEnrolled) {
                                        navigation.navigate('VideoPlayer', { lesson, courseTitle: course.title });
                                    } else {
                                        Alert.alert('Enrollment Required', 'Please enroll in the course to access this lesson.');
                                    }
                                }}
                                className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isEnrolled
                                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                        : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-50 dark:border-gray-800 opacity-60'
                                    }`}
                            >
                                <View className="w-16 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center mr-4 overflow-hidden border border-gray-100 dark:border-gray-600">
                                    {lesson.image ? (
                                        <Image
                                            source={{ uri: lesson.image.startsWith('http') ? lesson.image : `http://localhost:5000${lesson.image}` }}
                                            className="w-full h-full"
                                            style={{ resizeMode: 'cover' }}
                                        />
                                    ) : (
                                        <Text className="text-blue-600 font-bold">{index + 1}</Text>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text weight="medium" className="text-gray-800 dark:text-white mb-1">
                                        {lesson.title}
                                    </Text>
                                    <Text variant="caption" className="text-gray-500">
                                        {lesson.duration || 'Video'}
                                    </Text>
                                </View>
                                {isEnrolled ? <Play size={20} color="#2563EB" /> : <Lock size={20} color="#9CA3AF" />}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <ComingSoon
                            title="Lessons Coming Soon"
                            message="We're currently uploading the curriculum for this course. Please check back in a bit!"
                            icon={<Play size={40} color="#2563EB" fill="#2563EB" />}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Bottom CTA if course is paid and not enrolled */}
            {!isEnrolled && course.price > 0 && (
                <View className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-black">
                    <TouchableOpacity
                        onPress={handleEnroll}
                        disabled={isProcessing}
                        className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/20 active:bg-blue-700"
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Enroll Now - ₹{course.price}</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
                    <WebView
                        source={{ html: razorpayHtml }}
                        onMessage={onPaymentComplete}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                    />
                </View>
            </Modal>
        </View>
    );
};

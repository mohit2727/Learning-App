import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Video, ChevronRight, BookOpen, Star, ShieldCheck, Lock } from 'lucide-react-native';
import { paymentService } from '../../api/paymentService';
import { toast } from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';
import { ComingSoon } from '../../components/ComingSoon';
import { useRefresh } from '../../hooks/useRefresh';

const { width } = Dimensions.get('window');

const CourseCard = ({ course, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-[2.5rem] mb-6 overflow-hidden shadow-xl shadow-black/5 border border-gray-50"
        activeOpacity={0.9}
    >
        <View className="h-32 rounded-t-[2.5rem] overflow-hidden">
            <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                className="flex-1 flex-row items-end p-5"
            >
                <View className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1.5">
                    <Play size={10} color="white" fill="white" />
                    <Text className="text-white text-[9px] font-black uppercase tracking-widest">{course.lessons?.length || 0} VIDEOS</Text>
                </View>
                <View className="bg-emerald-500 p-1.5 rounded-full absolute top-4 right-4 shadow-lg shadow-emerald-500/30">
                    <ShieldCheck size={12} color="white" strokeWidth={3} />
                </View>
            </LinearGradient>
        </View>

        <View className="p-6">
            <Text className="text-gray-800 font-black text-base uppercase tracking-tight mb-1" numberOfLines={1}>{course.title}</Text>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-4 italic">Exclusive Learning Path</Text>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                <View className="flex-row items-center gap-2">
                    <Text className="text-indigo-600 font-black text-xl tracking-tighter">{course.price ? `₹${course.price}` : 'FREE'}</Text>
                    {course.price > 0 && <Text className="text-gray-300 text-[10px] font-bold line-through">₹{Math.round(course.price * 1.5)}</Text>}
                </View>
                <View className="bg-indigo-600 rounded-2xl px-6 py-2.5 shadow-lg shadow-indigo-200">
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Enroll Now</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);


export const CoursesScreen = ({ navigation }: any) => {
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [quizPlaylists, setQuizPlaylists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'videos' | 'quizzes'>('videos');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [razorpayKey, setRazorpayKey] = useState<string>('');
    const [activeItem, setActiveItem] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [coursesData, playlistsData, dashboardStats] = await Promise.all([
                dataService.getCourses(),
                dataService.getQuizPlaylists(),
                dataService.getDashboard()
            ]);
            setCourses(coursesData);
            setQuizPlaylists(playlistsData);
            if (dashboardStats.razorpayKeyId) setRazorpayKey(dashboardStats.razorpayKeyId);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    const handleEnrollFromList = async (item: any) => {
        const hasAccess = activeTab === 'videos' ? item.isEnrolled : item.hasAccess;
        if (hasAccess || item.price === 0) {
            // Navigate to detail if already have access
            if (activeTab === 'videos') {
                 navigation?.navigate?.('CourseDetail', { courseId: item._id });
            } else {
                 navigation?.navigate?.('QuizPlaylistDetail', { playlistId: item._id });
            }
            return;
        }

        setIsProcessing(true);
        setActiveItem(item);
        try {
            const order = await paymentService.createOrder(item._id, activeTab === 'videos' ? 'Course' : 'QuizPlaylist');
            setPaymentOrder(order);
            setShowPayment(true);
        } catch (error: any) {
            toast.error('Payment Error', error.message || 'Failed to initialize payment');
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
                toast.success('Success', `${activeTab === 'videos' ? 'Course' : 'Playlist'} unlocked successfully!`);
                fetchData();
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
                        "description": "Unlock ${activeTab === 'videos' ? 'Course' : 'Playlist'}: ${activeItem?.title}",
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

    const { refreshing, onRefresh } = useRefresh(fetchData);

    useEffect(() => {
        if (!authLoading && user) {
            setIsLoading(true);
            fetchData().finally(() => setIsLoading(false));
        }
    }, [authLoading, user]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2px]">FETCHING PLAYLISTS...</Text>
            </View>
        );
    }

    const currentItems = activeTab === 'videos' ? courses : quizPlaylists;
    const itemLabel = activeTab === 'videos' ? 'VIDEOS' : 'QUIZZES';

    return (
        <ScrollView 
            className="flex-1 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
            }
        >
            <View className="rounded-b-[3rem] overflow-hidden shadow-2xl shadow-indigo-100 mb-6">
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    className="pt-16 pb-8 px-6"
                >
                    <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mb-1">Knowledge Library</Text>
                    <Text variant="h2" className="text-white font-black text-2xl tracking-tighter">Premium Playlists</Text>
                    
                    <View className="flex-row bg-white/10 p-1 rounded-2xl mt-6 border border-white/10">
                        <TouchableOpacity 
                            onPress={() => setActiveTab('videos')}
                            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'videos' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'videos' ? 'text-indigo-600' : 'text-white'}`}>Video Playlists</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setActiveTab('quizzes')}
                            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'quizzes' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'quizzes' ? 'text-indigo-600' : 'text-white'}`}>Quiz Playlists</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <View className="px-6 pb-20">
                {currentItems.length > 0 ? (
                    currentItems.map((item: any) => (
                        <TouchableOpacity
                            key={item._id}
                            onPress={() => activeTab === 'videos' 
                                ? navigation?.navigate?.('CourseDetail', { courseId: item._id })
                                : navigation?.navigate?.('QuizPlaylistDetail', { playlistId: item._id })
                            }
                            className="bg-white rounded-[2.5rem] mb-6 overflow-hidden shadow-xl shadow-black/5 border border-gray-50"
                            activeOpacity={0.9}
                        >
                            <View className="h-32 overflow-hidden">
                                <LinearGradient
                                    colors={['#6366F1', '#4F46E5']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    className="flex-1 flex-row items-end p-5"
                                >
                                    <View className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1.5">
                                        <Play size={10} color="white" fill="white" />
                                        <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                                        {activeTab === 'videos' ? `${item.lessons?.length || 0} VIDEOS` : `${item.quizzes?.length || 0} QUIZZES`}
                                    </Text>
                                </View>
                                {((activeTab === 'videos' ? item.isEnrolled : item.hasAccess) || item.price === 0) ? (
                                    <View className="bg-emerald-500 p-1.5 rounded-full absolute top-4 right-4 shadow-lg shadow-emerald-500/30">
                                        <ShieldCheck size={12} color="white" strokeWidth={3} />
                                    </View>
                                ) : (
                                    <View className="bg-rose-500 p-1.5 rounded-full absolute top-4 right-4 shadow-lg shadow-rose-500/30">
                                        <Lock size={12} color="white" />
                                    </View>
                                )}
                            </LinearGradient>
                            </View>

                            <View className="p-6">
                                <Text className="text-gray-800 font-black text-base uppercase tracking-tight mb-1" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[1px] mb-4 italic">Exclusive {activeTab === 'videos' ? 'LearningPath' : 'Test Series'}</Text>

                                <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-indigo-600 font-black text-xl tracking-tighter">{item.price ? `₹${item.price}` : 'FREE'}</Text>
                                        {item.price > 0 && <Text className="text-gray-300 text-[10px] font-bold line-through">₹{Math.round(item.price * 1.5)}</Text>}
                                    </View>
                                    
                                    {((activeTab === 'videos' ? item.isEnrolled : item.hasAccess) || item.price === 0) ? (
                                        <View className="bg-emerald-50 rounded-2xl px-6 py-2.5 flex-row items-center gap-1.5">
                                            <ShieldCheck size={12} color="#10B981" strokeWidth={3} />
                                            <Text className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Enrolled</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleEnrollFromList(item)}
                                            className="bg-rose-500 rounded-2xl px-6 py-3 shadow-lg shadow-rose-200"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">PAY NOW</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="bg-white rounded-[2.5rem] p-10 items-center border border-gray-50 shadow-sm mt-4">
                        <Video size={56} color="#E5E7EB" strokeWidth={1} />
                        <Text className="text-gray-400 font-black text-sm uppercase tracking-widest mt-6">{activeTab === 'videos' ? 'Courses' : 'Quiz Playlists'} Coming Soon</Text>
                        <Text className="text-gray-300 text-xs text-center font-medium mt-2 px-6">We're curating advanced learning material for your preparation.</Text>
                    </View>
                )}
            </View>

            {/* Razorpay WebView Modal */}
            <Modal visible={showPayment} animationType="slide">
                <View className="flex-1 bg-white">
                    <View className="pt-16 pb-6 px-6 flex-row items-center border-b border-gray-50 justify-between">
                        <Text variant="h3" className="font-black text-gray-800 uppercase tracking-widest">Secure Checkout</Text>
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

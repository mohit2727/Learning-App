import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from '../../components/Text';
import { dataService } from '../../api/dataService';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShoppingBag, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';

export const OrderHistoryScreen = ({ navigation }: any) => {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders();
        }
    }, [authLoading, user]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle2 size={12} color="#059669" /> };
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={12} color="#D97706" /> };
            default:
                return { bg: 'bg-rose-50', text: 'text-rose-600', icon: <AlertCircle size={12} color="#E11D48" /> };
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-gray-400 text-[10px] font-black mt-4 tracking-[2px]">LOCALIZING ORDERS...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                className="pt-16 pb-12 px-6 rounded-b-[4rem]"
            >
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="bg-white/10 w-10 h-10 rounded-full items-center justify-center mb-6"
                >
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                
                <Text className="text-indigo-100 text-[10px] font-black uppercase tracking-[3px] mb-1">Account Activity</Text>
                <Text variant="h2" className="text-white font-black text-3xl tracking-tighter">Order History</Text>
            </LinearGradient>

            <View className="px-6 -mt-8 pb-20">
                {orders.length > 0 ? (
                    orders.map((order: any) => {
                        const { bg, text, icon } = getStatusStyles(order.status);
                        return (
                            <View 
                                key={order._id}
                                className="bg-white rounded-[2.5rem] p-6 mb-6 shadow-xl shadow-black/5 border border-gray-50"
                            >
                                <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                    <View className="flex-row items-center gap-2">
                                        <Calendar size={14} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{formatDate(order.createdAt)}</Text>
                                    </View>
                                    <View className={`${bg} px-3 py-1.5 rounded-full flex-row items-center gap-1.5`}>
                                        {icon}
                                        <Text className={`${text} text-[9px] font-black uppercase tracking-widest`}>{order.status}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4">
                                        <ShoppingBag size={20} color="#6366F1" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-0.5">{order.itemModel}</Text>
                                        <Text className="text-gray-800 font-black text-base uppercase tracking-tight" numberOfLines={1}>
                                            {order.itemId?.title || 'Unknown Item'}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-indigo-600 font-black text-xl tracking-tighter">₹{order.amount}</Text>
                                        <Text className="text-gray-300 text-[9px] font-bold">via Razorpay</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View className="bg-white rounded-[2.5rem] p-10 items-center border border-gray-50 shadow-sm mt-12">
                        <ShoppingBag size={56} color="#E5E7EB" strokeWidth={1} />
                        <Text className="text-gray-400 font-black text-sm uppercase tracking-widest mt-6">No Orders Yet</Text>
                        <Text className="text-gray-300 text-xs text-center font-medium mt-2 px-6">Your purchases will appear here once you make an enrollment.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

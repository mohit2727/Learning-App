'use client';
import { useAuth } from '@/context/AuthContext';
import { paymentService } from '@/lib/api';
import { ChevronLeft, Receipt, Calendar, CreditCard, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function OrderHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: orders, error, isLoading } = useSWR(
        user ? 'my-orders' : null,
        () => paymentService.getMyOrders(),
        { revalidateOnFocus: false }
    );

    if (authLoading || isLoading) return (
        <div className="flex-1 flex items-center justify-center p-20 bg-gray-50">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'failed': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header */}
            <div className="grad-header pb-12 rounded-b-[2.5rem] shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all">
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-white text-2xl font-black tracking-tight">Order History</h1>
                </div>
                <p className="text-violet-100 text-sm font-medium opacity-80">Track your purchases and subscriptions</p>
            </div>

            <div className="px-5 -mt-6 pb-20 space-y-4 relative z-20">
                {error ? (
                    <div className="bg-white rounded-[2rem] p-10 text-center shadow-xl border border-rose-100">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-rose-500" />
                        </div>
                        <h3 className="text-gray-800 font-black text-lg mb-2">Failed to load orders</h3>
                        <p className="text-gray-500 text-sm mb-6">Something went wrong while fetching your transaction history.</p>
                        <button onClick={() => router.push('/videos')} className="mt-6 bg-violet-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-violet-200">
                            Browse Videos
                        </button>
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-800 font-black text-xl mb-2">No Orders Yet</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                            You haven't made any purchases yet. Your course and quiz enrollments will appear here.
                        </p>
                        <button onClick={() => router.push('/videos')} className="w-full bg-violet-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-violet-100 active:scale-95 transition-transform">
                            Explore Videos
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <div key={order._id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                            <Receipt size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-800 text-sm line-clamp-1">
                                                {order.itemId?.title || `${order.itemModel} Purchase`}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{order.itemModel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Calendar size={12} strokeWidth={2.5} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <CreditCard size={12} strokeWidth={2.5} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Amount</span>
                                        </div>
                                        <span className="text-xs font-black text-violet-600">₹{order.amount}</span>
                                    </div>
                                </div>
                                
                                {order.razorpayPaymentId && (
                                    <div className="mt-4 pt-3 border-t border-gray-50">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                            Ref: {order.razorpayPaymentId}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, paymentService, setAuthToken } from '@/lib/api';
import { Lock, Unlock, Clock, Target, ChevronRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestsPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [razorpayKey, setRazorpayKey] = useState('');
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [activeTest, setActiveTest] = useState<any>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const token = await user!.getIdToken();
            setAuthToken(token);
            const [t, d] = await Promise.all([dataService.getTests(), dataService.getDashboard()]);
            setTests(t);
            if (d.razorpayKeyId) setRazorpayKey(d.razorpayKeyId);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (!authLoading && user) fetchTests(); }, [authLoading, user]);

    const handleStart = async (test: any) => {
        if (test.isPurchased || test.price === 0) {
            router.push(`/tests/${test._id}`);
        } else {
            setProcessing(true);
            try {
                const token = await user!.getIdToken();
                setAuthToken(token);
                const order = await paymentService.createOrder(test._id, 'Test');
                setPaymentOrder(order);
                setActiveTest(test);
                setShowPayment(true);
            } catch (e: any) {
                alert('Payment Error: ' + (e.message || 'Failed to initialize payment'));
            } finally {
                setProcessing(false);
            }
        }
    };

    const razorpayHtml = paymentOrder && razorpayKey ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://checkout.razorpay.com/v1/checkout.js"></script></head><body><script>var options={"key":"${razorpayKey}","amount":"${paymentOrder.amount}","currency":"INR","name":"Physical Education","description":"Unlock Quiz: ${activeTest?.title ?? ''}","order_id":"${paymentOrder.id}","handler":function(r){document.getElementById('rp-result').textContent=JSON.stringify({status:'success',...r});},"prefill":{"name":"${dbUser?.name ?? ''}","contact":"${dbUser?.mobile || user?.phoneNumber || ''}"},"theme":{"color":"#7c3aed"},"modal":{"ondismiss":function(){document.getElementById('rp-result').textContent=JSON.stringify({status:'cancel'});}}};var rzp=new Razorpay(options);rzp.open();</script><div id="rp-result" style="display:none"></div></body></html>` : '';

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Gradient Header */}
            <div className="grad-header mb-6">
                <h1 className="text-white text-2xl font-black tracking-tight">Quizzes & Tests</h1>
                <p className="text-violet-200 text-sm mt-1 font-medium">Practice to perfect your scores</p>
            </div>

            <div className="px-5 pb-8 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 gap-3">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-medium">Loading Quizzes...</p>
                    </div>
                ) : tests.length > 0 ? tests.map(test => {
                    const purchased = test.isPurchased || test.price === 0;
                    return (
                        <button key={test._id} onClick={() => handleStart(test)}
                            className="w-full text-left card card-hover p-4 border border-white group relative">

                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${purchased ? 'bg-violet-50 text-violet-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {purchased ? <Unlock size={24} strokeWidth={2.5} /> : <Lock size={24} strokeWidth={2.5} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-gray-800 text-base group-hover:text-violet-600 transition-colors uppercase tracking-tight">{test.title}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{test.description || 'Evaluate your knowledge with this quiz.'}</p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                            <Clock size={12} /> {test.duration || 0}m
                                        </div>
                                        <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                            <Target size={12} /> {test.totalMarks || 0} pts
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    {purchased ? (
                                        <div className="text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">READY</div>
                                    ) : (
                                        <div className="text-violet-700 text-sm font-black">₹{test.price}</div>
                                    )}
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-violet-400 transition-colors" />
                                </div>
                            </div>

                            {purchased && (
                                <div className="absolute top-0 right-0 p-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse" />
                                </div>
                            )}
                        </button>
                    );
                }) : (
                    <div className="text-center pt-20 px-10">
                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target size={40} className="text-violet-300" />
                        </div>
                        <p className="font-extrabold text-gray-800 text-lg">No Quizzes Available</p>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">Check back later for new practice materials.</p>
                    </div>
                )}

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 mt-4">
                    <Info size={18} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Purchased quizzes are unlocked for your account permanently. Scores are tracked in the leaderboard.
                    </p>
                </div>
            </div>

            {/* Razorpay Checkout Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex flex-col backdrop-blur-sm">
                    <div className="mt-auto bg-white rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-800">Secure Payment</h2>
                            <button onClick={() => setShowPayment(false)} className="text-gray-400 font-bold p-2 hover:bg-gray-50 rounded-full transition-colors">✕</button>
                        </div>

                        {processing ? (
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-500 font-bold">Initializing transaction...</p>
                            </div>
                        ) : (
                            <div className="h-[400px]">
                                <iframe srcDoc={razorpayHtml} className="w-full h-full rounded-2xl border border-gray-100" title="Razorpay Checkout" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

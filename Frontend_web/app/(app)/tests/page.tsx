'use client';
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { dataService, paymentService, setAuthToken } from '@/lib/api';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestsPage() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
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
            const token = await getToken();
            setAuthToken(token);
            const [t, d] = await Promise.all([dataService.getTests(), dataService.getDashboard()]);
            setTests(t);
            if (d.razorpayKeyId) setRazorpayKey(d.razorpayKeyId);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isLoaded && isSignedIn) fetchTests(); }, [isLoaded, isSignedIn]);

    const handleStart = async (test: any) => {
        if (test.isPurchased || test.price === 0) {
            router.push(`/tests/${test._id}`);
        } else {
            setProcessing(true);
            try {
                const token = await getToken();
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

    const razorpayHtml = paymentOrder && razorpayKey ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://checkout.razorpay.com/v1/checkout.js"></script></head><body><script>var options={"key":"${razorpayKey}","amount":"${paymentOrder.amount}","currency":"INR","name":"Ravina App","description":"Unlock Quiz: ${activeTest?.title ?? ''}","order_id":"${paymentOrder.id}","handler":function(r){document.getElementById('rp-result').textContent=JSON.stringify({status:'success',...r});},"prefill":{"name":"${user?.fullName ?? ''}","email":"${user?.primaryEmailAddress?.emailAddress ?? ''}"},"theme":{"color":"#2563EB"},"modal":{"ondismiss":function(){document.getElementById('rp-result').textContent=JSON.stringify({status:'cancel'});}}};var rzp=new Razorpay(options);rzp.open();</script><div id="rp-result" style="display:none"></div></body></html>` : '';

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <div className="bg-blue-600 pt-12 pb-8 px-5 rounded-b-3xl mb-5">
                <h1 className="text-white text-2xl font-bold">📝 Quizzes & Tests</h1>
                <p className="text-blue-200 text-sm mt-1">Assess your preparation level</p>
            </div>

            <div className="px-4 pb-6 space-y-3">
                <h2 className="font-bold text-gray-800">Available Quizzes</h2>
                {loading ? (
                    <div className="flex justify-center pt-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : tests.length > 0 ? tests.map(test => {
                    const purchased = test.isPurchased || test.price === 0;
                    return (
                        <button key={test._id} onClick={() => handleStart(test)} className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-800 truncate">{test.title}</span>
                                    {!purchased && <Lock size={13} className="text-gray-500 flex-shrink-0" />}
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2">{test.description || 'No description provided'}</p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded">⏱️ {test.duration || 0} mins</span>
                                    <span className="text-purple-600 text-xs font-semibold bg-purple-50 px-2 py-0.5 rounded">🎯 {test.totalMarks || 0} Marks</span>
                                    {!purchased && <span className="text-emerald-600 text-xs font-bold ml-auto">₹{test.price}</span>}
                                    {purchased && test.price > 0 && <span className="text-emerald-600 text-xs font-bold ml-auto">UNLOCKED</span>}
                                </div>
                            </div>
                            <span className="text-blue-600 text-xl">›</span>
                        </button>
                    );
                }) : (
                    <p className="text-center text-gray-500 pt-16">No quizzes available right now.</p>
                )}
            </div>

            {/* Razorpay Checkout Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                        <span className="font-bold text-gray-800">Secure Checkout</span>
                        <button onClick={() => setShowPayment(false)} className="text-blue-600 font-bold">Cancel</button>
                    </div>
                    {processing ? (
                        <div className="flex-1 flex items-center justify-center bg-white">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-gray-500">Initializing Payment...</p>
                            </div>
                        </div>
                    ) : (
                        <iframe srcDoc={razorpayHtml} className="flex-1 bg-white" title="Razorpay Checkout" />
                    )}
                </div>
            )}
        </div>
    );
}

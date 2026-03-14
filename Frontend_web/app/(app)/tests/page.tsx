'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService, paymentService, setAuthToken } from '@/lib/api';
import { Lock, Unlock, Clock, Target, ChevronRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestsPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const [tests, setTests] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [razorpayKey, setRazorpayKey] = useState('');
    const [paymentOrder, setPaymentOrder] = useState<any>(null);
    const [activeItem, setActiveItem] = useState<any>(null);
    const [activeItemType, setActiveItemType] = useState<'Test' | 'QuizPlaylist'>('Test');
    const [showPayment, setShowPayment] = useState(false);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await user!.getIdToken();
            setAuthToken(token);
            const [t, p, d] = await Promise.all([
                dataService.getTests(),
                dataService.getPlaylists(),
                dataService.getDashboard()
            ]);
            setTests(t);
            setPlaylists(p);
            if (d.razorpayKeyId) setRazorpayKey(d.razorpayKeyId);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (!authLoading && user) fetchData(); }, [authLoading, user]);

    const handleStart = async (test: any) => {
        const purchased = test.isPurchased || test.price === 0;

        if (!purchased) {
            setProcessing(true);
            try {
                const token = await user!.getIdToken();
                setAuthToken(token);
                const order = await paymentService.createOrder(test._id, 'Test');
                setPaymentOrder(order);
                setActiveItem(test);
                setActiveItemType('Test');
                setShowPayment(true);
            } catch (e: any) {
                alert('Payment Error: ' + (e.message || 'Failed to initialize payment'));
            } finally {
                setProcessing(false);
            }
            return;
        }

        if (test.isLocked) {
            alert('This quiz is currently locked by the admin. Please wait for it to be unlocked.');
            return;
        }

        router.push(`/tests/${test._id}`);
    };

    const handlePlaylistPurchase = async (playlist: any) => {
        if (playlist.hasAccess || playlist.price === 0) {
            // No redirection needed, just showing it's purchased
            return;
        } else {
            setProcessing(true);
            try {
                const token = await user!.getIdToken();
                setAuthToken(token);
                const order = await paymentService.createOrder(playlist._id, 'QuizPlaylist');
                setPaymentOrder(order);
                setActiveItem(playlist);
                setActiveItemType('QuizPlaylist');
                setShowPayment(true);
            } catch (e: any) {
                alert('Payment Error: ' + (e.message || 'Failed to initialize payment'));
            } finally {
                setProcessing(false);
            }
        }
    };

    const razorpayHtml = paymentOrder && razorpayKey ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://checkout.razorpay.com/v1/checkout.js"></script></head><body><script>var options={"key":"${razorpayKey}","amount":"${paymentOrder.amount}","currency":"INR","name":"Physical Education","description":"Unlock ${activeItemType === 'Test' ? 'Quiz' : 'Playlist'}: ${activeItem?.title ?? ''}","order_id":"${paymentOrder.id}","handler":function(r){document.getElementById('rp-result').textContent=JSON.stringify({status:'success',...r});},"prefill":{"name":"${dbUser?.name ?? ''}","contact":"${dbUser?.mobile || user?.phoneNumber || ''}"},"theme":{"color":"#7c3aed"},"modal":{"ondismiss":function(){document.getElementById('rp-result').textContent=JSON.stringify({status:'cancel'});}}};var rzp=new Razorpay(options);rzp.open();</script><div id="rp-result" style="display:none"></div></body></html>` : '';

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Gradient Header */}
            <div className="grad-header mb-6">
                <h1 className="text-white text-2xl font-black tracking-tight">Quiz Library</h1>
                <p className="text-violet-200 text-sm mt-1 font-medium">Practice to perfect your scores</p>
            </div>

            <div className="px-5 pb-8 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 gap-3">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-medium">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* Playlists Section */}
                        {playlists.length > 0 && (
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 bg-violet-600 rounded-full" />
                                    <h2 className="text-gray-800 font-black text-xs uppercase tracking-widest">Premium Bundles</h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
                                    {playlists.map(p => {
                                        const purchased = p.hasAccess || p.price === 0;
                                        return (
                                            <button key={p._id} onClick={() => handlePlaylistPurchase(p)}
                                                className="shrink-0 w-72 card p-5 border border-white text-left relative overflow-hidden group">
                                                <div className="flex flex-col h-full">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${purchased ? 'bg-violet-100 text-violet-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            <Unlock size={20} strokeWidth={2.5} />
                                                        </div>
                                                        {purchased ? (
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">OWNED</span>
                                                        ) : (
                                                            <span className="text-sm font-black text-gray-800">₹{p.price}</span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-extrabold text-gray-800 text-sm group-hover:text-violet-600 transition-colors line-clamp-1">{p.title}</h3>
                                                    <p className="text-gray-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                                            {p.quizzes?.length || 0} Full Quizzes
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Individual Tests Section */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-5 bg-violet-600 rounded-full" />
                            <h2 className="text-gray-800 font-black text-xs uppercase tracking-widest">Single Quizzes</h2>
                        </div>
                        {tests.length > 0 ? tests.map(test => {
                            const purchased = test.isPurchased || test.price === 0;
                            return (
                                <button key={test._id} onClick={() => handleStart(test)}
                                    className="w-full text-left card card-hover p-4 border border-white group relative">
                                    {/* ... existing test card body ... */}

                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${!purchased ? 'bg-gray-50 text-gray-400' : test.isLocked ? 'bg-amber-50 text-amber-500' : 'bg-violet-50 text-violet-600'}`}>
                                    {test.isLocked && purchased ? <Lock size={24} strokeWidth={2.5} /> : purchased ? <Unlock size={24} strokeWidth={2.5} /> : <Lock size={24} strokeWidth={2.5} />}
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
                                    {!purchased ? (
                                        <div className="text-violet-700 text-sm font-black">₹{test.price}</div>
                                    ) : test.isLocked ? (
                                        <div className="text-amber-600 text-[10px] font-black bg-amber-50 px-2 py-1 rounded-lg">LOCKED</div>
                                    ) : (
                                        <div className="text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">READY</div>
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
                    </>
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

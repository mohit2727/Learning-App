'use client';
import { ChevronLeft, MessageCircle, Mail, Phone, ExternalLink, HelpCircle, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpSupportPage() {
    const router = useRouter();

    const faqs = [
        { q: "How do I access my purchased courses?", a: "Once purchased, courses are instantly available in the 'My Courses' section of your profile." },
        { q: "Can I take a quiz multiple times?", a: "Yes, you can attempt quizzes as many times as you like to improve your score." },
        { q: "Is payment secure on this platform?", a: "Absolultely. We use Razorpay, India's leading payment gateway, to ensure your transactions are 100% secure." },
        { q: "What if I face a technical issue?", a: "You can reach out to us via WhatsApp or Email using the buttons below. We typically respond within 24 hours." }
    ];

    const handleWhatsApp = () => {
        window.open('https://wa.me/91XXXXXXXXXX', '_blank'); // Replace with actual number
    };

    const handleEmail = () => {
        window.location.href = 'mailto:support@example.com';
    };

    return (
        <div className="flex flex-col min-h-full bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 px-5 pt-8 pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-full flex justify-start mb-6">
                        <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all">
                            <ChevronLeft size={24} className="text-white" />
                        </button>
                    </div>
                    
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl border border-white/30">
                        <MessageCircle size={36} className="text-white" />
                    </div>
                    <h1 className="text-white text-3xl font-black tracking-tight mb-2">Help Center</h1>
                    <p className="text-violet-100 text-sm font-medium opacity-90 text-center max-w-[250px]">
                        We're here to help you excel in your learning journey.
                    </p>
                </div>
            </div>

            <div className="px-5 -mt-6 space-y-8 relative z-20">
                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleWhatsApp} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-white flex flex-col items-center text-center group active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Phone size={24} />
                        </div>
                        <span className="font-black text-gray-800 text-sm tracking-tight mb-1">WhatsApp</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instant Support</span>
                    </button>

                    <button onClick={handleEmail} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-white flex flex-col items-center text-center group active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                            <Mail size={24} />
                        </div>
                        <span className="font-black text-gray-800 text-sm tracking-tight mb-1">Email Us</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">24h Response</span>
                    </button>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 ml-2">
                        <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                        <h2 className="text-gray-800 font-black text-sm uppercase tracking-widest">Common Questions</h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all">
                                <summary className="flex items-center justify-between p-5 list-none cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                            <HelpCircle size={16} />
                                        </div>
                                        <span className="text-xs font-black text-gray-700 tracking-tight leading-snug">{faq.q}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="px-5 pb-5 pt-0">
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed pl-11">
                                        {faq.a}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-gray-100/50 rounded-[2.5rem] p-8 border border-white/50 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-violet-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Verified Content</p>
                            <p className="text-[10px] text-gray-500 font-bold">All materials are curated by experts.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Fast Activation</p>
                            <p className="text-[10px] text-gray-500 font-bold">Get instant access right after payment.</p>
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pt-4">
                    Version 1.2.0 • Made with ❤️ for Students
                </p>
            </div>
        </div>
    );
}

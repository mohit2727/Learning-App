'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
                        <span className="text-white font-black text-3xl">R</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Admin Portal</h1>
                    <p className="text-slate-500 font-medium text-lg">Sign in to manage your platform</p>
                </div>

                <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <SignIn
                        routing="hash"
                        forceRedirectUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                card: 'bg-transparent shadow-none w-full m-0 p-6',
                                headerTitle: 'text-slate-900 font-bold',
                                headerSubtitle: 'text-slate-500',
                                socialButtonsBlockButton: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm',
                                formFieldLabel: 'text-slate-700 font-semibold',
                                formFieldInput: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl px-4 py-3',
                                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 transition-all py-3 rounded-xl font-bold text-base',
                                footerActionLink: 'hidden',
                                footerActionText: 'hidden',
                                footer: 'hidden',
                                identityPreviewText: 'text-slate-700',
                                identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
                                dividerText: 'text-slate-400',
                                dividerLine: 'bg-slate-200',
                            },
                        }}
                    />
                </div>

                <p className="text-center text-slate-400 text-sm mt-8 font-medium">
                    Protected by Clerk Authentication
                </p>
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-100 rounded-full" />
                <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0" />
            </div>
            <p className="mt-4 text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em] animate-pulse">Loading Platform...</p>
        </div>
    );
}

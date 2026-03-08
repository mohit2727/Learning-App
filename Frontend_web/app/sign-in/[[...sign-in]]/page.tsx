import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 p-6">
            <div className="mb-8 text-center">
                <div className="text-5xl mb-3">📚</div>
                <h1 className="text-3xl font-bold text-white">Ravina App</h1>
                <p className="text-blue-200 mt-1">Learn, practice and grow</p>
            </div>
            <SignIn routing="hash" />
        </div>
    );
}

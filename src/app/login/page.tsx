import AuthForm from '@/components/auth/AuthForm';
import Navbar from '@/components/layouts/Navbar';

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Navbar />

            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

            <AuthForm />

            <p className="mt-8 text-gray-500 text-sm">
                By continuing, you agree to ZenSolve's Terms and Privacy Policy.
            </p>
        </main>
    );
}

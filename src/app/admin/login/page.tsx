import AuthForm from '@/components/auth/AuthForm';
import Navbar from '@/components/layouts/Navbar';

export default function AdminLoginPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Navbar />

            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

            <AuthForm portal="admin" />

            <p className="mt-8 text-gray-500 text-sm text-center">
                Restricted area. Only verified admin and department accounts can proceed.
            </p>
        </main>
    );
}

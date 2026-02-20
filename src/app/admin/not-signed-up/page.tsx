import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminNotSignedUpPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
            <Navbar />

            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-500/10 blur-[100px] rounded-full" />

            <section className="max-w-3xl mx-auto pt-36 pb-16">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-6">
                        <ShieldAlert className="w-7 h-7" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">No Admin Account Found Yet</h1>
                    <p className="text-gray-400 mb-8">
                        It looks like your organization has not finished admin onboarding. Add your staff email to the admin allowlist,
                        then sign in from the admin portal.
                    </p>

                    <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-8">
                        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Quick setup (Supabase SQL)</p>
                        <code className="block text-sm text-teal-300 whitespace-pre-wrap break-words">
                            {`insert into staff_role_allowlist (email, role)\nvalues ('admin@yourcity.gov', 'admin');`}
                        </code>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/login"
                            className="px-5 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            Back to Admin Login
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-300"
                        >
                            Citizen Login
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

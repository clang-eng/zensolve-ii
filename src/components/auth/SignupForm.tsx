'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function SignupForm() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || null,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (!data.session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError || !signInData.session) {
                setError('Account created. Please verify your email before signing in.');
                setLoading(false);
                return;
            }
        }

        router.replace('/dashboard');
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <p className="text-sm text-gray-300">Sign up as a citizen to report and track complaints.</p>

            <div className="space-y-2">
                <label htmlFor="full-name" className="text-sm text-gray-200">Full name</label>
                <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-teal-400"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-gray-200">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-teal-400"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-gray-200">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-teal-400"
                />
            </div>

            {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-500 px-4 py-2 font-semibold text-black transition hover:bg-teal-400 disabled:opacity-60"
            >
                {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <p className="text-sm text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-teal-300 hover:text-teal-200">
                    Sign in
                </Link>
            </p>
        </form>
    );
}

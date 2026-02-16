'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, LogOut, LayoutDashboard, Menu, X, Rocket, Map, Trophy, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { usePWA } from '@/hooks/usePWA';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { isInstallable, installApp } = usePWA();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { href: '/explore', label: 'Explore', icon: Map },
        { href: '/community', label: 'Community', icon: Trophy },
        { href: '/rewards', label: 'Rewards', icon: Rocket },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">Z</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">ZenSolve</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        {isInstallable && (
                            <button
                                onClick={installApp}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-full transition-all text-xs font-bold"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Install App
                            </button>
                        )}

                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-all text-sm font-bold shadow-lg shadow-white/5"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-black border-b border-white/10 p-6 flex flex-col gap-6 animate-fade-in slide-in-from-top-4">
                    {isInstallable && (
                        <button
                            onClick={() => {
                                installApp();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full py-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center gap-3 font-bold"
                        >
                            <Download className="w-5 h-5" />
                            Install App
                        </button>
                    )}

                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-medium text-gray-300 hover:text-teal-400 transition-colors"
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 w-full" />
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 text-lg font-medium text-gray-300 hover:text-teal-400"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 text-lg font-medium text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-4 bg-white text-black rounded-2xl text-center font-bold"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </nav>

    );
}

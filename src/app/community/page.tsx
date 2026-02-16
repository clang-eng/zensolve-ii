'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, Star, Target, Users, Search, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';

export default function CommunityPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('full_name, points, badge')
                .order('points', { ascending: false })
                .limit(10);

            if (error) throw error;
            setLeaderboard(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black tracking-tighter mb-4">
                        City <span className="text-teal-400">Champions</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Top contributors making our city better every day.</p>
                </div>

                {/* Top 3 Podiums */}
                <div className="grid grid-cols-3 gap-6 mb-12 items-end">
                    {leaderboard.slice(0, 3).map((user, i) => {
                        const positions = [
                            { pos: 2, height: 'h-48', color: 'from-gray-400 to-gray-600', shadow: 'shadow-gray-500/20' },
                            { pos: 1, height: 'h-64', color: 'from-teal-400 to-blue-600', shadow: 'shadow-teal-500/20' },
                            { pos: 3, height: 'h-40', color: 'from-orange-400 to-red-600', shadow: 'shadow-orange-500/20' }
                        ];
                        const p = positions[i === 0 ? 1 : i === 1 ? 0 : 2];

                        return (
                            <motion.div
                                key={user.full_name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${p.color} border border-white/20 mb-4 flex items-center justify-center text-3xl shadow-2xl`}>
                                    {p.pos === 1 ? '👑' : p.pos === 2 ? '🥈' : '🥉'}
                                </div>
                                <div className="text-center mb-4">
                                    <div className="font-bold text-sm truncate w-24">{user.full_name}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-black">{user.badge}</div>
                                </div>
                                <div className={`w-full ${p.height} rounded-t-[2rem] bg-gradient-to-b ${p.color} relative overflow-hidden ${p.shadow}`}>
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                                    <div className="absolute inset-x-0 top-8 text-center">
                                        <div className="text-2xl font-black text-white">{user.points}</div>
                                        <div className="text-[10px] uppercase font-black tracking-widest text-white/50">Points</div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Full List */}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="font-bold text-xl flex items-center gap-3">
                            <Users className="w-5 h-5 text-teal-400" />
                            Full Leaderboard
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest">
                            Updated <Clock className="w-3 h-3" /> Hourly
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {leaderboard.map((user, i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 text-xl font-black text-gray-700 group-hover:text-teal-500 transition-colors">#{i + 1}</div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                                            {user.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold group-hover:text-teal-400 transition-colors">{user.full_name}</div>
                                            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{user.badge}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-lg font-black">{user.points}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Points</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-700 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-12 p-10 rounded-[3rem] bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-2xl font-black mb-2">Want to climb the ranks?</h3>
                        <p className="text-gray-400 max-w-sm font-medium">Earn points by reporting issues, validating resolutions, and helping your community grow.</p>
                    </div>
                    <Link
                        href="/report"
                        className="px-10 py-5 bg-teal-500 text-black font-black rounded-2xl hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 whitespace-nowrap"
                    >
                        Start Contributing
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

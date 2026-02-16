'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Coffee,
    ShoppingBag,
    Utensils,
    Ticket,
    Zap,
    Star,
    Tag as TagIcon,
    ChevronRight,
    Wallet,
    ArrowRight
} from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';

const mockRewards = [
    { id: 1, name: 'Free Coffee', partner: 'Starbucks Local', points: 150, icon: Coffee, category: 'Food', color: 'bg-green-500/10 text-green-500' },
    { id: 2, name: '$10 Grocery Voucher', partner: 'Fresh Mart', points: 500, icon: ShoppingBag, category: 'Retail', color: 'bg-blue-500/10 text-blue-500' },
    { id: 3, name: 'BOGO Movie Ticket', partner: 'Cineplex', points: 300, icon: Ticket, category: 'Entertainment', color: 'bg-purple-500/10 text-purple-500' },
    { id: 4, name: '20% Off Main Course', partner: 'The Bistro', points: 200, icon: Utensils, category: 'Food', color: 'bg-orange-500/10 text-orange-500' },
    { id: 5, name: 'Urban Hero Kit', partner: 'ZenSolve Shop', points: 1000, icon: Star, category: 'Merch', color: 'bg-teal-500/10 text-teal-500' },
];

export default function RewardsPage() {
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('points')
                    .eq('id', user.id)
                    .single();
                setUserPoints(data?.points || 0);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6">
                {/* Points Header Card */}
                <div className="bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 border border-white/10 rounded-[3rem] p-12 mb-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl" />

                    <div className="relative z-10 text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight mb-2">Redeem <span className="text-teal-400">Impact</span></h1>
                        <p className="text-gray-400 font-medium">Your civic contribution converted into real-world value.</p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 bg-black/40 border border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-md">
                        <div className="w-16 h-16 bg-teal-500 text-black rounded-2xl flex items-center justify-center">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-4xl font-black tracking-tighter">{userPoints}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-gray-500">Available Points</div>
                        </div>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {['All', 'Food', 'Retail', 'Entertainment', 'Merch'].map(cat => (
                        <button
                            key={cat}
                            className="px-8 py-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold shrink-0"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Rewards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockRewards.map((reward, i) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`group bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all relative overflow-hidden flex flex-col ${userPoints < reward.points ? 'opacity-60 grayscale' : ''}`}
                        >
                            {userPoints < reward.points && (
                                <div className="absolute top-6 right-6">
                                    <Zap className="w-5 h-5 text-gray-700" />
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl ${reward.color} flex items-center justify-center mb-6`}>
                                <reward.icon className="w-7 h-7" />
                            </div>

                            <div className="mb-8 grow">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{reward.partner}</p>
                                <h3 className="text-2xl font-black mb-2 group-hover:text-teal-400 transition-colors">{reward.name}</h3>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-teal-400">
                                    <TagIcon className="w-4 h-4" /> {reward.points} Points
                                </div>
                            </div>

                            <button
                                disabled={userPoints < reward.points}
                                className="w-full py-4 rounded-2xl bg-white text-black font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed group/btn"
                            >
                                {userPoints >= reward.points ? (
                                    <>
                                        Redeem Reward
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>Not Enough Points</>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Leaderboard CTA */}
                <div className="mt-20 p-12 bg-white/5 border border-white/10 rounded-[3rem] text-center border-dashed">
                    <h3 className="text-xl font-bold mb-4">Want more points?</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">See how top citizens are earning points in the local community leaderboard.</p>
                    <a href="/community" className="text-teal-400 font-black flex items-center justify-center gap-2 hover:underline uppercase tracking-widest text-sm">
                        View Leaderboard <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </main>
        </div>
    );
}

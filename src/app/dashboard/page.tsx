'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Trophy,
    PlusCircle,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    TrendingUp,
    FileText,
    Navigation
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layouts/Navbar';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Fetch user's complaints
            const { data: complaintsData } = await supabase
                .from('complaints')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setComplaints(complaintsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: 'Total Points', value: profile?.points || 0, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Reports', value: complaints.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Validated', value: 0, icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-500/10' },
        { label: 'Rank', value: profile?.badge?.toUpperCase() || 'NONE', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            Welcome back, <span className="text-teal-400">{profile?.full_name?.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-gray-400">Here's an overview of your civic impact.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/report"
                            className="px-6 py-3 bg-teal-500 text-black font-bold rounded-2xl hover:bg-teal-400 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
                        >
                            <PlusCircle className="w-5 h-5" />
                            New Report
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all"
                        >
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Nearby Tasks Widget */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Navigation className="w-6 h-6 text-teal-400" />
                            Nearby Tasks to Validate
                            <span className="text-[10px] font-black bg-teal-500/10 text-teal-400 px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm border border-teal-500/20">
                                +30 PTS Each
                            </span>
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:bg-white/[0.07] transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500 opacity-50" />
                            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-8 h-8 text-teal-500" />
                            </div>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed px-4 font-medium">Enable location to find resolved complaints within 1km that need your validation.</p>
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            console.log(pos.coords.latitude, pos.coords.longitude);
                                        });
                                    }
                                }}
                                className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl"
                            >
                                Scan My Area
                            </button>
                        </motion.div>
                    </div>
                </div>


                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Recent Activity / Complaints List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold">My Recent Reports</h2>
                            <Link href="/explore" className="text-teal-400 text-sm font-semibold hover:underline flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {complaints.length > 0 ? (
                            <div className="space-y-4">
                                {complaints.slice(0, 5).map((complaint, i) => (
                                    <motion.div
                                        key={complaint.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/[0.07] transition-all flex items-center justify-between border-l-4 border-l-transparent hover:border-l-teal-500"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                                {complaint.images?.[0] ? (
                                                    <img src={complaint.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1 group-hover:text-teal-400 transition-colors">{complaint.title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(complaint.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                        <MapPin className="w-3.5 h-3.5" /> {complaint.address || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${complaint.status === 'resolved' || complaint.status === 'validated' ? 'bg-green-500/10 text-green-500' :
                                                    complaint.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center border-dashed"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-gray-700" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Your voice matters</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">You haven't submitted any complaints. Start by reporting an issue in your community and earn your first badge.</p>
                                <Link
                                    href="/report"
                                    className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all"
                                >
                                    Submit Report
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {/* Points Card */}
                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                                <h3 className="text-white/80 font-semibold mb-1">Your Balance</h3>
                                <div className="text-5xl font-black text-white mb-6 tracking-tighter">{profile?.points || 0} PTS</div>
                                <div className="w-full bg-white/20 h-2 rounded-full mb-3 overflow-hidden">
                                    <div className="bg-white h-full" style={{ width: `${(profile?.points % 500 / 500) * 100}%` }} />
                                </div>
                                <p className="text-white/70 text-sm font-medium">Earn {500 - (profile?.points % 500)} more points to reach next level!</p>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                            <h3 className="text-xl font-bold mb-6">Pro Tips</h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Validate Nearby</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Validate resolved issues within 1km to earn 30 points instantly.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Quality Photos</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Clear evidence increases the approval speed of your reports.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Support for Camera icon missing in imports
function Camera({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

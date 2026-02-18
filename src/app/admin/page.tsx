'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Inbox,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Search,
    MoreVertical,
    ChevronRight,
    UserPlus,
    RefreshCcw,
    CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layouts/Navbar';

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        in_progress: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const router = useRouter();

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select(`
          *,
          users:user_id (full_name),
          assigned_user:assigned_to (full_name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComplaints(data || []);

            // Calculate stats
            const s = {
                total: data?.length || 0,
                pending: data?.filter((c: any) => c.status === 'submitted').length || 0,
                resolved: data?.filter((c: any) => c.status === 'resolved' || c.status === 'validated').length || 0,
                in_progress: data?.filter((c: any) => c.status === 'in_progress' || c.status === 'assigned').length || 0,
            };
            setStats(s);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/admin/login');
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin' && profile?.role !== 'department') {
                router.push('/dashboard');
            }
        };

        checkAdmin();
        fetchComplaints();
    }, [router, fetchComplaints]);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('complaints')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            fetchComplaints();
        }
    };

    const filteredComplaints = complaints.filter((c: { title: string; description: string; status: string }) => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Government <span className="text-teal-400">Control Panel</span></h1>
                        <p className="text-gray-400 font-medium">Manage citizen grievances and city infrastructure health.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchComplaints}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Admin Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Grievances', value: stats.total, icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Needs Triage', value: stats.pending, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        { label: 'Active Work', value: stats.in_progress, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 p-7 rounded-[2.5rem]"
                        >
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="text-3xl font-black mb-1 tracking-tighter">{stat.value}</div>
                            <div className="text-xs text-gray-500 font-black uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Management Table Area */}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                    <div className="p-8 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search cases, ID, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {['all', 'submitted', 'assigned', 'in_progress', 'resolved'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shrink-0 ${filterStatus === s
                                        ? 'bg-teal-500 text-black border-teal-500'
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                        }`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Complaint</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Reporter</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Assigned To</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="w-10 h-10 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-medium">
                                            No complaints found matching current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredComplaints.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                                                        {c.images?.[0] ? (
                                                            <img src={c.images[0]} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-20"><Inbox className="w-5 h-5" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold mb-1 group-hover:text-teal-400 transition-colors uppercase text-sm tracking-tight">{c.title}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span className="font-bold text-teal-500/80 mr-1">{c.category}</span> • {new Date(c.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-semibold">{c.users?.full_name || 'Anonymous'}</div>
                                                <div className="text-[10px] uppercase font-black text-gray-600 mt-0.5">Citizen</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'resolved' || c.status === 'validated' ? 'bg-green-500/10 text-green-400' :
                                                    c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                                        c.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-gray-500/10 text-gray-400'
                                                    }`}>
                                                    {c.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm">
                                                {c.assigned_user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><Users className="w-3 h-3 text-gray-500" /></div>
                                                        <span className="font-bold text-gray-300">{c.assigned_user.full_name}</span>
                                                    </div>
                                                ) : (
                                                    <button className="text-[10px] font-black uppercase tracking-tighter text-teal-400/50 hover:text-teal-400 flex items-center gap-1 transition-colors">
                                                        <UserPlus className="w-3.5 h-3.5" /> Assign Staff
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {c.status === 'submitted' && (
                                                        <button
                                                            onClick={() => updateStatus(c.id, 'assigned')}
                                                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-teal-500 hover:text-black transition-all"
                                                            title="Begin Triage"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(c.status === 'assigned' || c.status === 'in_progress') && (
                                                        <button
                                                            onClick={() => updateStatus(c.id, 'resolved')}
                                                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                                                            title="Mark Resolved"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-500">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

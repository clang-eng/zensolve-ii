'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    Camera,
    MessageSquare,
    ShieldCheck,
    Undo2,
    Image as ImageIcon,
    Loader2,
    X
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layouts/Navbar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { compressAndUploadImage } from '@/services/storage';

export default function ComplaintDetailPage() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showValidationForm, setShowValidationForm] = useState(false);
    const [validationType, setValidationType] = useState<'verified' | 'not_resolved'>('verified');
    const [comment, setComment] = useState('');
    const [proofImages, setProofImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select(`
          *,
          users:user_id (full_name, points, badge),
          assigned_user:assigned_to (full_name, role),
          status_history (*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setComplaint(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploading(true);
        const files = Array.from(e.target.files);
        try {
            const urls = await Promise.all(files.map(f => compressAndUploadImage(f, 'validation-proofs')));
            setProofImages(prev => [...prev, ...urls]);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const submitValidation = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { error } = await supabase.from('validations').insert({
                complaint_id: id,
                validator_id: user.id,
                validation_type: validationType,
                comment,
                proof_images: proofImages
            });

            if (error) throw error;

            // Refresh data
            await fetchComplaint();
            setShowValidationForm(false);
            // Optional: Redirect or show success
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        </div>
    );

    if (!complaint) return <div className="text-white text-center pt-20">Complaint not found</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Explore
                </button>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column: Visuals and Stats */}
                    <div className="space-y-8">
                        <div className="aspect-square rounded-[3rem] overflow-hidden bg-white/5 border border-white/10 relative">
                            <img
                                src={complaint.images?.[0] || 'https://via.placeholder.com/600'}
                                alt={complaint.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-2xl border ${complaint.status === 'resolved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                    }`}>
                                    {complaint.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-2">Priority</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${complaint.priority === 1 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                    <span className="font-bold">{complaint.priority === 1 ? 'High' : 'Medium'}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-2">Category</p>
                                <span className="font-bold text-teal-400">{complaint.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content and Actions */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight">{complaint.title}</h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-500" />
                            <div>
                                <p className="text-sm font-bold">{complaint.users?.full_name}</p>
                                <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(complaint.created_at))} ago</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mb-8 grow">
                            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Description</h3>
                            <p className="text-gray-300 leading-relaxed text-lg">{complaint.description}</p>

                            <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
                                <MapPin className="w-5 h-5 text-teal-500" />
                                {complaint.address}
                            </div>
                        </div>

                        {/* Validation Call to Action */}
                        {complaint.status === 'resolved' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-teal-500/10 border border-teal-500/20 p-8 rounded-[2.5rem]"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-teal-500 text-black rounded-2xl flex items-center justify-center font-bold">
                                        +30
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Community Validation</h3>
                                        <p className="text-sm text-teal-400/70">Verify this resolution to earn reward points.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowValidationForm(true)}
                                    className="w-full bg-teal-500 text-black font-black py-4 rounded-2xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Validate Resolution
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Validation Form Overlay */}
                <AnimatePresence>
                    {showValidationForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-[#111] border border-white/10 w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl"
                            >
                                <button
                                    onClick={() => setShowValidationForm(false)}
                                    className="absolute top-8 right-8 text-gray-500 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <h2 className="text-3xl font-black mb-2">Community Audit</h2>
                                <p className="text-gray-400 mb-8 text-sm">Be honest. Your validation affects the reputation of both the department and citizens.</p>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setValidationType('verified')}
                                            className={`flex-1 p-6 rounded-[2rem] border transition-all text-center ${validationType === 'verified' ? 'bg-green-500/10 border-green-500/50 text-green-400 ring-1 ring-green-500/50' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                }`}
                                        >
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
                                            <div className="font-bold">Verified Fixed</div>
                                        </button>
                                        <button
                                            onClick={() => setValidationType('not_resolved')}
                                            className={`flex-1 p-6 rounded-[2rem] border transition-all text-center ${validationType === 'not_resolved' ? 'bg-red-500/10 border-red-500/50 text-red-400 ring-1 ring-red-500/50' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                                                }`}
                                        >
                                            <Undo2 className="w-8 h-8 mx-auto mb-3" />
                                            <div className="font-bold">Still Broken</div>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Comment / Notes</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add any specific details about the current state..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-teal-500 transition-all h-32 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Proof Image (Optional)</label>
                                        <div className="flex flex-wrap gap-4">
                                            {proofImages.map((url, i) => (
                                                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden relative border border-white/10 group">
                                                    <img src={url} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <label className="w-20 h-20 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-teal-500/50 hover:bg-white/10 transition-all text-gray-500 hover:text-teal-400">
                                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={submitValidation}
                                        disabled={isSubmitting}
                                        className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize Audit'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

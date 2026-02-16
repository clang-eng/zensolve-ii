'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    MapPin,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    HardHat,
    Trash2,
    ShieldAlert,
    Droplets,
    Zap,
    Truck,
    Trees,
    MoreHorizontal,
    X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintSchema, type ComplaintFormValues } from '@/lib/validations/complaint';
import Navbar from '@/components/layouts/Navbar';
import { compressAndUploadImage } from '@/services/storage';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const categories = [
    { id: 'Infrastructure', icon: HardHat, label: 'Infrastructure', color: 'bg-orange-500/10 text-orange-500' },
    { id: 'Sanitation', icon: Trash2, label: 'Sanitation', color: 'bg-green-500/10 text-green-500' },
    { id: 'Public Safety', icon: ShieldAlert, label: 'Public Safety', color: 'bg-red-500/10 text-red-500' },
    { id: 'Water Supply', icon: Droplets, label: 'Water Supply', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'Electricity', icon: Zap, label: 'Electricity', color: 'bg-yellow-500/10 text-yellow-500' },
    { id: 'Roads & Transport', icon: Truck, label: 'Roads & Transport', color: 'bg-indigo-500/10 text-indigo-500' },
    { id: 'Parks & Recreation', icon: Trees, label: 'Parks & Recreation', color: 'bg-emerald-500/10 text-emerald-500' },
    { id: 'Other', icon: MoreHorizontal, label: 'Other', color: 'bg-gray-500/10 text-gray-500' },
];

export default function ReportPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const router = useRouter();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            category: 'Infrastructure' as any,
            location: { lat: 0, lng: 0 },
            images: [],
        }
    });

    const currentCategory = watch('category');
    const watchImages = watch('images');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        setUploadingImages(true);
        const files = Array.from(e.target.files);

        try {
            const uploadPromises = files.map(file => compressAndUploadImage(file));
            const urls = await Promise.all(uploadPromises);

            const updatedImages = [...watchImages, ...urls];
            setValue('images', updatedImages);
            setImagePreviews(prev => [...prev, ...urls]);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = watchImages.filter((_, i) => i !== index);
        setValue('images', updatedImages);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ComplaintFormValues) => {
        setIsSubmitting(true);
        try {
            // Location Verification Guard
            if (navigator.geolocation) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const dist = Math.sqrt(
                    Math.pow(position.coords.latitude - data.location.lat, 2) +
                    Math.pow(position.coords.longitude - data.location.lng, 2)
                );

                // Roughly 5km limit (0.05 degrees)
                if (dist > 0.05) {
                    alert("Verification Failed: You must be near the location of the incident to report it.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('complaints').insert({
                user_id: user?.id,
                title: data.title,
                description: data.description,
                category: data.category,
                address: data.address,
                location: `POINT(${data.location.lng} ${data.location.lat})`,
                images: data.images,
                status: 'submitted'
            });

            if (error) throw error;
            router.push('/dashboard?success=true');
        } catch (error) {
            console.error('Submission failed:', error);
            alert("Submission failed. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [checkingDuplicates, setCheckingDuplicates] = useState(false);

    const checkDuplicates = async () => {
        const loc = watch('location');
        const cat = watch('category');

        if (loc.lat === 0 || loc.lng === 0) return true;

        setCheckingDuplicates(true);
        try {
            const { data, error } = await supabase.rpc('check_duplicate_complaint', {
                p_lat: loc.lat,
                p_lng: loc.lng,
                p_category: cat
            });

            if (error) throw error;

            if (data && data.length > 0) {
                setDuplicates(data);
                return false; // Found duplicates, stop progression to allow user to review
            }
            return true; // No duplicates, proceed
        } catch (err) {
            console.error('Duplicate check failed:', err);
            return true; // Proceed anyway in case of error
        } finally {
            setCheckingDuplicates(false);
        }
    };

    const nextStep = async () => {
        if (step === 2) {
            const isClear = await checkDuplicates();
            if (!isClear) return;
        }
        setStep(prev => Math.min(prev + 1, 3));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6">
                {/* Progress Stepper */}
                <div className="mb-12 flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-teal-500 transition-all duration-500 -translate-y-1/2"
                        style={{ width: `${((step - 1) / 2) * 100}%` }} />

                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${step >= i ? 'bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-[#1a1a1a] text-gray-500'
                            }`}>
                            {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Basic Information</h2>
                                    <p className="text-gray-400">Tell us what's happening and where.</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Complaint Title</label>
                                        <input
                                            {...register('title')}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="e.g. Broken streetlight on Main St"
                                        />
                                        {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-4">Category</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setValue('category', cat.id as any)}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${currentCategory === cat.id
                                                        ? 'bg-white/10 border-teal-500/50 ring-1 ring-teal-500/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${cat.color}`}>
                                                        <cat.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-semibold">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                        <textarea
                                            {...register('description')}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                                            placeholder="Describe the issue in detail..."
                                        />
                                        {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description.message}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Location</h2>
                                    <p className="text-gray-400">Where exactly is this occurring?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="h-64 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="w-12 h-12 text-teal-500 mx-auto mb-4 opacity-50" />
                                            <p className="text-gray-500 text-sm">Interactive Map Integration Coming Soon</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setValue('location', { lat: 40.7128, lng: -74.0060 });
                                                    setValue('address', '123 Test St, City, Country');
                                                }}
                                                className="mt-4 text-xs text-teal-400 font-semibold hover:underline"
                                            >
                                                Use Current Location
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Physical Address</label>
                                        <input
                                            {...register('address')}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="Street name, Landmark, etc."
                                        />
                                        {errors.address && <p className="mt-2 text-sm text-red-500">{errors.address.message}</p>}
                                    </div>

                                    {/* Duplicate Warning UI */}
                                    <AnimatePresence>
                                        {duplicates.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-orange-500/10 border border-orange-500/20 rounded-[2rem] p-6 space-y-4"
                                            >
                                                <div className="flex items-center gap-3 text-orange-400">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    <h4 className="font-bold">Possible Duplicate Detected</h4>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    We found {duplicates.length} similar {watch('category')} issues nearby. Please review them if they match your report:
                                                </p>
                                                <div className="space-y-2">
                                                    {duplicates.map((d) => (
                                                        <div key={d.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                                            <span className="text-xs font-medium truncate pr-4">{d.title}</span>
                                                            <span className="text-[10px] font-black uppercase text-gray-500 shrink-0">{Math.round(d.distance)}m away</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.push('/explore'); // Go see where they are
                                                        }}
                                                        className="flex-1 py-3 rounded-xl bg-orange-500 text-black font-bold text-xs"
                                                    >
                                                        View on Map
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDuplicates([]); // Clear warnings and proceed
                                                            setStep(3);
                                                        }}
                                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10"
                                                    >
                                                        Still a New Issue
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Evidence</h2>
                                    <p className="text-gray-400">Upload photos to help us understand the issue better.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {imagePreviews.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-3xl overflow-hidden relative group">
                                            <img src={url} alt="Proof" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {imagePreviews.length < 5 && (
                                        <label className="aspect-square rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 hover:border-teal-500/50 transition-all group">
                                            {uploadingImages ? (
                                                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                                    <span className="text-xs text-gray-500">Max 5 Photos</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImages} />
                                        </label>
                                    )}
                                </div>

                                <div className="p-6 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex gap-4">
                                    <AlertCircle className="w-6 h-6 text-teal-400 shrink-0" />
                                    <p className="text-sm text-teal-100/70 leading-relaxed">
                                        Clear photos help government officials resolve issues faster. Include surrounding landmarks if possible.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex items-center justify-between gap-4">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-8 py-4 rounded-2xl bg-teal-500 text-black font-bold hover:bg-teal-400 transition-all flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-10 py-4 rounded-2xl bg-teal-500 text-black font-bold hover:bg-teal-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Complaint
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

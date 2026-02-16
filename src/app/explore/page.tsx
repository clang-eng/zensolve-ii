'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    Search,
    Map as MapIcon,
    List,
    Filter,
    Clock,
    MapPin,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Navigation,
    Layers,
    Info
} from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { formatDistanceToNow } from 'date-fns';

const categories = [
    'All',
    'Infrastructure',
    'Sanitation',
    'Public Safety',
    'Water Supply',
    'Electricity',
    'Roads & Transport',
    'Parks & Recreation',
    'Other'
];

const statuses = ['All', 'submitted', 'in_progress', 'resolved', 'validated'];

export default function ExplorePage() {
    const [view, setView] = useState<'list' | 'map'>('list');
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

    const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const hasMapsKey = mapsKey && mapsKey !== '' && mapsKey !== 'your_actual_google_maps_key';

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: hasMapsKey ? mapsKey : ''
    });

    useEffect(() => {
        if (!hasMapsKey) {
            setView('list');
        }
    }, [hasMapsKey]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('complaints')
                .select(`
          *,
          users:user_id (full_name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComplaints(data || []);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
            const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [complaints, searchQuery, selectedCategory, selectedStatus]);

    const mapCenter = useMemo(() => {
        if (filteredComplaints.length > 0) {
            // In a real app, parse the POINT(lng lat) string from PostGIS
            // For now, let's assume default coordinates or fallback
            return { lat: 40.7128, lng: -74.0060 };
        }
        return { lat: 40.7128, lng: -74.0060 };
    }, [filteredComplaints]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* Header and Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold tracking-tight mb-4 lowercase first-letter:uppercase">
                            Explore <span className="text-teal-400">ZenSolve</span>
                        </h1>
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search complaints in your area..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0 shadow-lg">
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'list' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                        <button
                            onClick={() => hasMapsKey && setView('map')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'map' ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-400 hover:text-white'
                                } ${!hasMapsKey ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={!hasMapsKey ? 'Map view temporarily disabled' : ''}
                        >
                            <MapIcon className="w-4 h-4" />
                            Map
                        </button>
                    </div>
                </div>

                {/* Secondary Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mr-2 shrink-0">
                        <Filter className="w-4 h-4" /> Filter by:
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all shrink-0 ${selectedCategory === cat
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* View Content */}
                {loading ? (
                    <div className="h-[60vh] flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {view === 'list' ? (
                            <motion.div
                                key="list-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredComplaints.length > 0 ? (
                                    filteredComplaints.map((complaint) => (
                                        <div
                                            key={complaint.id}
                                            className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/[0.08] transition-all hover:border-teal-500/30 shadow-xl"
                                        >
                                            <div className="aspect-video w-full bg-white/5 relative overflow-hidden">
                                                {complaint.images?.[0] ? (
                                                    <img src={complaint.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <Layers className="w-10 h-10 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${complaint.status === 'resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                        complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                            'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                        }`}>
                                                        {complaint.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-7">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest px-2 py-0.5 bg-teal-400/10 rounded-md">
                                                        {complaint.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-teal-400 transition-colors line-clamp-1">{complaint.title}</h3>
                                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{complaint.description}</p>

                                                <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin className="w-4 h-4 text-teal-500" /> {complaint.address || 'Unknown Location'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="w-4 h-4 text-teal-500" /> {formatDistanceToNow(new Date(complaint.created_at))} ago
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500" />
                                                        <span className="text-xs font-semibold text-gray-400">{complaint.users?.full_name || 'Anonymous'}</span>
                                                    </div>
                                                    <Link
                                                        href={`/complaints/${complaint.id}`}
                                                        className="bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
                                                    >
                                                        <ChevronRight className="w-5 h-5 text-teal-400" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[3rem]">
                                        <h3 className="text-2xl font-bold mb-2">No complaints found</h3>
                                        <p className="text-gray-500">Try adjusting your filters or search keywords.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="map-view"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-[70vh] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative"
                            >
                                {!isLoaded ? (
                                    <div className="w-full h-full bg-[#111] flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                                    </div>
                                ) : (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={mapCenter}
                                        zoom={12}
                                        options={{
                                            styles: mapStyle,
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                        }}
                                    >
                                        {filteredComplaints.map(complaint => (
                                            <Marker
                                                key={complaint.id}
                                                position={{ lat: 40.7128, lng: -74.0060 }} // For demo, use real coords in prod
                                                onClick={() => setSelectedComplaint(complaint)}
                                                icon={{
                                                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                                                    fillColor: complaint.status === 'resolved' ? '#10b981' : '#f59e0b',
                                                    fillOpacity: 1,
                                                    strokeWeight: 1,
                                                    strokeColor: '#000',
                                                    scale: 1.5,
                                                }}
                                            />
                                        ))}

                                        {selectedComplaint && (
                                            <InfoWindow
                                                position={{ lat: 40.7128, lng: -74.0060 }}
                                                onCloseClick={() => setSelectedComplaint(null)}
                                            >
                                                <div className="p-3 max-w-xs text-black">
                                                    <h4 className="font-bold mb-1">{selectedComplaint.title}</h4>
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{selectedComplaint.description}</p>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-[10px] font-black uppercase text-teal-600">{selectedComplaint.status}</span>
                                                        <Link
                                                            href={`/complaints/${selectedComplaint.id}`}
                                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                                        >
                                                            Details ➔
                                                        </Link>
                                                    </div>
                                                </div>
                                            </InfoWindow>
                                        )}
                                    </GoogleMap>
                                )}

                                {/* Floating Map Legend */}
                                <div className="absolute bottom-8 left-8 p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4">
                                        <Navigation className="w-4 h-4 text-teal-400" /> Map Legend
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <span className="text-xs text-gray-300">Submitted / In Progress</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="text-xs text-gray-300">Resolved / Validated</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}

// Support components
function Loader2({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
    );
}

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#121212" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#222222" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

import Link from 'next/link';

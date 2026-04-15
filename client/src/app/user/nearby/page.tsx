'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, List, MapPin, 
  AlertCircle, Clock, ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const CityMap = dynamic(() => import('@/components/dashboard/CityMap'), {
  ssr: false,
  loading: () => (
    <div className="glass-card h-full min-h-[400px] flex items-center justify-center">
      <div className="text-white/20 text-sm">Loading map...</div>
    </div>
  ),
});

interface Complaint {
  _id: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: any; // Flexible for GeoJSON or old format
  createdAt: string;
}

export default function NearbyIssuesPage() {
  const router = useRouter();
  const { token, t } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setError("Location access denied. Using center coordinates.");
          setLocation({ lat: 28.6139, lng: 77.209 }); // Default Delhi
        }
      );
    } else {
      setError("Geolocation not supported.");
      setLocation({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  useEffect(() => {
    const fetchNearby = async () => {
      if (!location) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/complaints/nearby?lat=${location.lat}&lng=${location.lng}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);
        } else {
          setError(data.error || "Failed to fetch nearby issues");
        }
      } catch (err) {
        setError("Connection failed");
      } finally {
        setLoading(false);
      }
    };

    if (location) fetchNearby();
  }, [location, token]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'escalated': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
               <Navigation className="w-8 h-8 text-blue-500" />
              {t('nearbyIssues')}
            </h1>
            <p className="text-slate-500 mt-2">Grievances reported within 2km of your current location.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                {t('list')}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {t('map')}
              </button>
            </div>

            {location && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                <MapPin className="w-4 h-4" />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="min-h-[500px]">
          {loading ? (
            viewMode === 'list' ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="h-[500px] rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse flex items-center justify-center">
                <p className="text-white/20">Initializing map...</p>
              </div>
            )
          ) : viewMode === 'map' ? (
            <div className="h-[600px] rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-blue-500/5">
              <CityMap complaints={complaints as any} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-24 rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/10">
              <List className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">No Nearby Issues Found</h3>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Everything seems quiet in your area! Great news for the community.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {complaints.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/user/complaints/${c._id}`)}
                  className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                          {c.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {c.description}
                      </h3>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {c.location.area}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-500/20 transition-all">
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
               <Navigation className="w-8 h-8 text-blue-500" />
              {t('nearbyIssues')}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Grievances reported within 2km of your current location.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center dark:bg-white/5 bg-slate-100 p-1 rounded-xl border dark:border-white/10 border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  viewMode === 'list' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                {t('list')}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  viewMode === 'map' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {t('map')}
              </button>
            </div>

            {location && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="min-h-[500px]">
          {loading ? (
            viewMode === 'list' ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-[2rem] dark:bg-white/[0.03] bg-slate-100 border dark:border-white/10 border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="h-[500px] rounded-[2rem] dark:bg-white/[0.03] bg-slate-100 border dark:border-white/10 border-slate-200 animate-pulse flex items-center justify-center">
                <p className="text-slate-400 uppercase tracking-widest font-black text-xs">Initializing map...</p>
              </div>
            )
          ) : viewMode === 'map' ? (
            <div className="h-[600px] rounded-[2rem] border dark:border-white/10 border-slate-200 overflow-hidden shadow-2xl shadow-blue-500/5 bg-slate-50 dark:bg-slate-900/50">
              <CityMap complaints={complaints as any} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-24 rounded-[3rem] dark:bg-white/[0.02] bg-slate-50/50 border-2 border-dashed dark:border-white/10 border-slate-200">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-bold dark:text-slate-400 text-slate-900 mb-2">No Nearby Issues Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                Everything seems quiet in your area! Great news for the community. Use the report button to log any new concerns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {complaints.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/user/complaints/${c._id}`)}
                    className="group relative p-6 md:p-8 rounded-[2rem] glass-card hover:border-primary-500/30 hover:bg-white dark:hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-lg border-2"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {c.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold dark:text-white text-slate-800 truncate group-hover:text-primary-600 dark:group-hover:text-white transition-colors">
                          {c.description}
                        </h3>
                        <div className="flex items-center gap-6 mt-4 text-xs dark:text-slate-500 text-slate-400 font-medium">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-500/70" />
                            {c.location.area}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500/70" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-md">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Send,
  MapPin,
  Loader2,
  FileText,
  ChevronDown,
  Locate,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORIES, DELHI_DISTRICTS } from '@/lib/constants';
import VoiceInputButton from './VoiceInputButton';
import AIProcessingLoader from './AIProcessingLoader';
import toast from 'react-hot-toast';

const DELHI_AREAS: Record<string, { lat: number; lng: number; areas: string[] }> = {
  'Central Delhi': { lat: 28.6448, lng: 77.2167, areas: ['Connaught Place', 'Karol Bagh', 'Chandni Chowk', 'Daryaganj', 'Patel Nagar'] },
  'East Delhi': { lat: 28.6304, lng: 77.2773, areas: ['Laxmi Nagar', 'Preet Vihar', 'Mayur Vihar', 'Shakarpur', 'Patparganj'] },
  'South Delhi': { lat: 28.5244, lng: 77.2066, areas: ['Saket', 'Nehru Place', 'Greater Kailash', 'Lajpat Nagar', 'Hauz Khas'] },
  'North Delhi': { lat: 28.7134, lng: 77.2072, areas: ['Civil Lines', 'Model Town', 'Azadpur', 'Kamla Nagar', 'Timarpur'] },
  'West Delhi': { lat: 28.6491, lng: 77.1217, areas: ['Janakpuri', 'Rajouri Garden', 'Tilak Nagar', 'Moti Nagar', 'Kirti Nagar'] },
  'South West Delhi': { lat: 28.5921, lng: 77.0460, areas: ['Dwarka', 'Vasant Kunj', 'Palam', 'Najafgarh', 'Kapashera'] },
  'North West Delhi': { lat: 28.7158, lng: 77.0695, areas: ['Rohini', 'Pitampura', 'Wazirpur', 'Shalimar Bagh', 'Netaji Subhash Place'] },
  'New Delhi': { lat: 28.6139, lng: 77.2090, areas: ['India Gate', 'Pragati Maidan', 'Lodhi Road', 'Chanakyapuri', 'Barakhamba'] },
};

export default function ComplaintForm() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAreas = district ? DELHI_AREAS[district]?.areas || [] : [];

  const handleVoiceInput = (text: string) => {
    setDescription((prev) => (prev ? prev + ' ' + text : text));
    toast.success('Voice input captured!', { icon: '🎤' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a complaint description');
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 4000));

    setIsSubmitting(true);
    try {
      const districtData = DELHI_AREAS[district] || DELHI_AREAS['New Delhi'];
      const res: any = await api.createComplaint({
        description,
        location: {
          lat: districtData.lat + (Math.random() - 0.5) * 0.02,
          lng: districtData.lng + (Math.random() - 0.5) * 0.02,
          area: area || 'Unknown Area',
          district: district || 'New Delhi',
        },
      });

      if (res.success && res.data) {
        toast.success('Complaint submitted successfully!');
        router.push(`/complaints/${res.data.complaintId}`);
      } else {
        toast.error('Failed to submit complaint');
        setIsProcessing(false);
      }
    } catch {
      toast.error('Error submitting complaint');
      setIsProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProcessing) {
    return <AIProcessingLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-4">
          <FileText className="w-3 h-3" />
          AI-Powered Complaint Filing
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Submit a New Complaint</h1>
        <p className="text-white/50 text-sm">
          Describe your issue and our AI will automatically categorize, prioritize, and route it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Complaint Description
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail... (e.g., Major pothole on Ring Road near Nehru Place causing accidents)"
              rows={4}
              className="input-field resize-none pr-12"
              required
            />
            <VoiceInputButton onResult={handleVoiceInput} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Category <span className="text-white/30">(optional — AI will auto-detect)</span>
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Auto-detect by AI</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> District
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setArea(''); }}
                className="input-field appearance-none cursor-pointer"
              >
                <option value="">Select District</option>
                {DELHI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <Locate className="w-3.5 h-3.5 inline mr-1" /> Area
            </label>
            <div className="relative">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="input-field appearance-none cursor-pointer"
                disabled={!district}
              >
                <option value="">Select Area</option>
                {availableAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isSubmitting ? 'Processing...' : 'Submit & Analyze with AI'}
        </button>
      </form>
    </motion.div>
  );
}

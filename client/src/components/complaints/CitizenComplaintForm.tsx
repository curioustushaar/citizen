'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  MapPin,
  Tag,
  Upload,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Globe,
  Locate,
  Mic,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Water',
  'Electricity',
  'Traffic',
  'Roads',
  'Sanitation',
  'Public Safety',
  'Health',
  'Environment',
  'Infrastructure',
  'Other',
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  Water: ['Leakage', 'No Supply', 'Contamination', 'Low Pressure'],
  Electricity: ['Power Outage', 'Unsafe Wiring', 'Street Light', 'Transformer'],
  Traffic: ['Signal Issue', 'Congestion', 'Illegal Parking', 'Accident Spot'],
  Roads: ['Pothole', 'Broken Road', 'Road Block', 'Drain Damage'],
  Sanitation: ['Garbage', 'Overflow', 'Cleaning Required', 'Dead Animals'],
  'Public Safety': ['Crime', 'Harassment', 'Street Safety', 'Emergency'],
  Health: ['Medical', 'Hospital', 'Disease Risk', 'Ambulance'],
  Environment: ['Pollution', 'Tree Damage', 'Water Logging', 'Noise'],
  Infrastructure: ['Building Damage', 'Encroachment', 'Construction', 'Lighting'],
  Other: [],
};

const CONTACT_PREFERENCES = ['Email', 'Phone', 'Both'];
const LANGUAGE_OPTIONS = ['English', 'Hindi'];

const AREA_SUGGESTIONS = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone'];
const WARD_SUGGESTIONS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

type CitizenComplaintFormProps = {
  redirectBasePath?: string;
};

export default function CitizenComplaintForm({
  redirectBasePath = '/citizen/complaints',
}: CitizenComplaintFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [ward, setWard] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [contactPreference, setContactPreference] = useState('Email');
  const [anonymous, setAnonymous] = useState(false);
  const [consent, setConsent] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [locationStatusType, setLocationStatusType] = useState<'idle' | 'loading' | 'success' | 'error' | 'denied'>(
    'idle'
  );
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [detectedLocationLabel, setDetectedLocationLabel] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quickMode, setQuickMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const subcategories = category ? SUBCATEGORY_OPTIONS[category] || [] : [];

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
        // @ts-expect-error webkitSpeechRecognition fallback
        (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const res = await fetch('/api/citizen/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (!isMounted || !res.ok || !data?.success) return;
        const user = data.user || {};
        setFullName(user.name || '');
        setPhoneNumber(user.phone || '');
      } catch {
        // Ignore autofill errors
      }
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEvidenceChange = (files: FileList | null) => {
    if (!files) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const selected = Array.from(files);
    const filtered = selected.filter((file) => allowedTypes.includes(file.type));
    const next = filtered.slice(0, 5);
    setEvidenceFiles(next);
    if (filtered.length !== selected.length) {
      setErrors((prev) => ({ ...prev, evidence: 'Only JPG, PNG, WEBP, or PDF files are allowed.' }));
    } else {
      setErrors((prev) => ({ ...prev, evidence: '' }));
    }
  };

  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatusType('error');
      setLocationStatus('Geolocation is not supported in this browser.');
      return;
    }

    setLocationStatusType('loading');
    setLocationStatus('Detecting location...');
    setLocationAccuracy(null);
    setDetectedLocationLabel('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setLocationAccuracy(Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null);

        try {
          const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error || 'Could not detect location');
          }

          setCity(data.city || city);
          setArea(data.area || area);
          setPincode(data.pincode || pincode);
          setFullAddress(data.fullAddress || fullAddress);

          const label = [data.area, data.city].filter(Boolean).join(', ') || data.fullAddress || 'Location detected';
          setDetectedLocationLabel(label);
          setLocationStatusType('success');
          setLocationStatus('Location detected successfully');
        } catch (err) {
          setLocationStatusType('error');
          setLocationStatus('Could not detect location');
        }
      },
      (err) => {
        if (err?.code === err.PERMISSION_DENIED) {
          setLocationStatusType('denied');
          setLocationStatus('Location permission denied. Please enter manually.');
        } else {
          setLocationStatusType('error');
          setLocationStatus('Could not detect location');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleVoiceInput = () => {
    if (!speechSupported) return;
    // @ts-expect-error webkitSpeechRecognition fallback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setDescription(transcript.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    const finalCategory = category || (quickMode ? 'Other' : '');
    const autoLocationAvailable = Boolean(latitude && longitude);
    const finalCity = city.trim() || (quickMode && autoLocationAvailable ? 'Auto-detected' : '');
    const finalArea = area.trim() || (quickMode && autoLocationAvailable ? 'Auto-detected' : '');
    const finalPincode = pincode.trim() || (quickMode && autoLocationAvailable ? '000000' : '');

    if (!title.trim()) nextErrors.title = 'Title is required.';
    const nextDescription = description.trim() || (quickMode ? title.trim() : '');
    if (!nextDescription) nextErrors.description = 'Description is required.';
    if (!finalCategory) nextErrors.category = 'Category is required.';
    if (!finalCity) nextErrors.city = 'City is required.';
    if (!finalArea) nextErrors.area = 'Area is required.';
    if (!finalPincode) nextErrors.pincode = 'Pincode is required.';
    if (!evidenceFiles.length) nextErrors.evidence = 'At least one evidence file is required.';
    if (!consent) nextErrors.consent = 'Consent is required to submit.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitError('');
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('title', title);
    payload.append('description', nextDescription || description);
    payload.append('category', finalCategory);
    if (subcategory) payload.append('subcategory', subcategory);
    payload.append('city', finalCity);
    payload.append('area', finalArea);
    if (fullAddress) payload.append('fullAddress', fullAddress);
    if (ward) payload.append('ward', ward);
    payload.append('pincode', finalPincode);
    if (landmark) payload.append('landmark', landmark);
    if (preferredLanguage) payload.append('preferredLanguage', preferredLanguage);
    if (contactPreference) payload.append('contactPreference', contactPreference);
    payload.append('anonymous', String(anonymous));
    payload.append('consent', String(consent));
    if (latitude) payload.append('latitude', latitude);
    if (longitude) payload.append('longitude', longitude);
    evidenceFiles.forEach((file) => payload.append('evidence', file));

    fetch('/api/citizen/complaints', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to submit complaint');
        }
        const complaintId = data?.data?.complaintId;
        if (complaintId) {
          window.location.href = `${redirectBasePath}/${complaintId}`;
        }
      })
      .catch((err) => {
        setSubmitError(err.message || 'Failed to submit complaint');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Create Complaint</p>
            <h1 className="text-2xl font-semibold text-white">Submit a New Case</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <label className="text-sm font-medium text-white/70">Complaint Title</label>
            <input
              className="login-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Short, clear title"
              required
            />
            {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Name (auto-filled)</label>
              <div className="relative">
                <User className="login-input-icon" />
                <input className="login-input" value={fullName} readOnly placeholder="Your name" />
              </div>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Phone (auto-filled)</label>
              <div className="relative">
                <Phone className="login-input-icon" />
                <input className="login-input" value={phoneNumber} readOnly placeholder="Phone number" />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="text-sm font-medium text-white/70">Complaint Description</label>
            <textarea
              className="login-input min-h-[140px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue in detail"
              required
            />
            {errors.description && <p className="text-xs text-rose-400">{errors.description}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={quickMode}
                  onChange={(event) => setQuickMode(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                Quick complaint (title + photo + auto location)
              </label>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={!speechSupported || isListening}
                className="login-submit-btn"
              >
                <Mic className="w-4 h-4" />
                {isListening ? 'Listening...' : 'Voice input'}
              </button>
              {!speechSupported && (
                <span className="text-xs text-white/50">Voice input not supported in this browser.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Category</label>
              <div className="relative">
                <Tag className="login-input-icon" />
                <select
                  className="login-input"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setSubcategory('');
                  }}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-xs text-rose-400">{errors.category}</p>}
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Subcategory (optional)</label>
              <div className="relative">
                <Tag className="login-input-icon" />
                <select
                  className="login-input"
                  value={subcategory}
                  onChange={(event) => setSubcategory(event.target.value)}
                  disabled={!subcategories.length}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="text-sm font-medium text-white/70">Location Details</label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locationStatusType === 'loading'}
                className="login-submit-btn"
              >
                {locationStatusType === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>📍 Use my current location</>
                )}
              </button>
              {(locationStatusType === 'success' || locationStatusType === 'error' || locationStatusType === 'denied') && (
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="text-xs text-primary-300 hover:text-primary-200"
                >
                  Change location
                </button>
              )}
            </div>
            {locationStatus && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {locationStatusType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {locationStatusType === 'loading' && <Loader2 className="w-4 h-4 text-white/60 animate-spin" />}
                {(locationStatusType === 'error' || locationStatusType === 'denied') && (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-white/70">{locationStatus}</span>
                {locationStatusType === 'success' && locationAccuracy !== null && (
                  <span className="text-white/50">Accuracy ~{locationAccuracy}m</span>
                )}
              </div>
            )}
            {detectedLocationLabel && locationStatusType === 'success' && (
              <p className="text-xs text-emerald-300">
                {detectedLocationLabel}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="login-input-icon" />
                <input
                  className="login-input"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City"
                  required
                />
                {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
              </div>
              <div className="relative">
                <MapPin className="login-input-icon" />
                <input
                  className="login-input"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Area / Locality"
                  list="area-suggestions"
                  required
                />
                <datalist id="area-suggestions">
                  {AREA_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {errors.area && <p className="text-xs text-rose-400 mt-1">{errors.area}</p>}
              </div>
              <div className="relative">
                <MapPin className="login-input-icon" />
                <input
                  className="login-input"
                  value={ward}
                  onChange={(event) => setWard(event.target.value)}
                  placeholder="Ward / Zone"
                  list="ward-suggestions"
                />
                <datalist id="ward-suggestions">
                  {WARD_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="relative">
                <MapPin className="login-input-icon" />
                <input
                  className="login-input"
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value)}
                  placeholder="Pincode"
                  required
                />
                {errors.pincode && <p className="text-xs text-rose-400 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            <div className="relative">
              <Locate className="login-input-icon" />
              <input
                className="login-input"
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="Landmark (optional)"
              />
            </div>

            <div className="relative">
              <Locate className="login-input-icon" />
              <input
                className="login-input"
                value={fullAddress}
                onChange={(event) => setFullAddress(event.target.value)}
                placeholder="Full address (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3">
              <input
                className="login-input"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="Latitude (optional)"
              />
              <input
                className="login-input"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="Longitude (optional)"
              />
              <button type="button" onClick={handleUseLocation} className="login-submit-btn">
                Use GPS
              </button>
            </div>
            {latitude && longitude && (
              <a
                className="text-xs text-primary-300 hover:text-primary-200"
                href={`https://maps.google.com/?q=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                View pinned location
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Preferred Language</label>
              <div className="relative">
                <Globe className="login-input-icon" />
                <select
                  className="login-input"
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium text-white/70">Contact Preference</label>
              <div className="relative">
                <Phone className="login-input-icon" />
                <select
                  className="login-input"
                  value={contactPreference}
                  onChange={(event) => setContactPreference(event.target.value)}
                >
                  {CONTACT_PREFERENCES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium text-white/70">Evidence Upload (required)</label>
            <div className="glass-card p-4 border border-dashed border-white/10">
              <label className="flex flex-col items-center gap-2 cursor-pointer text-white/60">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Upload photos or PDFs (max 5)</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(event) => handleEvidenceChange(event.target.files)}
                  required
                />
              </label>
              {evidenceFiles.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-white/70">
                  {evidenceFiles.map((file) => (
                    <li key={file.name} className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-white/40" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.evidence && <p className="text-xs text-rose-400">{errors.evidence}</p>}
          </div>

          <div className="grid gap-3">
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              Keep my identity anonymous on public view
            </label>
            <label className="flex items-center gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
                required
              />
              I confirm the information is accurate and consent to share it with authorities
            </label>
            {errors.consent && <p className="text-xs text-rose-400">{errors.consent}</p>}
          </div>

          <button
            type="submit"
            className="login-submit-btn w-full"
            disabled={isSubmitting}
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
          {submitError && <p className="text-xs text-rose-400">{submitError}</p>}
        </form>
      </div>
    </div>
  );
}

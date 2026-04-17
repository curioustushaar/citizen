'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Phone,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  RecaptchaVerifier,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@/lib/firebase';

function CitizenLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const recaptchaRef = useRef(null);
  const handledLoginRef = useRef(false);
  const autoLoginRef = useRef(false);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const allowAutoRedirect = localStorage.getItem('citizen_auth_initiated') === '1';
      if (!allowAutoRedirect) return;
      try {
        const res = await fetch('/api/citizen/auth/me', {
          credentials: 'include',
        });
        const data = await res.json();
        if (isMounted && res.ok && data?.success) {
          router.replace('/user/dashboard');
        }
      } catch {
        // Ignore session check errors on login page
      }
    };
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const resolveRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!isMounted || !result) return;
        setLoading(true);
        const idToken = await result.user.getIdToken();
        await handleBackendLogin(idToken);
      } catch (err) {
        if (isMounted) setError(err.message || 'Google login failed');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    resolveRedirect();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const allowAutoLogin =
        autoLoginRef.current || localStorage.getItem('citizen_auth_initiated') === '1';
      if (!allowAutoLogin || !user || handledLoginRef.current) return;
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        await handleBackendLogin(idToken);
      } catch (err) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBackendLogin = async (idToken) => {
    const res = await fetch('/api/citizen/auth/firebase-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');
    handledLoginRef.current = true;
    localStorage.removeItem('citizen_auth_initiated');
    localStorage.setItem('citizen_login_pending', Date.now().toString());
    router.replace('/user/dashboard');
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      autoLoginRef.current = true;
      localStorage.setItem('citizen_auth_initiated', '1');
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      localStorage.removeItem('citizen_auth_initiated');
      setError(err.message || 'Google login failed');
      setLoading(false);
    } finally {
      // Redirect flow finishes in getRedirectResult.
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      autoLoginRef.current = true;
      localStorage.setItem('citizen_auth_initiated', '1');
      let userCredential;
      if (mode === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      if (mode === 'register') {
        const displayName = fullName.trim() || email.split('@')[0];
        await updateProfile(userCredential.user, { displayName });
      }
      const idToken = await userCredential.user.getIdToken();
      await handleBackendLogin(idToken);
    } catch (err) {
      handledLoginRef.current = false;
      localStorage.removeItem('citizen_auth_initiated');
      setError(err.message || 'Email login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      autoLoginRef.current = true;
      localStorage.setItem('citizen_auth_initiated', '1');
      const normalizedPhone = phone.trim();
      if (!normalizedPhone) {
        throw new Error('Enter a phone number with country code, e.g. +91...');
      }
      if (!normalizedPhone.startsWith('+')) {
        throw new Error('Phone must include country code, e.g. +91...');
      }
      const appVerifier = recaptchaRef.current;
      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);
      setConfirmation(result);
    } catch (err) {
      handledLoginRef.current = false;
      localStorage.removeItem('citizen_auth_initiated');
      setError(err.message || 'OTP send failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      autoLoginRef.current = true;
      localStorage.setItem('citizen_auth_initiated', '1');
      const result = await confirmation.confirm(otp);
      const idToken = await result.user.getIdToken();
      await handleBackendLogin(idToken);
    } catch (err) {
      handledLoginRef.current = false;
      localStorage.removeItem('citizen_auth_initiated');
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-bg-gradient" />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="login-container"
      >
        <div className="login-emblem-section">
          <div className="login-emblem">
            <div className="login-emblem-inner">
              <ShieldCheck className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="login-emblem-ring" />
          </div>
          <div>
            <h1 className="login-title">Citizen Service Login</h1>
            <p className="login-subtitle">Report, track, and resolve civic issues</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-role-toggle" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <button className="login-role-btn login-role-btn-active" style={{ padding: '0.75rem 0.25rem' }}>
              <UserCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs">Citizen</span>
            </button>
            <motion.div className="login-role-indicator" style={{ width: 'calc(100% - 1.33px)' }} />
          </div>

          <div className="login-mode-header">
            <h2 className="login-mode-title">
              {mode === 'login' ? 'Login' : 'Register'}{' '}
              <span className="login-mode-title-thin">
                {mode === 'login' ? 'to your account' : 'for a new account'}
              </span>
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'login'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'text-white/70 border-white/10 hover:text-white hover:border-white/30'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'register'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'text-white/70 border-white/10 hover:text-white hover:border-white/30'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="login-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <button onClick={handleGoogle} className="login-submit-btn" disabled={loading}>
              <LogIn className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="login-input-wrapper">
              <Phone className="login-input-icon" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="login-input"
                placeholder="Phone with country code, e.g. +91..."
              />
            </div>
            <button onClick={handleSendOtp} className="login-submit-btn" disabled={loading}>
              <Phone className="w-5 h-5" />
              Continue with Phone
            </button>
          </div>

          {confirmation && (
            <div className="mt-4">
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="login-input"
                  placeholder="Enter OTP"
                />
              </div>
              <button onClick={handleVerifyOtp} className="login-submit-btn mt-3" disabled={loading}>
                Verify OTP
              </button>
            </div>
          )}

          <div className="login-divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleEmail} className="login-form">
            {mode === 'register' && (
              <div className="login-field">
                <div className="login-input-wrapper">
                  <UserCircle2 className="login-input-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="login-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}
            <div className="login-field">
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <div className="login-spinner" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {mode === 'login' ? 'Login' : 'Register'}
                </>
              )}
            </button>
          </form>

          <div id="recaptcha-container" />
        </div>
      </motion.div>
    </div>
  );
}

export default function CitizenLoginPage() {
  return (
    <Suspense fallback={null}>
      <CitizenLoginContent />
    </Suspense>
  );
}

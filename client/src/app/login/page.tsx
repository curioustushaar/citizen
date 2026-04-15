'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogIn, UserPlus, Eye, EyeOff, Zap,
  AlertCircle, CheckCircle2, Mail, Lock, User, Phone,
  ArrowRight, Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Mode = 'login' | 'register';

const FEATURES = [
  { icon: '≡ƒñû', text: 'AI-Powered complaint routing' },
  { icon: 'ΓÜí', text: 'Real-time status tracking' },
  { icon: '≡ƒÅ¢∩╕Å', text: 'Direct department escalation' },
  { icon: '≡ƒôè', text: 'Live city-wide analytics' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user, isLoading: authLoading, t } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (mounted && !authLoading && user) {
      if (user.role === 'SUPER_ADMIN') router.replace('/superadmin/dashboard');
      else if (user.role === 'ADMIN') router.replace('/officer/dashboard');
      else router.replace('/user/dashboard');
    }
  }, [user, authLoading, mounted, router]);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '', phone: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!form.email || !form.password) {
          setError('Please fill in all fields');
          return;
        }
        const result = await login(form.email, form.password);
        if (result.ok) {
          setSuccess('Login successful! Redirecting...');
          // Redirect will be handled by the useEffect above once 'user' is set
        } else {
          setError(result.error || 'Invalid email or password.');
        }
      } else {
        if (!form.name || !form.email || !form.password) {
          setError('Name, email and password are required');
          return;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        const result = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        if (result.ok) {
          setSuccess('Account created! Redirecting...');
          setTimeout(() => router.push('/user/dashboard'), 800);
        } else {
          setError(result.error || 'Registration failed. This email may already be in use.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222, 47%, 4%)' }}>

      {/* ΓöÇΓöÇ Left Panel ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(222,47%,8%) 0%, hsl(230,50%,10%) 100%)' }}>

        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Grievance System</p>
            <p className="text-[10px] text-white/30">Smart Sarkari Resolver</p>
          </div>
        </div>

        {/* Main illustration content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">AI-Powered Governance</span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your grievances,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              resolved faster.
            </span>
          </h2>

          <p className="text-slate-400 text-base leading-relaxed mb-10">
            File complaints, track real-time status, and get AI-powered routing to the right government department ΓÇö all in one place.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base">
                  {f.icon}
                </div>
                <p className="text-sm text-slate-400">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom trust badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Secured with 256-bit encryption. Your data is protected under government privacy guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* ΓöÇΓöÇ Right Panel ΓÇö Auth Forms ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-bold text-white">AI Grievance System</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl mb-8">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                suppressHydrationWarning
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  mode === m
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {m === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">
              {mode === 'login' ? t('welcomeBack') : t('createAccount')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'login'
                ? 'Sign in to track your complaints and access your dashboard.'
                : 'Join thousands of citizens using AI to resolve grievances faster.'}
            </p>
          </div>

          {/* Error / Success Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={setField('name')}
                      placeholder="e.g. Rajesh Kumar"
                      required={mode === 'register'}
                      suppressHydrationWarning
                      className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                required
                suppressHydrationWarning
                autoComplete="email"
                className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter your password'}
                  required
                  suppressHydrationWarning
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3.5 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  suppressHydrationWarning
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Phone <span className="text-slate-700 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={setField('phone')}
                      placeholder="+91 98765 43210"
                      suppressHydrationWarning
                      className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              suppressHydrationWarning
              className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {mode === 'login' ? t('signInToDashboard') : t('createAccount')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Superadmin hint for judges/demo */}
          {mode === 'login' && (
            <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-widest mb-2">Demo Credentials</p>
              <p className="text-xs text-slate-500">
                Super Admin: <span className="text-slate-400 font-mono">superadmin@delhi.gov.in</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Password: <span className="text-slate-400 font-mono">super123</span>
              </p>
            </div>
          )}

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-600 mt-6">
            {mode === 'login' ? t('noAccount') : t('alreadyHaveAccount')}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              suppressHydrationWarning
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {mode === 'login' ? t('registerHere') : t('login')}
            </button>
          </p>

          <p className="text-center text-[10px] text-slate-700 mt-8">
            AI Grievance Intelligence System ΓÇó Delhi NCR Smart City Initiative
          </p>
        </div>
      </div>
    </div>
  );
}

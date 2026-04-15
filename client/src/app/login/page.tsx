'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, User, Users, LogIn, UserPlus, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const roles = [
  {
    key: 'PUBLIC',
    label: 'Citizen',
    desc: 'File complaints, track status, give feedback',
    icon: User,
    gradient: 'from-success-500 to-success-600',
    email: 'citizen@demo.com',
    password: 'demo123',
  },
  {
    key: 'ADMIN',
    label: 'Department Officer',
    desc: 'Manage complaints, update status, add notes',
    icon: Users,
    gradient: 'from-primary-500 to-primary-600',
    email: 'admin@trafficpolice.gov.in',
    password: 'admin123',
  },
  {
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    desc: 'Full control, SLA config, user management, audit',
    icon: Shield,
    gradient: 'from-accent-500 to-accent-600',
    email: 'superadmin@delhi.gov.in',
    password: 'super123',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, register } = useAuth();
  const [mode, setMode] = useState<'demo' | 'login' | 'register'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const handleDemoLogin = async (role: string) => {
    setLoading(role);
    setError('');
    const ok = await demoLogin(role);
    if (ok) {
      if (role === 'PUBLIC') router.push('/my-complaints');
      else if (role === 'ADMIN') router.push('/officer');
      else router.push('/superadmin');
    } else {
      setError('Login failed');
    }
    setLoading('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('login');
    setError('');
    const ok = await login(email, password);
    if (ok) {
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
    setLoading('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('register');
    setError('');
    const ok = await register({ name, email, password });
    if (ok) {
      router.push('/my-complaints');
    } else {
      setError('Registration failed');
    }
    setLoading('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'hsl(222, 47%, 5%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Grievance Intelligence</h1>
          <p className="text-white/40 text-sm">Smart Sarkari Complaint Resolver</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
          {(['demo', 'login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                mode === m ? 'bg-primary-500/20 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {m === 'demo' ? '⚡ Quick Demo' : m === 'login' ? '🔐 Login' : '📝 Register'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
            {error}
          </div>
        )}

        {/* Demo Mode */}
        {mode === 'demo' && (
          <div className="space-y-3">
            <p className="text-xs text-white/30 text-center mb-2">Select a role to explore the system</p>
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.button
                  key={role.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleDemoLogin(role.key)}
                  disabled={!!loading}
                  className="w-full glass-card glass-card-hover p-4 flex items-center gap-4 text-left disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{role.label}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{role.desc}</p>
                    <p className="text-[10px] text-white/20 mt-1 font-mono">{role.email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {loading === role.key ? (
                      <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={!!loading}>
              {loading === 'login' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="glass-card p-6 space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Create a password"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={!!loading}>
              {loading === 'register' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-white/20 mt-6">
          AI Grievance Intelligence System v2.0 • Powered by Smart City Governance
        </p>
      </motion.div>
    </div>
  );
}

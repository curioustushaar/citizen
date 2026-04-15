'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, User, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type RoleTab = 'CITIZEN' | 'OFFICER';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<RoleTab>('CITIZEN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const p = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${2 + Math.random() * 4}px`,
    }));
    setParticles(p);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const requiredRole = role === 'OFFICER' ? 'ADMIN' : 'PUBLIC';
    const ok = await login(email, password, requiredRole);
    if (ok) {
      const u = JSON.parse(localStorage.getItem('grievance_user') || '{}');
      if (u.role === 'SUPER_ADMIN') return router.push('/superadmin');
      router.push(role === 'OFFICER' ? '/officer' : '/my-complaints');
    } else {
      const stored = localStorage.getItem('grievance_user_auth_error_role');
      if (stored) {
        setError(`This account is registered as ${stored}. Please use the ${stored === 'ADMIN' ? 'Officer' : 'Citizen'} Login portal.`);
        localStorage.removeItem('grievance_user_auth_error_role');
      } else {
        setError(`Invalid credentials or access denied for ${role === 'OFFICER' ? 'Officer' : 'Citizen'} portal.`);
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await register({ name, email, password });
    if (ok) {
      router.push('/my-complaints');
    } else {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const roleKey = role === 'OFFICER' ? 'ADMIN' : 'PUBLIC';
    const ok = await demoLogin(roleKey);
    if (ok) {
      const u = JSON.parse(localStorage.getItem('grievance_user') || '{}');
      if (u.role === 'SUPER_ADMIN') return router.push('/superadmin');
      router.push(role === 'OFFICER' ? '/officer' : '/my-complaints');
    } else {
      setError('Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      {/* Animated background particles */}
      <div className="login-bg-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="login-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay */}
      <div className="login-bg-gradient" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="login-container"
      >
        {/* Government Emblem / Logo */}
        <div className="login-emblem-section">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="login-emblem"
          >
            {/* India Ashoka emblem style icon */}
            <div className="login-emblem-inner">
              <ShieldCheck className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
            </div>
            {/* Glow ring */}
            <div className="login-emblem-ring" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="login-title">AI Grievance Intelligence System</h1>
            <p className="login-subtitle">Smart Sarkari Complaint Resolver</p>
          </motion.div>
        </div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="login-card"
        >
          {/* Role Toggle */}
          <div className="login-role-toggle">
            <button
              onClick={() => { setRole('CITIZEN'); setError(''); }}
              className={`login-role-btn ${role === 'CITIZEN' ? 'login-role-btn-active' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>Citizen Login</span>
            </button>
            <button
              onClick={() => { setRole('OFFICER'); setError(''); }}
              className={`login-role-btn ${role === 'OFFICER' ? 'login-role-btn-active' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>Officer Login</span>
            </button>
            {/* Sliding indicator */}
            <motion.div
              className="login-role-indicator"
              animate={{ x: role === 'CITIZEN' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Mode label */}
          <div className="login-mode-header">
            <h2 className="login-mode-title">
              {mode === 'login' ? 'Login' : 'Register'}{' '}
              <span className="login-mode-title-thin">to your account</span>
            </h2>
          </div>

          {/* Error */}
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

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="login-form">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="login-field"
              >
                <div className="login-input-wrapper">
                  <User className="login-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </motion.div>
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

            {mode === 'login' && (
              <div className="login-forgot-row">
                <button type="button" className="login-forgot-btn">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="login-spinner" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="login-demo-section">
            <div className="login-divider">
              <span>or try quick demo</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="login-demo-btn"
            >
              ⚡ Quick Demo as {role === 'CITIZEN' ? 'Citizen' : 'Officer'}
            </button>
          </div>

          {/* Toggle mode */}
          <div className="login-toggle-mode">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('register'); setError(''); }} className="login-toggle-link">
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="login-toggle-link">
                  Login
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="login-footer"
        >
          AI Grievance Intelligence System v2.0 • Government of India • Smart City Initiative
        </motion.p>
      </motion.div>
    </div>
  );
}

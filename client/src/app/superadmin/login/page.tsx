'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      router.push('/superadmin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials or unauthorized role. Access denied.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const result = await login('superadmin@delhi.gov.in', 'super123');
    if (result.ok) {
      router.push('/superadmin/dashboard');
    } else {
      setError(result.error || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="sa-login-wrapper">
      <div className="sa-scanlines" />
      <div className="sa-grid-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="sa-login-container"
      >
        <div className="sa-emblem-section">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="sa-emblem"
          >
            <ShieldAlert className="w-10 h-10 text-red-400" strokeWidth={1.5} />
            <div className="sa-emblem-pulse" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="sa-title">RESTRICTED ACCESS</h1>
            <p className="sa-subtitle">Super Administrator Portal</p>
            <div className="sa-security-badge">
              <span className="sa-security-dot" />
              SECURITY CLEARANCE REQUIRED
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="sa-login-card"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sa-error"
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="sa-form">
            <div className="login-field">
              <div className="login-input-wrapper sa-input-wrapper">
                <Mail className="login-input-icon sa-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input sa-input"
                  placeholder="Admin email address"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-input-wrapper sa-input-wrapper">
                <Lock className="login-input-icon sa-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input sa-input login-input-password"
                  placeholder="Admin password"
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

            <button
              type="submit"
              className="sa-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="login-spinner sa-spinner" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </form>

          <div className="login-demo-section">
            <div className="login-divider sa-divider">
              <span>or use demo credentials</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="sa-demo-btn"
            >
              🔑 Demo Super Admin Access
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="sa-footer"
        >
          This is a restricted government portal. Unauthorized access is punishable under IT Act.
        </motion.p>
      </motion.div>
    </div>
  );
}

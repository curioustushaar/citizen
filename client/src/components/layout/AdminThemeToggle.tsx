'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center pointer-events-none" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm"
      style={{
        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
      }}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 hover:text-white transition-colors" />
          <span className="text-xs font-medium text-white/70">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 hover:text-slate-900 transition-colors" />
          <span className="text-xs font-medium text-slate-600">Dark</span>
        </>
      )}
    </button>
  );
}

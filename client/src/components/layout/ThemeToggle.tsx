'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl glass-card animate-pulse" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                 bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5
                 dark:bg-white/[0.03] dark:border-white/5 dark:hover:border-primary-400/50"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ y: isDark ? 0 : 30 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center text-amber-400"
        >
          <Sun className="w-5 h-5 fill-amber-400/20" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ y: isDark ? -30 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center text-slate-400 group-hover:text-primary-500"
        >
          <Moon className="w-5 h-5 fill-current/10" />
        </motion.div>
      </div>
      
      {/* Tooltip-like label for larger screens if needed, but let's keep it minimal for now */}
    </button>
  );
}

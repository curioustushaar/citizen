'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { AI_INSIGHTS } from '@/lib/constants';
import { api } from '@/lib/api';

const insightTypeStyles: Record<string, { border: string; bg: string; glow: string }> = {
  warning: {
    border: 'rgba(245, 158, 11, 0.15)',
    bg: 'rgba(245, 158, 11, 0.04)',
    glow: 'rgba(245, 158, 11, 0.06)',
  },
  danger: {
    border: 'rgba(244, 63, 94, 0.15)',
    bg: 'rgba(244, 63, 94, 0.04)',
    glow: 'rgba(244, 63, 94, 0.06)',
  },
  success: {
    border: 'rgba(16, 185, 129, 0.15)',
    bg: 'rgba(16, 185, 129, 0.04)',
    glow: 'rgba(16, 185, 129, 0.06)',
  },
  info: {
    border: 'rgba(6, 182, 212, 0.15)',
    bg: 'rgba(6, 182, 212, 0.04)',
    glow: 'rgba(6, 182, 212, 0.06)',
  },
};

function TypingText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="typing-cursor" />}
    </span>
  );
}

export default function AIInsightsPanel() {
  const [loading, setLoading] = useState(true);
  const [visibleInsights, setVisibleInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await api.getAIInsights();
      if (res.success) {
        // Sequentially reveal insights for a "real-time" feel
        const insights = res.data as any[];
        insights.forEach((insight, i) => {
          setTimeout(() => {
            setVisibleInsights((prev) => [...prev, insight]);
          }, i * 1500);
        });
      }
      setLoading(false);
    };
    fetchInsights();
  }, []);

  return (
    <div className="glass-card h-full flex flex-col">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: 'rgba(139, 92, 246, 0.1)' }}
        >
          <Brain className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          <p className="text-xs text-white/35">Real-time pattern analysis</p>
        </div>
        <Sparkles className="w-3 h-3 text-accent-400 ml-auto animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {visibleInsights.map((insight, i) => {
          const style = insightTypeStyles[insight.type] || insightTypeStyles.info;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="p-3 rounded-xl transition-all duration-200"
              style={{
                border: `1px solid ${style.border}`,
                background: style.bg,
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{insight.icon}</span>
                <p className="text-xs text-white/65 leading-relaxed">
                  <TypingText text={insight.text} speed={20} />
                </p>
              </div>
            </motion.div>
          );
        })}

        {visibleInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/20">
            <Brain className="w-8 h-8 mb-2 animate-pulse" />
            <p className="text-xs">Analyzing patterns...</p>
          </div>
        )}
      </div>
    </div>
  );
}

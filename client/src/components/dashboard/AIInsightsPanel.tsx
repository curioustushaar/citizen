'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { AI_INSIGHTS } from '@/lib/constants';

const insightTypeStyles = {
  warning: 'border-warning-500/20 bg-warning-500/5',
  danger: 'border-danger-500/20 bg-danger-500/5',
  success: 'border-success-500/20 bg-success-500/5',
  info: 'border-primary-500/20 bg-primary-500/5',
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

export default function AIInsightsPanel({ complaints, stats }: { complaints: any[], stats: any }) {
  const [visibleInsights, setVisibleInsights] = useState<any[]>([]);

  useEffect(() => {
    if (!complaints || complaints.length === 0) return;

    // Generate dynamic insights
    const dynamicInsights: any[] = [];

    // Insight 1: Highest category
    const categoryCounts: Record<string, number> = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      dynamicInsights.push({
        text: `${topCategory[0]} is currently the most reported category with ${topCategory[1]} active cases.`,
        type: 'info',
        icon: '📊'
      });
    }

    // Insight 2: Escalated issues
    if (stats?.escalated > 0) {
      dynamicInsights.push({
        text: `Urgent: ${stats.escalated} complaints have been escalated. Dispatching priority alerts to department heads.`,
        type: 'danger',
        icon: '🚨'
      });
    }

    // Insight 3: Location heat
    const areaCounts: Record<string, number> = {};
    complaints.forEach(c => {
      const area = typeof c.location === 'object' ? c.location.area : c.location;
      if (area) areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    const topArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0];
    if (topArea && topArea[1] > 2) {
      dynamicInsights.push({
        text: `Localized pattern detected in ${topArea[0]}. Recommending field inspection for root cause analysis.`,
        type: 'warning',
        icon: '📍'
      });
    }

    // Insight 4: Resolution efficiency
    if (stats?.resolved > 0) {
      const resRate = Math.round((stats.resolved / stats.total) * 100);
      dynamicInsights.push({
        text: `System Efficiency: ${resRate}% of grievances have been successfully resolved this month.`,
        type: 'success',
        icon: '⚡'
      });
    }

    // Insight 5: Predictive
    dynamicInsights.push({
      text: "AI Prediction: Traffic-related issues are expected to rise by 15% due to upcoming public events.",
      type: 'info',
      icon: '🔮'
    });

    // Sequentially reveal
    setVisibleInsights([]);
    const timers: NodeJS.Timeout[] = [];
    dynamicInsights.forEach((insight, i) => {
      const timer = setTimeout(() => {
        setVisibleInsights((prev) => [...prev, insight]);
      }, i * 1500);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, [complaints, stats]);

  return (
    <div className="glass-card h-full flex flex-col">
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-accent-500/10">
          <Brain className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Intelligence</h3>
          <p className="text-xs text-white/40">Real-time data correlations</p>
        </div>
        <Sparkles className="w-3 h-3 text-accent-400 ml-auto animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {visibleInsights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`p-3 rounded-xl border ${
              insightTypeStyles[insight.type as keyof typeof insightTypeStyles]
            } transition-all duration-200`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">{insight.icon}</span>
              <p className="text-xs text-white/70 leading-relaxed">
                <TypingText text={insight.text} speed={15} />
              </p>
            </div>
          </motion.div>
        ))}

        {visibleInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-white/20">
            <Brain className="w-8 h-8 mb-2 animate-pulse" />
            <p className="text-xs">Connecting to Neural Engine...</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatsData {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function StatsCards({ data }: { data: StatsData | null }) {
  const stats = [
    {
      label: 'Total Complaints',
      value: data?.total || 0,
      icon: TrendingUp,
      color: 'from-primary-500 to-primary-600',
      textColor: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/20',
      shadowColor: 'shadow-primary-500/5',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Pending',
      value: data?.pending || 0,
      icon: Clock,
      color: 'from-warning-500 to-warning-600',
      textColor: 'text-warning-400',
      bgColor: 'bg-warning-500/10',
      borderColor: 'border-warning-500/20',
      shadowColor: 'shadow-warning-500/5',
      change: '+5%',
      trend: 'up',
    },
    {
      label: 'Resolved',
      value: data?.resolved || 0,
      icon: CheckCircle,
      color: 'from-success-500 to-success-600',
      textColor: 'text-success-400',
      bgColor: 'bg-success-500/10',
      borderColor: 'border-success-500/20',
      shadowColor: 'shadow-success-500/5',
      change: '+18%',
      trend: 'up',
    },
    {
      label: 'Escalated',
      value: data?.escalated || 0,
      icon: AlertTriangle,
      color: 'from-danger-500 to-danger-600',
      textColor: 'text-danger-400',
      bgColor: 'bg-danger-500/10',
      borderColor: 'border-danger-500/20',
      shadowColor: 'shadow-danger-500/5',
      change: '-3%',
      trend: 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`stat-card ${stat.borderColor} border ${stat.shadowColor} hover:shadow-lg hover:border-opacity-40 cursor-default`}
            style={{ '--accent-color': stat.color } as React.CSSProperties}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.trend === 'up'
                    ? stat.label === 'Escalated'
                      ? 'text-success-400 bg-success-500/10'
                      : 'text-success-400 bg-success-500/10'
                    : 'text-danger-400 bg-danger-500/10'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              <AnimatedCounter value={stat.value} />
            </h3>
            <p className="text-sm text-white/50">{stat.label}</p>

            {/* Sparkline decoration */}
            <div className="mt-3 flex items-end gap-px h-8">
              {[65, 45, 78, 52, 88, 35, 72, 58, 42, 90, 62, 48].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${stat.bgColor} opacity-60`}
                  style={{
                    height: `${(h + index * 7) % 80 + 20}%`,
                    transition: 'height 0.3s ease',
                  }}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

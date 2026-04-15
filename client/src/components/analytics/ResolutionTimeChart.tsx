'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

interface ResolutionData {
  averageResolutionHours: number;
  trend: { day: string; avgHours: number; complaints: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        <p className="text-sm text-primary-400">{payload[0]?.value}h avg resolution</p>
        {payload[1] && (
          <p className="text-sm text-accent-400">{payload[1]?.value} complaints</p>
        )}
      </div>
    );
  }
  return null;
};

export default function ResolutionTimeChart({ data }: { data: ResolutionData | null }) {
  const trend = data?.trend || [];

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Resolution Time Trend</h3>
          <p className="text-xs text-white/40">Average hours to resolve complaints</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">
            {data?.averageResolutionHours || 0}h
          </p>
          <p className="text-[10px] text-white/40">avg resolution</p>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avgHours"
              stroke="#06b6d4"
              fill="url(#colorHours)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#06b6d4' }}
            />
            <Area
              type="monotone"
              dataKey="complaints"
              stroke="#8b5cf6"
              fill="url(#colorComplaints)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface EscalationData {
  rate: number;
  byCategory: { category: string; count: number }[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white/50">{payload[0].name}</p>
        <p className="text-sm font-semibold text-white">{payload[0].value} escalated</p>
      </div>
    );
  }
  return null;
};

export default function EscalationChart({ data }: { data: EscalationData | null }) {
  const chartData = data?.byCategory || [];

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Escalation Rate</h3>
          <p className="text-xs text-white/40">By complaint category</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-danger-400">{data?.rate || 0}%</p>
          <p className="text-[10px] text-white/40">escalation rate</p>
        </div>
      </div>

      <div className="h-52 relative">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="category"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            No escalation data
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {chartData.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-white/60 truncate max-w-[140px]">{item.category}</span>
            </div>
            <span className="text-white/80 font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

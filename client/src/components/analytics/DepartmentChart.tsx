'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DEPARTMENT_COLORS } from '@/lib/constants';

interface DeptData {
  department: string;
  count: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">{payload[0].value} complaints</p>
      </div>
    );
  }
  return null;
};

export default function DepartmentChart({ data }: { data: DeptData[] }) {
  const shortNames = data?.map((d) => ({
    ...d,
    short: d.department.split(' ').slice(0, 2).join(' '),
  })) || [];

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-sm font-semibold text-white mb-1">Complaints by Department</h3>
      <p className="text-xs text-white/40 mb-4">Distribution across government departments</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shortNames} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="short"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {shortNames.map((entry, index) => (
                <Cell
                  key={index}
                  fill={DEPARTMENT_COLORS[entry.department] || '#3b82f6'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

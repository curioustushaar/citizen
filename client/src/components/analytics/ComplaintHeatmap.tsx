'use client';

import { motion } from 'framer-motion';

interface HeatmapRow {
  area: string;
  slots: { time: string; count: number }[];
}

const getIntensityColor = (count: number) => {
  if (count === 0) return 'bg-white/[0.02]';
  if (count <= 3) return 'bg-primary-500/20';
  if (count <= 6) return 'bg-primary-500/40';
  if (count <= 9) return 'bg-warning-500/40';
  if (count <= 12) return 'bg-danger-500/40';
  return 'bg-danger-500/70';
};

export default function ComplaintHeatmap({ data }: { data: HeatmapRow[] }) {
  const timeSlots = data?.[0]?.slots.map((s) => s.time) || [];

  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-sm font-semibold text-white mb-1">Complaint Heatmap</h3>
      <p className="text-xs text-white/40 mb-4">Area × Time of Day distribution</p>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Header */}
          <div className="flex mb-2">
            <div className="w-28 flex-shrink-0" />
            {timeSlots.map((time) => (
              <div key={time} className="flex-1 text-center text-[10px] text-white/40 font-mono">
                {time}
              </div>
            ))}
          </div>

          {/* Rows */}
          {(data || []).map((row, rowIndex) => (
            <motion.div
              key={row.area}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="flex items-center mb-1"
            >
              <div className="w-28 flex-shrink-0 text-[11px] text-white/50 truncate pr-2">
                {row.area}
              </div>
              {row.slots.map((slot, i) => (
                <div key={i} className="flex-1 px-0.5">
                  <div
                    className={`h-7 rounded-sm ${getIntensityColor(
                      slot.count
                    )} transition-all duration-200 hover:ring-1 hover:ring-white/20 cursor-default flex items-center justify-center`}
                    title={`${row.area} ${slot.time}: ${slot.count} complaints`}
                  >
                    {slot.count > 0 && (
                      <span className="text-[9px] text-white/60 font-mono">
                        {slot.count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 justify-end">
            <span className="text-[10px] text-white/30">Low</span>
            {[2, 5, 8, 11, 14].map((n) => (
              <div
                key={n}
                className={`w-4 h-4 rounded-sm ${getIntensityColor(n)}`}
              />
            ))}
            <span className="text-[10px] text-white/30">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

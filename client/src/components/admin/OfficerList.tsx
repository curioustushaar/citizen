'use client';

import { motion } from 'framer-motion';
import { User, AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface Officer {
  _id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  pendingCount: number;
  escalatedCount: number;
  resolvedCount: number;
  performance: number;
}

function PerformanceBar({ value }: { value: number }) {
  const color =
    value >= 85 ? 'from-success-500 to-success-400' :
    value >= 70 ? 'from-warning-500 to-warning-400' :
    'from-danger-500 to-danger-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
      <span className="text-xs font-mono text-white/60">{value}%</span>
    </div>
  );
}

export default function OfficerList({ officers }: { officers: Officer[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {(officers || []).map((officer, i) => (
        <motion.div
          key={officer._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card glass-card-hover p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{officer.name}</h4>
              <p className="text-xs text-white/40">{officer.designation}</p>
              <p className="text-[10px] text-primary-400 font-medium">{officer.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-warning-500/5 border border-warning-500/10">
              <Clock className="w-3.5 h-3.5 text-warning-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{officer.pendingCount}</p>
              <p className="text-[9px] text-white/40">Pending</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-danger-500/5 border border-danger-500/10">
              <AlertTriangle className="w-3.5 h-3.5 text-danger-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{officer.escalatedCount}</p>
              <p className="text-[9px] text-white/40">Escalated</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-success-500/5 border border-success-500/10">
              <CheckCircle className="w-3.5 h-3.5 text-success-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{officer.resolvedCount}</p>
              <p className="text-[9px] text-white/40">Resolved</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3 h-3 text-white/30" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">Performance</span>
            </div>
            <PerformanceBar value={officer.performance} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

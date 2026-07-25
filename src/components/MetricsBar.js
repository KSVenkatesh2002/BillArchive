'use client';

import MetricCard from './MetricCard';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function MetricsBar({ tasksLength, metrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <MetricCard
        title="Total Tasks"
        value={tasksLength}
        subtext={`${metrics.completedCount} Completed`}
      />
      <MetricCard
        title="Allocated Hours"
        value={`${metrics.totalAllocated.toFixed(1)} hrs`}
        subtext="Planned budget"
        colorClass="text-indigo-400"
      />
      <MetricCard
        title="Billed Hours"
        value={`${metrics.totalBilled.toFixed(1)} hrs`}
        subtext="Billable to client"
        colorClass="text-cyan-400"
      />
      <MetricCard
        title="Actual Hours"
        value={`${metrics.totalActual.toFixed(1)} hrs`}
        subtext="Logged work"
        colorClass="text-purple-400"
      />
      <div className="col-span-2 md:col-span-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all">
        <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Efficiency Variance</div>
        <div className="text-xl font-bold text-white mt-1">
          {metrics.variance.toFixed(1)} hrs
        </div>
        <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5">
          {metrics.variance >= 0 ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Under actual log</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Over actual log</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

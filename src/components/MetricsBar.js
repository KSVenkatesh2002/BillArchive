'use client';

import { useSelector } from 'react-redux';
import MetricCard from './MetricCard';
import { CheckCircle, Clock, PieChart, ClipboardList } from 'lucide-react';

export default function MetricsBar(props) {
  const storeMetrics = useSelector((state) => state.tasks.metrics);
  const storeTasksLength = useSelector((state) => state.tasks.tasks.length);

  const metrics = props.metrics || storeMetrics || {
    totalAllocated: 0,
    totalBilled: 0,
    totalActual: 0,
    completedCount: 0,
    variance: 0
  };
  const tasksLength = props.tasksLength ?? storeTasksLength;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 transition-opacity ${props.loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {/* Total Tasks */}
      <div className="bg-[#111115] p-5 rounded-xl border border-zinc-800/80 shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <ClipboardList className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Total Tasks</p>
          <p className="text-2xl font-bold text-white leading-tight">{tasksLength}</p>
          <p className="text-[10px] font-medium text-zinc-500 mt-0.5">This Week</p>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-[#111115] p-5 rounded-xl border border-zinc-800/80 shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Completed</p>
          <p className="text-2xl font-bold text-white leading-tight">{metrics.completedCount || 0}</p>
          <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
            {tasksLength > 0 ? Math.round(((metrics.completedCount || 0) / tasksLength) * 100) : 0}% of total
          </p>
        </div>
      </div>

      {/* Total Hours */}
      <div className="bg-[#111115] p-5 rounded-xl border border-zinc-800/80 shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Total Hours</p>
          <p className="text-2xl font-bold text-white leading-tight">{(metrics.totalAllocated || 0).toFixed(2)}h</p>
          <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Allocated</p>
        </div>
      </div>

      {/* Billable Hours */}
      <div className="bg-[#111115] p-5 rounded-xl border border-zinc-800/80 shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
          <PieChart className="w-6 h-6 text-purple-500" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Billable Hours</p>
          <p className="text-2xl font-bold text-white leading-tight">{(metrics.totalBilled || 0).toFixed(2)}h</p>
          <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
            {(metrics.totalAllocated || 0) > 0 ? Math.round(((metrics.totalBilled || 0) / metrics.totalAllocated) * 100) : 0}% of total
          </p>
        </div>
      </div>
    </div>
  );
}

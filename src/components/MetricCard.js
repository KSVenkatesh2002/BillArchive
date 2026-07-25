'use client';

export default function MetricCard({ title, value, subtext, colorClass }) {
  return (
    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 transition-all hover:border-zinc-700">
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-black mt-1 ${colorClass || 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 mt-1">{subtext}</div>
    </div>
  );
}

'use client';

import { useAdmin } from './layout';
import { Database, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { CONFIG } from '@/lib/config';

export default function SuperAdminPage() {
  const { adminData } = useAdmin();

  if (!adminData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Database Connection Diagnostic Card */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-orange-400" />
          <span>Database Health</span>
        </h3>
        
        <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-450 uppercase font-semibold">Active Adaptor</span>
            <span className="text-xs font-mono text-zinc-200">{adminData?.database}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-455 uppercase font-semibold">Failover State</span>
            {adminData?.database === 'in-memory-fallback' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Active Fallback</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 inline-flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Stable Postgres</span>
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-zinc-505 leading-relaxed">
          If connection fails, the DB router switches from Postgres to In-Memory storage dynamically to isolate connection failures.
        </p>
      </div>

      {/* Single Source of Truth CONFIG Previewer */}
      <div className="col-span-1 md:col-span-2 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-orange-400" />
          <span>Global Settings Preview</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-black rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Site Name</div>
            <div className="font-semibold text-white mt-0.5">{CONFIG.SITE_NAME}</div>
          </div>
          <div className="p-3 bg-black rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Subtitle</div>
            <div className="font-semibold text-white mt-0.5">{CONFIG.SUBTITLE}</div>
          </div>
          <div className="p-3 bg-black rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Auth Cookie Name</div>
            <div className="font-semibold text-white mt-0.5 font-mono">{CONFIG.JWT_COOKIE_NAME}</div>
          </div>
          <div className="p-3 bg-black rounded-xl border border-zinc-800">
            <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Database Defaults (System)</div>
            <div className="font-semibold text-zinc-400 mt-1 flex flex-wrap gap-1">
              {adminData?.statuses?.map(s => (
                <span key={s} className="text-[9px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-350">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

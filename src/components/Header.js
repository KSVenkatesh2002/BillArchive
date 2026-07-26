'use client';

import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import { FileText, Calendar, User, LogOut, Plus, Shield } from 'lucide-react';

export default function Header({
  currentUser,
  onCopy1Wk,
  onCopy1Mo,
  onLogout,
}) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 mb-6 border-b border-zinc-800/80 gap-4">
      <div>
        <div className="flex items-center gap-3">
          <Link href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}` : "/"} className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center font-balmain font-bold text-white text-lg shadow-lg shadow-orange-500/20">
            {CONFIG.SITE_INITIAL}
          </Link>
          <div>
            <h1 className="text-lg font-balmain font-medium text-white flex items-center gap-3">
              <Link href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}` : "/"} className="hover:text-orange-400 transition-colors">
                {CONFIG.SITE_NAME}
              </Link>
            </h1>
          </div>
        </div>
      </div>

      {/* Right Action Bar (Auth & Actions) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Copy Timeframe Reports */}
        <div className="flex items-center bg-[#0d0d0d] border border-zinc-800 rounded-xl p-1">
          <button
            onClick={onCopy1Wk}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-1.5"
            title="Copy text summary of past 1 week tasks"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy 1-Wk Report</span>
          </button>
          <div className="w-px h-4 bg-zinc-800"></div>
          <button
            onClick={onCopy1Mo}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-1.5"
            title="Copy text summary of past 1 month tasks"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy 1-Mo Report</span>
          </button>
        </div>

        {/* Create Task Button */}
        <Link
          href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}/task-create` : "/login"}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>

        {/* Auth Profile / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-3 hover:bg-[#0d0d0d] border border-zinc-800 rounded-xl px-1 py-1.5">
            <Link
              href={`/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}/profile`}
              className="text-xs text-zinc-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
              title="Edit Profile Details"
            >
              <User className="w-4 h-4 text-zinc-400" />
            </Link>
            {currentUser.role === 'superAdmin' && (
              <Link
                href="/superadmin"
                className="text-xs bg-orange-950/30 hover:bg-orange-900/40 text-orange-400 px-2.5 py-1 rounded-lg transition border border-orange-900/30 flex items-center gap-1"
                title="Super Admin Controls"
              >
                <Shield className="w-4 h-4 text-orange-400" />
                <span>Super Admin</span>
              </Link>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-[#0d0d0d] border border-zinc-800 hover:bg-zinc-900 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Login / Sign Up</span>
          </Link>
        )}
      </div>
    </header>
  );
}

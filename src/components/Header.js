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
          <Link href={currentUser ? `/${currentUser.username}` : "/"} className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-500/20">
            {CONFIG.SITE_INITIAL}
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Link href={currentUser ? `/${currentUser.username}` : "/"} className="hover:text-orange-400 transition-colors">
                {CONFIG.SITE_NAME}
              </Link>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {CONFIG.SUBTITLE}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {CONFIG.DESCRIPTION}
            </p>
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
          <div className="w-px h-4 bg-zinc-850"></div>
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
          href={currentUser ? `/${currentUser.username}/task-create` : "/login"}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>

        {/* Auth Profile / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-3 bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3.5 py-1.5">
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-200">{currentUser.name}</div>
              <div className="text-[10px] text-zinc-450">@{currentUser.username}</div>
            </div>
            <Link
              href="/profile"
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg transition border border-zinc-705 flex items-center gap-1.5"
              title="Edit Profile Details"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Profile</span>
            </Link>
            {currentUser.role === 'admin' && (
              <Link
                href="/admin"
                className="text-xs bg-orange-950/30 hover:bg-orange-900/40 text-orange-400 px-2.5 py-1 rounded-lg transition border border-orange-900/30 flex items-center gap-1"
                title="Super Admin Controls"
              >
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin</span>
              </Link>
            )}
            <button
              onClick={onLogout}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-rose-450 px-2.5 py-1 rounded-lg transition border border-zinc-705 flex items-center gap-1.5"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Logout</span>
            </button>
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

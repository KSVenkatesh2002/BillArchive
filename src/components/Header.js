'use client';

import Link from 'next/link';

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
          <Link href="/" className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20">
            T
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Link href="/" className="hover:text-indigo-400 transition-colors">
                TaskFlow & Billing Matrix
              </Link>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Pro Desktop Edition
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-User Task Management • Status Change Audit Logging • Timeframe & Project Text Exports
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
            <span>📋</span> Copy 1-Wk Report
          </button>
          <div className="w-px h-4 bg-zinc-850"></div>
          <button
            onClick={onCopy1Mo}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-1.5"
            title="Copy text summary of past 1 month tasks"
          >
            <span>📅</span> Copy 1-Mo Report
          </button>
        </div>

        {/* Create Task Button */}
        <Link
          href="/task-create"
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
        >
          <span>+</span> New Task
        </Link>

        {/* Auth Profile / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-3 bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3.5 py-1.5">
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-200">{currentUser.name}</div>
              <div className="text-[10px] text-zinc-450">@{currentUser.username}</div>
            </div>
            <button
              onClick={onLogout}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-rose-450 px-2.5 py-1 rounded-lg transition border border-zinc-705"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-[#0d0d0d] border border-zinc-800 hover:bg-zinc-900 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <span>👤</span> Login / Sign Up
          </Link>
        )}
      </div>
    </header>
  );
}

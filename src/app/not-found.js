'use client';

import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-650/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000" />

      {/* Cyberpunk grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center bg-[#070707]/60 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl shadow-black/80 flex flex-col items-center">
        {/* Pulsing floating compass icon */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-2xl border border-zinc-800 flex items-center justify-center mb-8 shadow-inner group">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <Compass className="w-10 h-10 text-indigo-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        {/* 404 Title */}
        <div className="relative">
          <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 select-none">
            404
          </h1>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-black text-indigo-300 tracking-wider">
            Lost in Space
          </span>
        </div>

        {/* Message */}
        <p className="text-zinc-200 font-bold text-lg mt-8 leading-snug">
          Page Not Found
        </p>
        <p className="text-zinc-500 text-xs mt-2.5 max-w-sm leading-relaxed">
          The dashboard segment you are looking for has either been moved, archived, or is drifting in offline space.
        </p>

        {/* Action Button */}
        <div className="mt-8 w-full">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs py-3.5 rounded-xl transition duration-300 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            {/* Hover light reflection effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

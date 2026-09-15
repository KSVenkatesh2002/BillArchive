import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';
import DocsSidebar from '@/components/DocsSidebar';
import HashScroller from '@/components/HashScroller';

export default function DocsLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <HashScroller />
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-base tracking-wide text-white">Bill Archive Documentation</span>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500 hidden sm:block">
          v1.0.0 Pro Edition
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto relative">
        {/* Persistent Sidebar */}
        <DocsSidebar />

        {/* Dynamic Markdown Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-full md:max-w-4xl min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

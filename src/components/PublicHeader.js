'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CONFIG } from '@/lib/config';

export default function PublicHeader() {
  return (
    <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-9 w-9 flex items-center justify-center transition-transform hover:scale-105">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
          </Link>
          <Link href="/" className="text-md font-balmain font-semibold tracking-wider text-white hover:text-orange-400 transition">
            {CONFIG.SITE_NAME}
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-zinc-450 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition">
            Sign In
          </Link>
          <Link href="/register" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl transition">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

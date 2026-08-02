'use client';

import Link from 'next/link';
import { CONFIG } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-balmain font-semibold tracking-wider text-white hover:text-orange-400 transition inline-block mb-4">
              {CONFIG.SITE_NAME}
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm">
              {CONFIG.DESCRIPTION}
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-zinc-400 hover:text-orange-400 transition">About</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-400 hover:text-orange-400 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-orange-400 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} {CONFIG.SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

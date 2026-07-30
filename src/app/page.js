'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/apiClient';
import { ArrowRight, CheckCircle2, Clock, Shield, Sparkles, Zap, Layers, Cpu } from 'lucide-react';

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const data = await apiClient.checkAuth();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center font-balmain font-bold text-white text-md shadow-lg shadow-orange-500/20">
              {CONFIG.SITE_INITIAL}
            </div>
            <span className="text-md font-balmain font-semibold tracking-wider text-white">{CONFIG.SITE_NAME}</span>
          </div>

          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 bg-zinc-900 animate-pulse rounded-lg" />
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Logged in as <strong className="text-zinc-200">{currentUser.name}</strong></span>
                <Link
                  href={currentUser.role === 'superAdmin' || currentUser.email.toLowerCase() === 'admin' ? '/superadmin' : `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}`}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-600/25 flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-zinc-450 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20 relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/30 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Task Scoping & Hour Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-balmain font-light text-white leading-normal">
            Scale and Scope Your Billing <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent font-medium">Effortlessly</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Manage your daily workflow, link tasks directly to your ClickUp workspaces, record exact hour allocations, and build client billing summaries with premium developer speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {currentUser ? (
              <Link
                href={currentUser.role === 'superAdmin' || currentUser.email.toLowerCase() === 'admin' ? '/superadmin' : `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}`}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-orange-600/30 transition flex items-center gap-2"
              >
                <span>Access Personal Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-orange-600/30 transition flex items-center gap-2"
                >
                  <span>Start Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
                >
                  Demo Live Sandbox
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Image Mockup Display */}
        <div className="relative group max-w-5xl mx-auto rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_0_50px_rgba(234,88,12,0.15)] bg-zinc-950">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <img
            src="/dashboard_mockup.png"
            alt="SaaS BillArchive Task Dashboard View"
            className="w-full h-auto object-cover opacity-90 transition duration-700 group-hover:scale-[1.01] group-hover:opacity-100"
          />
        </div>

        {/* Features Matrix Grid */}
        <div className="pt-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xl sm:text-2xl font-balmain font-medium text-white">Structured for Professional Output</h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">Everything you need to analyze, trace, and archive active development contracts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="w-10 h-10 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-500 group-hover:text-black transition">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Namespace Scoping</h3>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Clean and intuitive URL structures nested directly under your username namespace. Scope projects dynamically with automatic auth validation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="w-10 h-10 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-500 group-hover:text-black transition">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">ClickUp Synchronization</h3>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Paste ClickUp URLs to automatically parse task IDs, synchronize status parameters, and audit task histories with inline quick triggers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="w-10 h-10 bg-orange-950/40 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-500 group-hover:text-black transition">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Billing Metrics Reporting</h3>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Compare allocated, billed, and actual hours to view variance trends. Copy detailed text-based summaries to clipboard instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="bg-gradient-to-r from-orange-950/20 via-zinc-950 to-orange-950/10 border border-zinc-900 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-600/5 blur-3xl pointer-events-none" />
          <h2 className="text-xl sm:text-3xl font-balmain font-medium text-white">Ready to optimize your time audits?</h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Join the developer dashboard designed to minimize administrative steps. Keep all hours registered under a clean, secure timeline.
          </p>
          <div className="pt-2">
            <Link
              href={currentUser ? (currentUser.role === 'superAdmin' || currentUser.email.toLowerCase() === 'admin' ? '/superadmin' : `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}`) : "/register"}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/20"
            >
              <span>{currentUser ? 'Go to Dashboard' : 'Get Started Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-8 text-center text-xs text-zinc-550">
        <p>&copy; {new Date().getFullYear()} {CONFIG.SITE_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}

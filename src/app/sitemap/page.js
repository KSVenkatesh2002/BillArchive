'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import { Globe, User, Shield, Compass, ArrowRight, Layout, PlusCircle, Folder, Settings2 } from 'lucide-react';

export default function VisualSitemap() {
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

  const username = currentUser?.username || 'admin';

  return (
    <div className="min-h-screen bg-black text-zinc-150 font-sans selection:bg-orange-500 selection:text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser ? `/${username}` : "/"}
              className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-850 flex items-center justify-center transition-colors font-black text-white text-lg"
              title="Return to main dashboard"
            >
              {CONFIG.SITE_INITIAL}
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">System Navigation Map</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/25 uppercase">
                  Sitemap UI
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Explore public entrypoints, user-scoped dashboards, and administrative panels
              </p>
            </div>
          </div>
          <Link
            href={currentUser ? `/${username}` : "/"}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-4 py-2 rounded-xl transition"
          >
            ← Return Home
          </Link>
        </div>

        {/* Status Notification */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>Session Status: {loading ? 'Loading...' : currentUser ? 'Authenticated' : 'Anonymous / Guest'}</span>
            </div>
            <p className="text-[11px] text-zinc-450">
              {currentUser
                ? `Active dynamic paths will link directly to @${currentUser.username}'s personalized views.`
                : 'Log in to unlock and interact with personalized dynamic routes.'
              }
            </p>
          </div>
          {!currentUser && !loading && (
            <Link
              href="/login"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-orange-600/20 text-center shrink-0"
            >
              Sign In to Account
            </Link>
          )}
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Public Core Pages */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-450" />
              <span>Public Core pages</span>
            </h2>

            <div className="space-y-3">
              {/* Landing Page */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-800 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">SaaS Landing Page</span>
                  <Link href="/" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Visit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  The primary application marketing landing page. Features interactive UI dashboard preview and highlights.
                </p>
                <div className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /
                </div>
              </div>

              {/* Login */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Sign In Gateway</span>
                  <Link href="/login" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Authenticate your credentials (e.g. admin/admin) to gain session access cookies.
                </p>
                <div className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /login
                </div>
              </div>

              {/* Register */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Account Registration</span>
                  <Link href="/register" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Create a new multi-tenant workspace identity with full username routing setups.
                </p>
                <div className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /register
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: User Scoped Pages */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>User Scoped workspace</span>
            </h2>

            <div className="space-y-3">
              {/* Dynamic User Dashboard */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Personal Dashboard</span>
                  </span>
                  <Link href={`/${username}`} className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Visit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Your primary workspace display tasks table, metrics breakdown, and interactive reports copy.
                </p>
                <div className="text-[10px] font-mono text-zinc-650 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /{username}
                </div>
              </div>

              {/* Dynamic Task Create */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-zinc-450" />
                    <span>New Task Form</span>
                  </span>
                  <Link href={`/${username}/task-create`} className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Quickly initialize new tasks, input allocations, and auto-parse ClickUp ticket paths.
                </p>
                <div className="text-[10px] font-mono text-zinc-650 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /{username}/task-create
                </div>
              </div>

              {/* Dynamic Project Scopes */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Project Scopes</span>
                  </span>
                  <Link href={`/${username}/project/BillArchive`} className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Demo</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Clean isolation filters to view tasks scoped only to a specific project name query.
                </p>
                <div className="text-[10px] font-mono text-zinc-650 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /{username}/project/[name]
                </div>
              </div>

              {/* Profile Page */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Profile Details</span>
                  <Link href="/profile" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Visit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Manage personal parameters (name, bio, email, clickup API keys) or soft-delete accounts.
                </p>
                <div className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /profile
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Administrative Control */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Administrative Console</span>
            </h2>

            <div className="space-y-3">
              {/* Admin Panel */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-zinc-450" />
                    <span>Diagnostics & Ledger</span>
                  </span>
                  <Link href="/admin" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Restricted to system operators. Grants direct visibility of user logs, invoice ledger lists, and Atlas connection adaptors.
                </p>
                <div className="text-[10px] font-mono text-zinc-650 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /admin
                </div>
              </div>

              {/* Sitemap.xml */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2 hover:border-zinc-850 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Dynamic XML Sitemap</span>
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5">
                    <span>Open XML</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Next.js automated XML feed generator for search engine crawlers and indexing services.
                </p>
                <div className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-1 rounded border border-zinc-900 w-fit">
                  /sitemap.xml
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

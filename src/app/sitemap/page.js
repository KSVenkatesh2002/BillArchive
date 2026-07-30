'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import { Globe, User, Shield, ArrowRight, Layout, PlusCircle, Folder, Settings2, FileCode, CheckCircle2 } from 'lucide-react';

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

  const orgId = currentUser?.orgId || 'dialedin';
  const userId = currentUser?.userId || currentUser?.id || 'admin';
  const dashboardPath = `/${orgId}/${userId}`;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-orange-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-zinc-800/80 gap-6">
          <div className="flex items-center gap-4">
            <Link
              href={currentUser ? dashboardPath : "/"}
              className="h-12 w-12 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-2xl flex items-center justify-center transition shadow-lg shadow-orange-500/20 font-black text-white text-xl shrink-0"
              title="Return to main dashboard"
            >
              {CONFIG.SITE_INITIAL}
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black text-white tracking-tight">System Navigation Sitemap</h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 uppercase tracking-wide">
                  Live Routes
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Explore public portals, dynamic multi-tenant user workspaces, and administrative settings
              </p>
            </div>
          </div>
          <Link
            href={currentUser ? dashboardPath : "/"}
            className="text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 px-5 py-2.5 rounded-xl transition duration-200 flex items-center gap-2 shadow-md shrink-0 self-start sm:self-auto"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* User Session Banner */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentUser ? 'bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>Authentication Status: {loading ? 'Checking session...' : currentUser ? `Signed in as @${currentUser.email || currentUser.name}` : 'Guest / Anonymous'}</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {currentUser
                ? `Personalized dynamic paths will redirect straight to your active workspace [${orgId}/${userId}].`
                : 'Sign in to access personalized multi-tenant organization workspaces.'
              }
            </p>
          </div>
          {!currentUser && !loading && (
            <Link
              href="/login"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/25 text-center shrink-0"
            >
              Sign In to Account
            </Link>
          )}
        </div>

        {/* Structured Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section 1: Public Core Gateway */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/70">
              <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200">Public Gateways</h2>
                <p className="text-[10px] text-zinc-500">Unrestricted application entrypoints</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Landing Page */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-orange-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-orange-400 transition">SaaS Landing Page</span>
                  <Link href="/" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Visit</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Marketing landing page featuring live metric previews, features breakdown, and CTAs.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /
                </div>
              </div>

              {/* Login */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-orange-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-orange-400 transition">Sign In Gateway</span>
                  <Link href="/login" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Authenticate your user credentials to establish session access cookies.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /login
                </div>
              </div>

              {/* Register */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-orange-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-orange-400 transition">Account Registration</span>
                  <Link href="/register" className="text-orange-400 hover:text-orange-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Create a new multi-tenant organization account with automated workspace routing.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /register
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: User Scoped Multi-Tenant Workspace */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/70">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200">User Workspaces</h2>
                <p className="text-[10px] text-zinc-500">Dynamic tenant & profile pages</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dynamic User Dashboard */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-amber-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-amber-400 transition">
                    <Layout className="w-3.5 h-3.5 text-amber-400" />
                    <span>Personal Dashboard</span>
                  </span>
                  <Link href={dashboardPath} className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Visit</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Main tasks dashboard featuring table views, card grids, metric cards, and task filters.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /[orgId]/[userId]
                </div>
              </div>

              {/* Dynamic Task Create */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-amber-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-amber-400 transition">
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Task Creation Modal</span>
                  </span>
                  <Link href={`${dashboardPath}/task-create`} className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Intercepted parallel modal and standalone task creation form with customizable dynamic fields.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /[orgId]/[userId]/task-create
                </div>
              </div>

              {/* Dynamic Project Scopes */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-amber-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-amber-400 transition">
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>Project Scopes</span>
                  </span>
                  <Link href={`${dashboardPath}/project/BillArchive`} className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Demo</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dedicated view displaying tasks filtered strictly by project name.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /[orgId]/[userId]/project/[name]
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Admin Controls & Feed XML */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/70">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-200">Admin & Indexing</h2>
                <p className="text-[10px] text-zinc-500">System admin & crawler feeds</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Super Admin Console */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-emerald-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition">
                    <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Super Admin Console</span>
                  </span>
                  <Link href="/superadmin" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Multi-organization management console for system administrators.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /superadmin
                </div>
              </div>

              {/* Dynamic XML Sitemap */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-emerald-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>XML Sitemap Feed</span>
                  </span>
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Open XML</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Automated XML feed for search engine crawlers and indexing tools.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /sitemap.xml
                </div>
              </div>

              {/* Profile Config */}
              <div className="bg-zinc-950/70 border border-zinc-850 hover:border-emerald-500/40 rounded-2xl p-4.5 space-y-2.5 transition duration-300 group shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Organization Settings</span>
                  </span>
                  <Link href={`${dashboardPath}/profile`} className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                    <span>Configure</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Configure organization custom metadata fields and toggle built-in field checkboxes.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-md border border-zinc-800 w-fit">
                  /[orgId]/[userId]/profile
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

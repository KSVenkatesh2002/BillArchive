'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { CONFIG } from '@/lib/config';
import { FileText, Calendar, User, Plus, Shield } from 'lucide-react';

export default function Header(props) {
  const params = useParams();
  const storeCurrentUser = useSelector((state) => state.auth.currentUser);
  const currentUser = props.currentUser !== undefined ? props.currentUser : storeCurrentUser;

  const activeOrgId = params?.orgId || currentUser?.orgId;
  const activeUserId = params?.userId || currentUser?.userId || currentUser?.id;

  const newTaskUrl = activeUserId ? `/${activeOrgId}/${activeUserId}/task-create` : '/login';
  const profileUrl = activeUserId ? `/${activeOrgId}/${activeUserId}/profile` : '/login';
  const homeUrl = activeUserId ? `/${activeOrgId}/${activeUserId}` : '/';

  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-3 mb-4 border-b border-zinc-800/80 gap-3">
      <div>
        <div className="flex items-center gap-3">
          <Link href={homeUrl} className="h-10 w-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
          </Link>
          <div>
            <h1 className="text-lg font-balmain font-medium text-white flex items-center gap-3">
              <Link href={homeUrl} className="hover:text-orange-400 transition-colors">
                {CONFIG.SITE_NAME}
              </Link>
            </h1>
          </div>
        </div>
      </div>

      {/* Right Action Bar (Auth & Actions) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Generate Report */}
        <div className="flex items-center bg-[#0d0d0d] border border-zinc-800 rounded-xl p-1">
          <Link
            href={`/${activeOrgId}/${activeUserId}/reports`}
            className="text-xs font-semibold px-4 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-2"
            title="Generate and copy timesheet reports"
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Report</span>
          </Link>
        </div>

        {/* Create Task Button */}
        <Link
          href={newTaskUrl}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>

        {/* Auth Profile / Login Button */}
        {activeUserId ? (
          <div className="flex items-center gap-3 hover:bg-[#0d0d0d] border border-zinc-800 rounded-xl px-1 py-1.5">
            <Link
              href={profileUrl}
              className="text-xs text-zinc-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5"
              title="Edit Profile Details"
            >
              <User className="w-4 h-4 text-zinc-400" />
            </Link>
            {currentUser?.role === 'superAdmin' && (
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

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut, 
  FileText
} from 'lucide-react';
import { logout } from '@/lib/store/authSlice';
import { CONFIG } from '@/lib/config';
import FilterControls from './FilterControls';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const orgSlug = currentUser?.orgId || 'Org';
  const basePath = currentUser ? `/${currentUser.orgId}/${currentUser.userId || currentUser.id}` : '#';

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', href: basePath, icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Projects', href: `${basePath}/projects`, icon: <FolderKanban className="w-5 h-5" /> },
    { label: 'Reports', href: `${basePath}/reports`, icon: <FileText className="w-5 h-5" /> },
    { label: 'Settings', href: `${basePath}/profile`, icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/80 h-screen flex flex-col fixed left-0 top-0 hidden md:flex">
      {/* Brand & Org */}
      <div className="p-6 pb-4 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-600/20">
          B
        </div>
        <div>
          <h1 className="text-white font-black text-sm tracking-wide">{CONFIG.SITE_NAME}</h1>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{orgSlug}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium text-sm ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-500' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Global Filters */}
        {pathname === basePath && (
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-3">Filters</h3>
            <div className="px-1">
              <FilterControls isSidebar={true} />
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <img 
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
            alt="User" 
            className="w-9 h-9 rounded-full object-cover border border-zinc-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

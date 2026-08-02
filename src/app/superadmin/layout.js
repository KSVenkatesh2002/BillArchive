"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { CONFIG } from "@/lib/config";
import {
  ShieldAlert,
  Users,
  DollarSign,
  Clock,
  Settings,
  ArrowLeft,
  Activity,
  RefreshCw,
  FolderOpen,
  LogOut,
} from "lucide-react";

export const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export default function SuperAdminLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const fetchAdminData = async () => {
    console.log('try1')
    setLoadingData(true);
    try {
      console.log('try2')
      const data = await apiClient.getAdminData();
      console.log('try3')
      if (data.success) {
        setAdminData(data);
      } else {
        setError(data.error || "Failed to fetch administrator data.");
      }
    } catch (err) {
      setError("An error occurred while fetching system data.");
      console.log({err});
    } finally {
      setLoadingData(false);
      console.log("final")
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const auth = await apiClient.checkAuth();
        const isSuperAdmin = auth.user?.role === "superAdmin" && auth.user?.email?.toLowerCase() === "admin@dialedin.com";
          console.log({auth})
        if (auth.authenticated && isSuperAdmin) {
          setCurrentUser(auth.user);
          fetchAdminData();
        } else {
          setError(
            "Access Denied: You must be logged in as a super administrator.",
          );
          setLoadingData(false)
        }
      } catch (err) {
        setError("Authentication check failed.");
      } finally {
        setLoadingAuth(false);
      }
    }
    init();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loadingAuth || loadingData) {
    console.log({ loadingAuth, loadingData });
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-6 drop-shadow-xl" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Access Restricted
        </h1>
        <p className="text-zinc-400 text-sm">{error}</p>
        <Link
          href="/"
          className="mt-8 text-orange-500 hover:text-orange-400 font-bold text-sm underline underline-offset-4"
        >
          Return to Application
        </Link>
      </div>
    );
  }

  const stats = adminData?.stats || {
    usersCount: 0,
    tasksCount: 0,
    billsCount: 0,
    totalAllocatedHours: 0,
    totalGrossPaidAmount: 0,
  };

  return (
    <AdminContext.Provider value={{ adminData, currentUser, fetchAdminData }}>
      <div className="min-h-screen bg-[#020202] text-white selection:bg-orange-500/30 font-sans selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-xl border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                  {CONFIG.SITE_NAME} Admin
                  <span className="text-[9px] uppercase tracking-widest bg-orange-950 text-orange-400 px-2 py-0.5 rounded border border-orange-900/50 font-bold">
                    Super Admin Panel
                  </span>
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 font-semibold">
                  Centralized database management, audit analytics, and mock
                  seeding control
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchAdminData}
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Data</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-rose-450 hover:text-rose-350 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 px-4 py-2.5 rounded-xl transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Top Analytics Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  User Directory
                </p>
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-white">
                  {stats.usersCount}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Total registered users
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Work Task Archive
                </p>
                <FolderOpen className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-white">
                  {stats.tasksCount}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Total tasks in system
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Hours Tracked
                </p>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-white flex items-baseline gap-1">
                  {stats.totalActualHours.toFixed(2)}{" "}
                  <span className="text-sm font-medium text-zinc-600">hrs</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Variance: {stats.totalAllocatedHours - stats.totalActualHours}{" "}
                  hrs
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Gross Paid Invoices
                </p>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-emerald-500">
                  $
                  {stats.totalGrossPaidAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Sum of Paid invoices
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-px">
              <Link
                href="/superadmin"
                className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  pathname === "/superadmin"
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-450 hover:text-zinc-200"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Diagnostics & Config</span>
              </Link>
              <Link
                href="/superadmin/users"
                className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  pathname === "/superadmin/users"
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-450 hover:text-zinc-200"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Directory ({stats.usersCount})</span>
              </Link>
              <Link
                href="/superadmin/bills"
                className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  pathname === "/superadmin/bills"
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-450 hover:text-zinc-200"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Bills Ledger ({stats.billsCount})</span>
              </Link>
              <Link
                href="/superadmin/statuses"
                className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  pathname === "/superadmin/statuses"
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-450 hover:text-zinc-200"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Manage Statuses</span>
              </Link>
            </div>

            {/* Child Content */}
            <div className="animate-fadeIn">{children}</div>
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}

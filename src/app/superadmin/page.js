'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import {
  ShieldAlert,
  Database,
  Users,
  DollarSign,
  Clock,
  Settings,
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  FolderOpen,
  LogOut
} from 'lucide-react';

export default function SuperAdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('system'); // 'system', 'users', 'bills', 'statuses'
  const [error, setError] = useState('');

  // Status management state
  const [statuses, setStatuses] = useState([]);
  const [newStatusName, setNewStatusName] = useState('');
  const [savingStatuses, setSavingStatuses] = useState(false);
  const [statusesSuccess, setStatusesSuccess] = useState('');
  const [statusesError, setStatusesError] = useState('');

  // Bill Form State
  const [billForm, setBillForm] = useState({
    title: '',
    clientName: '',
    amount: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });
  const [submittingBill, setSubmittingBill] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const router = useRouter();

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const data = await apiClient.getAdminData();
      if (data.success) {
        setAdminData(data);
        setStatuses(data.statuses || []);
      } else {
        setError(data.error || 'Failed to fetch administrator data.');
      }
    } catch (err) {
      setError('An error occurred while fetching system data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const auth = await apiClient.checkAuth();
        const isSuperAdmin = auth.user?.role === 'superAdmin' || auth.user?.email?.toLowerCase() === 'admin@dialed.in';
        if (auth.authenticated && isSuperAdmin) {
          setCurrentUser(auth.user);
          fetchAdminData();
        } else {
          setError('Access Denied: You must be logged in as a super administrator.');
        }
      } catch (err) {
        setError('Authentication check failed.');
      } finally {
        setLoadingAuth(false);
      }
    }
    init();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const moveStatus = (index, direction) => {
    const updated = [...statuses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setStatuses(updated);
    }
  };

  const removeStatus = (statusName) => {
    setStatuses(statuses.filter(s => s !== statusName));
  };

  const addStatus = () => {
    const name = newStatusName.trim().toLowerCase();
    if (!name) return;
    if (statuses.includes(name)) {
      setStatusesError('Status option already exists.');
      return;
    }
    setStatusesError('');
    setStatuses([...statuses, name]);
    setNewStatusName('');
  };

  const saveStatuses = async () => {
    setSavingStatuses(true);
    setStatusesSuccess('');
    setStatusesError('');
    try {
      const res = await apiClient.updateStatuses(statuses);
      if (res.success) {
        setStatusesSuccess('Task status configuration saved successfully!');
        setStatuses(res.statuses || []);
      } else {
        setStatusesError(res.error || 'Failed to save status configuration.');
      }
    } catch (err) {
      setStatusesError('An error occurred while saving statuses.');
    } finally {
      setSavingStatuses(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!billForm.title || !billForm.clientName || !billForm.amount) return;
    setSubmittingBill(true);
    setFormSuccess('');

    try {
      const res = await apiClient.createBill(billForm);
      if (res.success) {
        setFormSuccess('Bill logged successfully!');
        setBillForm({
          title: '',
          clientName: '',
          amount: '',
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        });
        fetchAdminData();
      } else {
        alert(res.error || 'Failed to create bill.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the bill.');
    } finally {
      setSubmittingBill(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-semibold">Verifying Admin authorization...</p>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-450" />
          </div>
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {error || 'You do not have permission to view this page. Super administrator access is required.'}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}` : "/"}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3 rounded-xl transition border border-zinc-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Dashboard</span>
            </Link>
            <Link
              href="/login"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/20"
            >
              <span>Login as Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = adminData?.stats || {
    usersCount: 0,
    tasksCount: 0,
    billsCount: 0,
    totalAllocatedHours: 0,
    totalBilledHours: 0,
    totalActualHours: 0,
    totalGrossPaidAmount: 0
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800/80 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}` : "/"}
              className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center justify-center transition-colors"
              title="Return to main dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{CONFIG.SITE_NAME} Admin</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/25 uppercase">
                  Super Admin Panel
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Centralized database management, audit analytics, and mock seeding control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={fetchAdminData}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-350 px-3.5 py-2 rounded-xl transition border border-zinc-800 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Sync Data</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 px-3.5 py-2 rounded-xl transition border border-rose-900/30 flex items-center gap-2"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Top Analytics Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-550">
              <span className="text-[10px] font-bold uppercase tracking-wider">User Directory</span>
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{stats.usersCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Total registered users</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Work Task Archive</span>
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{stats.tasksCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Total tasks in system</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Hours Tracked</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {stats.totalActualHours.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">hrs</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Variance: {(stats.totalBilledHours - stats.totalActualHours).toFixed(1)} hrs
            </p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Paid Invoices</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1.5">
              ${stats.totalGrossPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Sum of Paid invoices</p>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-zinc-800 gap-2">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === 'system'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Diagnostics & Config</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === 'users'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory ({stats.usersCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === 'bills'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Bills Ledger ({stats.billsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('statuses')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
              activeTab === 'statuses'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Manage Statuses</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {loadingData ? (
          <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl py-20 text-center text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin text-zinc-650 mx-auto mb-3" />
            <p className="text-xs">Synchronizing admin payload...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* System Diagnostics Tab */}
            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Database Connection Diagnostic Card */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4.5 h-4.5 text-orange-400" />
                    <span>Database Health</span>
                  </h3>
                  
                  <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-450 uppercase font-semibold">Active Adaptor</span>
                      <span className="text-xs font-mono text-zinc-200">{adminData?.database}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-455 uppercase font-semibold">Failover State</span>
                      {adminData?.database === 'in-memory-fallback' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Active Fallback</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Stable Atlas</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-505 leading-relaxed">
                    If connection fails, the DB router switches from MongoDB to In-Memory storage dynamically to isolate SSL/TLS handshake connection failures.
                  </p>
                </div>

                {/* Single Source of Truth CONFIG Previewer */}
                <div className="col-span-1 md:col-span-2 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="w-4.5 h-4.5 text-orange-400" />
                    <span>Single Source of Truth CONFIG Preview</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-black rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">CONFIG.SITE_NAME</div>
                      <div className="font-semibold text-white mt-0.5">{CONFIG.SITE_NAME}</div>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">CONFIG.SUBTITLE</div>
                      <div className="font-semibold text-white mt-0.5">{CONFIG.SUBTITLE}</div>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">CONFIG.JWT_COOKIE_NAME</div>
                      <div className="font-semibold text-white mt-0.5 font-mono">{CONFIG.JWT_COOKIE_NAME}</div>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">CONFIG.VALID_STATUSES</div>
                      <div className="font-semibold text-zinc-400 mt-1 flex flex-wrap gap-1">
                        {CONFIG.VALID_STATUSES.map(s => (
                          <span key={s} className="text-[9px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-350">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Users Directory Tab */}
            {activeTab === 'users' && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">System Role</th>
                        <th className="py-3 px-4 text-right">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
                      {adminData?.users?.map((u) => (
                        <tr key={u._id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-zinc-500 text-[10px]">{u._id}</td>
                          <td className="py-3.5 px-4 font-bold text-zinc-100">{u.name}</td>
                          <td className="py-3.5 px-4 font-mono text-orange-400">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.role === 'admin' 
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-right">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bills Ledger Tab */}
            {activeTab === 'bills' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ledger Listing */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
                    <h3 className="text-sm font-bold text-white">Client Bill Invoices Ledger</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900/40 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Invoice Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
                        {adminData?.bills?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-10 text-center text-zinc-550 font-medium">
                              No client billing matrices records found.
                            </td>
                          </tr>
                        ) : (
                          adminData?.bills?.map((b) => (
                            <tr key={b._id} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-zinc-100">{b.title}</td>
                              <td className="py-3.5 px-4 font-medium text-zinc-300">{b.clientName}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-white">
                                ${b.amount.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  b.status === 'Paid'
                                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                    : b.status === 'Overdue'
                                    ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-zinc-400 text-right font-mono">{b.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form to log client bill */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4 h-fit">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4.5 h-4.5 text-orange-400" />
                      <span>Log New Invoice Bill</span>
                    </h3>
                    <p className="text-[10px] text-zinc-450 mt-0.5">Insert bill record into the active database</p>
                  </div>

                  {formSuccess && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
                      {formSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateBill} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Invoice Item / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Cloud Infrastructure"
                        value={billForm.title}
                        onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Client Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Initech Corp"
                        value={billForm.clientName}
                        onChange={(e) => setBillForm({ ...billForm, clientName: e.target.value })}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Amount ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={billForm.amount}
                          onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Status</label>
                        <select
                          value={billForm.status}
                          onChange={(e) => setBillForm({ ...billForm, status: e.target.value })}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="Pending" className="bg-black">Pending</option>
                          <option value="Paid" className="bg-black">Paid</option>
                          <option value="Overdue" className="bg-black">Overdue</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Billing Date</label>
                      <input
                        type="date"
                        value={billForm.date}
                        onChange={(e) => setBillForm({ ...billForm, date: e.target.value })}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingBill}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-1.5 disabled:opacity-55"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{submittingBill ? 'Logging Bill...' : 'Create Invoice'}</span>
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* Manage Statuses Tab */}
            {activeTab === 'statuses' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-white">System Task Statuses Config</h3>
                    <p className="text-[11px] text-zinc-450 mt-1 leading-relaxed">
                      Reorder, add, or delete the status options for the dashboard tasks. These updates will reflect across all user accounts in real time.
                    </p>
                  </div>

                  {statusesError && (
                    <div className="p-3 bg-red-955/20 border border-red-900/30 rounded-xl text-red-300 text-xs">
                      {statusesError}
                    </div>
                  )}

                  {statusesSuccess && (
                    <div className="p-3 bg-emerald-955/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
                      {statusesSuccess}
                    </div>
                  )}

                  <div className="space-y-2">
                    {statuses.length === 0 ? (
                      <div className="text-center py-6 text-zinc-500 text-xs">No status configurations found.</div>
                    ) : (
                      statuses.map((status, index) => (
                        <div
                          key={status}
                          className="flex items-center justify-between p-3.5 bg-black border border-zinc-800 hover:border-zinc-700 rounded-xl transition group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-zinc-500 font-mono w-5">{(index + 1).toString().padStart(2, '0')}</span>
                            <span className="text-xs font-bold text-zinc-150 uppercase tracking-wide bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                              {status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveStatus(index, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 disabled:opacity-30 disabled:hover:bg-zinc-900 transition flex items-center justify-center font-bold text-xs"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveStatus(index, 'down')}
                              disabled={index === statuses.length - 1}
                              className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 disabled:opacity-30 disabled:hover:bg-zinc-900 transition flex items-center justify-center font-bold text-xs"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <div className="w-px h-5 bg-zinc-800 mx-1"></div>
                            <button
                              onClick={() => removeStatus(status)}
                              className="h-8 w-8 rounded-lg bg-rose-955/20 hover:bg-rose-900/30 border border-rose-900/30 text-rose-455 hover:text-rose-350 transition flex items-center justify-center text-[10px] font-bold"
                              title="Delete Status"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveStatuses}
                      disabled={savingStatuses}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>{savingStatuses ? 'Saving...' : 'Save Status Changes'}</span>
                    </button>
                    <button
                      onClick={() => setStatuses([...CONFIG.VALID_STATUSES])}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>

                {/* Add Status Form */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4 h-fit shadow-2xl">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4.5 h-4.5 text-orange-450" />
                      <span>Add New Status Option</span>
                    </h3>
                    <p className="text-[10px] text-zinc-450 mt-0.5">Append a new task status choice</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addStatus();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Status Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ready for Deployment"
                        value={newStatusName}
                        onChange={(e) => setNewStatusName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3 rounded-xl border border-zinc-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to List</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

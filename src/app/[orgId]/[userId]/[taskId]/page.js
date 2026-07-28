'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  ExternalLink, 
  Folder, 
  CheckCircle, 
  Edit3, 
  FileText,
  User,
  History
} from 'lucide-react';
import Header from '@/components/Header';
import Toast from '@/components/Toast';

export default function TaskDetailPage() {
  const { orgId, userId, taskId } = useParams();
  const router = useRouter();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Log Hours Form State
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    note: ''
  });
  const [submittingEntry, setSubmittingEntry] = useState(false);

  // Status Change State
  const [statuses, setStatuses] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchStatuses();
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.success) {
        setTask(data.task);
      } else {
        setError(data.error || 'Failed to load task details');
      }
    } catch (err) {
      setError('An error occurred while loading the task.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/admin/statuses');
      const data = await res.json();
      if (data.success) {
        setStatuses(data.statuses || []);
      }
    } catch (err) {
      console.error('Failed to fetch statuses', err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTask(data.task);
        triggerToast(`Status updated to "${newStatus.toUpperCase()}"`);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    setSubmittingEntry(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addTimeEntry',
          entry: entryForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setTask(data.task);
        setEntryForm({
          date: new Date().toISOString().split('T')[0],
          allocatedHours: '',
          billedHours: '',
          actualHours: '',
          note: ''
        });
        triggerToast('Time entry logged successfully!');
      } else {
        alert(data.error || 'Failed to log hours');
      }
    } catch (err) {
      alert('Error logging time entry');
    } finally {
      setSubmittingEntry(false);
    }
  };

  const handleDeleteTimeEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteTimeEntry',
          entryId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTask(data.task);
        triggerToast('Time entry removed.');
      } else {
        alert(data.error || 'Failed to delete time entry');
      }
    } catch (err) {
      alert('Error deleting time entry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-3" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
          <p className="text-rose-400 font-bold text-lg mb-4">{error || 'Task not found'}</p>
          <Link href={`/${orgId}/${userId}`} className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeStatuses = statuses.length > 0 ? statuses : ['inprocess', 'dev', 'ready for qa', 'qa complete', 'complete', 'need approval'];
  const hasClickup = !!task.clickupId;
  const clickupUrl = hasClickup ? (task.clickupId.startsWith('http') ? task.clickupId : `https://app.clickup.com/t/${task.clickupId}`) : '';

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Navigation back & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${orgId}/${userId}`}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{task.name}</h1>
                {hasClickup && (
                  <a
                    href={clickupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black px-2.5 py-1 rounded-lg border border-orange-500/20 transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ClickUp</span>
                  </a>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-3 font-mono">
                <span>Nickname: <strong className="text-zinc-200">{task.nickName || 'N/A'}</strong></span>
                <span>•</span>
                <span>Work Date: <strong className="text-orange-400">{new Date(task.workDate || task.createdAt).toLocaleDateString()}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Status Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400">Current Status:</span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusLoading}
              className="bg-zinc-950 border border-orange-500/30 rounded-xl px-4 py-2 text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer uppercase tracking-wider"
            >
              {activeStatuses.map((s) => (
                <option key={s} value={s} className="bg-black text-white">
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Metadata & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Box */}
          <div className="md:col-span-2 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 p-6 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-450 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <FileText className="w-4 h-4" />
              Task Metadata & Dynamic Fields
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Project Workspace</span>
                <Link
                  href={`/${orgId}/${userId}/project/${encodeURIComponent(task.project || 'General')}`}
                  className="text-xs font-bold text-white hover:text-orange-400 flex items-center gap-1.5"
                >
                  <Folder className="w-3.5 h-3.5 text-orange-500" />
                  <span>{task.project || 'General'}</span>
                </Link>
              </div>

              <div className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Logged By</span>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{task.user || task.username || 'User'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Created At</span>
                <div className="text-xs font-mono text-zinc-300">
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Dynamic Values Display */}
              {task.dynamicValues && Object.entries(task.dynamicValues).map(([key, val]) => (
                <div key={key} className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">{key}</span>
                  <span className="text-xs font-semibold text-zinc-200">{String(val || 'N/A')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary Metrics */}
          <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-450 flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
                <Clock className="w-4 h-4" />
                Aggregated Hours Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Allocated Hours</span>
                  <span className="text-base font-bold font-mono text-zinc-100">{task.bill?.allocatedHours || 0} hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Billed Hours</span>
                  <span className="text-base font-bold font-mono text-amber-400">{task.bill?.billedHours || 0} hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Actual Hours</span>
                  <span className="text-base font-bold font-mono text-orange-400">{task.bill?.actualHours || 0} hrs</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex justify-between">
              <span>Total Entries:</span>
              <strong className="text-zinc-300">{(task.timeEntries || []).length} logged</strong>
            </div>
          </div>
        </div>

        {/* Timesheet Section: Logged Hours & New Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timesheet Entries Log */}
          <div className="lg:col-span-2 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-450 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Work Log / Timesheet Entries
              </h2>
              <span className="text-xs text-zinc-500 font-mono">{(task.timeEntries || []).length} Entries</span>
            </div>

            {(!task.timeEntries || task.timeEntries.length === 0) ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No timesheet entries recorded yet. Log your first hours on the right form!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-center">Allocated</th>
                      <th className="py-3 px-3 text-center">Billed</th>
                      <th className="py-3 px-3 text-center">Actual</th>
                      <th className="py-3 px-3">Note / Summary</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {task.timeEntries.map((entry) => (
                      <tr key={entry._id || Math.random()} className="hover:bg-zinc-900/40 transition">
                        <td className="py-3 px-3 font-mono font-semibold text-orange-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-zinc-300">{entry.allocatedHours || 0} hrs</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">{entry.billedHours || 0} hrs</td>
                        <td className="py-3 px-3 text-center font-mono text-orange-400 font-bold">{entry.actualHours || 0} hrs</td>
                        <td className="py-3 px-3 text-zinc-300 max-w-xs truncate" title={entry.note}>
                          {entry.note || <span className="text-zinc-600 font-italic">No note</span>}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteTimeEntry(entry._id)}
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-955/40 text-zinc-400 hover:text-rose-400 transition"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Hours Form */}
          <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-450 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <PlusCircle className="w-4 h-4" />
              Log Work Hours
            </h2>

            <form onSubmit={handleLogHours} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Work Date *</label>
                <input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Allocated</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={entryForm.allocatedHours}
                    onChange={(e) => setEntryForm({ ...entryForm, allocatedHours: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Billed</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={entryForm.billedHours}
                    onChange={(e) => setEntryForm({ ...entryForm, billedHours: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Actual</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={entryForm.actualHours}
                    onChange={(e) => setEntryForm({ ...entryForm, actualHours: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Entry Note / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Worked on database migration..."
                  value={entryForm.note}
                  onChange={(e) => setEntryForm({ ...entryForm, note: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEntry}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
              >
                {submittingEntry ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Time Entry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Audit History Section */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-450 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <History className="w-4 h-4" />
            Status History Log
          </h2>

          {(!task.statusHistory || task.statusHistory.length === 0) ? (
            <p className="text-xs text-zinc-500 italic">No history logged yet.</p>
          ) : (
            <div className="space-y-3">
              {task.statusHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-3 bg-black rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400 uppercase tracking-wider">{item.status}</span>
                    <span className="text-zinc-500">by</span>
                    <span className="text-zinc-200 font-semibold">{item.changedBy || 'User'}</span>
                  </div>
                  <span className="text-zinc-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}

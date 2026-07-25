'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TaskCreatePage() {
  const [form, setForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
    project: '',
    source: 'dialedin',
    typeOfWork: 'dev',
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    clickupId: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle auto parsing of ClickUp URL/ID input
  const handleLinkInput = (e) => {
    const rawVal = e.target.value;
    let parsedId = rawVal.trim();
    
    if (rawVal.includes('clickup.com') || rawVal.includes('/t/')) {
      const match = rawVal.match(/t\/([a-zA-Z0-9]+)/);
      if (match) {
        parsedId = match[1];
      }
    }

    setForm({
      ...form,
      clickupId: rawVal,
      nickName: form.nickName === '' || form.nickName === form.clickupId ? parsedId : form.nickName,
      name: form.name === '' ? `ClickUp Task #${parsedId}` : form.name
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.project) return;
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        nickName: form.nickName || form.name,
        status: form.status,
        project: form.project,
        source: form.source,
        typeOfWork: form.typeOfWork,
        clickupId: form.clickupId,
        bill: {
          allocatedHours: parseFloat(form.allocatedHours || 0),
          billedHours: parseFloat(form.billedHours || 0),
          actualHours: parseFloat(form.actualHours || 0),
        }
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        alert(data.error || 'Failed to save task. Make sure you are logged in!');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 flex items-center justify-center">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🚀 Create New Task</span>
          </h2>
          <Link href="/" className="text-zinc-400 hover:text-white text-xs font-semibold">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ClickUp Link Input */}
          <div className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ClickUp Link / Task ID</label>
            <input
              type="text"
              placeholder="e.g. https://app.clickup.com/t/86d3tn93v or 86d3tn93v"
              value={form.clickupId}
              onChange={handleLinkInput}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              💡 Pasting a ClickUp link automatically extracts the ID for your nickname and task name placeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Name *</label>
              <input
                type="text"
                placeholder="e.g. Build Payment Gateway"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nick Name</label>
              <input
                type="text"
                placeholder="e.g. Pay-GW"
                value={form.nickName}
                onChange={(e) => setForm({ ...form, nickName: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. Billing Engine"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="inprocess">In Process</option>
                <option value="dev">Development</option>
                <option value="ready for qa">Ready for QA</option>
                <option value="qa complete">QA Complete</option>
                <option value="ready for code review">Ready for CR</option>
                <option value="code review complete">CR Complete</option>
                <option value="complete">Complete</option>
                <option value="need approval">Need Approval</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dialedin">dialedin</option>
                <option value="fluent">fluent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Type of Work</label>
              <select
                value={form.typeOfWork}
                onChange={(e) => setForm({ ...form, typeOfWork: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dev">dev (Development)</option>
                <option value="qa">qa (Quality Assurance)</option>
              </select>
            </div>
          </div>

          {/* Billing Hours Breakdown */}
          <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Billing Hours Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Allocated (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.allocatedHours}
                  onChange={(e) => setForm({ ...form, allocatedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Billed (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.billedHours}
                  onChange={(e) => setForm({ ...form, billedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Actual (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.actualHours}
                  onChange={(e) => setForm({ ...form, actualHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-55"
          >
            {loading ? 'Creating task...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

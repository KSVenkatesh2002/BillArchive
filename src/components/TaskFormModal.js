'use client';

import { Edit3, PlusCircle, Lightbulb } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'inprocess', label: 'In Process' },
  { id: 'dev', label: 'Development' },
  { id: 'ready for qa', label: 'Ready for QA' },
  { id: 'qa complete', label: 'QA Complete' },
  { id: 'ready for code review', label: 'Ready for CR' },
  { id: 'code review complete', label: 'CR Complete' },
  { id: 'complete', label: 'Complete' },
  { id: 'need approval', label: 'Need Approval' },
];

export default function TaskFormModal({ show, onClose, onSubmit, form, onChange, isEdit }) {
  if (!show) return null;

  // Handle auto parsing of ClickUp URL/ID input
  const handleLinkInput = (e) => {
    const rawVal = e.target.value;
    let parsedId = rawVal.trim();
    
    // Extract last slug/id if a full ClickUp url is pasted
    if (rawVal.includes('clickup.com') || rawVal.includes('/t/')) {
      const match = rawVal.match(/t\/([a-zA-Z0-9]+)/);
      if (match) {
        parsedId = match[1];
      }
    }

    onChange({
      ...form,
      clickupId: rawVal,
      // Automatically prefill Nickname with extracted ClickUp ID if nickname is empty
      nickName: form.nickName === '' || form.nickName === form.clickupId ? parsedId : form.nickName,
      // Automatically prefill Name with task ID placeholder if name is empty
      name: form.name === '' ? `ClickUp Task #${parsedId}` : form.name
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-805 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit3 className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-indigo-400" />}
            <span>{isEdit ? 'Edit Task' : 'Create New Task'}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* ClickUp Link Input */}
          <div className="p-3.5 bg-black rounded-xl border border-zinc-850">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ClickUp Link / Task ID</label>
            <input
              type="text"
              placeholder="e.g. https://app.clickup.com/t/86d3tn93v or 86d3tn93v"
              value={form.clickupId}
              onChange={handleLinkInput}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-start gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Pasting a ClickUp link automatically extracts the ID for your nickname and task name placeholder.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Name *</label>
              <input
                type="text"
                placeholder="e.g. Build Payment Gateway"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nick Name</label>
              <input
                type="text"
                placeholder="e.g. Pay-GW"
                value={form.nickName}
                onChange={(e) => onChange({ ...form, nickName: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
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
                onChange={(e) => onChange({ ...form, project: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => onChange({ ...form, status: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-black">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => onChange({ ...form, source: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dialedin" className="bg-black">dialedin</option>
                <option value="fluent" className="bg-black">fluent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Type of Work</label>
              <select
                value={form.typeOfWork}
                onChange={(e) => onChange({ ...form, typeOfWork: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dev" className="bg-black">dev (Development)</option>
                <option value="qa" className="bg-black">qa (Quality Assurance)</option>
              </select>
            </div>
          </div>

          {/* Billing Hours Breakdown */}
          <div className="p-3.5 rounded-xl bg-black border border-zinc-805 space-y-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Billing Hours Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Allocated (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.allocatedHours || ''}
                  onChange={(e) => onChange({ ...form, allocatedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Billed (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.billedHours || ''}
                  onChange={(e) => onChange({ ...form, billedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Actual (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.actualHours || ''}
                  onChange={(e) => onChange({ ...form, actualHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/25"
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

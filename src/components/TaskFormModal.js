'use client';

import { useState, useEffect } from 'react';
import { Edit3, PlusCircle, Lightbulb, ChevronDown } from 'lucide-react';

export default function TaskFormModal({ show, onClose, onSubmit, form, onChange, isEdit }) {
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Fetch user projects
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects || []);
        }
      })
      .catch((err) => console.error(err));

    // Fetch statuses
    fetch('/api/admin/statuses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatuses(data.statuses || []);
        } else {
          setStatuses([
            'inprocess',
            'dev',
            'ready for qa',
            'qa complete',
            'ready for code review',
            'code review complete',
            'complete',
            'need approval',
          ]);
        }
      })
      .catch(() => {
        setStatuses([
          'inprocess',
          'dev',
          'ready for qa',
          'qa complete',
          'ready for code review',
          'code review complete',
          'complete',
          'need approval',
        ]);
      });
  }, [show]);

  if (!show) return null;

  const allProjects = [...projects];
  if (form.project && !allProjects.includes(form.project)) {
    allProjects.push(form.project);
  }

  const handleLinkInput = (e) => {
    onChange({
      ...form,
      clickupId: e.target.value,
    });
  };

  const handleProjectSelect = (e) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      setIsAddingNewProject(true);
      onChange({ ...form, project: '' });
    } else {
      setIsAddingNewProject(false);
      onChange({ ...form, project: val });
    }
  };

  const handleNewProjectChange = (e) => {
    const val = e.target.value;
    setNewProjectName(val);
    onChange({ ...form, project: val });
  };

  const handleWrapperSubmit = async (e) => {
    e.preventDefault();
    if (isAddingNewProject && newProjectName.trim()) {
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: newProjectName.trim() }),
        });
      } catch (err) {
        console.error('Failed to save project to db:', err);
      }
    }
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-805 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit3 className="w-5 h-5 text-orange-500" /> : <PlusCircle className="w-5 h-5 text-orange-500" />}
            <span>{isEdit ? 'Edit Task Details' : 'Create New Task'}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleWrapperSubmit} className="space-y-4">
          {/* ClickUp Link Input */}
          <div className="p-3.5 bg-black rounded-xl border border-zinc-850">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ClickUp Link / Task ID</label>
            <input
              type="text"
              placeholder="e.g. https://app.clickup.com/t/86d3tn93v or 86d3tn93v"
              value={form.clickupId || ''}
              onChange={handleLinkInput}
              className="w-full bg-zinc-900 border border-zinc-805 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-start gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Pasting a link will store it as a clickable ClickUp ID shortcut in reports.</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Name *</label>
            <input
              type="text"
              placeholder="e.g. Build Payment Gateway"
              value={form.name || ''}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Project Name *</label>
              <div className="relative">
                <select
                  value={isAddingNewProject ? '__add_new__' : (form.project || '')}
                  onChange={handleProjectSelect}
                  className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-black text-zinc-600">Select Project</option>
                  {allProjects.map((proj) => (
                    <option key={proj} value={proj} className="bg-black text-white">
                      {proj}
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-zinc-900 text-orange-400 font-bold">
                    + Add New Project
                  </option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {isAddingNewProject && (
                <div className="mt-2 animate-slideDown">
                  <input
                    type="text"
                    placeholder="Type new project name..."
                    value={newProjectName}
                    onChange={handleNewProjectChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Status</label>
              <div className="relative">
                <select
                  value={form.status || 'inprocess'}
                  onChange={(e) => onChange({ ...form, status: e.target.value })}
                  className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="bg-black text-white">
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Source</label>
              <div className="relative">
                <select
                  value={form.source || 'dialedin'}
                  onChange={(e) => onChange({ ...form, source: e.target.value })}
                  className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                >
                  <option value="dialedin" className="bg-black text-white">dialedin</option>
                  <option value="fluent" className="bg-black text-white">fluent</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Type of Work</label>
              <div className="relative">
                <select
                  value={form.typeOfWork || 'dev'}
                  onChange={(e) => onChange({ ...form, typeOfWork: e.target.value })}
                  className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                >
                  <option value="dev" className="bg-black text-white">dev (Development)</option>
                  <option value="qa" className="bg-black text-white">qa (Quality Assurance)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Hours Breakdown */}
          <div className="p-3.5 rounded-xl bg-black border border-zinc-805 space-y-3">
            <div className="text-xs font-bold text-orange-450 uppercase tracking-wider">Billing Hours Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Allocated</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.allocatedHours || ''}
                  onChange={(e) => onChange({ ...form, allocatedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Billed</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.billedHours || ''}
                  onChange={(e) => onChange({ ...form, billedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Actual</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.actualHours || ''}
                  onChange={(e) => onChange({ ...form, actualHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Advanced Collapsible Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-bold text-orange-400 hover:text-orange-300 transition flex items-center gap-1 focus:outline-none"
            >
              <span>{showAdvanced ? 'Hide Optional Fields' : 'Show Optional Fields (Nickname)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 bg-black border border-zinc-800 rounded-xl animate-fadeIn">
                <label className="block text-xs font-semibold text-zinc-350 mb-1">Nick Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pay-GW"
                  value={form.nickName || ''}
                  onChange={(e) => onChange({ ...form, nickName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-805 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/25"
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

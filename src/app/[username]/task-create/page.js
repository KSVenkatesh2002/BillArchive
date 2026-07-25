'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { PlusCircle, Lightbulb, ChevronDown } from 'lucide-react';

export default function UserTaskCreatePage() {
  const { username } = useParams();
  const router = useRouter();

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
  const [authChecking, setAuthChecking] = useState(true);
  
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scrapingTitle, setScrapingTitle] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await apiClient.checkAuth();
        if (!data.authenticated) {
          router.push('/login');
        } else if (data.user.username !== username) {
          router.push(`/${data.user.username}/task-create`);
        } else {
          setAuthChecking(false);
        }
      } catch (err) {
        console.error(err);
        router.push('/login');
      }
    };
    verifyAuth();
  }, [router, username]);

  useEffect(() => {
    if (authChecking) return;

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
  }, [authChecking]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Handle auto parsing of ClickUp URL/ID input
  const handleLinkInput = async (e) => {
    const rawVal = e.target.value;
    setForm({
      ...form,
      clickupId: rawVal
    });

    if (rawVal.startsWith('http://') || rawVal.startsWith('https://')) {
      setScrapingTitle(true);
      try {
        const res = await fetch(`/api/title-scraper?url=${encodeURIComponent(rawVal)}`);
        const data = await res.json();
        if (data.success && data.title) {
          setForm({
            ...form,
            clickupId: rawVal,
            name: data.title
          });
        }
      } catch (err) {
        console.error('Failed to scrape title:', err);
      } finally {
        setScrapingTitle(false);
      }
    }
  };

  const handleProjectSelect = (e) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      setIsAddingNewProject(true);
      setForm({ ...form, project: '' });
    } else {
      setIsAddingNewProject(false);
      setForm({ ...form, project: val });
    }
  };

  const handleNewProjectChange = (e) => {
    const val = e.target.value;
    setNewProjectName(val);
    setForm({ ...form, project: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.project) return;
    setLoading(true);

    try {
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

      const data = await apiClient.createTask(payload);
      if (data.success) {
        router.push(`/${username}`);
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
            <PlusCircle className="w-5 h-5 text-orange-450" />
            <span>Create New Task</span>
          </h2>
          <Link href={`/${username}`} className="text-zinc-400 hover:text-white text-xs font-semibold">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ClickUp Link Input */}
          <div className="p-3.5 bg-black rounded-xl border border-zinc-800/80">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">ClickUp Link / Task ID</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. https://app.clickup.com/t/86d3tn93v or 86d3tn93v"
                value={form.clickupId}
                onChange={handleLinkInput}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
              />
              {scrapingTitle && (
                <span className="absolute right-3 top-2.5 text-[10px] text-orange-400 animate-pulse">
                  Scraping page title...
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-start gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Pasting a web URL automatically scrapes the page title for the Task Name input.</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Task Name *</label>
            <input
              type="text"
              placeholder="e.g. Build Payment Gateway"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-black text-zinc-600">Select Project</option>
                  {projects.map((proj) => (
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Initial Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
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
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
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
                  value={form.typeOfWork}
                  onChange={(e) => setForm({ ...form, typeOfWork: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
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
          <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-orange-450 uppercase tracking-wider">Billing Hours Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Allocated</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.allocatedHours}
                  onChange={(e) => setForm({ ...form, allocatedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Billed</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.billedHours}
                  onChange={(e) => setForm({ ...form, billedHours: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Actual</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.actualHours}
                  onChange={(e) => setForm({ ...form, actualHours: e.target.value })}
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
                  value={form.nickName}
                  onChange={(e) => setForm({ ...form, nickName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/25 disabled:opacity-55"
          >
            {loading ? 'Creating task...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

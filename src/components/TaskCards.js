'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Pin, ExternalLink, Folder, Copy, Clock, Edit2, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'inprocess', label: 'In Process', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'dev', label: 'Development', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { id: 'ready for qa', label: 'Ready for QA', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'qa complete', label: 'QA Complete', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  { id: 'ready for code review', label: 'Ready for CR', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'code review complete', label: 'CR Complete', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { id: 'complete', label: 'Complete', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'need approval', label: 'Need Approval', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
];

export default function TaskCards({
  loading,
  tasks,
  handleQuickStatusChange,
  setActiveHistoryTask,
  handleCopyProjectDetails,
  openEditModal,
  deleteTask,
}) {
  const params = useParams();
  const username = params?.username || 'admin';

  return (
    <div className="w-full">
      {loading ? (
        <div className="py-20 text-center text-zinc-500 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading task data...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl">
          <Pin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-base font-semibold text-zinc-200">No tasks found matching criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Click "+ New Task" to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const statusObj = STATUS_OPTIONS.find(s => s.id === task.status) || STATUS_OPTIONS[0];

            return (
              <div
                key={task._id}
                className="bg-[#0b0b0b] rounded-2xl border border-zinc-800 hover:border-zinc-700/80 shadow-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-950/10 hover:shadow-xl group relative overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Task Header info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-zinc-150 text-base leading-snug group-hover:text-indigo-400 transition-colors duration-200 truncate" title={task.name}>
                        {task.name}
                      </h3>
                      <div className="text-[11px] text-zinc-500 font-mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>Nick: <strong className="text-zinc-300">{task.nickName || 'N/A'}</strong></span>
                        {task.user && (
                          <span className="text-[10px] bg-zinc-900/80 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800/40">by {task.user}</span>
                        )}
                      </div>
                    </div>

                    {task.clickupId && (
                      <a
                        href={task.clickupId.includes('http') ? task.clickupId : `https://app.clickup.com/t/${task.clickupId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500 hover:text-black px-2 py-1 rounded-lg border border-emerald-500/20 transition flex items-center gap-1 shrink-0"
                        title="Open Task in ClickUp"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>ClickUp</span>
                      </a>
                    )}
                  </div>

                  {/* Project Tag */}
                  <div className="flex items-center gap-2 mb-4">
                    <Link
                      href={`/${username}/project/${encodeURIComponent(task.project)}`}
                      className="text-xs font-semibold text-zinc-300 bg-zinc-950 hover:bg-zinc-900 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800/80 transition-colors inline-flex items-center gap-1.5 max-w-full truncate"
                      title={`View tasks for project "${task.project}"`}
                    >
                      <Folder className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{task.project}</span>
                    </Link>

                    {handleCopyProjectDetails && (
                      <button
                        onClick={() => handleCopyProjectDetails(task.project)}
                        title={`Copy all details for project "${task.project}" as text`}
                        className="opacity-0 group-hover:opacity-100 text-[10px] bg-zinc-950 hover:bg-indigo-600 text-zinc-400 hover:text-white p-1.5 rounded-lg border border-zinc-800/80 transition"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Metadata and Hours breakdown */}
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 mb-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                      <span>Hours Metrics</span>
                      <span className="text-zinc-650">(Alloc / Bill / Act)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">Allocated</div>
                        <div className="text-indigo-400 font-bold text-xs mt-0.5">{task.bill?.allocatedHours || 0}h</div>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">Billed</div>
                        <div className="text-cyan-400 font-bold text-xs mt-0.5">{task.bill?.billedHours || 0}h</div>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">Actual</div>
                        <div className="text-purple-400 font-bold text-xs mt-0.5">{task.bill?.actualHours || 0}h</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags & History bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                        task.source === 'fluent'
                          ? 'bg-amber-500/10 text-amber-350 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-350 border border-indigo-500/20'
                      }`}>
                        {task.source}
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                        task.typeOfWork === 'qa'
                          ? 'bg-teal-500/10 text-teal-350 border border-teal-500/20'
                          : 'bg-purple-500/10 text-purple-350 border border-purple-500/20'
                      }`}>
                        {task.typeOfWork}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveHistoryTask(task)}
                      className="bg-zinc-950 hover:bg-zinc-900 text-zinc-350 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1.5"
                      title="Click to view full status progression audit log"
                    >
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{task.statusHistory?.length || 1} change{(task.statusHistory?.length || 1) > 1 ? 's' : ''}</span>
                    </button>
                  </div>
                </div>

                {/* Footer Controls (Status Select & Actions) */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 mt-auto">
                  <div className="flex-1 min-w-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleQuickStatusChange(task._id, e.target.value)}
                      className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${statusObj.color}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id} className="bg-black text-zinc-200">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(task)}
                      className="bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white p-2 rounded-lg border border-zinc-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="bg-zinc-950 hover:bg-rose-950/40 text-zinc-450 hover:text-rose-350 p-2 rounded-lg border border-zinc-800 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

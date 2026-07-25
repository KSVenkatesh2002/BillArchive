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

export default function TaskTable({
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
    <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-zinc-500">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading task data...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center text-zinc-400">
          <Pin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-base font-semibold text-zinc-200">No tasks found matching criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Click "+ New Task" to create one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                <th className="py-3.5 px-4">Task / Nickname</th>
                <th className="py-3.5 px-3">Project</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-center">Status History</th>
                <th className="py-3.5 px-3 text-center">Hours (Alloc / Bill / Act)</th>
                <th className="py-3.5 px-3 text-center">Source</th>
                <th className="py-3.5 px-3 text-center">Work Type</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
              {tasks.map((task) => {
                const statusObj = STATUS_OPTIONS.find(s => s.id === task.status) || STATUS_OPTIONS[0];

                return (
                  <tr key={task._id} className="hover:bg-zinc-900/40 transition-colors group">
                    {/* Task Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-zinc-100 text-sm group-hover:text-indigo-400 transition-colors">
                          {task.name}
                        </div>
                        {task.clickupId && (
                          <a
                            href={task.clickupId.includes('http') ? task.clickupId : `https://app.clickup.com/t/${task.clickupId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black px-2 py-0.5 rounded border border-emerald-500/20 transition flex items-center gap-1 shrink-0"
                            title="Open Task in ClickUp"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>ClickUp</span>
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>Nick: <strong className="text-zinc-300">{task.nickName || 'N/A'}</strong></span>
                        {task.user && <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">by {task.user}</span>}
                      </div>
                    </td>

                    {/* Project Name (Clickable link) + Project Text Copy Button */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${username}/project/${encodeURIComponent(task.project)}`}
                          className="font-semibold text-zinc-200 bg-black hover:bg-zinc-900 hover:text-white px-2.5 py-1 rounded-lg border border-zinc-800/80 transition-colors inline-flex items-center gap-1.5"
                          title={`View workspace tasks for project "${task.project}"`}
                        >
                          <Folder className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{task.project}</span>
                        </Link>
                        {handleCopyProjectDetails && (
                          <button
                            onClick={() => handleCopyProjectDetails(task.project)}
                            title={`Copy all details for project "${task.project}" as text`}
                            className="opacity-0 group-hover:opacity-100 text-[10px] bg-zinc-900 hover:bg-indigo-600 text-zinc-300 hover:text-white p-1 px-1.5 rounded transition inline-flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Interactive Status Selector */}
                    <td className="py-3.5 px-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleQuickStatusChange(task._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusObj.color}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id} className="bg-black text-zinc-200">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Audit History Timeline Button */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setActiveHistoryTask(task)}
                        className="bg-black hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px] font-mono transition flex items-center gap-1.5 mx-auto"
                        title="Click to view full status progression audit log"
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{task.statusHistory?.length || 1} change{(task.statusHistory?.length || 1) > 1 ? 's' : ''}</span>
                      </button>
                    </td>

                    {/* Hours breakdown */}
                    <td className="py-3.5 px-3 text-center font-mono">
                      <div className="flex items-center justify-center gap-1.5 text-[11px]">
                        <span className="text-indigo-400 font-bold" title="Allocated Hours">{task.bill?.allocatedHours || 0}h</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-cyan-400 font-bold" title="Billed Hours">{task.bill?.billedHours || 0}h</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-purple-400 font-bold" title="Actual Hours">{task.bill?.actualHours || 0}h</span>
                      </div>
                    </td>

                    {/* Source Badge */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                         task.source === 'fluent'
                           ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                           : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {task.source}
                      </span>
                    </td>

                    {/* Work Type Badge */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                         task.typeOfWork === 'qa'
                           ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                           : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      }`}>
                        {task.typeOfWork}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white p-1.5 rounded-lg border border-zinc-800 transition flex items-center justify-center"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-350 p-1.5 rounded-lg border border-zinc-800 transition flex items-center justify-center"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

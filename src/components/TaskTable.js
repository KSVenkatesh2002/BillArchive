'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Pin, ExternalLink, Folder, Copy, Clock, Edit2, Trash2 } from 'lucide-react';

export default function TaskTable({
  loading,
  tasks,
  handleQuickStatusChange,
  setActiveHistoryTask,
  handleCopyProjectDetails,
  openEditModal,
  deleteTask,
  dynamicFields = [],
}) {
  const customCols = dynamicFields.filter(f => f.name !== 'project');
  const params = useParams();
  const userId = params?.userId || 'admin';
  const orgId = params?.orgId || 'dialedin';
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetch('/api/admin/statuses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatuses(data.statuses || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const activeStatuses =
    statuses.length > 0
      ? statuses
      : [
          'inprocess',
          'dev',
          'ready for qa',
          'qa complete',
          'ready for code review',
          'code review complete',
          'complete',
          'need approval',
        ];

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'complete' || s === 'qa complete') return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/30';
    if (s === 'inprocess' || s === 'dev') return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    if (s === 'ready for qa' || s === 'ready for code review') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (s === 'need approval') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    return 'bg-zinc-900 text-zinc-300 border-zinc-800';
  };

  return (
    <div className="bg-[#0b0b0b] rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden">
      {loading ? (
        <div className="py-20 text-center text-zinc-500">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-3"></div>
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
                {customCols.map(col => (
                  <th key={col.name} className="py-3.5 px-3 text-center">{col.label}</th>
                ))}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
              {tasks.map((task) => {
                const statusColor = getStatusColor(task.status);
                
                // Parse clickupId to get last slug and full url
                const hasClickup = !!task.clickupId;
                let clickupLabel = '';
                let clickupUrl = '';
                if (hasClickup) {
                  const idStr = task.clickupId.trim();
                  clickupLabel = idStr.includes('/') ? idStr.split('/').filter(Boolean).pop() : idStr;
                  clickupUrl = idStr.startsWith('http') ? idStr : `https://app.clickup.com/t/${idStr}`;
                }

                return (
                  <tr key={task._id} className="hover:bg-zinc-900/40 transition-colors group">
                    {/* Task Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-zinc-100 text-sm group-hover:text-orange-450 transition-colors">
                          {task.name}
                        </div>
                        {hasClickup && (
                          <a
                            href={clickupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black px-2 py-0.5 rounded border border-orange-500/20 transition flex items-center gap-1 shrink-0"
                            title={`Open ClickUp: ${clickupLabel}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{clickupLabel}</span>
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
                          href={`/${orgId}/${userId}/project/${encodeURIComponent(task.project)}`}
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
                            className="opacity-0 group-hover:opacity-100 text-[10px] bg-zinc-900 hover:bg-orange-600 text-zinc-300 hover:text-white p-1 px-1.5 rounded transition inline-flex items-center gap-1"
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
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusColor} bg-black`}
                      >
                        {activeStatuses.map((s) => (
                          <option key={s} value={s} className="bg-black text-zinc-200">
                            {s.toUpperCase()}
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
                        <span className="text-orange-400 font-bold" title="Allocated Hours">{task.bill?.allocatedHours || 0}h</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-amber-400 font-bold" title="Billed Hours">{task.bill?.billedHours || 0}h</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-yellow-500 font-bold" title="Actual Hours">{task.bill?.actualHours || 0}h</span>
                      </div>
                    </td>
                    
                    {customCols.map(col => {
                      const val = task.dynamicValues?.[col.name] ?? task[col.name] ?? 'N/A';
                      const displayVal = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val);
                      return (
                        <td key={col.name} className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            col.name === 'source'
                              ? (val === 'fluent' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-orange-500/10 text-orange-300 border border-orange-500/20')
                              : col.name === 'typeOfWork'
                              ? (val === 'qa' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-zinc-900 text-zinc-350 border border-zinc-800')
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-850'
                          }`}>
                            {displayVal}
                          </span>
                        </td>
                      );
                    })}

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
                            className="bg-zinc-900 hover:bg-rose-955/40 text-zinc-400 hover:text-rose-350 p-1.5 rounded-lg border border-zinc-800 transition flex items-center justify-center"
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

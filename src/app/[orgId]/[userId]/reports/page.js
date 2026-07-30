'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw, Download, Filter, Settings, Link as LinkIcon, CheckCircle, Search, LayoutDashboard, Copy, Check, FileText, Calendar, Eye, Settings2, CheckSquare, Square, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import Link from 'next/link';

export default function ReportsPage() {
  const { orgId, userId } = useParams();
  const router = useRouter();

  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Task Exclusion checklist
  const [taskList, setTaskList] = useState([]);
  const [excludedTaskIds, setExcludedTaskIds] = useState(new Set());

  // Report Content Toggles
  const [includeHours, setIncludeHours] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeClickUp, setIncludeClickUp] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [includeTotals, setIncludeTotals] = useState(true);

  const [reportText, setReportText] = useState('');
  const [tasksCount, setTasksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordion states
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isTogglesOpen, setIsTogglesOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiClient.getProjects();
        if (data.success && data.projects) {
          setProjectsList(data.projects);
        }
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProject && selectedProject !== 'all') params.set('project', selectedProject);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      if (excludedTaskIds.size > 0) {
        params.set('excludedIds', Array.from(excludedTaskIds).join(','));
      }

      params.set('includeHours', includeHours ? 'true' : 'false');
      params.set('includeHistory', includeHistory ? 'true' : 'false');
      params.set('includeClickUp', includeClickUp ? 'true' : 'false');
      params.set('includeMeta', includeMeta ? 'true' : 'false');
      params.set('includeTotals', includeTotals ? 'true' : 'false');

      const data = await apiClient.getReport(Object.fromEntries(params));
      if (data.success) {
        setReportText(data.reportText || '');
        setTasksCount(data.tasksCount || 0);

        if (data.tasks) {
          setTaskList(data.tasks);
        }
      }
    } catch (err) {
      console.error('Failed to generate report preview:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, startDate, endDate, excludedTaskIds, includeHours, includeHistory, includeClickUp, includeMeta, includeTotals]);

  useEffect(() => {
    setTimeout(() => fetchReport(), 0);
  }, [fetchReport]);

  const toggleTaskExclusion = (taskId) => {
    setExcludedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 bg-zinc-950/40 rounded-2xl flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${orgId}/${userId}`}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                Timeline Summary Report Generator
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate and export detailed timesheet reports
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={loading || !reportText}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-5 space-y-6 flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto pr-2">

          {/* Timeline Range Controls */}
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between p-5 bg-zinc-900/40 hover:bg-zinc-900/80 transition text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" /> Date & Project Filter
              </div>
              {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isFilterOpen && (
              <div className="p-5 border-t border-zinc-800/50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Projects</option>
                    {projectsList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Report Content Options */}
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setIsTogglesOpen(!isTogglesOpen)}
              className="w-full flex items-center justify-between p-5 bg-zinc-900/40 hover:bg-zinc-900/80 transition text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-orange-400" /> Output Toggles
              </div>
              {isTogglesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isTogglesOpen && (
              <div className="p-5 border-t border-zinc-800/50 grid grid-cols-2 gap-4 text-sm">
                <label className="flex items-center gap-2.5 text-zinc-300 cursor-pointer select-none bg-[#0d0d0d] p-3 rounded-xl border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={includeHours}
                    onChange={(e) => setIncludeHours(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                  />
                  <span>Hours Breakdown</span>
                </label>

                <label className="flex items-center gap-2.5 text-zinc-300 cursor-pointer select-none bg-[#0d0d0d] p-3 rounded-xl border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={includeHistory}
                    onChange={(e) => setIncludeHistory(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                  />
                  <span>Status Progression</span>
                </label>

                <label className="flex items-center gap-2.5 text-zinc-300 cursor-pointer select-none bg-[#0d0d0d] p-3 rounded-xl border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={includeClickUp}
                    onChange={(e) => setIncludeClickUp(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                  />
                  <span>ClickUp Metadata</span>
                </label>

                <label className="flex items-center gap-2.5 text-zinc-300 cursor-pointer select-none bg-[#0d0d0d] p-3 rounded-xl border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={includeTotals}
                    onChange={(e) => setIncludeTotals(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                  />
                  <span>Totals Summary</span>
                </label>
              </div>
            )}
          </section>

          {/* Task Inclusion Checklist */}
          <section className={`bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden ${isTasksOpen ? 'flex-1 min-h-[300px]' : ''}`}>
            <button 
              onClick={() => setIsTasksOpen(!isTasksOpen)}
              className="w-full flex items-center justify-between p-5 bg-zinc-900/40 hover:bg-zinc-900/80 transition text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-orange-400" /> Filter Tasks
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold px-2 py-1 bg-[#0d0d0d] rounded-lg text-zinc-300 border border-zinc-800">
                  {taskList.length - excludedTaskIds.size} / {taskList.length} Included
                </span>
                {isTasksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isTasksOpen && (
              <div className="flex-1 flex flex-col p-5 border-t border-zinc-800/50 overflow-hidden">
                {taskList.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-black/50">
                No tasks available in this range
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {(() => {
                  let lastGroup = null;
                  
                  const getRelativeTimeGroup = (dateString) => {
                    if (!dateString) return 'Older';
                    const date = new Date(dateString);
                    const now = new Date();
                    
                    if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                      return 'Today';
                    }
                    
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
                      return 'Yesterday';
                    }
                    
                    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  };

                  return taskList.map((t, index) => {
                    const taskId = t.uniqueId;
                    const isIncluded = !excludedTaskIds.has(taskId);
                    const currentGroup = getRelativeTimeGroup(t.workDate);
                    
                    const showSeparator = currentGroup !== lastGroup;
                    lastGroup = currentGroup;

                    return (
                      <div key={taskId}>
                        {showSeparator && (
                          <div className="text-[10px] font-black tracking-widest uppercase text-orange-500 border-b border-orange-500/20 pb-1.5 mb-2 mt-2">
                            {currentGroup}
                          </div>
                        )}
                        <div
                          onClick={() => toggleTaskExclusion(taskId)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition mb-1.5 ${
                            isIncluded
                              ? 'bg-[#0d0d0d] border-zinc-700 text-zinc-100 hover:border-zinc-500'
                              : 'bg-black/40 border-zinc-800 text-zinc-600 line-through'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {isIncluded ? (
                              <CheckSquare className="w-4 h-4 text-orange-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-700 shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate text-xs">{t.taskName}</span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                                <span>{t.project}</span>
                                {t.nickName && (
                                  <>
                                    <span>•</span>
                                    <span className="text-zinc-400">{t.nickName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono shrink-0 pl-4">
                            <span className={`${isIncluded ? 'text-orange-400' : 'text-zinc-600'} font-bold`}>{t.billed}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </section>

    </div>

        {/* RIGHT COLUMN: Output Preview */}
        <div className="lg:col-span-7 h-[calc(100vh-120px)] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
            <span className="flex items-center gap-2 text-sm font-bold text-zinc-300 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-orange-400" /> Document Preview
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {loading ? 'Generating...' : 'Live Output'}
            </span>
          </div>
          
          <textarea
            readOnly
            value={loading ? 'Generating customized report preview...' : reportText}
            className="flex-1 w-full bg-black/95 text-zinc-300 p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
            placeholder="Report will appear here..."
          />
          
          {copied && (
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-emerald-500 text-black font-bold text-sm rounded-xl shadow-lg animate-bounce">
              Copied to clipboard!
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

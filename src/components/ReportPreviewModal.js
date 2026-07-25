'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, FileText, Calendar, Filter, Eye, X, Settings2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function ReportPreviewModal({ isOpen, onClose, initialProject = null, initialTimeframe = 'all', projectsList = [] }) {
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [selectedProject, setSelectedProject] = useState(initialProject || 'all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  // Sync initial props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProject(initialProject || 'all');
      setTimeframe(initialProject ? 'all' : (initialTimeframe || 'all'));
      setCopied(false);
    }
  }, [isOpen, initialProject, initialTimeframe]);

  const fetchReport = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('timeframe', timeframe);
      if (selectedProject && selectedProject !== 'all') params.set('project', selectedProject);
      if (timeframe === 'custom') {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }

      params.set('includeHours', includeHours ? 'true' : 'false');
      params.set('includeHistory', includeHistory ? 'true' : 'false');
      params.set('includeClickUp', includeClickUp ? 'true' : 'false');
      params.set('includeMeta', includeMeta ? 'true' : 'false');
      params.set('includeTotals', includeTotals ? 'true' : 'false');

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportText(data.reportText || '');
        setTasksCount(data.tasksCount || 0);
      }
    } catch (err) {
      console.error('Failed to generate report preview:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, timeframe, selectedProject, startDate, endDate, includeHours, includeHistory, includeClickUp, includeMeta, includeTotals]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Report Preview & Exporter</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {tasksCount} {tasksCount === 1 ? 'task' : 'tasks'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customize report scope, toggles, and date parameters before copying
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-sans">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
            {/* Timeframe selector */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-400" /> Timeframe Range
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Time</option>
                <option value="1w">Past 1 Week</option>
                <option value="1m">Past 1 Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-orange-400" /> Project Scope
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Projects</option>
                {projectsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Custom Date Pickers */}
            {timeframe === 'custom' && (
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Toggle Checkboxes */}
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Settings2 className="w-3 h-3 text-orange-400" /> Report Content Options
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeHours}
                  onChange={(e) => setIncludeHours(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                />
                <span>Hours Breakdown</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                />
                <span>Status Progression</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMeta}
                  onChange={(e) => setIncludeMeta(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                />
                <span>Source & Work Type</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeClickUp}
                  onChange={(e) => setIncludeClickUp(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                />
                <span>ClickUp ID & Nickname</span>
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTotals}
                  onChange={(e) => setIncludeTotals(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-orange-500 focus:ring-0"
                />
                <span>Totals Summary</span>
              </label>
            </div>
          </div>

          {/* Report Live Preview Window */}
          <div className="relative">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold mb-1 px-1">
              <span className="flex items-center gap-1 text-zinc-300">
                <Eye className="w-3.5 h-3.5 text-orange-400" /> Live Text Preview
              </span>
              <span>{loading ? 'Refreshing report...' : 'Ready to copy'}</span>
            </div>
            
            <textarea
              readOnly
              value={loading ? 'Generating customized report preview...' : reportText}
              rows={12}
              className="w-full bg-black/90 text-zinc-200 border border-zinc-800 rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="text-xs text-zinc-400">
            {copied ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Report copied to clipboard!
              </span>
            ) : (
              <span>Click copy to place report on your clipboard.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={loading || !reportText}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center gap-2 disabled:opacity-50"
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

      </div>
    </div>
  );
}

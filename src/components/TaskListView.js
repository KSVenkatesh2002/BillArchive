import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Play, Check, ChevronDown, ChevronRight, Plus, MoreHorizontal, LayoutGrid, List as ListIcon, Filter, Calendar as CalendarIcon, CheckCircle, Clock, Folder, Edit2, Trash2, ChevronLeft, Copy } from 'lucide-react';
import TaskCards from './TaskCards';

export default function TaskListView({ 
  tasks, openEditModal, openTimeModal, statusColors, 
  viewMode, setViewMode, loading, handleQuickStatusChange, 
  setActiveHistoryTask, deleteTask, dynamicFields,
  currentWeekStart, onPrevWeek, onNextWeek
}) {
  const [copiedId, setCopiedId] = useState(null);
  const params = useParams();
  const userId = params?.userId || "admin";
  const orgId = params?.orgId;

  const handleCopyTaskDetails = (task) => {
    const text = `id: ${task._originalId || task._id}\nname: ${task.name}\nproject: ${task.project}\ndate: ${new Date(task.workDate || task.createdAt).toLocaleDateString()}\nbill hours: ${task.bill?.billedHours || 0}`;
    navigator.clipboard.writeText(text);
    setCopiedId(task._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const d = task.workDate ? new Date(task.workDate) : null;
      const key = d ? d.toISOString().split('T')[0] : 'No Date';
      if (!acc[key]) {
        acc[key] = {
          dateObj: d,
          tasks: [],
          allocated: 0,
          billable: 0,
          actual: 0
        };
      }
      acc[key].tasks.push(task);
      acc[key].allocated += task.bill?.allocatedHours || 0;
      acc[key].billable += task.bill?.billedHours || 0;
      acc[key].actual += task.bill?.actualHours || 0;
      return acc;
    }, {});
  }, [tasks]);

  const weekTotals = useMemo(() => {
    return tasks.reduce((sum, task) => sum + (task.bill?.billedHours || 0), 0);
  }, [tasks]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(b) - new Date(a);
    });
  }, [groupedTasks]);

  const [openDate, setOpenDate] = useState(null);
  const hasAutoOpened = useRef(false);

  // Reset auto-open flag when navigating between weeks
  useEffect(() => {
    hasAutoOpened.current = false;
  }, [currentWeekStart]);

  useEffect(() => {
    if (!hasAutoOpened.current && sortedDates.length > 0) {
      setOpenDate(sortedDates[0]);
      hasAutoOpened.current = true;
    }
  }, [sortedDates]);

  const toggleDateCollapse = (dateStr) => {
    setOpenDate(prev => prev === dateStr ? null : dateStr);
  };
  const dateRangeText = useMemo(() => {
    if (!currentWeekStart) return 'Task Directory';
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatStr = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `Week of ${formatStr(start)} - ${formatStr(end)}`;
  }, [currentWeekStart]);

  const weekBadge = useMemo(() => {
    if (!currentWeekStart) return 'Current Week';
    let cwsYear, cwsMonth, cwsDate;
    if (typeof currentWeekStart === 'string' && currentWeekStart.includes('-')) {
      const parts = currentWeekStart.split('T')[0].split('-').map(Number);
      cwsYear = parts[0];
      cwsMonth = parts[1] - 1;
      cwsDate = parts[2];
    } else {
      const d = new Date(currentWeekStart);
      cwsYear = d.getFullYear();
      cwsMonth = d.getMonth();
      cwsDate = d.getDate();
    }
    const cwsTime = new Date(cwsYear, cwsMonth, cwsDate, 0, 0, 0).getTime();

    const now = new Date();
    const todaySun = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0).getTime();
    const diffDays = Math.round((cwsTime - todaySun) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Current Week';
    if (diffDays < 0) return 'Previous Week';
    return 'Next Week';
  }, [currentWeekStart]);

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-[#111115] border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={onPrevWeek}
              title="Previous Week"
              aria-label="Previous Week"
              className="p-1.5 border border-zinc-700 rounded-md hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </button>
            <button 
              onClick={onNextWeek}
              title="Next Week"
              aria-label="Next Week"
              className="p-1.5 border border-zinc-700 rounded-md hover:bg-zinc-800 transition"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm tracking-wide">
              <CalendarIcon className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">{dateRangeText}</span>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ml-2 ${
                weekBadge === 'Current Week' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                weekBadge === 'Previous Week' ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {weekBadge}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium ml-6">Total Billed: {weekTotals.toFixed(2)}h</span>
          </div>
        </div>
        
        <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-transparent text-zinc-400 hover:bg-zinc-800'}`}
          >
            <ListIcon className="w-4 h-4" /> List View
          </button>
          <button 
            onClick={() => setViewMode('cards')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition border-l border-zinc-700 ${viewMode === 'cards' ? 'bg-orange-600 text-white' : 'bg-transparent text-zinc-400 hover:bg-zinc-800'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Card View
          </button>
        </div>
      </div>

      {/* List Body */}
      {viewMode === 'cards' ? (
        <div className="p-4">
          <TaskCards
            loading={loading}
            tasks={tasks}
            handleQuickStatusChange={handleQuickStatusChange}
            setActiveHistoryTask={setActiveHistoryTask}
            openEditModal={openEditModal}
            deleteTask={deleteTask}
            dynamicFields={dynamicFields}
            statusColors={statusColors}
          />
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {sortedDates.map((dateStr) => {
            const group = groupedTasks[dateStr];
            const isCollapsed = openDate !== dateStr;
            const d = group.dateObj;
            const dayText = d ? d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : 'NO';
            const dateNum = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'DATE';
            const variance = group.allocated - group.actual;

            return (
              <div key={dateStr} className="group/day">
                {/* Date Header Row */}
                <div 
                  className="px-6 py-3 bg-[#111115] hover:bg-zinc-900/80 transition cursor-pointer flex items-center justify-between"
                  onClick={() => toggleDateCollapse(dateStr)}
                >
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-orange-500 font-bold text-xs">{dayText}</span>
                      <span className="text-white font-bold text-xs">{dateNum}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-[11px] font-mono font-medium text-zinc-400">
                    <span>Allocated: {group.allocated.toFixed(2)}h</span>
                    <span>Billable: {group.billable.toFixed(2)}h</span>
                    <span>Actual: {group.actual.toFixed(2)}h</span>
                  </div>
                  <div className={`text-[11px] font-bold ${variance < 0 ? 'text-red-500' : 'text-zinc-500'}`} title={variance < 0 ? "Actual hours spent exceeds the allocated hours" : "Actual hours are within the allocated budget"}>
                    {variance < 0 ? `Over by ${Math.abs(variance).toFixed(2)}h` : 'On track'}
                  </div>
                </div>

                {/* Tasks List for the Date */}
                {!isCollapsed && (
                  <div className="bg-[#0a0a0a]">
                    {group.tasks.map(task => {
                      const colorClass = statusColors?.[task.status] || 'bg-zinc-500';
                      const textColorClass = colorClass.replace('bg-', 'text-').replace('500', '400');
                      const bgFadedClass = colorClass.replace('bg-', 'bg-').replace('500', '500/10');

                      return (
                      <div key={task._id} className="flex flex-wrap md:flex-nowrap items-center justify-between px-6 py-4 border-b border-zinc-800/50 hover:bg-zinc-900/40 transition gap-4">
                        {/* Checkbox / Name */}
                        <div className="flex items-start gap-4 w-full md:w-1/3 min-w-0">
                          {task.status === 'completed' || task.status === 'done' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <Link href={`/${orgId}/${userId}/${task._originalId || task._id}`} className="text-white text-sm font-bold truncate leading-tight cursor-pointer hover:text-orange-400 hover:underline transition">
                              {task.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-zinc-500 text-[10px]">Nick: <span className="text-white font-bold">N/A</span></span>
                              <span className="text-zinc-500 text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">by {task.user || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Project / Folder */}
                        <div className="flex items-center gap-2 w-full md:w-1/5 text-zinc-300 text-xs font-medium">
                          <Folder className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="truncate">{task.project || 'No Project'}</span>
                        </div>

                        {/* Status Pill */}
                        <div className="w-full md:w-1/6">
                          <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded border border-zinc-800/80 inline-block ${textColorClass} ${bgFadedClass}`}>
                            {task.status}
                          </span>
                        </div>

                        {/* Hours */}
                        <div className="flex flex-col items-start md:items-center w-full md:w-1/6">
                          <div className="text-xs font-mono font-bold text-zinc-300">
                            {task.bill?.allocatedHours || 0}h / <span className="text-amber-500">{task.bill?.billedHours || 0}h</span> / {task.bill?.actualHours || 0}h
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                          {task.source && (
                            <span className="px-2 py-1 text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">{task.source}</span>
                          )}
                          {task.type && (
                            <span className="px-2 py-1 text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">{task.type}</span>
                          )}
                          <button 
                            onClick={() => handleCopyTaskDetails(task)} 
                            title="Copy details as text"
                            className="p-1.5 text-zinc-500 hover:text-orange-400 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition flex items-center gap-1"
                          >
                            {copiedId === task._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button onClick={() => openEditModal(task)} className="p-1.5 text-zinc-500 hover:text-white rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteTask && deleteTask(task._id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {loading && tasks.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 text-sm font-medium">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">You're all caught up!</h3>
              <p className="text-zinc-500 text-sm">No tasks found for this period.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

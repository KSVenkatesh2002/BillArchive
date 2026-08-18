import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Play, Check, ChevronDown, ChevronRight, Plus, MoreHorizontal, LayoutGrid, List as ListIcon, Filter, Calendar as CalendarIcon, CheckCircle, Clock, Folder, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import TaskCards from './TaskCards';

export default function TaskListView({ 
  tasks, openEditModal, openTimeModal, statusColors, 
  viewMode, setViewMode, loading, handleQuickStatusChange, 
  setActiveHistoryTask, deleteTask, dynamicFields 
}) {
  const params = useParams();
  const userId = params?.userId || "admin";
  const orgId = params?.orgId;

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

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(b) - new Date(a);
    });
  }, [groupedTasks]);

  const [openDate, setOpenDate] = useState(null);
  const hasAutoOpened = useRef(false);

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
    if (sortedDates.length === 0) return 'No tasks found';
    const validDates = sortedDates.filter(d => d !== 'No Date').map(d => new Date(d));
    if (validDates.length === 0) return 'Unscheduled Tasks';
    
    const maxDate = new Date(Math.max(...validDates));
    const minDate = new Date(Math.min(...validDates));
    
    const formatStr = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (minDate.getTime() === maxDate.getTime()) {
      return formatStr(minDate);
    }
    return `${formatStr(minDate)} - ${formatStr(maxDate)}`;
  }, [sortedDates]);



  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-[#111115] border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-zinc-700 rounded-md hover:bg-zinc-800 transition"><ChevronLeft className="w-4 h-4 text-zinc-400" /></button>
            <button className="p-1.5 border border-zinc-700 rounded-md hover:bg-zinc-800 transition"><ChevronRight className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm tracking-wide">
            <CalendarIcon className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Task Directory:</span>
            <span className="text-orange-400">{dateRangeText}</span>
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
                  <div className={`text-[11px] font-bold ${variance < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
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
                          <div className="text-[9px] text-zinc-500 flex gap-2 uppercase tracking-widest mt-0.5">
                            <span>Alloc</span><span>Bill</span><span>Act</span>
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
          
          {tasks.length === 0 && (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-zinc-700" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">You're all caught up!</h3>
              <p className="text-zinc-500 text-sm">No tasks found for this period.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

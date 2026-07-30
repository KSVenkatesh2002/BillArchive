'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, X, FileText, Activity, List, Save } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function LogTimeModal({ isOpen, onClose, tasks, onSubmit }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [allocatedHours, setAllocatedHours] = useState('');
  const [billedHours, setBilledHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [status, setStatus] = useState('');
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.getStatuses()
        .then(data => {
          if (data.success && data.statuses) {
            setStatuses(data.statuses);
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTaskId || !date) return;
    
    onSubmit(selectedTaskId, {
      date,
      allocatedHours: parseFloat(allocatedHours || 0),
      billedHours: parseFloat(billedHours || 0),
      actualHours: parseFloat(actualHours || 0),
      status: status || undefined
    });
    
    // Reset form
    setSelectedTaskId('');
    setDate(new Date().toISOString().split('T')[0]);
    setAllocatedHours('');
    setBilledHours('');
    setActualHours('');
    setStatus('');
  };

  // Get unique parent tasks
  const uniqueTasks = Array.from(new Map(tasks.map(t => [t._originalId || t._id, t])).values());

  // Filter tasks that already have a time entry for the currently selected date
  const availableTasks = useMemo(() => {
    return uniqueTasks.filter(task => {
      if (!task.timeEntries || task.timeEntries.length === 0) return true;
      
      const hasEntryOnDate = task.timeEntries.some(te => {
        if (!te.date) return false;
        try {
          // Compare YYYY-MM-DD
          const teDateStr = new Date(te.date).toISOString().split('T')[0];
          return teDateStr === date;
        } catch (e) {
          return false;
        }
      });
      
      return !hasEntryOnDate;
    });
  }, [uniqueTasks, date]);

  // Reset selected task if it's no longer available for the new date
  useEffect(() => {
    if (selectedTaskId) {
      const stillAvailable = availableTasks.some(t => (t._originalId || t._id) === selectedTaskId);
      if (!stillAvailable) {
        setTimeout(() => setSelectedTaskId(''), 0);
      }
    }
  }, [date, availableTasks, selectedTaskId]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b0b0b] rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Log Time for Existing Task
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="logTimeForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Task Select */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" />
                Select Task
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                required
                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none"
              >
                <option value="" disabled>-- Select an existing task --</option>
                {availableTasks.map(t => (
                  <option key={t._originalId || t._id} value={t._originalId || t._id}>
                    {t.name} {t.project ? `(${t.project})` : ''}
                  </option>
                ))}
              </select>
              {availableTasks.length === 0 && (
                <p className="text-[10px] text-red-400 mt-1">All tasks already have logged time for this date.</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                Work Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Status Option */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Update Task Status (Optional)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none uppercase"
              >
                <option value="">-- No Change --</option>
                {(statuses.length > 0 ? statuses : ['inprocess', 'dev', 'ready for qa', 'qa complete', 'complete', 'need approval']).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Hours */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Allocated</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={allocatedHours}
                  onChange={(e) => setAllocatedHours(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider text-orange-400">Billed</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={billedHours}
                  onChange={(e) => setBilledHours(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-[#0d0d0d] border border-orange-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/80 transition-all text-center placeholder:text-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Actual</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all text-center"
                />
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800/80 bg-black/50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="logTimeForm"
            className="px-5 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-400 text-black transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Save className="w-4 h-4" />
            Log Time
          </button>
        </div>

      </div>
    </div>
  );
}

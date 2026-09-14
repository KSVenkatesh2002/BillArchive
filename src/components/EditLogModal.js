"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { CONFIG } from "@/lib/config";

export default function EditLogModal({
  isOpen,
  onClose,
  logEntry,
  onSave,
  saving = false,
  statuses = []
}) {
  const [date, setDate] = useState("");
  const [allocatedHours, setAllocatedHours] = useState(0);
  const [billedHours, setBilledHours] = useState(0);
  const [actualHours, setActualHours] = useState(0);
  const [status, setStatus] = useState("inprocess");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (logEntry) {
      // Format date for date picker input (YYYY-MM-DD)
      let formattedDate = "";
      if (logEntry.date) {
        const d = new Date(logEntry.date);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }
      if (!formattedDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }

      setDate(formattedDate);
      setAllocatedHours(logEntry.allocatedHours ?? logEntry.bill?.allocatedHours ?? 0);
      setBilledHours(logEntry.billedHours ?? logEntry.bill?.billedHours ?? 0);
      setActualHours(logEntry.actualHours ?? logEntry.bill?.actualHours ?? 0);
      setStatus(logEntry.status || "inprocess");
      setNote(logEntry.note || "");
      setError("");
    }
  }, [logEntry, isOpen]);

  if (!isOpen || !logEntry) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Log date is required");
      return;
    }

    try {
      await onSave({
        taskId: logEntry.taskId || logEntry._originalId || logEntry._id,
        entryId: logEntry.entryId || logEntry._entryId,
        date: new Date(date).toISOString(),
        allocatedHours: parseFloat(allocatedHours) || 0,
        billedHours: parseFloat(billedHours) || 0,
        actualHours: parseFloat(actualHours) || 0,
        status,
        note
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save log details");
    }
  };

  const activeStatuses = statuses.length > 0 ? statuses : [
    "inprocess",
    "dev",
    "ready for qa",
    "qa complete",
    "ready for code review",
    "code review complete",
    "complete",
    "need approval"
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Log Details</h2>
              <p className="text-xs text-zinc-400 truncate max-w-[280px]">
                Task: <span className="text-zinc-200 font-medium">{logEntry.name || logEntry.taskName || "Time Entry Log"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Log Date */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Log Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition"
              required
            />
          </div>

          {/* Hours Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Allocated (h)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Billed (h)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={billedHours}
                onChange={(e) => setBilledHours(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Actual (h)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono text-center"
              />
            </div>
          </div>

          {/* Log Status */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 capitalize cursor-pointer"
            >
              {activeStatuses.map((s) => (
                <option key={s} value={s} className="bg-black text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Note / Description */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              Log Note / Description
            </label>
            <textarea
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe work completed in this time log..."
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving Log Details...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Log Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

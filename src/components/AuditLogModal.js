'use client';

import { History } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'inprocess', label: 'In Process' },
  { id: 'dev', label: 'Development' },
  { id: 'ready for qa', label: 'Ready for QA' },
  { id: 'qa complete', label: 'QA Complete' },
  { id: 'ready for code review', label: 'Ready for CR' },
  { id: 'code review complete', label: 'CR Complete' },
  { id: 'complete', label: 'Complete' },
  { id: 'need approval', label: 'Need Approval' },
];

export default function AuditLogModal({ task, onClose }) {
  if (!task) return null;
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>Task Status History</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Audit log timeline for: {task.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 font-sans">
          {(task.statusHistory && task.statusHistory.length > 0) ? (
            task.statusHistory.map((history, idx) => {
              const opt = STATUS_OPTIONS.find(s => s.id === history.status) || { label: history.status };
              return (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== task.statusHistory.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-zinc-800"></div>
                  )}
                  <div className="w-5 h-5 rounded-full bg-zinc-900 border border-indigo-500/30 flex items-center justify-center shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      Changed to <span className="text-indigo-400 font-mono">[{opt.label}]</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      by {history.changedBy || 'System'} • {new Date(history.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-zinc-500 text-center py-4">No audit timeline recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

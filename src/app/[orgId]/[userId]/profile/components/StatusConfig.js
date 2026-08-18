"use client";

import { useState, useEffect } from "react";
import { Settings, RefreshCw } from "lucide-react";
import SectionCard from "@/components/SectionCard";
import { CONFIG } from "@/lib/config";

export default function StatusConfig({ statuses = [], statusColors = {}, onSave, saving }) {
  const [colors, setColors] = useState({});

  useEffect(() => {
    setColors(statusColors);
  }, [statusColors]);

  const handleColorChange = (status, colorValue) => {
    setColors(prev => ({ ...prev, [status]: colorValue }));
  };

  const handleSave = () => {
    onSave(colors);
  };

  return (
    <SectionCard>
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-500" />
          <span>Status Color Configuration</span>
        </h3>
        <p className="text-[10.5px] text-zinc-405 mt-1">
          Assign a distinct color to each task status for your organization.
        </p>
      </div>

      <div className="space-y-4 mt-4">
        <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
          {statuses.length === 0 ? (
            <div className="text-center py-6 text-zinc-555 text-xs">
              No statuses available.
            </div>
          ) : (
            statuses.map((status) => {
              const currentColor = colors[status] || 'bg-zinc-500';
              return (
                <div key={status} className="p-3 bg-black border border-zinc-800 rounded-xl flex justify-between items-center group relative">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${currentColor}`}></div>
                    <span className="text-xs font-semibold text-zinc-300 uppercase">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={currentColor}
                      onChange={(e) => handleColorChange(status, e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {CONFIG.COLOR_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Status Colors"
          )}
        </button>
      </div>
    </SectionCard>
  );
}

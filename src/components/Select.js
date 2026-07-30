import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, value, onChange, options, children, className = '', containerClassName = '' }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer ${className}`}
        >
          {options && options.map((opt, idx) => (
            <option key={opt.value ?? idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

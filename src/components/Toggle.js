import React from 'react';

export default function Toggle({ label, checked, onChange, disabled, containerClassName = '' }) {
  return (
    <label className={containerClassName}>
      {label && <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1 mb-1.5">{label}</span>}
      <div className="relative inline-block w-10 h-6 shrink-0 cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? 'bg-orange-500' : 'bg-zinc-700'
          }`}
        />
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

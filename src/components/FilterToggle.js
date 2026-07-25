'use client';

export default function FilterToggle({ label, value, options, onChange, activeColorClass }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{label}</label>
      <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
              value === opt.id
                ? activeColorClass || 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

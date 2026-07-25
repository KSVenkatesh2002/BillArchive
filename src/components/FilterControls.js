'use client';

import FilterToggle from './FilterToggle';

const SOURCE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'dialedin', label: 'Dialedin' },
  { id: 'fluent', label: 'Fluent' },
];

const WORK_TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'dev', label: 'Dev' },
  { id: 'qa', label: 'QA' },
];

export default function FilterControls({
  filterSource,
  setFilterSource,
  filterType,
  setFilterType,
  filterProject,
  setFilterProject,
  filterTimeframe,
  setFilterTimeframe,
  uniqueProjects,
  tasksLength,
}) {
  return (
    <div className="bg-[#0b0b0b] p-4 rounded-2xl border border-zinc-800/80 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Source Filter */}
        <FilterToggle
          label="Source"
          value={filterSource}
          options={SOURCE_OPTIONS}
          onChange={setFilterSource}
        />

        {/* Type of Work Filter */}
        <FilterToggle
          label="Type of Work"
          value={filterType}
          options={WORK_TYPE_OPTIONS}
          onChange={setFilterType}
          activeColorClass="bg-cyan-600 text-white shadow"
        />

        {/* Project Filter */}
        {setFilterProject && filterProject !== undefined && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        {/* Timeframe Filter */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Timeframe</label>
          <select
            value={filterTimeframe}
            onChange={(e) => setFilterTimeframe(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="1w">Past 1 Week</option>
            <option value="1m">Past 1 Month</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-zinc-400 font-medium">
        Showing <span className="text-white font-bold">{tasksLength}</span> tasks
      </div>
    </div>
  );
}

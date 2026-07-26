'use client';

import { useMemo } from 'react';
import FilterToggle from './FilterToggle';

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
  dynamicFields = [],
  customFilters = {},
  setCustomFilters = () => {}
}) {
  const sourceField = dynamicFields.find(f => f.name === 'source');
  const typeOfWorkField = dynamicFields.find(f => f.name === 'typeOfWork');
  const projectField = dynamicFields.find(f => f.name === 'project');

  const sourceOptions = useMemo(() => {
    if (!sourceField) return [];
    return [
      { id: 'all', label: 'All' },
      ...(sourceField.options || []).map(opt => ({ id: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))
    ];
  }, [sourceField]);

  const workTypeOptions = useMemo(() => {
    if (!typeOfWorkField) return [];
    return [
      { id: 'all', label: 'All' },
      ...(typeOfWorkField.options || []).map(opt => ({ id: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))
    ];
  }, [typeOfWorkField]);

  const projectOptions = useMemo(() => {
    const opts = new Set(uniqueProjects);
    if (projectField?.options) {
      projectField.options.forEach(opt => opts.add(opt));
    }
    return Array.from(opts);
  }, [uniqueProjects, projectField]);

  return (
    <div className="bg-[#0b0b0b] p-4 rounded-2xl border border-zinc-800/80 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Source Filter */}
        {sourceField && (
          <FilterToggle
            label="Source"
            value={filterSource}
            options={sourceOptions}
            onChange={setFilterSource}
          />
        )}

        {/* Type of Work Filter */}
        {typeOfWorkField && (
          <FilterToggle
            label="Type of Work"
            value={filterType}
            options={workTypeOptions}
            onChange={setFilterType}
            activeColorClass="bg-cyan-600 text-white shadow"
          />
        )}

        {/* Dynamic Custom Filters */}
        {dynamicFields
          .filter(f => f.name !== 'source' && f.name !== 'typeOfWork' && f.name !== 'project')
          .map(field => {
            const value = customFilters[field.name] || 'all';
            const onChange = (val) => setCustomFilters(prev => ({ ...prev, [field.name]: val }));

            const options = field.type === 'toggle'
              ? [
                  { id: 'all', label: 'All' },
                  { id: 'true', label: 'Yes' },
                  { id: 'false', label: 'No' }
                ]
              : [
                  { id: 'all', label: 'All' },
                  ...(field.options || []).map(opt => ({ id: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))
                ];

            return (
              <FilterToggle
                key={field.name}
                label={field.label}
                value={value}
                options={options}
                onChange={onChange}
              />
            );
          })}

        {/* Project Filter */}
        {projectField && setFilterProject && filterProject !== undefined && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Projects</option>
              {projectOptions.map((p) => (
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

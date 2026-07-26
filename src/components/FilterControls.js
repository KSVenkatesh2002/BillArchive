'use client';

import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FilterToggle from './FilterToggle';
import {
  setFilterSource,
  setFilterType,
  setFilterProject,
  setFilterTimeframe,
  updateCustomFilter
} from '@/lib/store/taskSlice';

export default function FilterControls(props) {
  const dispatch = useDispatch();

  // Select state from Redux store with fallback to props if passed
  const storeDynamicFields = useSelector((state) => state.org.dynamicFields);
  const storeTasks = useSelector((state) => state.tasks.tasks);
  const storeFilterSource = useSelector((state) => state.tasks.filterSource);
  const storeFilterType = useSelector((state) => state.tasks.filterType);
  const storeFilterProject = useSelector((state) => state.tasks.filterProject);
  const storeFilterTimeframe = useSelector((state) => state.tasks.filterTimeframe);
  const storeCustomFilters = useSelector((state) => state.tasks.customFilters);

  const dynamicFields = props.dynamicFields || storeDynamicFields || [];
  const filterSource = props.filterSource ?? storeFilterSource;
  const filterType = props.filterType ?? storeFilterType;
  const filterProject = props.filterProject ?? storeFilterProject;
  const filterTimeframe = props.filterTimeframe ?? storeFilterTimeframe;
  const customFilters = props.customFilters || storeCustomFilters || {};
  const tasksLength = props.tasksLength ?? storeTasks.length;

  const handleSourceChange = (val) => {
    if (props.setFilterSource) props.setFilterSource(val);
    else dispatch(setFilterSource(val));
  };

  const handleTypeChange = (val) => {
    if (props.setFilterType) props.setFilterType(val);
    else dispatch(setFilterType(val));
  };

  const handleProjectChange = (val) => {
    if (props.setFilterProject) props.setFilterProject(val);
    else dispatch(setFilterProject(val));
  };

  const handleTimeframeChange = (val) => {
    if (props.setFilterTimeframe) props.setFilterTimeframe(val);
    else dispatch(setFilterTimeframe(val));
  };

  const handleCustomFilterChange = (key, val) => {
    if (props.setCustomFilters) {
      props.setCustomFilters((prev) => ({ ...prev, [key]: val }));
    } else {
      dispatch(updateCustomFilter({ key, value: val }));
    }
  };

  const sourceField = dynamicFields.find((f) => f.name === 'source');
  const typeOfWorkField = dynamicFields.find((f) => f.name === 'typeOfWork');
  const projectField = dynamicFields.find((f) => f.name === 'project');

  const sourceOptions = useMemo(() => {
    if (!sourceField) return [];
    return [
      { id: 'all', label: 'All' },
      ...(sourceField.options || []).map((opt) => ({
        id: opt,
        label: opt.charAt(0).toUpperCase() + opt.slice(1)
      }))
    ];
  }, [sourceField]);

  const workTypeOptions = useMemo(() => {
    if (!typeOfWorkField) return [];
    return [
      { id: 'all', label: 'All' },
      ...(typeOfWorkField.options || []).map((opt) => ({
        id: opt,
        label: opt.charAt(0).toUpperCase() + opt.slice(1)
      }))
    ];
  }, [typeOfWorkField]);

  const projectOptions = useMemo(() => {
    const opts = new Set(props.uniqueProjects || storeTasks.map((t) => t.project).filter(Boolean));
    if (projectField?.options) {
      projectField.options.forEach((opt) => opts.add(opt));
    }
    return Array.from(opts);
  }, [props.uniqueProjects, storeTasks, projectField]);

  return (
    <div className="bg-[#0b0b0b] p-4 rounded-2xl border border-zinc-800/80 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Source Filter */}
        {sourceField && (
          <FilterToggle
            label="Source"
            value={filterSource}
            options={sourceOptions}
            onChange={handleSourceChange}
          />
        )}

        {/* Type of Work Filter */}
        {typeOfWorkField && (
          <FilterToggle
            label="Type of Work"
            value={filterType}
            options={workTypeOptions}
            onChange={handleTypeChange}
            activeColorClass="bg-cyan-600 text-white shadow"
          />
        )}

        {/* Dynamic Custom Filters */}
        {dynamicFields
          .filter((f) => f.name !== 'source' && f.name !== 'typeOfWork' && f.name !== 'project')
          .map((field) => {
            const value = customFilters[field.name] || 'all';
            const onChange = (val) => handleCustomFilterChange(field.name, val);

            const options =
              field.type === 'toggle'
                ? [
                    { id: 'all', label: 'All' },
                    { id: 'true', label: 'Yes' },
                    { id: 'false', label: 'No' }
                  ]
                : [
                    { id: 'all', label: 'All' },
                    ...(field.options || []).map((opt) => ({
                      id: opt,
                      label: opt.charAt(0).toUpperCase() + opt.slice(1)
                    }))
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
        {projectField && (
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Projects</option>
              {projectOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Timeframe Filter */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Timeframe</label>
          <select
            value={filterTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
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

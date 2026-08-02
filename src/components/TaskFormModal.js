'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit3, PlusCircle, Lightbulb, ChevronDown } from 'lucide-react';
import Select from './Select';
import Toggle from './Toggle';
import { DEFAULT_ENABLED_FIELDS, fetchOrgConfig } from '@/lib/store/orgSlice';
import { apiClient } from '@/lib/apiClient';

export default function TaskFormModal({ show, onClose, onSubmit, form, onChange, isEdit, inline = false, isSubmitting = false }) {
  const dispatch = useDispatch();
  const orgLoading = useSelector((state) => state.org?.loading);
  const orgError = useSelector((state) => state.org?.error);
  const organization = useSelector((state) => state.org?.organization);
  const storeEnabledFields = useSelector((state) => state.org?.enabledFields);
  const enabledFields = { ...DEFAULT_ENABLED_FIELDS, ...(storeEnabledFields || {}) };

  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [userPrefs, setUserPrefs] = useState({});

  useEffect(() => {
    if (!show) return;

    // Fetch projects (for fallback or general use)
    apiClient.getProjects()
      .then((data) => {
        if (data.success) {
          setProjects(data.projects || []);
        }
      })
      .catch((err) => console.error(err));

    // Fetch statuses
    apiClient.getStatuses()
      .then((data) => {
        if (data.success) {
          setStatuses(data.statuses || []);
        } else {
          console.error('Failed to load statuses:', data.error);
          setStatuses([]);
        }
      })
      .catch((err) => {
        console.error('Network error loading statuses:', err);
        setStatuses([]);
      });

    // Fetch organization dynamic fields and user preferences via Redux dispatch
    Promise.all([
      dispatch(fetchOrgConfig()).unwrap(),
      apiClient.getUserPreferences()
    ]).then(([orgData, prefData]) => {
      let fields = orgData?.dynamicFields ? orgData.dynamicFields : [];

      // Ensure Project field is always present, since it is a core property
      if (!fields.some(f => f.name === 'project')) {
        fields = [
          { name: 'project', label: 'Project', type: 'dropdown', options: [] },
          ...fields
        ];
      }

      const prefs = prefData.success && prefData.preferences?.fieldDefaults ? prefData.preferences.fieldDefaults : {};

      setDynamicFields(fields);
      setUserPrefs(prefs);

      // Seed default dynamic values on creation if not set yet
      if (!isEdit && (!form.dynamicValues || Object.keys(form.dynamicValues).length === 0)) {
        const initialVals = {};
        fields.forEach((f) => {
          initialVals[f.name] = prefs[f.name] ?? f.defaultValue ?? '';
        });
        onChange({
          ...form,
          dynamicValues: initialVals,
          project: initialVals.project || form.project || ''
        });
      }
    }).catch((err) => console.error('Failed to load dynamic fields / preferences:', err));

  }, [show, isEdit]);

  if (!show) return null;

  const handleLinkInput = (e) => {
    onChange({
      ...form,
      clickupId: e.target.value,
    });
  };

  const handleNewProjectChange = (e) => {
    const val = e.target.value;
    setNewProjectName(val);
    onChange({
      ...form,
      project: val,
      dynamicValues: {
        ...(form.dynamicValues || {}),
        project: val
      }
    });
  };

  const handleWrapperSubmit = async (e) => {
    e.preventDefault();
    if (isAddingNewProject && newProjectName.trim()) {
      try {
        await apiClient.createProject(newProjectName.trim());
      } catch (err) {
        console.error('Failed to save project to db:', err);
      }
    }
    onSubmit(e);
  };

  const isLoading = orgLoading || !organization;

  if (isLoading) {
    const loadingContent = (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full md:max-w-3xl lg:max-w-4xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-semibold text-zinc-400">Loading Task Configuration...</p>
      </div>
    );
    if (inline) return loadingContent;
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        {loadingContent}
      </div>
    );
  }

  if (orgError) {
    const errorContent = (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full md:max-w-3xl lg:max-w-4xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl max-w-md w-full text-center">
          <h3 className="font-bold mb-2">Configuration Error</h3>
          <p className="text-sm">{orgError}</p>
          {!inline && (
            <button onClick={onClose} className="mt-5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition">
              Close
            </button>
          )}
        </div>
      </div>
    );
    if (inline) return errorContent;
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        {errorContent}
      </div>
    );
  }

  const formContent = (
    <div 
      className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full md:max-w-3xl lg:max-w-4xl p-6 shadow-2xl animate-fadeIn max-h-[95vh] overflow-y-auto custom-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {isEdit ? <Edit3 className="w-5 h-5 text-orange-500" /> : <PlusCircle className="w-5 h-5 text-orange-500" />}
          <span>{isEdit ? 'Edit Task Details' : 'Create New Task'}</span>
        </h3>
        {!inline && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleWrapperSubmit} className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* LEFT COLUMN - Core Details */}
        <div className="space-y-5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700"></span> Core Details
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Task Name <span className="text-orange-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Build Payment Gateway"
              value={form.name || ''}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
              required
            />
          </div>

          {/* ClickUp Link Input */}
          {enabledFields.clickupId !== false && (
            <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/80">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ClickUp Link / Task ID</label>
              <input
                type="text"
                placeholder="e.g. https://app.clickup.com/t/86d3tn93v or 86d3tn93v"
                value={form.clickupId || ''}
                onChange={handleLinkInput}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 hover:border-zinc-700 transition-colors"
              />
              <p className="text-[10px] text-zinc-500 mt-2 flex items-start gap-1.5 leading-relaxed">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Pasting a link will store it as a clickable ClickUp ID shortcut in reports.</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Task Status"
              value={form.status || 'inprocess'}
              onChange={(e) => onChange({ ...form, status: e.target.value })}
              options={statuses.map(s => ({ value: s || '', label: (s || '').toUpperCase() }))}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Work Date / Start Date</label>
              <input
                type="date"
                value={form.workDate ? new Date(form.workDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => onChange({ ...form, workDate: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 text-zinc-200 hover:border-zinc-700 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Additional Properties */}
        <div className="space-y-5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700"></span> Properties & Metrics
          </div>
          
          {/* Dynamic Fields Section */}
          {dynamicFields.length > 0 && (
            <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                {dynamicFields.filter(f => f.name !== 'project' || enabledFields.project !== false).map((field) => {
                  const val = form.dynamicValues?.[field.name] ?? userPrefs[field.name] ?? field.defaultValue ?? '';

                  const handleFieldChange = async (newVal) => {
                    if (field.name === 'project' && newVal === '__add_new__') {
                      setIsAddingNewProject(true);
                      onChange({
                        ...form,
                        dynamicValues: {
                          ...(form.dynamicValues || {}),
                          project: '',
                        },
                        project: '',
                      });
                      return;
                    }

                    if (field.name === 'project') {
                      setIsAddingNewProject(false);
                    }

                    onChange({
                      ...form,
                      dynamicValues: {
                        ...(form.dynamicValues || {}),
                        [field.name]: newVal,
                      },
                      ...(field.name === 'project' ? { project: newVal } : {}),
                    });
                  };

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-350">{field.label}</label>

                      {field.type === 'dropdown' ? (
                        <Select
                          value={val}
                          onChange={(e) => handleFieldChange(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
                        >
                          <option value="" disabled className="bg-black text-zinc-650">Select Option</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt} className="bg-black text-white">
                              {opt}
                            </option>
                          ))}
                          {field.name === 'project' && (
                            <>
                              {projects.filter(proj => !(field.options || []).includes(proj)).map((proj) => (
                                <option key={proj} value={proj} className="bg-black text-white">
                                  {proj}
                                </option>
                              ))}
                              <option value="__add_new__" className="bg-zinc-900 text-orange-400 font-bold">
                                + Add New Project
                              </option>
                            </>
                          )}
                        </Select>
                      ) : field.type === 'pill' ? (
                        <div className="flex flex-wrap gap-2">
                          {(field.options || []).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleFieldChange(opt)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition border ${
                                val === opt 
                                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/20' 
                                  : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                          {field.name === 'project' && (
                            <>
                              {projects.filter(proj => !(field.options || []).includes(proj)).map((proj) => (
                                <button
                                  key={proj}
                                  type="button"
                                  onClick={() => handleFieldChange(proj)}
                                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition border ${
                                    val === proj 
                                      ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/20' 
                                      : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                                  }`}
                                >
                                  {proj}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleFieldChange('__add_new__')}
                                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition bg-zinc-900 border border-zinc-700 text-orange-400 hover:text-orange-300 hover:bg-zinc-800"
                              >
                                + Add Project
                              </button>
                            </>
                          )}
                        </div>
                      ) : field.type === 'text' ? (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleFieldChange(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 hover:border-zinc-700 transition-colors"
                          placeholder={`Enter ${field.label}...`}
                        />
                      ) : field.type === 'toggle' ? (
                        <div className="py-1">
                          <Toggle
                            checked={!!val}
                            onChange={(checked) => handleFieldChange(checked)}
                          />
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) => handleFieldChange(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 text-orange-600 focus:ring-orange-500 bg-black accent-orange-600 cursor-pointer"
                          />
                          <span className="text-xs text-zinc-400">Enable {field.label}</span>
                        </div>
                      ) : null}

                      {field.name === 'project' && isAddingNewProject && (
                        <div className="mt-3 animate-fadeIn">
                          <input
                            type="text"
                            placeholder="Type new project name..."
                            value={newProjectName}
                            onChange={handleNewProjectChange}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 shadow-inner transition-all"
                            required
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Billing Hours Breakdown */}
          {(enabledFields.allocatedHours !== false || enabledFields.billedHours !== false || enabledFields.actualHours !== false) && (
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
              <div className="text-[10px] font-bold text-orange-450 uppercase tracking-wider flex items-center gap-2">
                Billing Hours Metrics
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {enabledFields.allocatedHours !== false && (
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Allocated</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={form.allocatedHours || ''}
                      onChange={(e) => onChange({ ...form, allocatedHours: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 hover:border-zinc-700 transition-colors"
                    />
                  </div>
                )}
                {enabledFields.billedHours !== false && (
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Billed</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={form.billedHours || ''}
                      onChange={(e) => onChange({ ...form, billedHours: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 hover:border-zinc-700 transition-colors"
                    />
                  </div>
                )}
                {enabledFields.actualHours !== false && (
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Actual</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={form.actualHours || ''}
                      onChange={(e) => onChange({ ...form, actualHours: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 hover:border-zinc-700 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Collapsible Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-bold text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              <span>{showAdvanced ? 'Hide Optional Fields' : 'Show Optional Fields (Nickname)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl animate-fadeIn">
                <label className="block text-xs font-semibold text-zinc-350 mb-1.5">Nick Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pay-GW"
                  value={form.nickName || ''}
                  onChange={(e) => onChange({ ...form, nickName: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON - Spans full width */}
        <div className="lg:col-span-2 pt-4 mt-2 border-t border-zinc-800/50">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isSubmitting 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/25 hover:shadow-orange-500/40'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              isEdit ? 'Save Task Changes' : 'Create New Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return formContent;
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {formContent}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Zap, LayoutGrid, List, FileText, Plus } from 'lucide-react';

// Import Redux Actions & Thunks
import { checkAuth, logout } from '@/lib/store/authSlice';
import { fetchOrgConfig } from '@/lib/store/orgSlice';
import {
  fetchTasks,
  setFilterSource,
  setFilterType,
  setFilterProject,
  setFilterTimeframe,
  setCustomFilters,
  setActiveHistoryTask,
  deleteTask,
  createTask,
  updateTask,
  addTimeEntry
} from '@/lib/store/taskSlice';

// Import child components
import MetricsBar from '@/components/MetricsBar';
import FilterControls from '@/components/FilterControls';
import TaskTable from '@/components/TaskTable';
import TaskCards from '@/components/TaskCards';
import Toast from '@/components/Toast';
import AuditLogModal from '@/components/AuditLogModal';
import TaskFormModal from '@/components/TaskFormModal';
import LogTimeModal from '@/components/LogTimeModal';
import EditLogModal from '@/components/EditLogModal';
import TaskListView from '@/components/TaskListView';
import { CONFIG } from '@/lib/config';
import { apiClient } from '@/lib/apiClient';

export default function UserDashboard() {
  const { userId, orgId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Select states from Redux store
  const { currentUser } = useSelector((state) => state.auth);
  const { dynamicFields, enabledFields } = useSelector((state) => state.org);
  const {
    tasks,
    loading,
    page,
    hasMore,
    isDemo,
    metrics,
    filterSource,
    filterType,
    filterProject,
    filterTimeframe,
    customFilters,
    activeHistoryTask
  } = useSelector((state) => state.tasks);

  // Local UI states (viewMode, modals, toast)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const parts = String(dateStr).split('T')[0].split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const weekStartParam = searchParams.get('weekStart');
    if (weekStartParam) {
      const parsed = parseLocalDate(weekStartParam);
      if (parsed) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Sunday
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    const dStr = formatLocalDate(currentWeekStart);
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get('weekStart') !== dStr) {
      newParams.set('weekStart', dStr);
      router.replace(`/${orgId}/${userId}?${newParams.toString()}`, { scroll: false });
    }
  }, [currentWeekStart, searchParams, orgId, userId, router]);

  const [viewMode, setViewMode] = useState('table');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingLogEntry, setEditingLogEntry] = useState(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    clickupId: '',
    dynamicValues: {}
  });
  const [initialTaskForm, setInitialTaskForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgStatuses, setOrgStatuses] = useState([]);
  const [toastMessage, setToastMessage] = useState('');


  // Check auth
  const handleCheckAuth = async () => {
    if (userId === 'undefined' || orgId === 'undefined') {
      router.push('/');
      return;
    }

    try {
      const user = await dispatch(checkAuth()).unwrap();
      if (user) {
        if (user.id !== userId || user.orgId !== orgId) {
          if (user.role !== 'superAdmin' && !user.orgId) {
            alert('Your account is not linked to any organization. Please contact an administrator.');
            return;
          }
          router.push(`/${user.orgId}/${user.id}`);
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  // Fetch paginated tasks
  const handleFetchTasks = (pageNum, reset = false) => {
    dispatch(fetchTasks({ pageNum, reset }));
  };

  const handleFetchOrgConfig = async () => {
    try {
      const orgData = await dispatch(fetchOrgConfig()).unwrap();
      if (orgData) {
        const fields = orgData.dynamicFields || [];

        // Seed default filter values from organization config
        const sourceField = fields.find(f => f.name === 'source');
        if (sourceField?.defaultValue && dynamicFields.length === 0) {
          dispatch(setFilterSource(sourceField.defaultValue));
        }

        const typeField = fields.find(f => f.name === 'typeOfWork');
        if (typeField?.defaultValue && dynamicFields.length === 0) {
          dispatch(setFilterType(typeField.defaultValue));
        }

        const projectField = fields.find(f => f.name === 'project');
        if (projectField?.defaultValue && dynamicFields.length === 0) {
          dispatch(setFilterProject(projectField.defaultValue));
        }

        const initialCustomFilters = {};
        if (Object.keys(initialCustomFilters).length > 0) {
          dispatch(setCustomFilters(initialCustomFilters));
        }
      }
    } catch (err) {
      console.error('Failed to load organization config:', err);
    }
  };

  useEffect(() => {
    handleCheckAuth();
    handleFetchOrgConfig();
    dispatch(setFilterProject('all')); // Reset project filter when entering dashboard
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => setViewMode('cards'), 0);
    }
  }, []);

  // Reload tasks when filters change
  useEffect(() => {
    const startIso = new Date(currentWeekStart).toISOString();
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const endIso = end.toISOString();

    if (customFilters.startDate !== startIso || customFilters.endDate !== endIso) {
      dispatch(setCustomFilters({
        ...customFilters,
        startDate: startIso,
        endDate: endIso
      }));
    } else {
      handleFetchTasks(1, true);
    }
  }, [filterSource, filterType, filterProject, filterTimeframe, customFilters, currentWeekStart]);

  const handlePrevWeek = () => {
    dispatch(setFilterTimeframe('all'));
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    dispatch(setFilterTimeframe('all'));
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // Load next page on scroll reach end
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
      hasMore &&
      !loading
    ) {
      const nextPage = page + 1;
      handleFetchTasks(nextPage, false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, page]);

  // Handle Logout
  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    triggerToast('Logged out successfully');
    router.push('/');
  };

  // Quick Status change directly from the desktop list
  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const data = await dispatch(updateTask({ taskId, updateData: { status: newStatus } })).unwrap();
      if (data.success) {
        triggerToast(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save (Create or Edit Mode)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const projectVal = taskForm.dynamicValues?.project || taskForm.project;
    if (!taskForm.name) {
      alert("Please enter a task name.");
      return;
    }
    if (!projectVal) {
      alert("Please select a project.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: taskForm.name,
        nickName: taskForm.nickName || '',
        status: taskForm.status,
        project: projectVal || '',
        source: taskForm.dynamicValues?.source || taskForm.source || undefined,
        typeOfWork: taskForm.dynamicValues?.typeOfWork || taskForm.typeOfWork || undefined,
        clickupId: taskForm.clickupId,
        dynamicValues: taskForm.dynamicValues || {},
        workDate: taskForm.workDate,
        bill: {
          allocatedHours: parseFloat(taskForm.allocatedHours || 0),
          billedHours: parseFloat(taskForm.billedHours || 0),
          actualHours: parseFloat(taskForm.actualHours || 0),
        }
      };

      let data;
      if (editingTask) {
        const targetTaskId = editingTask._originalId || editingTask._id;
        
        if (editingTask._entryId) {
          // If editing a specific time entry log, update the log hours first!
          await apiClient.updateTimeEntry(targetTaskId, editingTask._entryId, {
            date: taskForm.workDate,
            allocatedHours: parseFloat(taskForm.allocatedHours || 0),
            billedHours: parseFloat(taskForm.billedHours || 0),
            actualHours: parseFloat(taskForm.actualHours || 0)
          });
          // Remove 'bill' from payload so we don't overwrite the task summary
          delete payload.bill;
        }
        
        data = await dispatch(updateTask({ taskId: targetTaskId, updateData: payload })).unwrap();
      } else {
        data = await dispatch(createTask(payload)).unwrap();
      }

      if (data.success) {
        setShowTaskModal(false);
        setEditingTask(null);
        triggerToast(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
      } else {
        alert(data.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogTimeSubmit = async (taskId, entryData) => {
    try {
      const data = await dispatch(addTimeEntry({ taskId, entry: entryData })).unwrap();
      if (data.success) {
        setShowLogTimeModal(false);
        triggerToast('Time logged successfully!');
      } else {
        alert(data.error || 'Failed to log time.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while logging time.');
    }
  };

  const handleSaveLogEntry = async (logData) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.updateTimeEntry(logData.taskId, logData.entryId, {
        date: logData.date,
        allocatedHours: logData.allocatedHours,
        billedHours: logData.billedHours,
        actualHours: logData.actualHours,
        status: logData.status,
        note: logData.note
      });

      if (res.success) {
        setShowEditLogModal(false);
        setEditingLogEntry(null);
        triggerToast('Log entry details updated successfully!');
        handleFetchTasks(page, true);
      } else {
        alert(res.error || 'Failed to update log details.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update log details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (task) => {
    const targetTaskId = task._originalId || (task._id && task._id.includes('::') ? task._id.split('::')[0] : task._id);
    const originalTask = tasks.find(t => t._id === targetTaskId) || task;

    const entryId = task._entryId || (task._id && task._id.includes('::') ? task._id.split('::')[1] : null);

    if (entryId || (originalTask.timeEntries && originalTask.timeEntries.length > 0)) {
      const targetEntryId = entryId || (originalTask.timeEntries?.[0]?._id || originalTask.timeEntries?.[0]?.id);
      const entry = originalTask.timeEntries?.find(e => String(e._id || e.id) === String(targetEntryId)) || originalTask.timeEntries?.[0];

      setEditingLogEntry({
        taskId: originalTask._id,
        entryId: targetEntryId,
        taskName: originalTask.name,
        name: originalTask.name,
        date: entry ? entry.date : (task.workDate || originalTask.workDate),
        allocatedHours: entry ? entry.allocatedHours : (task.bill?.allocatedHours ?? originalTask.bill?.allocatedHours ?? 0),
        billedHours: entry ? entry.billedHours : (task.bill?.billedHours ?? originalTask.bill?.billedHours ?? 0),
        actualHours: entry ? entry.actualHours : (task.bill?.actualHours ?? originalTask.bill?.actualHours ?? 0),
        status: originalTask.status,
        note: entry ? entry.note : ''
      });
      setShowEditLogModal(true);
      return;
    }

    // Otherwise, edit parent task metadata
    setEditingTask(originalTask);
    const newForm = {
      name: originalTask.name,
      nickName: originalTask.nickName || '',
      status: originalTask.status,
      project: originalTask.project,
      source: originalTask.source,
      typeOfWork: originalTask.typeOfWork,
      allocatedHours: originalTask.bill?.allocatedHours || '',
      billedHours: originalTask.bill?.billedHours || '',
      actualHours: originalTask.bill?.actualHours || '',
      clickupId: originalTask.clickupId || '',
      dynamicValues: originalTask.dynamicValues || {},
      workDate: originalTask.workDate
    };
    setTaskForm(newForm);
    setInitialTaskForm(JSON.stringify(newForm));
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await dispatch(deleteTask(id)).unwrap();
      triggerToast('Task deleted');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTimeEntry = async (taskId, entryId) => {
    if (!confirm('Are you sure you want to delete this time entry log?')) return;
    try {
      const res = await apiClient.deleteTimeEntry(taskId, entryId);
      if (res.success) {
        triggerToast('Log entry deleted');
        handleFetchTasks(page, true);
      } else {
        alert(res.error || 'Failed to delete log entry');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenReportModal = (tf = 'all', proj = 'all') => {
    setReportModalTimeframe(tf);
    setReportModalProject(proj);
    setReportModalOpen(true);
  };

  // Generate Copy Text for a Specific Project
  const handleCopyProjectDetails = (projectName) => {
    handleOpenReportModal('all', projectName);
  };

  // Memoized derived calculations for unique projects
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.project))).filter(Boolean);
  }, [tasks]);

  // Flatten tasks by time entries to show duplicate rows for multi-day tasks
  const flattenedTasks = useMemo(() => {
    const list = [];
    tasks.forEach(task => {
      if (task.timeEntries && task.timeEntries.length > 0) {
        task.timeEntries.forEach(te => {
          const teId = te._id || te.id;
          list.push({
            ...task,
            _id: `${task._id}::${teId}`,
            _originalId: task._id,
            _entryId: teId,
            workDate: te.date,
            bill: {
              allocatedHours: te.allocatedHours || 0,
              billedHours: te.billedHours || 0,
              actualHours: te.actualHours || 0
            }
          });
        });
      } else {
        list.push({ ...task, _originalId: task._id });
      }
    });
    // Filter strictly by the current week bounds
    const weekStart = new Date(currentWeekStart);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const filteredList = list.filter(t => {
      const d = new Date(t.workDate || t.createdAt);
      return d >= weekStart && d <= weekEnd;
    });

    // Sort chronologically by date
    filteredList.sort((a, b) => new Date(b.workDate || b.createdAt) - new Date(a.workDate || a.createdAt));
    return filteredList;
  }, [tasks, currentWeekStart]);

  const handleAddNewTask = () => {
    setEditingTask(null);
    setTaskForm({
      name: '',
      nickName: '',
      status: 'inprocess',
      allocatedHours: '',
      billedHours: '',
      actualHours: '',
      clickupId: '',
      dynamicValues: {}
    });
    setInitialTaskForm(null);
    setShowTaskModal(true);
  };

  return (
    <>
      <Toast message={toastMessage} />

      <div className="relative space-y-6">

        {/* Status Notification for Demo Mode */}
        {isDemo && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Running in Live Demo Mode. Configure <code className="bg-amber-900/40 px-1 rounded">MONGODB_URI</code> in <code className="bg-amber-900/40 px-1 rounded">.env.local</code> for persistent Atlas database storage.</span>
            </div>
          </div>
        )}

        {CONFIG.USE_NEW_UI && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogTimeModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow shadow-black/20 flex items-center gap-1.5 border border-zinc-800"
              >
                <Plus className="w-3.5 h-3.5" /> Log Time
              </button>
              <button
                onClick={handleAddNewTask}
                className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow shadow-orange-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Task
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Metrics Bar (Legacy) */}
        {!CONFIG.USE_NEW_UI && (
          <MetricsBar
            tasksLength={flattenedTasks.length}
            metrics={metrics}
            loading={loading && flattenedTasks.length === 0}
          />
        )}

        {/* Filter Controls Bar (Legacy) */}
        {!CONFIG.USE_NEW_UI && (
          <FilterControls
            loading={loading && flattenedTasks.length === 0}
            filterSource={filterSource}
            setFilterSource={(val) => dispatch(setFilterSource(val))}
            filterType={filterType}
            setFilterType={(val) => dispatch(setFilterType(val))}
            filterProject={filterProject}
            setFilterProject={(val) => dispatch(setFilterProject(val))}
            filterTimeframe={filterTimeframe}
            setFilterTimeframe={(val) => dispatch(setFilterTimeframe(val))}
            uniqueProjects={uniqueProjects}
            tasksLength={flattenedTasks.length}
            dynamicFields={dynamicFields}
            customFilters={customFilters}
            setCustomFilters={(val) => {
              const resolved = typeof val === 'function' ? val(customFilters) : val;
              dispatch(setCustomFilters(resolved));
            }}
          />
        )}

        {CONFIG.USE_NEW_UI ? (
          <TaskListView
            tasks={flattenedTasks}
            openEditModal={openEditModal}
            openTimeModal={() => setShowLogTimeModal(true)}
            statusColors={enabledFields?.statusColors || {}}
            viewMode={viewMode === 'table' ? 'list' : viewMode}
            setViewMode={(val) => setViewMode(val === 'list' ? 'table' : val)}
            // Props for TaskCards rendering inside TaskListView
            loading={loading && flattenedTasks.length === 0}
            handleQuickStatusChange={(id, status) => {
              const task = flattenedTasks.find(t => t._id === id);
              handleQuickStatusChange(task ? task._originalId : id, status);
            }}
            setActiveHistoryTask={(val) => dispatch(setActiveHistoryTask(val))}
            deleteTask={(id) => {
              const task = flattenedTasks.find(t => t._id === id);
              const targetId = task?._originalId || (typeof id === 'string' && id.includes('::') ? id.split('::')[0] : id);
              return handleDeleteTask(targetId);
            }}
            dynamicFields={dynamicFields}
            currentWeekStart={currentWeekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
          />
        ) : (
          <>
            {/* View Mode Toggle Header */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <span>Task Directory</span>
                <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                  {viewMode === 'table' ? 'table view' : 'card view'}
                </span>
                <button
                  onClick={() => setShowLogTimeModal(true)}
                  className="ml-2 text-[10px] uppercase font-bold px-3 py-1 rounded-md bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black border border-orange-500/20 transition-all flex items-center gap-1"
                >
                  + Add Task
                </button>
              </h2>
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-zinc-900 text-white border border-zinc-800 shadow'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Table View (Desktop Preferred)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-zinc-900 text-white border border-zinc-800 shadow'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                  title="Card View (Mobile Preferred)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Task Data Display */}
            {viewMode === 'table' ? (
              <TaskTable
                loading={loading && flattenedTasks.length === 0}
                tasks={flattenedTasks}
                handleQuickStatusChange={(id, status) => {
                  const task = flattenedTasks.find(t => t._id === id);
                  handleQuickStatusChange(task ? task._originalId : id, status);
                }}
                setActiveHistoryTask={(val) => dispatch(setActiveHistoryTask(val))}
                openEditModal={openEditModal}
                deleteTask={(id) => {
                  const task = flattenedTasks.find(t => t._id === id);
                  const targetId = task?._originalId || (typeof id === 'string' && id.includes('::') ? id.split('::')[0] : id);
                  return handleDeleteTask(targetId);
                }}
                dynamicFields={dynamicFields}
                statusColors={enabledFields?.statusColors || {}}
              />
            ) : (
              <TaskCards
                loading={loading && flattenedTasks.length === 0}
                tasks={flattenedTasks}
                handleQuickStatusChange={(id, status) => {
                  const task = flattenedTasks.find(t => t._id === id);
                  handleQuickStatusChange(task ? task._originalId : id, status);
                }}
                setActiveHistoryTask={(val) => dispatch(setActiveHistoryTask(val))}
                openEditModal={openEditModal}
                deleteTask={(id) => {
                  const task = flattenedTasks.find(t => t._id === id);
                  const targetId = task?._originalId || (typeof id === 'string' && id.includes('::') ? id.split('::')[0] : id);
                  return handleDeleteTask(targetId);
                }}
                dynamicFields={dynamicFields}
                statusColors={enabledFields?.statusColors || {}}
              />
            )}
          </>
        )}

        {/* Infinite Scroll loading indicator */}
        {loading && flattenedTasks.length > 0 && (
          <div className="py-6 text-center text-zinc-500 text-xs">
            Loading next page...
          </div>
        )}
      </div>

      {/* Task Edit Modal */}
      <TaskFormModal
        show={showTaskModal}
        isEdit={!!editingTask}
        form={taskForm}
        onChange={setTaskForm}
        onSubmit={handleSaveTask}
        onClose={() => setShowTaskModal(false)}
        isSubmitting={isSubmitting}
        disableSubmit={JSON.stringify(taskForm) === initialTaskForm}
      />

      {/* Log Time Modal */}
      <LogTimeModal
        isOpen={showLogTimeModal}
        onClose={() => setShowLogTimeModal(false)}
        tasks={tasks}
        onSubmit={handleLogTimeSubmit}
      />

      {/* Edit Log Details Modal */}
      <EditLogModal
        isOpen={showEditLogModal}
        onClose={() => {
          setShowEditLogModal(false);
          setEditingLogEntry(null);
        }}
        logEntry={editingLogEntry}
        onSave={handleSaveLogEntry}
        saving={isSubmitting}
        statuses={orgStatuses}
      />



      {/* History Audit Log Modal */}
      <AuditLogModal
        task={activeHistoryTask}
        onClose={() => dispatch(setActiveHistoryTask(null))}
      />
    </>
  );
}

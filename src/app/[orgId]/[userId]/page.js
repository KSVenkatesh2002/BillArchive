'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Zap, LayoutGrid, List } from 'lucide-react';

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

export default function UserDashboard() {
  const { userId, orgId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // Select states from Redux store
  const { currentUser } = useSelector((state) => state.auth);
  const { dynamicFields } = useSelector((state) => state.org);
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
  const [viewMode, setViewMode] = useState('table');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  const [toastMessage, setToastMessage] = useState('');


  // Check auth
  const handleCheckAuth = async () => {
    try {
      const user = await dispatch(checkAuth()).unwrap();
      if (user) {
        if (user.username !== userId || user.orgId !== orgId) {
          router.push(`/${user.orgId || 'dialedin'}/${user.username}`);
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
        if (sourceField?.defaultValue) {
          dispatch(setFilterSource(sourceField.defaultValue));
        }

        const typeField = fields.find(f => f.name === 'typeOfWork');
        if (typeField?.defaultValue) {
          dispatch(setFilterType(typeField.defaultValue));
        }

        const projectField = fields.find(f => f.name === 'project');
        if (projectField?.defaultValue) {
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
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('cards');
    }
  }, []);

  // Reload tasks when filters change
  useEffect(() => {
    handleFetchTasks(1, true);
  }, [filterSource, filterType, filterProject, filterTimeframe, customFilters]);

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

  // Handle Save (Edit Mode)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const projectVal = taskForm.dynamicValues?.project || taskForm.project;
    if (!taskForm.name || !projectVal) return;

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
        bill: {
          allocatedHours: parseFloat(taskForm.allocatedHours || 0),
          billedHours: parseFloat(taskForm.billedHours || 0),
          actualHours: parseFloat(taskForm.actualHours || 0),
        }
      };

      const data = await dispatch(updateTask({ taskId: editingTask._originalId || editingTask._id, updateData: payload })).unwrap();
      if (data.success) {
        setShowTaskModal(false);
        setEditingTask(null);
        triggerToast('Task updated successfully!');
      } else {
        alert(data.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
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

  const openEditModal = (task) => {
    // Find the original unflattened task to populate the edit form accurately
    const originalTask = tasks.find(t => t._id === (task._originalId || task._id)) || task;

    setEditingTask(originalTask);
    setTaskForm({
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
      dynamicValues: originalTask.dynamicValues || {}
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await dispatch(deleteTask(id)).unwrap();
      triggerToast('Task deleted');
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
          list.push({
            ...task,
            _id: `${task._id}-${te._id}`,
            _originalId: task._id,
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
    // Sort chronologically by date
    list.sort((a, b) => new Date(b.workDate || b.createdAt) - new Date(a.workDate || a.createdAt));
    return list;
  }, [tasks]);

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

        {/* Dashboard Metrics Bar */}
        <MetricsBar
          tasksLength={flattenedTasks.length}
          metrics={metrics}
        />

        {/* Filter Controls Bar */}
        <FilterControls
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
            handleCopyProjectDetails={handleCopyProjectDetails}
            openEditModal={openEditModal}
            deleteTask={(id) => {
              const task = flattenedTasks.find(t => t._id === id);
              handleDeleteTask(task ? task._originalId : id);
            }}
            dynamicFields={dynamicFields}
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
            handleCopyProjectDetails={handleCopyProjectDetails}
            openEditModal={openEditModal}
            deleteTask={(id) => {
              const task = flattenedTasks.find(t => t._id === id);
              handleDeleteTask(task ? task._originalId : id);
            }}
            dynamicFields={dynamicFields}
          />
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
        isEdit={true}
        form={taskForm}
        onChange={setTaskForm}
        onSubmit={handleSaveTask}
        onClose={() => setShowTaskModal(false)}
      />

      {/* Log Time Modal */}
      <LogTimeModal
        isOpen={showLogTimeModal}
        onClose={() => setShowLogTimeModal(false)}
        tasks={tasks}
        onSubmit={handleLogTimeSubmit}
      />



      {/* History Audit Log Modal */}
      <AuditLogModal
        task={activeHistoryTask}
        onClose={() => dispatch(setActiveHistoryTask(null))}
      />
    </>
  );
}

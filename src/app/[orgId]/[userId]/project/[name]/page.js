'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';

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
  updateTask
} from '@/lib/store/taskSlice';

// Import child components
import Header from '@/components/Header';
import MetricsBar from '@/components/MetricsBar';
import FilterControls from '@/components/FilterControls';
import TaskTable from '@/components/TaskTable';
import Toast from '@/components/Toast';
import TaskFormModal from '@/components/TaskFormModal';
import AuditLogModal from '@/components/AuditLogModal';

export default function UserProjectPage() {
  const { userId, orgId, name } = useParams();
  const decodedProjectName = decodeURIComponent(name);
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
    metrics,
    filterSource,
    filterType,
    filterTimeframe,
    customFilters,
    activeHistoryTask
  } = useSelector((state) => state.tasks);

  // Local UI states (modals, toast)
  const [showTaskModal, setShowTaskModal] = useState(false);
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
        if (user.username !== userId) {
          router.push(`/${user.orgId || 'dialedin'}/${user.username}/project/${name}`);
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

        const initialCustomFilters = {};
        fields.forEach(f => {
          if (f.name !== 'source' && f.name !== 'typeOfWork' && f.name !== 'project') {
            if (f.defaultValue !== undefined && f.defaultValue !== null && f.defaultValue !== '') {
              initialCustomFilters[f.name] = String(f.defaultValue);
            }
          }
        });
        if (Object.keys(initialCustomFilters).length > 0) {
          dispatch(setCustomFilters(initialCustomFilters));
        }
      }
    } catch (err) {
      console.error('Failed to load organization config:', err);
    }
  };

  useEffect(() => {
    dispatch(setFilterProject(decodedProjectName));
    handleCheckAuth();
    handleFetchOrgConfig();
  }, [decodedProjectName]);

  // Reload tasks when filters change
  useEffect(() => {
    handleFetchTasks(1, true);
  }, [filterSource, filterType, filterTimeframe, customFilters]);

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

  // Handle Save (Edit/Create Mode)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const projectVal = taskForm.dynamicValues?.project || taskForm.project || decodedProjectName;
    if (!taskForm.name || !projectVal) return;

    try {
      const payload = {
        name: taskForm.name,
        nickName: taskForm.nickName || '',
        status: taskForm.status,
        project: projectVal,
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

      const data = editingTask 
        ? await dispatch(updateTask({ taskId: editingTask._id, updateData: payload })).unwrap()
        : await dispatch(createTask(payload)).unwrap();

      if (data.success) {
        setShowTaskModal(false);
        setEditingTask(null);
        triggerToast(editingTask ? 'Task updated successfully!' : 'New task created!');
      } else {
        alert(data.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      nickName: task.nickName || '',
      status: task.status,
      project: task.project,
      source: task.source,
      typeOfWork: task.typeOfWork,
      allocatedHours: task.bill?.allocatedHours || '',
      billedHours: task.bill?.billedHours || '',
      actualHours: task.bill?.actualHours || '',
      clickupId: task.clickupId || '',
      dynamicValues: task.dynamicValues || {}
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

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Toast message={toastMessage} />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Back navigation & Project Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/${orgId || 'dialedin'}/${userId}`} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:text-white text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
              ← Dashboard
            </Link>
            <h2 className="text-xl font-black text-white">
              Project: <span className="text-orange-400 font-mono">{decodedProjectName}</span>
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Active workspace scoping
          </span>
        </div>

        {/* Metrics Bar */}
        <MetricsBar
          tasksLength={tasks.length}
          metrics={metrics}
        />

        {/* Filters */}
        <FilterControls
          filterSource={filterSource}
          setFilterSource={(val) => dispatch(setFilterSource(val))}
          filterType={filterType}
          setFilterType={(val) => dispatch(setFilterType(val))}
          filterProject={decodedProjectName}
          setFilterProject={() => {}}
          filterTimeframe={filterTimeframe}
          setFilterTimeframe={(val) => dispatch(setFilterTimeframe(val))}
          uniqueProjects={[decodedProjectName]}
          tasksLength={tasks.length}
          dynamicFields={dynamicFields}
          customFilters={customFilters}
          setCustomFilters={(val) => {
            const resolved = typeof val === 'function' ? val(customFilters) : val;
            dispatch(setCustomFilters(resolved));
          }}
        />

        {/* Tasks Table */}
        <TaskTable
          loading={loading && tasks.length === 0}
          tasks={tasks}
          handleQuickStatusChange={handleQuickStatusChange}
          setActiveHistoryTask={(val) => dispatch(setActiveHistoryTask(val))}
          handleCopyProjectDetails={() => {}}
          openEditModal={openEditModal}
          deleteTask={handleDeleteTask}
          dynamicFields={dynamicFields}
        />

        {/* Infinite Scroll loading indicator */}
        {loading && tasks.length > 0 && (
          <div className="py-6 text-center text-zinc-500 text-xs">
            Loading next page...
          </div>
        )}
      </div>

      {/* Task Create/Edit Modal */}
      <TaskFormModal
        show={showTaskModal}
        isEdit={!!editingTask}
        form={taskForm}
        onChange={setTaskForm}
        onSubmit={handleSaveTask}
        onClose={() => setShowTaskModal(false)}
      />

      {/* History Audit Modal */}
      <AuditLogModal
        task={activeHistoryTask}
        onClose={() => dispatch(setActiveHistoryTask(null))}
      />
    </div>
  );
}

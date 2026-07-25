'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import Header from '@/components/Header';
import MetricsBar from '@/components/MetricsBar';
import FilterControls from '@/components/FilterControls';
import TaskTable from '@/components/TaskTable';
import Toast from '@/components/Toast';
import TaskFormModal from '@/components/TaskFormModal';
import AuditLogModal from '@/components/AuditLogModal';

export default function UserProjectPage() {
  const { username, name } = useParams();
  const decodedProjectName = decodeURIComponent(name);
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  // App Data, Filters, Pagination
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filterSource, setFilterSource] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [isDemo, setIsDemo] = useState(false);
  const [metrics, setMetrics] = useState({
    totalAllocated: 0,
    totalBilled: 0,
    totalActual: 0,
    completedCount: 0,
    variance: 0
  });

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
    project: decodedProjectName,
    source: 'dialedin',
    typeOfWork: 'dev',
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    clickupId: ''
  });
  const [activeHistoryTask, setActiveHistoryTask] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Check auth
  const checkAuth = async () => {
    try {
      const data = await apiClient.checkAuth();
      if (data.authenticated) {
        setCurrentUser(data.user);
        if (data.user.username !== username) {
          router.push(`/${data.user.username}/project/${name}`);
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  // Fetch paginated tasks for project
  const fetchTasks = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const data = await apiClient.getTasks({
        page: pageNum,
        limit: 15,
        timeframe: filterTimeframe,
        source: filterSource,
        typeOfWork: filterType,
        project: decodedProjectName
      });

      if (data.success) {
        const fetchedTasks = data.tasks || [];
        setTasks(prev => (reset ? fetchedTasks : [...prev, ...fetchedTasks]));
        setHasMore(data.hasMore);
        setIsDemo(data.isDemo || false);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page and reload when filters change
  useEffect(() => {
    checkAuth();
    setPage(1);
    fetchTasks(1, true);
  }, [filterSource, filterType, filterTimeframe]);

  // Load next page on scroll reach end
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
      hasMore &&
      !loading
    ) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchTasks(nextPage, false);
        return nextPage;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setTasks([]);
    router.push('/');
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const data = await apiClient.updateTask(taskId, { status: newStatus });
      if (data.success) {
        fetchTasks(1, true);
        triggerToast(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.project) return;

    try {
      const payload = {
        name: taskForm.name,
        nickName: taskForm.nickName || '',
        status: taskForm.status,
        project: taskForm.project,
        source: taskForm.source,
        typeOfWork: taskForm.typeOfWork,
        clickupId: taskForm.clickupId,
        bill: {
          allocatedHours: parseFloat(taskForm.allocatedHours || 0),
          billedHours: parseFloat(taskForm.billedHours || 0),
          actualHours: parseFloat(taskForm.actualHours || 0),
        }
      };

      const data = editingTask 
        ? await apiClient.updateTask(editingTask._id, payload)
        : await apiClient.createTask(payload);

      if (data.success) {
        setShowTaskModal(false);
        setEditingTask(null);
        fetchTasks(1, true);
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
    });
    setShowTaskModal(true);
  };

  const deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const data = await apiClient.deleteTask(id);
      if (data.success) {
        fetchTasks(1, true);
        triggerToast('Task deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard!`);
  };

  const handleCopyTimeframeReport = async (tf) => {
    try {
      const data = await apiClient.getReport(tf);
      if (data.reportText) {
        copyToClipboard(data.reportText, tf === '1w' ? '1-Week Report' : '1-Month Report');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Toast message={toastMessage} />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <Header
          currentUser={currentUser}
          onCopy1Wk={() => handleCopyTimeframeReport('1w')}
          onCopy1Mo={() => handleCopyTimeframeReport('1m')}
          onLogout={handleLogout}
        />

        {/* Back navigation & Project Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/${username}`} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:text-white text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
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
          setFilterSource={setFilterSource}
          filterType={filterType}
          setFilterType={setFilterType}
          filterProject={decodedProjectName}
          setFilterProject={() => {}}
          filterTimeframe={filterTimeframe}
          setFilterTimeframe={setFilterTimeframe}
          uniqueProjects={[decodedProjectName]}
          tasksLength={tasks.length}
        />

        {/* Tasks Table */}
        <TaskTable
          loading={loading && tasks.length === 0}
          tasks={tasks}
          handleQuickStatusChange={handleQuickStatusChange}
          setActiveHistoryTask={setActiveHistoryTask}
          handleCopyProjectDetails={() => {}}
          openEditModal={openEditModal}
          deleteTask={deleteTask}
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
        onClose={() => setActiveHistoryTask(null)}
      />
    </div>
  );
}

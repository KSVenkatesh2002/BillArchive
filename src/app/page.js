'use client';

import { useState, useEffect, useMemo } from 'react';

// Import child components
import Header from '@/components/Header';
import MetricsBar from '@/components/MetricsBar';
import FilterControls from '@/components/FilterControls';
import TaskTable from '@/components/TaskTable';
import Toast from '@/components/Toast';
import AuditLogModal from '@/components/AuditLogModal';
import TaskFormModal from '@/components/TaskFormModal';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  // App Data, Filters, Pagination
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filterSource, setFilterSource] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [isDemo, setIsDemo] = useState(false);
  const [metrics, setMetrics] = useState({
    totalAllocated: 0,
    totalBilled: 0,
    totalActual: 0,
    completedCount: 0,
    variance: 0
  });

  // Edit Task Modal state (Creation uses /task-create route)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
    project: '',
    source: 'dialedin',
    typeOfWork: 'dev',
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    clickupId: ''
  });

  // History Audit Modal state
  const [activeHistoryTask, setActiveHistoryTask] = useState(null);

  // Copy Feedback Toast
  const [toastMessage, setToastMessage] = useState('');

  // Check auth
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch paginated tasks
  const fetchTasks = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      let url = `/api/tasks?page=${pageNum}&limit=15&timeframe=${filterTimeframe}`;
      if (filterSource !== 'all') url += `&source=${filterSource}`;
      if (filterType !== 'all') url += `&typeOfWork=${filterType}`;
      if (filterProject !== 'all') url += `&project=${encodeURIComponent(filterProject)}`;

      const res = await fetch(url);
      const data = await res.json();

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

  useEffect(() => {
    checkAuth();
  }, []);

  // Reset page and list on filter change
  useEffect(() => {
    setPage(1);
    fetchTasks(1, true);
  }, [filterSource, filterType, filterProject, filterTimeframe]);

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

  // Handle Logout (Clear tasks & state)
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setTasks([]);
    setMetrics({
      totalAllocated: 0,
      totalBilled: 0,
      totalActual: 0,
      completedCount: 0,
      variance: 0
    });
    triggerToast('Logged out successfully');
  };

  // Quick Status change directly from the desktop list
  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks(1, true);
        triggerToast(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save (Edit Mode)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.project) return;

    try {
      const payload = {
        name: taskForm.name,
        nickName: taskForm.nickName || taskForm.name,
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

      const res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowTaskModal(false);
        setEditingTask(null);
        fetchTasks(1, true);
        triggerToast('Task updated successfully!');
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
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
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

  // Generate Copy Text for Timeframe Report (1 Week or 1 Month)
  const handleCopyTimeframeReport = async (tf) => {
    try {
      const res = await fetch(`/api/reports?timeframe=${tf}`);
      const data = await res.json();
      if (data.reportText) {
        copyToClipboard(data.reportText, tf === '1w' ? '1-Week Report' : '1-Month Report');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Copy Text for a Specific Project
  const handleCopyProjectDetails = (projectName) => {
    const projectTasks = tasks.filter(t => t.project === projectName);
    let text = `=========================================\n`;
    text += `PROJECT DETAILS: ${projectName.toUpperCase()}\n`;
    text += `Total Tasks: ${projectTasks.length}\n`;
    text += `=========================================\n\n`;

    let totalAlloc = 0, totalBilled = 0, totalActual = 0;

    projectTasks.forEach((t, index) => {
      totalAlloc += Number(t.bill?.allocatedHours || 0);
      totalBilled += Number(t.bill?.billedHours || 0);
      totalActual += Number(t.bill?.actualHours || 0);

      text += `${index + 1}. Task: ${t.name} (Nick: ${t.nickName || 'N/A'})\n`;
      text += `   Status: ${t.status} | Source: ${t.source} | Work: ${t.typeOfWork}\n`;
      text += `   Allocated: ${t.bill?.allocatedHours || 0}h | Billed: ${t.bill?.billedHours || 0}h | Actual: ${t.bill?.actualHours || 0}h\n`;
      if (t.statusHistory && t.statusHistory.length > 0) {
        text += `   Status History: ${t.statusHistory.map(h => h.status).join(' ➔ ')}\n`;
      }
      text += `-----------------------------------------\n`;
    });

    text += `TOTALS: Allocated: ${totalAlloc}h | Billed: ${totalBilled}h | Actual: ${totalActual}h\n`;

    copyToClipboard(text, `Project "${projectName}" details`);
  };

  // Memoized derived calculations for unique projects
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.project))).filter(Boolean);
  }, [tasks]);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Toast message={toastMessage} />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Navbar Header */}
        <Header
          currentUser={currentUser}
          onCopy1Wk={() => handleCopyTimeframeReport('1w')}
          onCopy1Mo={() => handleCopyTimeframeReport('1m')}
          onLogout={handleLogout}
        />

        {/* Status Notification for Demo Mode */}
        {isDemo && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Running in Live Demo Mode. Configure <code className="bg-amber-900/40 px-1 rounded">MONGODB_URI</code> in <code className="bg-amber-900/40 px-1 rounded">.env.local</code> for persistent Atlas database storage.</span>
            </div>
          </div>
        )}

        {/* Dashboard Metrics Bar */}
        <MetricsBar
          tasksLength={tasks.length}
          metrics={metrics}
        />

        {/* Filter Controls Bar */}
        <FilterControls
          filterSource={filterSource}
          setFilterSource={setFilterSource}
          filterType={filterType}
          setFilterType={setFilterType}
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          filterTimeframe={filterTimeframe}
          setFilterTimeframe={setFilterTimeframe}
          uniqueProjects={uniqueProjects}
          tasksLength={tasks.length}
        />

        {/* Dense Desktop Task Data Table */}
        <TaskTable
          loading={loading && tasks.length === 0}
          tasks={tasks}
          handleQuickStatusChange={handleQuickStatusChange}
          setActiveHistoryTask={setActiveHistoryTask}
          handleCopyProjectDetails={handleCopyProjectDetails}
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

      {/* Task Edit Modal */}
      <TaskFormModal
        show={showTaskModal}
        isEdit={true}
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

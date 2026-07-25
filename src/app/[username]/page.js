'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { Zap, LayoutGrid, List } from 'lucide-react';

// Import child components
import Header from '@/components/Header';
import MetricsBar from '@/components/MetricsBar';
import FilterControls from '@/components/FilterControls';
import TaskTable from '@/components/TaskTable';
import TaskCards from '@/components/TaskCards';
import Toast from '@/components/Toast';
import AuditLogModal from '@/components/AuditLogModal';
import TaskFormModal from '@/components/TaskFormModal';
import ReportPreviewModal from '@/components/ReportPreviewModal';

export default function UserDashboard() {
  const { username } = useParams();
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  // App Data, Filters, Pagination
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filterSource, setFilterSource] = useState('dialedin');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [isDemo, setIsDemo] = useState(false);
  const [viewMode, setViewMode] = useState('table');
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
      const data = await apiClient.checkAuth();
      if (data.authenticated) {
        setCurrentUser(data.user);
        if (data.user.username !== username) {
          router.push(`/${data.user.username}`);
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
  const fetchTasks = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const data = await apiClient.getTasks({
        page: pageNum,
        limit: 15,
        timeframe: filterTimeframe,
        source: filterSource,
        typeOfWork: filterType,
        project: filterProject
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

  useEffect(() => {
    checkAuth();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('cards');
    }
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
    await apiClient.logout();
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
    router.push('/');
  };

  // Quick Status change directly from the desktop list
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

  // Handle Save (Edit Mode)
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

      const data = await apiClient.updateTask(editingTask._id, payload);
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

  // Report Preview Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalProject, setReportModalProject] = useState('all');
  const [reportModalTimeframe, setReportModalTimeframe] = useState('all');

  const handleOpenReportModal = (tf = 'all', proj = 'all') => {
    setReportModalTimeframe(tf);
    setReportModalProject(proj);
    setReportModalOpen(true);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard!`);
  };

  // Generate Copy Text for Timeframe Report (1 Week or 1 Month)
  const handleCopyTimeframeReport = (tf) => {
    handleOpenReportModal(tf, 'all');
  };

  // Generate Copy Text for a Specific Project
  const handleCopyProjectDetails = (projectName) => {
    handleOpenReportModal('all', projectName);
  };

  // Memoized derived calculations for unique projects
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.project))).filter(Boolean);
  }, [tasks]);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <Toast message={toastMessage} />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Navbar Header */}
        <Header
          currentUser={currentUser}
          onCopy1Wk={() => handleOpenReportModal('1w', 'all')}
          onCopy1Mo={() => handleOpenReportModal('1m', 'all')}
          onLogout={handleLogout}
        />

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

        {/* View Mode Toggle Header */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <span>Task Directory</span>
            <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
              {viewMode === 'table' ? 'table view' : 'card view'}
            </span>
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
            loading={loading && tasks.length === 0}
            tasks={tasks}
            handleQuickStatusChange={handleQuickStatusChange}
            setActiveHistoryTask={setActiveHistoryTask}
            handleCopyProjectDetails={handleCopyProjectDetails}
            openEditModal={openEditModal}
            deleteTask={deleteTask}
          />
        ) : (
          <TaskCards
            loading={loading && tasks.length === 0}
            tasks={tasks}
            handleQuickStatusChange={handleQuickStatusChange}
            setActiveHistoryTask={setActiveHistoryTask}
            handleCopyProjectDetails={handleCopyProjectDetails}
            openEditModal={openEditModal}
            deleteTask={deleteTask}
          />
        )}

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

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialProject={reportModalProject}
        initialTimeframe={reportModalTimeframe}
        projectsList={uniqueProjects}
      />
    </div>
  );
}

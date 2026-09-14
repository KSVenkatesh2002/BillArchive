'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Folder, Clock, CheckCircle, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

function ProjectTaskList({ projectName }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['tasks', projectName],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.getTasks({ project: projectName, scope: 'org', page: pageParam, limit: 5 });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
  });

  if (status === 'pending') {
    return <div className="p-6 text-center text-zinc-500 text-xs">Loading organization tasks for &quot;{projectName}&quot;...</div>;
  }

  if (status === 'error') {
    return <div className="p-6 text-center text-rose-500 text-xs">Error loading tasks for this project.</div>;
  }

  const tasks = data?.pages?.flatMap(page => page.tasks || []) || [];

  if (tasks.length === 0) {
    return <div className="p-6 text-center text-zinc-500 text-xs">No tasks found for &quot;{projectName}&quot;.</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task._id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {task.status === 'completed' || task.status === 'complete' || task.status === 'done' ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-150 truncate">{task.name}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold uppercase text-[9px]">
                  {task.status}
                </span>
                <span className="text-zinc-400 flex items-center gap-1 font-medium">
                  <User className="w-3 h-3 text-orange-400" />
                  <span>Assigned / Worked by: <strong className="text-zinc-200">{task.user || task.author_name || task.email || 'Unknown User'}</strong></span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-zinc-400 shrink-0">
            <span className="text-orange-400 font-bold">{task.bill?.billedHours || 0}h</span> billed
          </div>
        </div>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-3 w-full py-2.5 text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl transition"
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More (5)'}
        </button>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { orgId, userId } = useParams();
  const [selectedProject, setSelectedProject] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      if (!response.success) throw new Error('Failed to load projects');
      return response.projects;
    }
  });

  const projectsList = Array.isArray(data) ? data : (data?.projects || []);

  useEffect(() => {
    if (projectsList.length > 0 && !selectedProject) {
      setSelectedProject(projectsList[0]);
    }
  }, [projectsList, selectedProject]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 border border-zinc-800 bg-zinc-950/60 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${orgId}/${userId}`}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2 text-white">
              Organization Projects
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a project from the dropdown to view organization-wide tasks & user assignments
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="space-y-6">
        {isLoading ? (
          <div className="text-center py-16 text-zinc-500">Loading projects list...</div>
        ) : isError ? (
          <div className="text-center py-16 text-rose-500">Error loading projects.</div>
        ) : projectsList.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">No organization projects found.</div>
        ) : (
          <div className="space-y-6">
            {/* Project Selection Dropdown */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm font-semibold text-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {projectsList.map((proj) => (
                  <option key={proj} value={proj} className="bg-black text-zinc-200">
                    📂 {proj}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Project Tasks */}
            {selectedProject && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-orange-400" />
                    <span>Project: {selectedProject}</span>
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">Org View</span>
                </div>

                <ProjectTaskList projectName={selectedProject} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

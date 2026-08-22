'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Folder, ChevronDown, ChevronUp, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ProjectTaskList({ projectName }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['tasks', projectName],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.getTasks({ project: projectName, page: pageParam, limit: 5 });
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });

  if (status === 'pending') {
    return <div className="p-4 text-zinc-500 text-xs">Loading tasks...</div>;
  }

  if (status === 'error') {
    return <div className="p-4 text-red-500 text-xs">Error loading tasks.</div>;
  }

  const tasks = data?.pages.flatMap(page => page.tasks) || [];

  if (tasks.length === 0) {
    return <div className="p-4 text-zinc-500 text-xs">No tasks found for this project.</div>;
  }

  return (
    <div className="p-4 bg-black/50 space-y-2">
      {tasks.map(task => (
        <div key={task._id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            {task.status === 'completed' || task.status === 'done' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-bold text-zinc-200">{task.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{task.status}</p>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            {task.bill?.billedHours || 0}h
          </div>
        </div>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-3 w-full py-2 text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition"
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More (5)'}
        </button>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { orgId, userId } = useParams();
  const [openProject, setOpenProject] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.getProjects();
      if (!response.success) throw new Error('Failed to load projects');
      return response.projects;
    }
  });

  const toggleProject = (projectName) => {
    setOpenProject(prev => prev === projectName ? null : projectName);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 bg-zinc-950/40 rounded-2xl flex items-center gap-4 mb-4">
        <Link
          href={`/${orgId}/${userId}`}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Projects Overview
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse tasks by project folder
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">Loading projects...</div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">Error loading projects.</div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No projects found.</div>
          ) : (
            data.map((projectName) => {
              const isOpen = openProject === projectName;
              return (
                <div key={projectName} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleProject(projectName)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-5 h-5 text-orange-400" />
                      <span className="font-bold text-sm text-zinc-200">{projectName}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-800">
                      <ProjectTaskList projectName={projectName} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

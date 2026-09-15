'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useTasksQuery(orgId, userId, filters = {}) {
  return useQuery({
    queryKey: ['tasks', orgId, userId, filters],
    queryFn: async () => {
      const data = await apiClient.getTasks(orgId, userId, filters);
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      return data;
    },
    staleTime: 60 * 1000, // 1 minute cache time
    refetchOnWindowFocus: false,
    enabled: Boolean(orgId),
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData) => apiClient.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, taskData }) => apiClient.updateTask(taskId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => apiClient.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useAddTimeEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, date, hours, note }) => apiClient.addTimeEntry(taskId, date, hours, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

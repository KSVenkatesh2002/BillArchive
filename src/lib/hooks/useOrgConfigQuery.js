'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useOrgConfigQuery(orgId) {
  return useQuery({
    queryKey: ['orgConfig', orgId],
    queryFn: async () => {
      const data = await apiClient.getOrgConfig(orgId);
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch organization config');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(orgId),
  });
}

export function useStatusesQuery() {
  return useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const data = await apiClient.getStatuses();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch statuses');
      }
      return data.statuses || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateOrgConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, config }) => apiClient.updateOrgConfig(orgId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orgConfig', variables.orgId] });
    },
  });
}

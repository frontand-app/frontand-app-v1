import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, FlowDefinition, ExecutionRequest, ExecutionResponse } from '@/lib/api';

// Flow queries
export const useFlows = () => {
  return useQuery({
    queryKey: ['flows'],
    queryFn: () => apiClient.getFlows(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFlow = (id: string) => {
  return useQuery({
    queryKey: ['flow', id],
    queryFn: () => apiClient.getFlow(id),
    enabled: !!id,
  });
};

export const useSearchFlows = (query: string, category?: string) => {
  return useQuery({
    queryKey: ['flows', 'search', query, category],
    queryFn: () => apiClient.searchFlows(query, category),
    enabled: !!query,
  });
};

// Model queries
export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => apiClient.getModels(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useModelPricing = (modelId: string) => {
  return useQuery({
    queryKey: ['models', modelId, 'pricing'],
    queryFn: () => apiClient.getModelPricing(modelId),
    enabled: !!modelId,
  });
};

// Execution mutations
export const useExecuteFlow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ExecutionRequest) => apiClient.executeFlow(request),
    onSuccess: (data: ExecutionResponse) => {
      // Invalidate user usage queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['user', 'usage'] });
    },
  });
};

export const useExecutionStatus = (executionId: string) => {
  return useQuery({
    queryKey: ['executions', executionId],
    queryFn: () => apiClient.getExecutionStatus(executionId),
    enabled: !!executionId,
    refetchInterval: (query) => {
      // Stop polling if execution is completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
};

// Cost estimation
export const useCostEstimation = () => {
  return useMutation({
    mutationFn: ({
      flowId,
      inputs,
      modelId,
    }: {
      flowId: string;
      inputs: Record<string, any>;
      modelId: string;
    }) => apiClient.estimateCost(flowId, inputs, modelId),
  });
};

// User queries
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.getUserProfile(),
  });
};

export const useUserUsage = () => {
  return useQuery({
    queryKey: ['user', 'usage'],
    queryFn: () => apiClient.getUserUsage(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Credit management
export const useAddCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (amount: number) => apiClient.addCredits(amount),
    onSuccess: () => {
      // Refresh user profile and usage
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
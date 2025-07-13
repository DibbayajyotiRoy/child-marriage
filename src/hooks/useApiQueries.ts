
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  caseService, 
  reportService, 
  teamFormationService, 
  personService,
  type CreateCaseRequest,
  type UpdateCaseRequest,
  type CreateReportRequest,
  type TeamFormationRequest,
  ApiError
} from '@/api';

// Query Keys
export const queryKeys = {
  cases: {
    all: ['cases'] as const,
    active: ['cases', 'active'] as const,
    pending: ['cases', 'pending'] as const,
    resolved: ['cases', 'resolved'] as const,
    byId: (id: string) => ['cases', id] as const,
  },
  reports: {
    all: ['reports'] as const,
    byCase: (caseId: string) => ['reports', 'case', caseId] as const,
    byMember: (personId: string) => ['reports', 'member', personId] as const,
    byId: (id: string) => ['reports', id] as const,
  },
  teams: {
    all: ['teams'] as const,
    byCase: (caseId: string) => ['teams', 'case', caseId] as const,
    pendingResponses: ['teams', 'pending-responses'] as const,
  },
  persons: {
    all: ['persons'] as const,
    byId: (id: string) => ['persons', id] as const,
  },
};

// Case Hooks
export const useCases = () => {
  return useQuery({
    queryKey: queryKeys.cases.all,
    queryFn: () => caseService.getAll(),
  });
};

export const useActiveCases = () => {
  return useQuery({
    queryKey: queryKeys.cases.active,
    queryFn: () => caseService.getActiveCases(),
  });
};

export const usePendingCases = () => {
  return useQuery({
    queryKey: queryKeys.cases.pending,
    queryFn: () => caseService.getPendingCases(),
  });
};

export const useResolvedCases = () => {
  return useQuery({
    queryKey: queryKeys.cases.resolved,
    queryFn: () => caseService.getResolvedCases(),
  });
};

export const useCase = (id: string) => {
  return useQuery({
    queryKey: queryKeys.cases.byId(id),
    queryFn: () => caseService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCaseRequest) => caseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.active });
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCaseRequest }) => 
      caseService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
};

// Report Hooks
export const useReportsByCase = (caseId: string) => {
  return useQuery({
    queryKey: queryKeys.reports.byCase(caseId),
    queryFn: () => reportService.getByCaseId(caseId),
    enabled: !!caseId,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.create(data),
    onSuccess: (_, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.byCase(issueId) });
    },
  });
};

// Team Formation Hooks
export const useTeamByCase = (caseId: string) => {
  return useQuery({
    queryKey: queryKeys.teams.byCase(caseId),
    queryFn: () => teamFormationService.getByCaseId(caseId),
    enabled: !!caseId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TeamFormationRequest) => teamFormationService.createTeam(data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.byCase(caseId) });
    },
  });
};

// Person Hooks
export const usePersons = () => {
  return useQuery({
    queryKey: queryKeys.persons.all,
    queryFn: () => personService.getAll(),
  });
};

// Error Handler Hook
export const useApiError = () => {
  const handleError = (error: unknown): string => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error occurred. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }
    return 'Network error. Please check your connection.';
  };

  return { handleError };
};

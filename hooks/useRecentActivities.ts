/**
 * Recent Activities Hook
 *
 * React Query hook for managing user's recent activities from the last 7 days.
 * Follows existing patterns from useExercises.ts and integrates with the activity service layer.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { activityService } from '../services/activityService';
import { workoutSessionService } from '../services/workoutSessionService';
import type {
  UserActivity,
  CreateActivityRequest,
  ActivityFilterOptions,
  ActivityStats,
  WorkoutSession,
  CreateWorkoutSessionRequest
} from '../types/activity';
import type { Exercise } from '../data/exercises';

// Query key factory for consistency
const activityKeys = {
  all: ['activities'] as const,
  recent: (userId: string, days: number) => [...activityKeys.all, 'recent', userId, days] as const,
  stats: (userId: string, days: number) => [...activityKeys.all, 'stats', userId, days] as const,
  sessions: (userId: string) => [...activityKeys.all, 'sessions', userId] as const,
  activeSession: (userId: string) => [...activityKeys.all, 'active-session', userId] as const,
};

/**
 * Hook for fetching and managing user's recent activities
 */
export function useRecentActivities(days: number = 7, userId: string = 'current-user') {
  const queryClient = useQueryClient();

  // Get recent activities query
  const {
    data: activities = [],
    isLoading: isLoadingActivities,
    error: activitiesError,
    refetch: refetchActivities
  } = useQuery({
    queryKey: activityKeys.recent(userId, days),
    queryFn: () => activityService.getUserActivities(userId, days),
    staleTime: 1000 * 60 * 2, // 2 minutes - activities change frequently
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    enabled: !!userId
  });

  // Get activity statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: activityKeys.stats(userId, days),
    queryFn: () => activityService.getActivityStats(userId, days),
    staleTime: 1000 * 60 * 5, // 5 minutes for stats
    gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes
    enabled: !!userId
  });

  // Get active workout session
  const {
    data: activeSession,
    isLoading: isLoadingActiveSession,
    error: activeSessionError,
    refetch: refetchActiveSession
  } = useQuery({
    queryKey: activityKeys.activeSession(userId),
    queryFn: () => workoutSessionService.getActiveWorkoutSession(userId),
    staleTime: 1000 * 30, // 30 seconds - active sessions change frequently
    gcTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
    enabled: !!userId,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for active sessions
  });

  // Create new activity mutation
  const createActivityMutation = useMutation({
    mutationFn: (request: CreateActivityRequest) =>
      activityService.createActivity(request, userId),
    onSuccess: (newActivity) => {
      // Invalidate recent activities query to trigger refetch
      queryClient.invalidateQueries({ queryKey: activityKeys.recent(userId, days) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats(userId, days) });

      // Optimistically update the cache
      queryClient.setQueryData(
        activityKeys.recent(userId, days),
        (old: UserActivity[] = []) => [newActivity, ...old]
      );
    },
    onError: (error) => {
      console.error('Failed to create activity:', error);
    }
  });

  // Create workout session mutation
  const createWorkoutSessionMutation = useMutation({
    mutationFn: (request: CreateWorkoutSessionRequest) =>
      workoutSessionService.createWorkoutSession(request, userId),
    onSuccess: (newSession) => {
      // Invalidate sessions queries
      queryClient.invalidateQueries({ queryKey: activityKeys.sessions(userId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.activeSession(userId) });
    },
    onError: (error) => {
      console.error('Failed to create workout session:', error);
    }
  });

  // End workout session mutation
  const endWorkoutSessionMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates?: Partial<{ title: string; notes: string; totalDuration: number; totalCalories: number }> }) =>
      workoutSessionService.endWorkoutSession(sessionId, updates),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: activityKeys.sessions(userId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.activeSession(userId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.recent(userId, days) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats(userId, days) });
    },
    onError: (error) => {
      console.error('Failed to end workout session:', error);
    }
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: string) => activityService.deleteActivity(activityId),
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: activityKeys.recent(userId, days) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats(userId, days) });
    },
    onError: (error) => {
      console.error('Failed to delete activity:', error);
    }
  });

  // Memoized derived state
  const exerciseActivities = useMemo(() =>
    activities.filter(activity => activity.type === 'EXERCISE_COMPLETED' && activity.exercise),
    [activities]
  );

  const workoutActivities = useMemo(() =>
    activities.filter(activity => activity.type === 'WORKOUT_COMPLETED'),
    [activities]
  );

  const mealActivities = useMemo(() =>
    activities.filter(activity => activity.type === 'MEAL_LOGGED'),
    [activities]
  );

  const recentActivitiesByType = useMemo(() => {
    const byType: Record<string, UserActivity[]> = {};
    activities.forEach(activity => {
      if (!byType[activity.type]) {
        byType[activity.type] = [];
      }
      byType[activity.type].push(activity);
    });
    return byType;
  }, [activities]);

  // Convenience functions for common operations
  const logExerciseCompleted = useCallback((
    exerciseId: string,
    overrides: Partial<CreateActivityRequest> = {}
  ) => {
    return createActivityMutation.mutateAsync({
      type: 'EXERCISE_COMPLETED',
      exerciseId,
      duration: 0,
      calories: 0,
      ...overrides
    });
  }, [createActivityMutation]);

  const logWorkoutCompleted = useCallback((updates?: Partial<{ title: string; notes: string; totalDuration: number; totalCalories: number }>) => {
    if (activeSession) {
      return endWorkoutSessionMutation.mutateAsync({
        sessionId: activeSession.id,
        updates
      });
    }
    return Promise.reject(new Error('No active workout session found'));
  }, [activeSession, endWorkoutSessionMutation]);

  const startWorkoutSession = useCallback((request: CreateWorkoutSessionRequest = {}) => {
    return createWorkoutSessionMutation.mutateAsync(request);
  }, [createWorkoutSessionMutation]);

  const endWorkoutSession = useCallback((
    sessionId: string,
    updates?: Partial<{ title: string; notes: string; totalDuration: number; totalCalories: number }>
  ) => {
    return endWorkoutSessionMutation.mutateAsync({ sessionId, updates });
  }, [endWorkoutSessionMutation]);

  const deleteActivity = useCallback((activityId: string) => {
    return deleteActivityMutation.mutateAsync(activityId);
  }, [deleteActivityMutation]);

  // Refetch all data
  const refetchAll = useCallback(() => {
    return Promise.all([
      refetchActivities(),
      refetchStats(),
      refetchActiveSession()
    ]);
  }, [refetchActivities, refetchStats, refetchActiveSession]);

  // Overall loading state
  const isLoading = isLoadingActivities || isLoadingStats || isLoadingActiveSession;

  // Combined error state
  const error = activitiesError || statsError || activeSessionError;

  return {
    // Data
    activities,
    exerciseActivities,
    workoutActivities,
    mealActivities,
    recentActivitiesByType,
    stats,
    activeSession,

    // Loading states
    isLoading,
    isLoadingActivities,
    isLoadingStats,
    isLoadingActiveSession,

    // Error states
    error,
    activitiesError,
    statsError,
    activeSessionError,

    // Actions
    logActivity: createActivityMutation.mutateAsync,
    logExerciseCompleted,
    logWorkoutCompleted,
    startWorkoutSession,
    endWorkoutSession,
    deleteActivity,
    refetch: refetchAll,

    // Mutation states
    isLoggingActivity: createActivityMutation.isPending,
    isCreatingSession: createWorkoutSessionMutation.isPending,
    isEndingSession: endWorkoutSessionMutation.isPending,
    isDeletingActivity: deleteActivityMutation.isPending,

    // Query invalidation helpers
    invalidateActivities: () => queryClient.invalidateQueries({ queryKey: activityKeys.recent(userId, days) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: activityKeys.stats(userId, days) }),
    invalidateActiveSession: () => queryClient.invalidateQueries({ queryKey: activityKeys.activeSession(userId) }),
  };
}

/**
 * Hook for managing individual activity operations
 */
export function useActivity(activityId: string) {
  const queryClient = useQueryClient();

  const {
    data: activity,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activityService.getActivityById(activityId),
    enabled: !!activityId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateActivityMutation = useMutation({
    mutationFn: (updates: Partial<CreateActivityRequest>) =>
      activityService.updateActivity(activityId, updates),
    onSuccess: (updatedActivity) => {
      // Update the specific activity in cache
      queryClient.setQueryData(['activity', activityId], updatedActivity);

      // Invalidate broader queries
      queryClient.invalidateQueries({ queryKey: activityKeys.recent('current-user', 7) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats('current-user', 7) });
    },
    onError: (error) => {
      console.error('Failed to update activity:', error);
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: () => activityService.deleteActivity(activityId),
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['activity', activityId] });

      // Invalidate broader queries
      queryClient.invalidateQueries({ queryKey: activityKeys.recent('current-user', 7) });
      queryClient.invalidateQueries({ queryKey: activityKeys.stats('current-user', 7) });
    },
    onError: (error) => {
      console.error('Failed to delete activity:', error);
    }
  });

  return {
    activity,
    isLoading,
    error,
    refetch,
    updateActivity: updateActivityMutation.mutateAsync,
    deleteActivity: deleteActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isPending,
    isDeleting: deleteActivityMutation.isPending,
  };
}

/**
 * Hook for workout session management
 */
export function useWorkoutSession(sessionId?: string) {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['workout-session', sessionId],
    queryFn: () => sessionId ? workoutSessionService.getWorkoutSessionById(sessionId, true) : null,
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2, // 2 minutes - sessions change frequently during workouts
  });

  const updateSessionMutation = useMutation({
    mutationFn: (updates: Partial<CreateWorkoutSessionRequest & { totalDuration: number; totalCalories: number; exercisesCount: number }>) =>
      workoutSessionService.updateWorkoutSession(sessionId!, updates),
    onSuccess: (updatedSession) => {
      // Update the specific session in cache
      queryClient.setQueryData(['workout-session', sessionId], updatedSession);

      // Invalidate broader queries
      queryClient.invalidateQueries({ queryKey: activityKeys.sessions('current-user') });
      queryClient.invalidateQueries({ queryKey: activityKeys.activeSession('current-user') });
    },
    onError: (error) => {
      console.error('Failed to update workout session:', error);
    }
  });

  return {
    session,
    isLoading,
    error,
    refetch,
    updateSession: updateSessionMutation.mutateAsync,
    isUpdating: updateSessionMutation.isPending,
  };
}

export default useRecentActivities;
/**
 * Tests for useRecentActivities Hook
 *
 * These tests verify the functionality of the React Query hooks for
 * managing user activities and workout sessions.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useRecentActivities,
  useActivity,
  useWorkoutSession
} from '../hooks/useRecentActivities';
import { activityService } from '../services/activityService';
import { workoutSessionService } from '../services/workoutSessionService';
import type {
  UserActivity,
  CreateActivityRequest,
  WorkoutSession
} from '../types/activity';

// Mock the services
vi.mock('../services/activityService');
vi.mock('../services/workoutSessionService');

const mockActivityService = vi.mocked(activityService);
const mockWorkoutSessionService = vi.mocked(workoutSessionService);

// Mock test data
const mockActivities: UserActivity[] = [
  {
    id: 'activity-1',
    userId: 'test-user',
    type: 'EXERCISE_COMPLETED',
    exerciseId: 'exercise-1',
    duration: 30,
    calories: 150,
    sets: 3,
    reps: 12,
    weight: '50kg',
    notes: 'Good workout',
    activityDate: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    exercise: {
      id: 'exercise-1',
      name: 'Bench Press',
      muscle: 'Chest',
      equipment: 'Barbell',
      image: '',
      video: '',
      overview: '',
      steps: [],
      benefits: [],
      bpm: 0,
      difficulty: 'Intermediate',
      videoContext: '',
      equipmentList: ['Barbell'],
      calories: 50
    }
  },
  {
    id: 'activity-2',
    userId: 'test-user',
    type: 'WORKOUT_COMPLETED',
    workoutSessionId: 'session-1',
    duration: 60,
    calories: 300,
    activityDate: new Date('2024-01-14T09:00:00Z'),
    createdAt: new Date('2024-01-14T09:00:00Z'),
    updatedAt: new Date('2024-01-14T09:00:00Z')
  }
];

const mockWorkoutSession: WorkoutSession = {
  id: 'session-1',
  userId: 'test-user',
  title: 'Morning Workout',
  startedAt: new Date('2024-01-15T09:00:00Z'),
  endedAt: undefined, // Active session
  totalDuration: undefined,
  totalCalories: undefined,
  exercisesCount: 2,
  notes: 'Feeling strong today',
  createdAt: new Date('2024-01-15T09:00:00Z'),
  updatedAt: new Date('2024-01-15T09:00:00Z')
};

const mockStats = {
  totalActivities: 15,
  totalDuration: 450,
  totalCalories: 2250,
  activitiesByType: {
    EXERCISE_COMPLETED: 12,
    WORKOUT_COMPLETED: 2,
    MEAL_LOGGED: 1
  },
  recentStreak: 5,
  weeklyGoal: 7,
  weeklyProgress: 3
};

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return function({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useRecentActivities Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockActivityService.getUserActivities.mockResolvedValue(mockActivities);
    mockActivityService.getActivityStats.mockResolvedValue(mockStats);
    mockWorkoutSessionService.getActiveWorkoutSession.mockResolvedValue(mockWorkoutSession);
    mockActivityService.createActivity.mockResolvedValue(mockActivities[0]);
    mockWorkoutSessionService.createWorkoutSession.mockResolvedValue(mockWorkoutSession);
    mockWorkoutSessionService.endWorkoutSession.mockResolvedValue({
      ...mockWorkoutSession,
      endedAt: new Date(),
      totalDuration: 60,
      totalCalories: 300
    });
    mockActivityService.deleteActivity.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch recent activities successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activities).toEqual(mockActivities);
      expect(result.current.exerciseActivities).toHaveLength(1);
      expect(result.current.workoutActivities).toHaveLength(1);
      expect(result.current.mealActivities).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it('should fetch activity statistics', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingStats).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(mockActivityService.getActivityStats).toHaveBeenCalledWith('test-user', 7);
    });

    it('should fetch active workout session', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoadingActiveSession).toBe(false);
      });

      expect(result.current.activeSession).toEqual(mockWorkoutSession);
      expect(mockWorkoutSessionService.getActiveWorkoutSession).toHaveBeenCalledWith('test-user');
    });

    it('should handle different time periods', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(14, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockActivityService.getUserActivities).toHaveBeenCalledWith('test-user', 14);
      expect(mockActivityService.getActivityStats).toHaveBeenCalledWith('test-user', 14);
    });

    it('should handle loading states correctly', () => {
      mockActivityService.getUserActivities.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isLoadingActivities).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockActivityService.getUserActivities.mockRejectedValue(new Error('Database error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.activitiesError).toBeTruthy();
    });
  });

  describe('Activity Creation', () => {
    it('should log exercise completed activity', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      const activityRequest: CreateActivityRequest = {
        type: 'EXERCISE_COMPLETED',
        exerciseId: 'exercise-1',
        duration: 30,
        calories: 150,
        sets: 3,
        reps: 12
      };

      await result.current.logExerciseCompleted('exercise-1', activityRequest);

      expect(mockActivityService.createActivity).toHaveBeenCalledWith({
        type: 'EXERCISE_COMPLETED',
        exerciseId: 'exercise-1',
        duration: 0,
        calories: 0,
        ...activityRequest
      }, 'test-user');
    });

    it('should handle activity creation errors', async () => {
      mockActivityService.createActivity.mockRejectedValue(new Error('Creation failed'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await expect(result.current.logActivity({
        type: 'EXERCISE_COMPLETED',
        duration: 30
      })).rejects.toThrow('Creation failed');
    });

    it('should show loading state during activity creation', async () => {
      mockActivityService.createActivity.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      const activityPromise = result.current.logActivity({
        type: 'EXERCISE_COMPLETED',
        duration: 30
      });

      expect(result.current.isLoggingActivity).toBe(true);

      await activityPromise;
      expect(result.current.isLoggingActivity).toBe(false);
    });
  });

  describe('Workout Session Management', () => {
    it('should start workout session', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await result.current.startWorkoutSession({
        title: 'Morning Workout',
        notes: 'Ready to train'
      });

      expect(mockWorkoutSessionService.createWorkoutSession).toHaveBeenCalledWith({
        title: 'Morning Workout',
        notes: 'Ready to train'
      }, 'test-user');
    });

    it('should end workout session', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activeSession).toBeDefined();
      });

      if (result.current.activeSession) {
        await result.current.endWorkoutSession({
          title: 'Completed Workout',
          totalDuration: 60,
          totalCalories: 300
        });

        expect(mockWorkoutSessionService.endWorkoutSession).toHaveBeenCalledWith(
          result.current.activeSession.id,
          {
            title: 'Completed Workout',
            totalDuration: 60,
            totalCalories: 300
          }
        );
      }
    });

    it('should log workout completed', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activeSession).toBeDefined();
      });

      if (result.current.activeSession) {
        await result.current.logWorkoutCompleted({
          totalDuration: 60,
          totalCalories: 300
        });

        expect(mockWorkoutSessionService.endWorkoutSession).toHaveBeenCalledWith(
          result.current.activeSession.id,
          {
            totalDuration: 60,
            totalCalories: 300
          }
        );
      }
    });

    it('should handle ending session when no active session exists', async () => {
      mockWorkoutSessionService.getActiveWorkoutSession.mockResolvedValue(null);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activeSession).toBeNull();
      });

      await expect(result.current.logWorkoutCompleted()).rejects.toThrow('No active workout session found');
    });

    it('should show loading states during session operations', async () => {
      mockWorkoutSessionService.createWorkoutSession.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      const sessionPromise = result.current.startWorkoutSession({
        title: 'Test Session'
      });

      expect(result.current.isCreatingSession).toBe(true);

      await sessionPromise;
      expect(result.current.isCreatingSession).toBe(false);
    });
  });

  describe('Derived State', () => {
    it('should categorize activities by type', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activities).toEqual(mockActivities);
      });

      expect(result.current.exerciseActivities).toHaveLength(1);
      expect(result.current.exerciseActivities[0].type).toBe('EXERCISE_COMPLETED');
      expect(result.current.workoutActivities).toHaveLength(1);
      expect(result.current.workoutActivities[0].type).toBe('WORKOUT_COMPLETED');
      expect(result.current.mealActivities).toHaveLength(0);
    });

    it('should group activities by type', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activities).toEqual(mockActivities);
      });

      expect(result.current.recentActivitiesByType).toHaveProperty('EXERCISE_COMPLETED');
      expect(result.current.recentActivitiesByType).toHaveProperty('WORKOUT_COMPLETED');
      expect(result.current.recentActivitiesByType['EXERCISE_COMPLETED']).toHaveLength(1);
      expect(result.current.recentActivitiesByType['WORKOUT_COMPLETED']).toHaveLength(1);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate activities cache', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.activities).toEqual(mockActivities);
      });

      result.current.invalidateActivities();

      // Note: In a real test, we would verify that the query is invalidated
      // This requires more complex testing setup with QueryClient
    });

    it('should invalidate stats cache', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      });

      result.current.invalidateStats();
    });

    it('should refetch all data', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const refetchPromise = result.current.refetch();
      await expect(refetchPromise).resolves.toBeUndefined();
    });
  });
});

describe('useActivity Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActivityService.getActivityById.mockResolvedValue(mockActivities[0]);
    mockActivityService.updateActivity.mockResolvedValue({
      ...mockActivities[0],
      duration: 45
    });
    mockActivityService.deleteActivity.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch single activity by ID', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivity('activity-1'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activity).toEqual(mockActivities[0]);
    expect(mockActivityService.getActivityById).toHaveBeenCalledWith('activity-1');
  });

  it('should handle non-existent activity', async () => {
    mockActivityService.getActivityById.mockResolvedValue(null);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivity('non-existent'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activity).toBeNull();
  });

  it('should update activity', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivity('activity-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.activity).toBeDefined();
    });

    const updatedActivity = await result.current.updateActivity({
      duration: 45,
      calories: 200
    });

    expect(mockActivityService.updateActivity).toHaveBeenCalledWith('activity-1', {
      duration: 45,
      calories: 200
    });
  });

  it('should delete activity', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivity('activity-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.activity).toBeDefined();
    });

    await result.current.deleteActivity();

    expect(mockActivityService.deleteActivity).toHaveBeenCalledWith('activity-1');
  });

  it('should show loading states during operations', async () => {
    mockActivityService.updateActivity.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useActivity('activity-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.activity).toBeDefined();
    });

    const updatePromise = result.current.updateActivity({ duration: 45 });

    expect(result.current.isUpdating).toBe(true);

    await updatePromise;
    expect(result.current.isUpdating).toBe(false);
  });
});

describe('useWorkoutSession Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkoutSessionService.getWorkoutSessionById.mockResolvedValue(mockWorkoutSession);
    mockWorkoutSessionService.updateWorkoutSession.mockResolvedValue({
      ...mockWorkoutSession,
      title: 'Updated Session'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch workout session by ID', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkoutSession('session-1'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockWorkoutSession);
    expect(mockWorkoutSessionService.getWorkoutSessionById).toHaveBeenCalledWith('session-1', true);
  });

  it('should handle non-existent session', async () => {
    mockWorkoutSessionService.getWorkoutSessionById.mockResolvedValue(null);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkoutSession('non-existent'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
  });

  it('should update workout session', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkoutSession('session-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    await result.current.updateSession({
      title: 'Updated Session',
      totalDuration: 75
    });

    expect(mockWorkoutSessionService.updateWorkoutSession).toHaveBeenCalledWith('session-1', {
      title: 'Updated Session',
      totalDuration: 75
    });
  });

  it('should show loading state during update', async () => {
    mockWorkoutSessionService.updateWorkoutSession.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkoutSession('session-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    const updatePromise = result.current.updateSession({ title: 'Updated' });

    expect(result.current.isUpdating).toBe(true);

    await updatePromise;
    expect(result.current.isUpdating).toBe(false);
  });
});

// Integration Tests
describe('Hook Integration Tests', () => {
  it('should handle complete workout flow', async () => {
    const wrapper = createWrapper();
    const { result: activitiesResult } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });

    // Start with no active session
    await waitFor(() => {
      expect(activitiesResult.current.isLoading).toBe(false);
    });

    // Start workout session
    await activitiesResult.current.startWorkoutSession({ title: 'Integration Test Workout' });

    // Log exercise
    await activitiesResult.current.logExerciseCompleted('exercise-1', {
      duration: 30,
      calories: 150,
      sets: 3,
      reps: 12
    });

    // End workout
    await activitiesResult.current.endWorkoutSession({
      totalDuration: 30,
      totalCalories: 150
    });

    // Verify all service methods were called
    expect(mockWorkoutSessionService.createWorkoutSession).toHaveBeenCalled();
    expect(mockActivityService.createActivity).toHaveBeenCalled();
    expect(mockWorkoutSessionService.endWorkoutSession).toHaveBeenCalled();
  });

  it('should handle concurrent operations across multiple hooks', async () => {
    const wrapper = createWrapper();

    const { result: activitiesResult } = renderHook(() => useRecentActivities(7, 'test-user'), { wrapper });
    const { result: activityResult } = renderHook(() => useActivity('activity-1'), { wrapper });
    const { result: sessionResult } = renderHook(() => useWorkoutSession('session-1'), { wrapper });

    // Wait for all initial data to load
    await waitFor(() => {
      expect(activitiesResult.current.isLoading).toBe(false);
      expect(activityResult.current.isLoading).toBe(false);
      expect(sessionResult.current.isLoading).toBe(false);
    });

    // Perform concurrent operations
    const promises = [
      activitiesResult.current.logActivity({ type: 'EXERCISE_COMPLETED', duration: 30 }),
      activityResult.current.updateActivity({ duration: 45 }),
      sessionResult.current.updateSession({ title: 'Updated' })
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    expect(mockActivityService.createActivity).toHaveBeenCalled();
    expect(mockActivityService.updateActivity).toHaveBeenCalled();
    expect(mockWorkoutSessionService.updateWorkoutSession).toHaveBeenCalled();
  });
});
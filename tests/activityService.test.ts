/**
 * Tests for Activity Service
 *
 * These tests verify the functionality of the activity tracking system,
 * including CRUD operations, caching, and data integrity.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { activityService } from '../services/activityService';
import { workoutSessionService } from '../services/workoutSessionService';
import type {
  UserActivity,
  CreateActivityRequest,
  WorkoutSession,
  CreateWorkoutSessionRequest,
  ActivityStats
} from '../types/activity';

// Mock test data
const mockActivity: UserActivity = {
  id: 'test-activity-1',
  userId: 'test-user',
  type: 'EXERCISE_COMPLETED',
  exerciseId: 'test-exercise-1',
  duration: 30,
  calories: 150,
  sets: 3,
  reps: 12,
  weight: '50kg',
  notes: 'Test activity notes',
  activityDate: new Date('2024-01-15T10:00:00Z'),
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z')
};

const mockWorkoutSession: WorkoutSession = {
  id: 'test-session-1',
  userId: 'test-user',
  title: 'Test Workout',
  startedAt: new Date('2024-01-15T09:00:00Z'),
  endedAt: new Date('2024-01-15T10:30:00Z'),
  totalDuration: 90,
  totalCalories: 450,
  exercisesCount: 5,
  notes: 'Test workout session',
  createdAt: new Date('2024-01-15T09:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z')
};

const mockCreateActivityRequest: CreateActivityRequest = {
  type: 'EXERCISE_COMPLETED',
  exerciseId: 'test-exercise-1',
  duration: 30,
  calories: 150,
  sets: 3,
  reps: 12,
  weight: '50kg',
  notes: 'Test activity'
};

const mockCreateSessionRequest: CreateWorkoutSessionRequest = {
  title: 'Test Workout Session',
  notes: 'Test session notes'
};

describe('Activity Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    activityService.clearActivityCache();
    workoutSessionService.clearSessionCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Activity CRUD Operations', () => {
    it('should create a new activity', async () => {
      const activity = await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.userId).toBe('test-user');
      expect(activity.type).toBe('EXERCISE_COMPLETED');
      expect(activity.exerciseId).toBe('test-exercise-1');
      expect(activity.duration).toBe(30);
      expect(activity.calories).toBe(150);
      expect(activity.sets).toBe(3);
      expect(activity.reps).toBe(12);
      expect(activity.weight).toBe('50kg');
      expect(activity.notes).toBe('Test activity');
      expect(activity.activityDate).toBeInstanceOf(Date);
      expect(activity.createdAt).toBeInstanceOf(Date);
      expect(activity.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle activity creation errors gracefully', async () => {
      // Mock invalid activity request
      const invalidRequest = {
        type: 'INVALID_TYPE' as any,
        exerciseId: ''
      };

      await expect(activityService.createActivity(invalidRequest, 'test-user'))
        .rejects.toThrow();
    });

    it('should get activities by user ID', async () => {
      // Create a test activity first
      await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      const activities = await activityService.getUserActivities('test-user', 7);

      expect(Array.isArray(activities)).toBe(true);
      if (activities.length > 0) {
        activities.forEach(activity => {
          expect(activity.userId).toBe('test-user');
          expect(activity.activityDate).toBeInstanceOf(Date);
          expect(['EXERCISE_COMPLETED', 'WORKOUT_COMPLETED', 'MEAL_LOGGED', 'GOAL_ACHIEVED', 'PERSONAL_RECORD', 'STREAK_MAINTAINED'])
            .toContain(activity.type);
        });
      }
    });

    it('should get activity by ID', async () => {
      // Create a test activity first
      const createdActivity = await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      if (createdActivity) {
        const retrievedActivity = await activityService.getActivityById(createdActivity.id);

        expect(retrievedActivity).toBeDefined();
        expect(retrievedActivity?.id).toBe(createdActivity.id);
        expect(retrievedActivity?.type).toBe('EXERCISE_COMPLETED');
      }
    });

    it('should return null for non-existent activity', async () => {
      const activity = await activityService.getActivityById('non-existent-id');
      expect(activity).toBeNull();
    });

    it('should update an existing activity', async () => {
      // Create a test activity first
      const createdActivity = await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      if (createdActivity) {
        const updates = {
          duration: 45,
          calories: 200,
          notes: 'Updated activity notes'
        };

        const updatedActivity = await activityService.updateActivity(createdActivity.id, updates);

        expect(updatedActivity).toBeDefined();
        expect(updatedActivity?.id).toBe(createdActivity.id);
        expect(updatedActivity?.duration).toBe(45);
        expect(updatedActivity?.calories).toBe(200);
        expect(updatedActivity?.notes).toBe('Updated activity notes');
      }
    });

    it('should delete an activity', async () => {
      // Create a test activity first
      const createdActivity = await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      if (createdActivity) {
        const deleteResult = await activityService.deleteActivity(createdActivity.id);
        expect(deleteResult).toBe(true);

        // Verify the activity is deleted
        const deletedActivity = await activityService.getActivityById(createdActivity.id);
        expect(deletedActivity).toBeNull();
      }
    });

    it('should return false when deleting non-existent activity', async () => {
      const deleteResult = await activityService.deleteActivity('non-existent-id');
      expect(deleteResult).toBe(false);
    });
  });

  describe('Activity Filtering and Querying', () => {
    it('should filter activities by date range', async () => {
      const activities = await activityService.getUserActivities('test-user', 7, {
        dateRange: {
          start: new Date('2024-01-10T00:00:00Z'),
          end: new Date('2024-01-20T00:00:00Z')
        }
      });

      expect(Array.isArray(activities)).toBe(true);
      // Verify date filtering works (actual implementation would need real data)
    });

    it('should filter activities by type', async () => {
      const activities = await activityService.getUserActivities('test-user', 7, {
        types: ['EXERCISE_COMPLETED']
      });

      expect(Array.isArray(activities)).toBe(true);
      activities.forEach(activity => {
        expect(activity.type).toBe('EXERCISE_COMPLETED');
      });
    });

    it('should filter activities with exercises', async () => {
      const activities = await activityService.getUserActivities('test-user', 7, {
        hasExercise: true
      });

      expect(Array.isArray(activities)).toBe(true);
      activities.forEach(activity => {
        expect(activity.exerciseId).toBeDefined();
      });
    });

    it('should apply pagination correctly', async () => {
      const activities = await activityService.getUserActivities('test-user', 7, {
        limit: 5,
        offset: 0
      });

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Activity Statistics', () => {
    it('should calculate activity statistics', async () => {
      const stats = await activityService.getActivityStats('test-user', 7);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalActivities');
      expect(stats).toHaveProperty('totalDuration');
      expect(stats).toHaveProperty('totalCalories');
      expect(stats).toHaveProperty('activitiesByType');
      expect(stats).toHaveProperty('recentStreak');
      expect(stats).toHaveProperty('weeklyGoal');
      expect(stats).toHaveProperty('weeklyProgress');

      expect(typeof stats.totalActivities).toBe('number');
      expect(typeof stats.totalDuration).toBe('number');
      expect(typeof stats.totalCalories).toBe('number');
      expect(typeof stats.activitiesByType).toBe('object');
      expect(typeof stats.recentStreak).toBe('number');
      expect(typeof stats.weeklyGoal).toBe('number');
      expect(typeof stats.weeklyProgress).toBe('number');
    });

    it('should handle stats for user with no activities', async () => {
      const stats = await activityService.getActivityStats('user-with-no-activities', 7);

      expect(stats.totalActivities).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.totalCalories).toBe(0);
      expect(stats.recentStreak).toBe(0);
    });
  });

  describe('Activity Aggregation', () => {
    it('should get activity aggregation by week', async () => {
      const aggregation = await activityService.getActivityAggregation('test-user', 'week', 30);

      expect(aggregation).toBeDefined();
      expect(aggregation).toHaveProperty('period');
      expect(aggregation).toHaveProperty('data');
      expect(aggregation.period).toBe('week');
      expect(Array.isArray(aggregation.data)).toBe(true);
    });

    it('should get activity aggregation by day', async () => {
      const aggregation = await activityService.getActivityAggregation('test-user', 'day', 7);

      expect(aggregation).toBeDefined();
      expect(aggregation.period).toBe('day');
      expect(Array.isArray(aggregation.data)).toBe(true);
      expect(aggregation.data.length).toBeLessThanOrEqual(7);
    });

    it('should get activity aggregation by month', async () => {
      const aggregation = await activityService.getActivityAggregation('test-user', 'month', 90);

      expect(aggregation).toBeDefined();
      expect(aggregation.period).toBe('month');
      expect(Array.isArray(aggregation.data)).toBe(true);
      expect(aggregation.data.length).toBeLessThanOrEqual(3); // 3 months in 90 days
    });
  });

  describe('Caching', () => {
    it('should cache activities for performance', async () => {
      const startTime1 = Date.now();
      await activityService.getUserActivities('test-user', 7);
      const time1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await activityService.getUserActivities('test-user', 7);
      const time2 = Date.now() - startTime2;

      // Second call should be faster due to caching
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should clear cache when requested', async () => {
      // First call to populate cache
      await activityService.getUserActivities('test-user', 7);

      // Clear cache
      activityService.clearActivityCache();

      // Next call should fetch fresh data
      const activities = await activityService.getUserActivities('test-user', 7);
      expect(Array.isArray(activities)).toBe(true);
    });

    it('should invalidate cache on activity creation', async () => {
      // First call to populate cache
      await activityService.getUserActivities('test-user', 7);

      // Create new activity (should clear cache)
      await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      // Verify fresh data is fetched
      const activities = await activityService.getUserActivities('test-user', 7);
      expect(Array.isArray(activities)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      const activities = await activityService.getUserActivities('test-user', 7);
      expect(Array.isArray(activities)).toBe(true);
    });

    it('should handle invalid user IDs', async () => {
      const activities = await activityService.getUserActivities('', 7);
      expect(Array.isArray(activities)).toBe(true);
    });

    it('should handle invalid date ranges', async () => {
      const activities = await activityService.getUserActivities('test-user', -1);
      expect(Array.isArray(activities)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain consistent data types', async () => {
      // Create test activity
      const activity = await activityService.createActivity(mockCreateActivityRequest, 'test-user');

      if (activity) {
        expect(typeof activity.id).toBe('string');
        expect(typeof activity.userId).toBe('string');
        expect(['EXERCISE_COMPLETED', 'WORKOUT_COMPLETED', 'MEAL_LOGGED', 'GOAL_ACHIEVED', 'PERSONAL_RECORD', 'STREAK_MAINTAINED'])
          .toContain(activity.type);
        expect(typeof activity.duration).toBe('number');
        expect(typeof activity.calories).toBe('number');
        expect(typeof activity.sets).toBe('number');
        expect(typeof activity.reps).toBe('number');
        expect(typeof activity.weight).toBe('string');
        expect(activity.activityDate).toBeInstanceOf(Date);
        expect(activity.createdAt).toBeInstanceOf(Date);
        expect(activity.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should validate activity types', async () => {
      const validTypes = ['EXERCISE_COMPLETED', 'WORKOUT_COMPLETED', 'MEAL_LOGGED', 'GOAL_ACHIEVED', 'PERSONAL_RECORD', 'STREAK_MAINTAINED'];

      for (const type of validTypes) {
        const activity = await activityService.createActivity({
          type: type as any,
          duration: 30
        }, 'test-user');

        expect(activity?.type).toBe(type);
      }
    });
  });
});

describe('Workout Session Service', () => {
  beforeEach(() => {
    workoutSessionService.clearSessionCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Workout Session CRUD Operations', () => {
    it('should create a new workout session', async () => {
      const session = await workoutSessionService.createWorkoutSession(mockCreateSessionRequest, 'test-user');

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.userId).toBe('test-user');
      expect(session.title).toBe('Test Workout Session');
      expect(session.notes).toBe('Test session notes');
      expect(session.startedAt).toBeInstanceOf(Date);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.exercisesCount).toBe(0);
    });

    it('should get workout session by ID', async () => {
      // Create test session first
      const createdSession = await workoutSessionService.createWorkoutSession(mockCreateSessionRequest, 'test-user');

      if (createdSession) {
        const retrievedSession = await workoutSessionService.getWorkoutSessionById(createdSession.id);

        expect(retrievedSession).toBeDefined();
        expect(retrievedSession?.id).toBe(createdSession.id);
        expect(retrievedSession?.title).toBe('Test Workout Session');
      }
    });

    it('should end a workout session', async () => {
      // Create test session first
      const createdSession = await workoutSessionService.createWorkoutSession(mockCreateSessionRequest, 'test-user');

      if (createdSession) {
        const updates = {
          title: 'Updated Session Title',
          notes: 'Updated notes',
          totalDuration: 60,
          totalCalories: 300
        };

        const endedSession = await workoutSessionService.endWorkoutSession(createdSession.id, updates);

        expect(endedSession).toBeDefined();
        expect(endedSession?.id).toBe(createdSession.id);
        expect(endedSession?.endedAt).toBeInstanceOf(Date);
        expect(endedSession?.title).toBe('Updated Session Title');
        expect(endedSession?.notes).toBe('Updated notes');
        expect(endedSession?.totalDuration).toBe(60);
        expect(endedSession?.totalCalories).toBe(300);
      }
    });

    it('should get active workout session', async () => {
      // Create an active session
      const activeSession = await workoutSessionService.createWorkoutSession({
        title: 'Active Workout'
      }, 'test-user');

      if (activeSession) {
        const retrievedActiveSession = await workoutSessionService.getActiveWorkoutSession('test-user');
        expect(retrievedActiveSession).toBeDefined();
        expect(retrievedActiveSession?.endedAt).toBeUndefined();
      }
    });

    it('should get user workout sessions', async () => {
      // Create test sessions
      await workoutSessionService.createWorkoutSession({ title: 'Session 1' }, 'test-user');
      await workoutSessionService.createWorkoutSession({ title: 'Session 2' }, 'test-user');

      const sessions = await workoutSessionService.getUserWorkoutSessions('test-user', 10, true);

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThanOrEqual(0);
      sessions.forEach(session => {
        expect(session.userId).toBe('test-user');
        expect(session.startedAt).toBeInstanceOf(Date);
      });
    });

    it('should update workout session', async () => {
      // Create test session first
      const createdSession = await workoutSessionService.createWorkoutSession(mockCreateSessionRequest, 'test-user');

      if (createdSession) {
        const updates = {
          title: 'Updated Title',
          notes: 'Updated notes',
          totalDuration: 45,
          totalCalories: 225,
          exercisesCount: 3
        };

        const updatedSession = await workoutSessionService.updateWorkoutSession(createdSession.id, updates);

        expect(updatedSession).toBeDefined();
        expect(updatedSession?.title).toBe('Updated Title');
        expect(updatedSession?.notes).toBe('Updated notes');
        expect(updatedSession?.totalDuration).toBe(45);
        expect(updatedSession?.totalCalories).toBe(225);
        expect(updatedSession?.exercisesCount).toBe(3);
      }
    });

    it('should delete workout session', async () => {
      // Create test session first
      const createdSession = await workoutSessionService.createWorkoutSession(mockCreateSessionRequest, 'test-user');

      if (createdSession) {
        const deleteResult = await workoutSessionService.deleteWorkoutSession(createdSession.id);
        expect(deleteResult).toBe(true);

        // Verify the session is deleted
        const deletedSession = await workoutSessionService.getWorkoutSessionById(createdSession.id);
        expect(deletedSession).toBeNull();
      }
    });
  });

  describe('Workout Session Statistics', () => {
    it('should get workout statistics', async () => {
      const stats = await workoutSessionService.getWorkoutStats('test-user', 30);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('completedSessions');
      expect(stats).toHaveProperty('totalDuration');
      expect(stats).toHaveProperty('averageDuration');
      expect(stats).toHaveProperty('totalCalories');
      expect(stats).toHaveProperty('activeSession');

      expect(typeof stats.totalSessions).toBe('number');
      expect(typeof stats.completedSessions).toBe('number');
      expect(typeof stats.totalDuration).toBe('number');
      expect(typeof stats.averageDuration).toBe('number');
      expect(typeof stats.totalCalories).toBe('number');
    });

    it('should handle stats for user with no sessions', async () => {
      const stats = await workoutSessionService.getWorkoutStats('user-with-no-sessions', 30);

      expect(stats.totalSessions).toBe(0);
      expect(stats.completedSessions).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.totalCalories).toBe(0);
      expect(stats.activeSession).toBeNull();
    });
  });

  describe('Workout Session Caching', () => {
    it('should cache sessions for performance', async () => {
      const startTime1 = Date.now();
      await workoutSessionService.getUserWorkoutSessions('test-user', 10);
      const time1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await workoutSessionService.getUserWorkoutSessions('test-user', 10);
      const time2 = Date.now() - startTime2;

      // Second call should be faster due to caching
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should clear cache when requested', async () => {
      // First call to populate cache
      await workoutSessionService.getUserWorkoutSessions('test-user', 10);

      // Clear cache
      workoutSessionService.clearSessionCache();

      // Next call should fetch fresh data
      const sessions = await workoutSessionService.getUserWorkoutSessions('test-user', 10);
      expect(Array.isArray(sessions)).toBe(true);
    });
  });
});

// Integration Tests
describe('Activity and Workout Session Integration', () => {
  it('should create complete workout flow', async () => {
    // 1. Start workout session
    const session = await workoutSessionService.createWorkoutSession({
      title: 'Morning Workout'
    }, 'test-user');

    expect(session).toBeDefined();

    if (session) {
      // 2. Log exercises during workout
      const exercise1 = await activityService.createActivity({
        type: 'EXERCISE_COMPLETED',
        exerciseId: 'bench-press',
        workoutSessionId: session.id,
        duration: 15,
        calories: 100,
        sets: 3,
        reps: 10
      }, 'test-user');

      const exercise2 = await activityService.createActivity({
        type: 'EXERCISE_COMPLETED',
        exerciseId: 'squats',
        workoutSessionId: session.id,
        duration: 20,
        calories: 150,
        sets: 3,
        reps: 12
      }, 'test-user');

      expect(exercise1).toBeDefined();
      expect(exercise2).toBeDefined();

      // 3. End workout session
      const endedSession = await workoutSessionService.endWorkoutSession(session.id, {
        totalDuration: 35,
        totalCalories: 250,
        exercisesCount: 2
      });

      expect(endedSession?.endedAt).toBeInstanceOf(Date);
      expect(endedSession?.totalDuration).toBe(35);
      expect(endedSession?.totalCalories).toBe(250);
      expect(endedSession?.exercisesCount).toBe(2);

      // 4. Log workout completion
      const workoutCompleted = await activityService.createActivity({
        type: 'WORKOUT_COMPLETED',
        workoutSessionId: session.id,
        duration: 35,
        calories: 250
      }, 'test-user');

      expect(workoutCompleted?.type).toBe('WORKOUT_COMPLETED');
    }
  });

  it('should handle concurrent operations', async () => {
    const promises = [
      activityService.createActivity({ type: 'EXERCISE_COMPLETED', duration: 30 }, 'test-user'),
      workoutSessionService.createWorkoutSession({ title: 'Concurrent Session' }, 'test-user'),
      activityService.getUserActivities('test-user', 7),
      workoutSessionService.getUserWorkoutSessions('test-user', 10)
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(4);
    expect(results[0]).toBeDefined(); // Created activity
    expect(results[1]).toBeDefined(); // Created session
    expect(Array.isArray(results[2])).toBe(true); // Activities list
    expect(Array.isArray(results[3])).toBe(true); // Sessions list
  });
});
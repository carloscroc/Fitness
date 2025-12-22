/**
 * Activity Service
 *
 * Service layer for managing user activities and workout sessions.
 * Follows the same patterns as the existing supabaseClient.ts.
 */

import { supabase } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserActivity,
  CreateActivityRequest,
  ActivityFilterOptions,
  ActivitySortOptions,
  ActivityAggregation,
  ActivityStats,
  ActivityType,
  WorkoutSession
} from '../types/activity';
import type { Exercise } from '../data/exercises';

// Cache for performance optimization (following existing pattern)
const activityCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STATS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for stats

/**
 * Generic cache helper (copied from supabaseClient)
 */
function getCachedData<T>(key: string): T | null {
  const cached = activityCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  activityCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  activityCache.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Map database row to UserActivity interface
 */
function mapDbRowToActivity(row: any): UserActivity {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.activity_type,
    exerciseId: row.exercise_id,
    workoutSessionId: row.workout_session_id,
    duration: row.duration_minutes,
    calories: row.calories_burned,
    sets: row.sets_completed,
    reps: row.reps_completed,
    weight: row.weight_used,
    notes: row.notes,
    activityDate: new Date(row.activity_date),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Map database row to WorkoutSession interface
 */
function mapDbRowToWorkoutSession(row: any): WorkoutSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
    totalDuration: row.total_duration_minutes,
    totalCalories: row.total_calories,
    exercisesCount: row.exercises_count || 0,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Activity Service Class
 */
export class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(request: CreateActivityRequest, userId: string = 'current-user'): Promise<UserActivity> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: request.type,
          exercise_id: request.exerciseId,
          workout_session_id: request.workoutSessionId,
          duration_minutes: request.duration,
          calories_burned: request.calories,
          sets_completed: request.sets,
          reps_completed: request.reps,
          weight_used: request.weight,
          notes: request.notes,
          activity_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create activity:', error);
        throw new Error(`Failed to create activity: ${error.message}`);
      }

      const activity = mapDbRowToActivity(data);
      this.clearActivityCache(); // Clear cache to ensure fresh data
      return activity;
    } catch (err) {
      console.error('Error creating activity:', err);
      throw err;
    }
  }

  /**
   * Get user activities for a specific time range
   */
  async getUserActivities(
    userId: string = 'current-user',
    days: number = 7,
    filters: ActivityFilterOptions = {}
  ): Promise<UserActivity[]> {
    const cacheKey = `activities_${userId}_${days}_${JSON.stringify(filters)}`;
    const cached = getCachedData<UserActivity[]>(cacheKey);
    if (cached) return cached;

    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('user_activities')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString())
        .order('activity_date', { ascending: false });

      // Apply filters
      if (filters.types?.length) {
        query = query.in('activity_type', filters.types);
      }

      if (filters.hasExercise === true) {
        query = query.not('exercise_id', 'is', null);
      } else if (filters.hasExercise === false) {
        query = query.is('exercise_id', null);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch user activities:', error);
        return [];
      }

      const activities = (data || []).map(mapDbRowToActivity);
      setCachedData(cacheKey, activities);
      return activities;
    } catch (err) {
      console.error('Error fetching user activities:', err);
      return [];
    }
  }

  /**
   * Get a single activity by ID
   */
  async getActivityById(activityId: string): Promise<UserActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('id', activityId)
        .single();

      if (error || !data) {
        return null;
      }

      return mapDbRowToActivity(data);
    } catch (err) {
      console.error('Error fetching activity by ID:', err);
      return null;
    }
  }

  /**
   * Update an existing activity
   */
  async updateActivity(activityId: string, updates: Partial<CreateActivityRequest>): Promise<UserActivity | null> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .update({
          duration_minutes: updates.duration,
          calories_burned: updates.calories,
          sets_completed: updates.sets,
          reps_completed: updates.reps,
          weight_used: updates.weight,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to update activity:', error);
        return null;
      }

      const activity = mapDbRowToActivity(data);
      this.clearActivityCache(); // Clear cache to ensure fresh data
      return activity;
    } catch (err) {
      console.error('Error updating activity:', err);
      return null;
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Failed to delete activity:', error);
        return false;
      }

      this.clearActivityCache(); // Clear cache to ensure fresh data
      return true;
    } catch (err) {
      console.error('Error deleting activity:', err);
      return false;
    }
  }

  /**
   * Get activity statistics for a user
   */
  async getActivityStats(
    userId: string = 'current-user',
    days: number = 7
  ): Promise<ActivityStats> {
    const cacheKey = `activity_stats_${userId}_${days}`;
    const cached = getCachedData<ActivityStats>(cacheKey);
    if (cached) return cached;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total count
      const { count: totalCount } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString());

      // Get all activities to calculate counts by type
      const { data: allActivitiesForTypes } = await supabase
        .from('user_activities')
        .select('activity_type')
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString());

      const typeCounts: Record<string, number> = {};
      (allActivitiesForTypes || []).forEach((item: any) => {
        typeCounts[item.activity_type] = (typeCounts[item.activity_type] || 0) + 1;
      });

      // Calculate aggregates
      const { data: allActivities } = await supabase
        .from('user_activities')
        .select('duration_minutes, calories_burned')
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString());

      const totalDuration = (allActivities || []).reduce((sum, activity) => sum + (activity.duration_minutes || 0), 0);
      const totalCalories = (allActivities || []).reduce((sum, activity) => sum + (activity.calories_burned || 0), 0);

      const stats: ActivityStats = {
        totalActivities: totalCount || 0,
        totalDuration,
        totalCalories,
        activitiesByType: typeCounts as Record<ActivityType, number>,
        recentStreak: 0, // TODO: Implement streak calculation
        weeklyGoal: 7, // TODO: Make configurable
        weeklyProgress: 0 // TODO: Calculate based on goal
      };

      setCachedData(cacheKey, stats, STATS_CACHE_TTL);
      return stats;
    } catch (err) {
      console.error('Error getting activity stats:', err);
      return {
        totalActivities: 0,
        totalDuration: 0,
        totalCalories: 0,
        activitiesByType: {} as Record<ActivityType, number>,
        recentStreak: 0,
        weeklyGoal: 7,
        weeklyProgress: 0
      };
    }
  }

  /**
   * Get activity aggregation data
   */
  async getActivityAggregation(
    userId: string = 'current-user',
    period: 'day' | 'week' | 'month' = 'week',
    days: number = 30
  ): Promise<ActivityAggregation> {
    const cacheKey = `activity_agg_${userId}_${period}_${days}`;
    const cached = getCachedData<ActivityAggregation>(cacheKey);
    if (cached) return cached;

    try {
      // TODO: Implement aggregation logic based on period
      // This would require more complex SQL queries or client-side aggregation
      return {
        period,
        data: []
      };
    } catch (err) {
      console.error('Error getting activity aggregation:', err);
      return {
        period,
        data: []
      };
    }
  }

  /**
   * Clear activity cache
   */
  clearActivityCache(): void {
    activityCache.clear();
  }
}

/**
 * Export a singleton instance for consistency with existing patterns
 */
export const activityService = new ActivityService();
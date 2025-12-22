/**
 * Workout Session Service
 *
 * Service layer for managing workout sessions (groups of exercises).
 * Follows the same patterns as the existing supabaseClient.ts.
 */

import { supabase } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkoutSession, CreateWorkoutSessionRequest } from '../types/activity';
import type { Exercise } from '../data/exercises';

// Cache for performance optimization (following existing pattern)
const sessionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic cache helper (copied from supabaseClient)
 */
function getCachedData<T>(key: string): T | null {
  const cached = sessionCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  sessionCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  sessionCache.set(key, { data, timestamp: Date.now(), ttl });
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
 * Workout Session Service Class
 */
export class WorkoutSessionService {
  /**
   * Create a new workout session
   */
  async createWorkoutSession(request: CreateWorkoutSessionRequest, userId: string = 'current-user'): Promise<WorkoutSession> {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          title: request.title,
          started_at: new Date().toISOString(),
          notes: request.notes,
          exercises_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create workout session:', error);
        throw new Error(`Failed to create workout session: ${error.message}`);
      }

      const session = mapDbRowToWorkoutSession(data);
      this.clearSessionCache(); // Clear cache to ensure fresh data
      return session;
    } catch (err) {
      console.error('Error creating workout session:', err);
      throw err;
    }
  }

  /**
   * End a workout session (calculate duration and calories)
   */
  async endWorkoutSession(sessionId: string, updates: Partial<{ title: string; notes: string; totalDuration: number; totalCalories: number }>): Promise<WorkoutSession | null> {
    try {
      // Get current session to calculate totals if not provided
      const currentSession = await this.getWorkoutSessionById(sessionId);
      if (!currentSession) {
        throw new Error('Workout session not found');
      }

      const finalUpdates = {
        title: updates.title || currentSession.title,
        notes: updates.notes || currentSession.notes,
        total_duration_minutes: updates.totalDuration || currentSession.totalDuration,
        total_calories: updates.totalCalories || currentSession.totalCalories,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If duration not provided, calculate from start time
      if (!finalUpdates.total_duration_minutes && currentSession.startedAt) {
        const now = new Date();
        const durationMs = now.getTime() - currentSession.startedAt.getTime();
        finalUpdates.total_duration_minutes = Math.floor(durationMs / (1000 * 60));
      }

      const { data, error } = await supabase
        .from('workout_sessions')
        .update(finalUpdates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to end workout session:', error);
        return null;
      }

      const session = mapDbRowToWorkoutSession(data);
      this.clearSessionCache(); // Clear cache to ensure fresh data
      return session;
    } catch (err) {
      console.error('Error ending workout session:', err);
      throw err;
    }
  }

  /**
   * Get workout session by ID with associated exercises
   */
  async getWorkoutSessionById(sessionId: string, includeExercises: boolean = false): Promise<WorkoutSession | null> {
    const cacheKey = `session_${sessionId}_${includeExercises}`;
    const cached = getCachedData<WorkoutSession>(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId);

      if (includeExercises) {
        // Join with exercises if needed
        query = query.select(`
          *,
          exercises:exercises(id)
        `);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return null;
      }

      const session = mapDbRowToWorkoutSession(data);
      setCachedData(cacheKey, session);
      return session;
    } catch (err) {
      console.error('Error fetching workout session:', err);
      return null;
    }
  }

  /**
   * Get user's workout sessions
   */
  async getUserWorkoutSessions(
    userId: string = 'current-user',
    limit: number = 10,
    includeActive: boolean = true
  ): Promise<WorkoutSession[]> {
    const cacheKey = `sessions_${userId}_${limit}_${includeActive}`;
    const cached = getCachedData<WorkoutSession[]>(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (!includeActive) {
        query = query.not('ended_at', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch workout sessions:', error);
        return [];
      }

      const sessions = (data || []).map(mapDbRowToWorkoutSession);
      setCachedData(cacheKey, sessions);
      return sessions;
    } catch (err) {
      console.error('Error fetching workout sessions:', err);
      return [];
    }
  }

  /**
   * Get active workout session for a user
   */
  async getActiveWorkoutSession(userId: string = 'current-user'): Promise<WorkoutSession | null> {
    const cacheKey = `active_session_${userId}`;
    const cached = getCachedData<WorkoutSession>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      const session = mapDbRowToWorkoutSession(data);
      setCachedData(cacheKey, session, 60 * 1000); // Shorter cache for active sessions
      return session;
    } catch (err) {
      console.error('Error fetching active workout session:', err);
      return null;
    }
  }

  /**
   * Update workout session
   */
  async updateWorkoutSession(
    sessionId: string,
    updates: Partial<CreateWorkoutSessionRequest & { totalDuration: number; totalCalories: number; exercisesCount: number }>
  ): Promise<WorkoutSession | null> {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.totalDuration !== undefined) dbUpdates.total_duration_minutes = updates.totalDuration;
      if (updates.totalCalories !== undefined) dbUpdates.total_calories = updates.totalCalories;
      if (updates.exercisesCount !== undefined) dbUpdates.exercises_count = updates.exercisesCount;

      const { data, error } = await supabase
        .from('workout_sessions')
        .update(dbUpdates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to update workout session:', error);
        return null;
      }

      const session = mapDbRowToWorkoutSession(data);
      this.clearSessionCache(); // Clear cache to ensure fresh data
      return session;
    } catch (err) {
      console.error('Error updating workout session:', err);
      return null;
    }
  }

  /**
   * Delete a workout session
   */
  async deleteWorkoutSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Failed to delete workout session:', error);
        return false;
      }

      this.clearSessionCache(); // Clear cache to ensure fresh data
      return true;
    } catch (err) {
      console.error('Error deleting workout session:', err);
      return false;
    }
  }

  /**
   * Get workout session statistics
   */
  async getWorkoutStats(userId: string = 'current-user', days: number = 30): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalDuration: number;
    averageDuration: number;
    totalCalories: number;
    activeSession: WorkoutSession | null;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString());

      // Get completed sessions
      const { count: completedSessions } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .not('ended_at', 'is', null);

      // Get aggregated data
      const { data: allSessions } = await supabase
        .from('workout_sessions')
        .select('total_duration_minutes, total_calories')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString());

      const totalDuration = (allSessions || []).reduce((sum, session) => sum + (session.total_duration_minutes || 0), 0);
      const totalCalories = (allSessions || []).reduce((sum, session) => sum + (session.total_calories || 0), 0);

      const averageDuration = (completedSessions || 0) > 0
        ? Math.round(totalDuration / completedSessions)
        : 0;

      // Get active session
      const activeSession = await this.getActiveWorkoutSession(userId);

      return {
        totalSessions: totalSessions || 0,
        completedSessions: completedSessions || 0,
        totalDuration,
        averageDuration,
        totalCalories,
        activeSession
      };
    } catch (err) {
      console.error('Error getting workout stats:', err);
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        totalCalories: 0,
        activeSession: null
      };
    }
  }

  /**
   * Clear session cache
   */
  clearSessionCache(): void {
    sessionCache.clear();
  }
}

/**
 * Export a singleton instance for consistency with existing patterns
 */
export const workoutSessionService = new WorkoutSessionService();
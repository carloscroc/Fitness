/**
 * Activity Tracking Types
 *
 * This file defines TypeScript interfaces for user activity tracking,
 * including workout sessions and individual activities.
 */

import { Exercise } from '../data/exercises';

/**
 * Activity type enumeration for user activities
 */
export type ActivityType =
  | 'EXERCISE_COMPLETED'
  | 'WORKOUT_COMPLETED'
  | 'MEAL_LOGGED'
  | 'GOAL_ACHIEVED'
  | 'PERSONAL_RECORD'
  | 'STREAK_MAINTAINED';

/**
 * User activity interface representing a single activity log
 */
export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  exerciseId?: string;
  workoutSessionId?: string;
  duration?: number;
  calories?: number;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
  activityDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Joined data from related tables
  exercise?: Exercise;
  workoutSession?: WorkoutSession;
}

/**
 * Workout session interface for grouping exercises
 */
export interface WorkoutSession {
  id: string;
  userId: string;
  title?: string;
  startedAt: Date;
  endedAt?: Date;
  totalDuration?: number;
  totalCalories?: number;
  exercisesCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Joined data
  exercises?: Exercise[];
}

/**
 * Request interface for creating new activities
 */
export interface CreateActivityRequest {
  type: ActivityType;
  exerciseId?: string;
  workoutSessionId?: string;
  duration?: number;
  calories?: number;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
}

/**
 * Request interface for creating workout sessions
 */
export interface CreateWorkoutSessionRequest {
  title?: string;
  notes?: string;
}

/**
 * Activity statistics interface for dashboard summaries
 */
export interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
  activitiesByType: Record<ActivityType, number>;
  recentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

/**
 * Activity filter options for querying activities
 */
export interface ActivityFilterOptions {
  types?: ActivityType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasExercise?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Activity sort options
 */
export interface ActivitySortOptions {
  field: 'activityDate' | 'duration' | 'calories' | 'type';
  direction: 'asc' | 'desc';
}

/**
 * Activity aggregation result
 */
export interface ActivityAggregation {
  period: 'day' | 'week' | 'month';
  data: Array<{
    period: string;
    count: number;
    totalDuration: number;
    totalCalories: number;
    activitiesByType: Record<ActivityType, number>;
  }>;
}

/**
 * Type guard functions
 */
export function isExerciseActivity(activity: UserActivity): activity is UserActivity & {
  type: 'EXERCISE_COMPLETED';
  exerciseId: string;
  exercise: Exercise;
} {
  return activity.type === 'EXERCISE_COMPLETED' && !!activity.exerciseId;
}

export function isWorkoutActivity(activity: UserActivity): activity is UserActivity & {
  type: 'WORKOUT_COMPLETED';
  workoutSessionId: string;
  workoutSession: WorkoutSession;
} {
  return activity.type === 'WORKOUT_COMPLETED' && !!activity.workoutSessionId;
}

export function isActiveSession(session: WorkoutSession): boolean {
  return !session.endedAt;
}

/**
 * Utility functions
 */
export function createActivityFromExercise(
  exercise: Exercise,
  overrides: Partial<CreateActivityRequest> = {}
): CreateActivityRequest {
  return {
    type: 'EXERCISE_COMPLETED',
    exerciseId: exercise.id,
    duration: exercise.duration || 0,
    calories: exercise.calories || 0,
    notes: `Completed ${exercise.name}`,
    ...overrides
  };
}

export function getActivityDurationText(activity: UserActivity): string {
  if (!activity.duration) return '';

  if (activity.duration < 60) {
    return `${activity.duration} min`;
  }

  const hours = Math.floor(activity.duration / 60);
  const minutes = activity.duration % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function getActivityTypeIcon(type: ActivityType): string {
  switch (type) {
    case 'EXERCISE_COMPLETED':
      return '🏋️';
    case 'WORKOUT_COMPLETED':
      return '💪';
    case 'MEAL_LOGGED':
      return '🍽️';
    case 'GOAL_ACHIEVED':
      return '🎯';
    case 'PERSONAL_RECORD':
      return '🏆';
    case 'STREAK_MAINTAINED':
      return '🔥';
    default:
      return '📝';
  }
}

export function getActivityTypeColor(type: ActivityType): string {
  switch (type) {
    case 'EXERCISE_COMPLETED':
      return '#30D158'; // Green
    case 'WORKOUT_COMPLETED':
      return '#0A84FF'; // Blue
    case 'MEAL_LOGGED':
      return '#FF9F0A'; // Orange
    case 'GOAL_ACHIEVED':
      return '#FF453A'; // Red
    case 'PERSONAL_RECORD':
      return '#FFD60A'; // Yellow
    case 'STREAK_MAINTAINED':
      return '#FF6B35'; // Coral
    default:
      return '#8E8E93'; // Gray
  }
}
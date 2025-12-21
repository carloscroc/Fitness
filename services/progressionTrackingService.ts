/**
 * Progression Tracking Service
 *
 * Comprehensive service for tracking user progression through Phase 4 exercises.
 * Handles milestone detection, improvement calculations, and achievement celebrations.
 */

import { supabase } from './supabaseClient';
import { getExerciseLibraryAnalytics } from './exerciseLibraryAnalytics';
import { trackError } from './errorTracking';
import { exerciseService } from './exerciseService';
import type {
  ExerciseProgression,
  ProgressionLevel,
  EnhancedExercise
} from './exerciseService';

/**
 * Milestone definitions
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  type: 'level' | 'reps' | 'sets' | 'weight' | 'time' | 'streak' | 'improvement';
  targetValue: number;
  category: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  badge?: string;
}

/**
 * User achievement record
 */
export interface UserAchievement {
  id: string;
  userId: string;
  milestoneId: string;
  exerciseId?: string;
  achievedAt: Date;
  points: number;
  celebrated: boolean;
  shared: boolean;
}

/**
 * Progression session data
 */
export interface ProgressionSession {
  id: string;
  userId: string;
  exerciseId: string;
  startTime: Date;
  endTime?: Date;
  sets: Array<{
    reps: number;
    weight?: number;
    time?: number;
    restTime?: number;
    formRating?: number;
    notes?: string;
  }>;
  totalReps: number;
  totalTime: number;
  avgFormRating: number;
  perceivedExertion?: number; // 1-10 RPE scale
  notes?: string;
  completed: boolean;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

/**
 * Progression analytics
 */
export interface ProgressionAnalytics {
  userId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    totalExercises: number;
    totalReps: number;
    totalTime: number; // in minutes
    avgSessionDuration: number;
    consistency: number; // percentage of planned sessions completed
    improvementRate: number; // overall improvement percentage
  };
  byCategory: {
    flexibility: {
      sessions: number;
      avgFlexibility: number; // 1-10
      improvement: number;
    };
    balance: {
      sessions: number;
      avgStability: number; // 1-10
      improvement: number;
    };
    power: {
      sessions: number;
      avgPower: number; // 1-10
      improvement: number;
    };
    cardio: {
      sessions: number;
      avgEndurance: number; // 1-10
      improvement: number;
    };
  };
  streaks: {
    current: number; // days
    longest: number; // days
    thisWeek: number;
    thisMonth: number;
  };
  upcomingMilestones: Array<{
    exerciseId: string;
    exerciseName: string;
    milestone: Milestone;
    progress: number; // percentage
    estimatedCompletion: Date;
  }>;
}

/**
 * Progression recommendation
 */
export interface ProgressionRecommendation {
  type: 'increase_difficulty' | 'add_variation' | 'focus_form' | 'take_rest' | 'new_exercise';
  exerciseId?: string;
  exerciseName?: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

class ProgressionTrackingService {
  private analytics = getExerciseLibraryAnalytics();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private milestones: Milestone[] = [];
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.initializeMilestones();
    this.setupCacheCleanup();
  }

  /**
   * Initialize milestone definitions
   */
  private initializeMilestones(): void {
    this.milestones = [
      // Level milestones
      {
        id: 'level_2',
        name: 'Rising Star',
        description: 'Reach Level 2 in any exercise',
        type: 'level',
        targetValue: 2,
        category: 'bronze',
        points: 50,
        badge: 'bronze_star'
      },
      {
        id: 'level_3',
        name: 'Intermediate Athlete',
        description: 'Reach Level 3 in any exercise',
        type: 'level',
        targetValue: 3,
        category: 'silver',
        points: 100,
        badge: 'silver_star'
      },
      {
        id: 'level_4',
        name: 'Advanced Performer',
        description: 'Reach Level 4 in any exercise',
        type: 'level',
        targetValue: 4,
        category: 'gold',
        points: 200,
        badge: 'gold_star'
      },
      {
        id: 'level_5',
        name: 'Master Elite',
        description: 'Reach Level 5 in any exercise',
        type: 'level',
        targetValue: 5,
        category: 'platinum',
        points: 500,
        badge: 'platinum_star'
      },

      // Volume milestones
      {
        id: 'reps_100',
        name: 'Century Club',
        description: 'Complete 100 total reps in any exercise',
        type: 'reps',
        targetValue: 100,
        category: 'bronze',
        points: 75
      },
      {
        id: 'reps_500',
        name: 'Rep Master',
        description: 'Complete 500 total reps in any exercise',
        type: 'reps',
        targetValue: 500,
        category: 'silver',
        points: 150
      },
      {
        id: 'reps_1000',
        name: 'Rep Legend',
        description: 'Complete 1000 total reps in any exercise',
        type: 'reps',
        targetValue: 1000,
        category: 'gold',
        points: 300
      },

      // Sets milestones
      {
        id: 'sets_50',
        name: 'Dedicated',
        description: 'Complete 50 sets in any exercise',
        type: 'sets',
        targetValue: 50,
        category: 'bronze',
        points: 60
      },
      {
        id: 'sets_100',
        name: 'Committed',
        description: 'Complete 100 sets in any exercise',
        type: 'sets',
        targetValue: 100,
        category: 'silver',
        points: 120
      },

      // Streak milestones
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        type: 'streak',
        targetValue: 7,
        category: 'bronze',
        points: 80
      },
      {
        id: 'streak_30',
        name: 'Month Master',
        description: 'Maintain a 30-day workout streak',
        type: 'streak',
        targetValue: 30,
        category: 'gold',
        points: 400
      },

      // Improvement milestones
      {
        id: 'improvement_25',
        name: 'Improving',
        description: 'Achieve 25% improvement in any exercise',
        type: 'improvement',
        targetValue: 25,
        category: 'bronze',
        points: 90
      },
      {
        id: 'improvement_50',
        name: 'Progressing Well',
        description: 'Achieve 50% improvement in any exercise',
        type: 'improvement',
        targetValue: 50,
        category: 'silver',
        points: 180
      },
      {
        id: 'improvement_100',
        name: 'Transformation',
        description: 'Achieve 100% improvement in any exercise',
        type: 'improvement',
        targetValue: 100,
        category: 'platinum',
        points: 600
      }
    ];
  }

  /**
   * Setup cache cleanup
   */
  private setupCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Get cached data
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached data
   */
  private setCachedData<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Record a progression session
   */
  async recordSession(session: Omit<ProgressionSession, 'id' | 'quality' | 'avgFormRating'>): Promise<ProgressionSession> {
    try {
      // Calculate session quality metrics
      const avgFormRating = session.sets.reduce((sum, set) => sum + (set.formRating || 0), 0) / session.sets.length;

      let quality: ProgressionSession['quality'] = 'fair';
      if (avgFormRating >= 8) quality = 'excellent';
      else if (avgFormRating >= 6) quality = 'good';
      else if (avgFormRating >= 4) quality = 'fair';
      else quality = 'poor';

      // Create complete session object
      const completeSession: ProgressionSession = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quality,
        avgFormRating: Math.round(avgFormRating * 10) / 10
      };

      // In a real implementation, save to database
      // await supabase.from('progression_sessions').insert(completeSession);

      // Update exercise progression
      await this.updateExerciseProgression(session.userId, session.exerciseId, session);

      // Clear relevant caches
      this.cache.delete(`progression_${session.userId}`);
      this.cache.delete(`analytics_${session.userId}`);
      this.cache.delete(`achievements_${session.userId}`);

      // Track analytics
      this.analytics.trackEvent('progression_session_completed', {
        userId: session.userId,
        exerciseId: session.exerciseId,
        duration: session.totalTime,
        quality,
        setsCount: session.sets.length
      });

      return completeSession;
    } catch (error) {
      trackError(error as Error, { operation: 'recordSession', session });
      throw error;
    }
  }

  /**
   * Update exercise progression based on session
   */
  private async updateExerciseProgression(
    userId: string,
    exerciseId: string,
    session: Omit<ProgressionSession, 'id' | 'quality' | 'avgFormRating'>
  ): Promise<void> {
    // Get current progression
    const currentProgression = await exerciseService.getUserProgression(userId, [exerciseId]);
    let progression = currentProgression.get(exerciseId);

    if (!progression) {
      // Initialize new progression
      progression = {
        userId,
        exerciseId,
        currentLevel: 1,
        completedSets: 0,
        totalReps: 0,
        lastCompleted: new Date(),
        improvementRate: 0,
        milestoneAchievements: []
      };
    }

    // Update progression data
    progression.completedSets += session.sets.length;
    progression.totalReps += session.totalReps;
    progression.lastCompleted = new Date();

    // Calculate improvement rate (simplified)
    progression.improvementRate = this.calculateImprovementRate(progression, session);

    // Check for level progression
    const newLevel = this.calculateProgressionLevel(progression);
    if (newLevel > progression.currentLevel) {
      progression.currentLevel = newLevel;

      // Track level up
      this.analytics.trackEvent('exercise_level_up', {
        userId,
        exerciseId,
        oldLevel: progression.currentLevel - 1,
        newLevel
      });
    }

    // Check for milestone achievements
    const newAchievements = await this.checkMilestoneAchievements(userId, progression);
    progression.milestoneAchievements.push(...newAchievements.map(a => a.id));

    // Save updated progression
    await exerciseService.updateUserProgression(userId, exerciseId, progression);
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovementRate(
    progression: ExerciseProgression,
    session: Omit<ProgressionSession, 'id' | 'quality' | 'avgFormRating'>
  ): number {
    // Simplified improvement calculation
    // In a real implementation, this would consider:
    // - Weight progression
    // - Time improvements
    // - Form rating improvements
    // - Consistency factors

    const baseImprovement = Math.min(session.sets.length * 2, 20); // Up to 20% per session
    const formBonus = session.avgFormRating ? (session.avgFormRating - 5) * 2 : 0; // Form bonus
    const consistencyBonus = progression.completedSets > 10 ? 10 : progression.completedSets;

    return Math.round(progression.improvementRate + baseImprovement + formBonus + consistencyBonus);
  }

  /**
   * Calculate progression level based on performance
   */
  private calculateProgressionLevel(progression: ExerciseProgression): ProgressionLevel {
    const { completedSets, totalReps, improvementRate } = progression;

    // Level progression logic
    if (completedSets >= 100 || totalReps >= 1000 || improvementRate >= 75) {
      return 5;
    } else if (completedSets >= 50 || totalReps >= 500 || improvementRate >= 50) {
      return 4;
    } else if (completedSets >= 25 || totalReps >= 250 || improvementRate >= 30) {
      return 3;
    } else if (completedSets >= 10 || totalReps >= 100 || improvementRate >= 15) {
      return 2;
    }

    return 1;
  }

  /**
   * Check for milestone achievements
   */
  private async checkMilestoneAchievements(
    userId: string,
    progression: ExerciseProgression
  ): Promise<UserAchievement[]> {
    const achievements: UserAchievement[] = [];

    // Check level milestones
    const levelMilestones = this.milestones.filter(m => m.type === 'level');
    for (const milestone of levelMilestones) {
      if (progression.currentLevel >= milestone.targetValue) {
        // Check if already achieved
        const existing = await this.getUserAchievements(userId);
        if (!existing.some(a => a.milestoneId === milestone.id)) {
          achievements.push({
            id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            milestoneId: milestone.id,
            exerciseId: progression.exerciseId,
            achievedAt: new Date(),
            points: milestone.points,
            celebrated: false,
            shared: false
          });
        }
      }
    }

    // Check volume milestones
    const volumeMilestones = this.milestones.filter(m => m.type === 'reps' || m.type === 'sets');
    for (const milestone of volumeMilestones) {
      const currentValue = milestone.type === 'reps' ? progression.totalReps : progression.completedSets;

      if (currentValue >= milestone.targetValue) {
        const existing = await this.getUserAchievements(userId);
        if (!existing.some(a => a.milestoneId === milestone.id && a.exerciseId === progression.exerciseId)) {
          achievements.push({
            id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            milestoneId: milestone.id,
            exerciseId: progression.exerciseId,
            achievedAt: new Date(),
            points: milestone.points,
            celebrated: false,
            shared: false
          });
        }
      }
    }

    // Check improvement milestones
    const improvementMilestones = this.milestones.filter(m => m.type === 'improvement');
    for (const milestone of improvementMilestones) {
      if (progression.improvementRate >= milestone.targetValue) {
        const existing = await this.getUserAchievements(userId);
        if (!existing.some(a => a.milestoneId === milestone.id && a.exerciseId === progression.exerciseId)) {
          achievements.push({
            id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            milestoneId: milestone.id,
            exerciseId: progression.exerciseId,
            achievedAt: new Date(),
            points: milestone.points,
            celebrated: false,
            shared: false
          });
        }
      }
    }

    // Save achievements
    if (achievements.length > 0) {
      // In a real implementation: await supabase.from('user_achievements').insert(achievements);

      // Track achievement events
      achievements.forEach(achievement => {
        this.analytics.trackEvent('milestone_achieved', {
          userId,
          milestoneId: achievement.milestoneId,
          exerciseId: achievement.exerciseId,
          points: achievement.points
        });
      });
    }

    return achievements;
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string, limit: number = 50): Promise<UserAchievement[]> {
    const cacheKey = `achievements_${userId}`;
    const cached = this.getCachedData<UserAchievement[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // In a real implementation:
      // const { data } = await supabase
      //   .from('user_achievements')
      //   .select('*')
      //   .eq('userId', userId)
      //   .order('achievedAt', { ascending: false })
      //   .limit(limit);

      // For now, return mock data
      const achievements: UserAchievement[] = [];

      this.setCachedData(cacheKey, achievements, this.CACHE_TTL);
      return achievements;
    } catch (error) {
      trackError(error as Error, { operation: 'getUserAchievements', userId });
      return [];
    }
  }

  /**
   * Get progression analytics
   */
  async getProgressionAnalytics(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ProgressionAnalytics> {
    const cacheKey = `analytics_${userId}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
    const cached = this.getCachedData<ProgressionAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // In a real implementation, this would query the database
      // For now, return mock analytics structure
      const analytics: ProgressionAnalytics = {
        userId,
        timeRange,
        summary: {
          totalSessions: 0,
          totalExercises: 0,
          totalReps: 0,
          totalTime: 0,
          avgSessionDuration: 0,
          consistency: 0,
          improvementRate: 0
        },
        byCategory: {
          flexibility: { sessions: 0, avgFlexibility: 0, improvement: 0 },
          balance: { sessions: 0, avgStability: 0, improvement: 0 },
          power: { sessions: 0, avgPower: 0, improvement: 0 },
          cardio: { sessions: 0, avgEndurance: 0, improvement: 0 }
        },
        streaks: {
          current: 0,
          longest: 0,
          thisWeek: 0,
          thisMonth: 0
        },
        upcomingMilestones: []
      };

      this.setCachedData(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      trackError(error as Error, { operation: 'getProgressionAnalytics', userId, timeRange });
      throw error;
    }
  }

  /**
   * Get progression recommendations
   */
  async getProgressionRecommendations(userId: string): Promise<ProgressionRecommendation[]> {
    const cacheKey = `recommendations_${userId}`;
    const cached = this.getCachedData<ProgressionRecommendation[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const recommendations: ProgressionRecommendation[] = [];

      // Get user progression data
      const userProgression = await exerciseService.getUserProgression(userId);
      const analytics = await this.getProgressionAnalytics(userId, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      });

      // Analyze progression patterns and generate recommendations
      for (const [exerciseId, progression] of userProgression) {
        // Check for stagnation
        if (progression.improvementRate < 10 && progression.completedSets > 20) {
          recommendations.push({
            type: 'add_variation',
            exerciseId,
            exerciseName: '', // Would fetch from exercise service
            reasoning: 'Progress has plateaued. Try a variation of this exercise.',
            priority: 'medium',
            actionable: true
          });
        }

        // Check for readiness to level up
        if (progression.currentLevel < 5 && progression.improvementRate >= progression.currentLevel * 15) {
          recommendations.push({
            type: 'increase_difficulty',
            exerciseId,
            exerciseName: '',
            reasoning: `Ready to advance to Level ${progression.currentLevel + 1}`,
            priority: 'high',
            actionable: true
          });
        }

        // Check form consistency
        if (progression.avgFormRating && progression.avgFormRating < 6) {
          recommendations.push({
            type: 'focus_form',
            exerciseId,
            exerciseName: '',
            reasoning: 'Focus on form quality before increasing intensity.',
            priority: 'high',
            actionable: true
          });
        }
      }

      // Check for overtraining
      if (analytics.summary.totalSessions > 25 && analytics.streaks.current > 14) {
        recommendations.push({
          type: 'take_rest',
          reasoning: 'Consider a rest day to prevent overtraining and promote recovery.',
          priority: 'medium',
          actionable: true
        });
      }

      // Sort by priority and relevance
      recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      this.setCachedData(cacheKey, recommendations, this.CACHE_TTL);
      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      trackError(error as Error, { operation: 'getProgressionRecommendations', userId });
      throw error;
    }
  }

  /**
   * Celebrate milestone achievement
   */
  async celebrateAchievement(achievementId: string, share: boolean = false): Promise<void> {
    try {
      // In a real implementation:
      // await supabase
      //   .from('user_achievements')
      //   .update({ celebrated: true, shared: share })
      //   .eq('id', achievementId);

      this.analytics.trackEvent('milestone_celebrated', {
        achievementId,
        shared: share
      });

      if (share) {
        this.analytics.trackFeatureUsage('social_features', 'interact', {
          action: 'share_achievement',
          targetId: achievementId
        });
      }
    } catch (error) {
      trackError(error as Error, { operation: 'celebrateAchievement', achievementId, share });
      throw error;
    }
  }

  /**
   * Get available milestones
   */
  getAvailableMilestones(category?: Milestone['category']): Milestone[] {
    if (category) {
      return this.milestones.filter(m => m.category === category);
    }
    return this.milestones;
  }

  /**
   * Get milestone by ID
   */
  getMilestone(milestoneId: string): Milestone | undefined {
    return this.milestones.find(m => m.id === milestoneId);
  }

  /**
   * Calculate user's total points
   */
  async getUserPoints(userId: string): Promise<number> {
    const achievements = await this.getUserAchievements(userId);
    return achievements.reduce((total, achievement) => total + achievement.points, 0);
  }

  /**
   * Get user's rank and leaderboard position
   */
  async getUserRank(userId: string): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
    points: number;
  }> {
    try {
      // In a real implementation, this would query a leaderboard table
      // For now, return mock rank data
      return {
        rank: 1,
        totalUsers: 1,
        percentile: 100,
        points: await this.getUserPoints(userId)
      };
    } catch (error) {
      trackError(error as Error, { operation: 'getUserRank', userId });
      throw error;
    }
  }

  /**
   * Export progression data
   */
  async exportProgressionData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const analytics = await this.getProgressionAnalytics(userId, {
        start: new Date(0), // Beginning of time
        end: new Date()
      });

      const achievements = await this.getUserAchievements(userId, 1000);
      const userProgression = await exerciseService.getUserProgression(userId);

      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        analytics,
        achievements,
        progression: Object.fromEntries(userProgression)
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else {
        // Convert to CSV format
        return this.convertToCSV(exportData);
      }
    } catch (error) {
      trackError(error as Error, { operation: 'exportProgressionData', userId, format });
      throw error;
    }
  }

  /**
   * Convert progression data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    const headers = [
      'Exercise ID',
      'Current Level',
      'Total Sets',
      'Total Reps',
      'Improvement Rate (%)',
      'Last Completed'
    ];

    const rows = [headers.join(',')];

    Object.entries(data.progression).forEach(([exerciseId, progression]: [string, any]) => {
      const row = [
        exerciseId,
        progression.currentLevel,
        progression.completedSets,
        progression.totalReps,
        progression.improvementRate,
        progression.lastCompleted
      ].join(',');

      rows.push(row);
    });

    return rows.join('\n');
  }

  /**
   * Clear user cache
   */
  clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key =>
      key.includes(userId)
    );

    keysToDelete.forEach(key => this.cache.delete(key));

    this.analytics.trackEvent('cache_cleared', {
      operation: 'clear_user_cache',
      userId,
      clearedKeys: keysToDelete.length
    });
  }
}

// Create and export singleton instance
export const progressionTrackingService = new ProgressionTrackingService();

export default progressionTrackingService;
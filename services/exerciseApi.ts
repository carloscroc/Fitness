/**
 * Exercise API - Clean Interface for Phase 4 Exercise Service
 *
 * Provides a simplified, developer-friendly API for consuming exercise data
 * with full Phase 4 support, including caching, error handling, and analytics.
 */

import { exerciseService } from './exerciseService';
import { progressionTrackingService } from './progressionTrackingService';
import { getExerciseLibraryAnalytics } from './exerciseLibraryAnalytics';
import { trackError } from './errorTracking';
import type {
  EnhancedExercise,
  AdvancedExerciseFilters,
  ExerciseSearchResult,
  ExerciseProgression,
  ExerciseRecommendationContext,
  ProgressionAnalytics,
  ProgressionRecommendation,
  UserAchievement,
  ProgressionSession,
  BalanceRequirement,
  FlexibilityType,
  PowerMetric,
  ProgressionLevel,
  MedicineBallWeight,
  StabilityBallSize,
  Phase4Category
} from './exerciseService';

/**
 * Simplified API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  metadata?: {
    responseTime: number;
    cached: boolean;
    totalItems?: number;
    pagination?: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

/**
 * Exercise categories with Phase 4 support
 */
export const EXERCISE_CATEGORIES = {
  // Standard categories
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  STRETCHING: 'stretching',
  PLYOMETRICS: 'plyometrics',

  // Phase 4 categories
  FLEXIBILITY: 'flexibility' as Phase4Category,
  BALANCE: 'balance' as Phase4Category,
  MEDICINE_BALL: 'medicine_ball' as Phase4Category,
  STABILITY_BALL: 'stability_ball' as Phase4Category,
  ADVANCED_CARDIO: 'advanced_cardio' as Phase4Category
} as const;

/**
 * Predefined filters for common use cases
 */
export const PREDEFINED_FILTERS = {
  // Phase 4 category filters
  FLEXIBILITY_EXERCISES: {
    categories: [EXERCISE_CATEGORIES.FLEXIBILITY],
    flexibilityTypes: ['static', 'dynamic', 'proprioceptive']
  } as AdvancedExerciseFilters,

  BALANCE_EXERCISES: {
    categories: [EXERCISE_CATEGORIES.BALANCE],
    balanceRequirements: ['static', 'dynamic', 'advanced']
  } as AdvancedExerciseFilters,

  MEDICINE_BALL_WORKOUTS: {
    categories: [EXERCISE_CATEGORIES.MEDICINE_BALL],
    powerMetrics: ['explosive', 'rotational', 'plyometric']
  } as AdvancedExerciseFilters,

  STABILITY_BALL_EXERCISES: {
    categories: [EXERCISE_CATEGORIES.STABILITY_BALL],
    stabilityRequirements: ['moderate', 'high'],
    balanceRequirements: ['dynamic', 'advanced']
  } as AdvancedExerciseFilters,

  ADVANCED_CARDIO_WORKOUTS: {
    categories: [EXERCISE_CATEGORIES.ADVANCED_CARDIO],
    cardiovascularIntensity: ['vigorous', 'max'],
    impactLevels: ['high']
  } as AdvancedExerciseFilters,

  // Progressive filters
  BEGINNER_FRIENDLY: {
    progressionLevels: [1, 2],
    minPopularityScore: 0.3
  } as AdvancedExerciseFilters,

  INTERMEDIATE_CHALLENGE: {
    progressionLevels: [2, 3, 4],
    minPopularityScore: 0.5
  } as AdvancedExerciseFilters,

  ADVANCED_WORKOUTS: {
    progressionLevels: [4, 5],
    userRatedOnly: true,
    minFormRating: 7
  } as AdvancedExerciseFilters,

  // Equipment-based filters
  NO_EQUIPMENT: {
    equipment: ['none', 'bodyweight']
  } as AdvancedExerciseFilters,

  MINIMAL_EQUIPMENT: {
    equipment: ['none', 'bodyweight', 'dumbbell', 'resistance band']
  } as AdvancedExerciseFilters,

  FULL_GYM: {
    // No equipment filter - includes all
  } as AdvancedExerciseFilters
} as const;

class ExerciseApi {
  private analytics = getExerciseLibraryAnalytics();

  /**
   * Search exercises with enhanced filtering
   */
  async searchExercises(
    query: string = '',
    filters: Partial<AdvancedExerciseFilters> = {},
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'name' | 'popularity' | 'difficulty' | 'relevance' | 'progressionLevel';
      sortOrder?: 'asc' | 'desc';
      includeRelevanceScores?: boolean;
    } = {}
  ): Promise<ApiResponse<ExerciseSearchResult & { relevanceScores?: Map<string, number> }>> {
    const endTimer = this.analytics.startPerformanceTimer('api_search_exercises');

    try {
      const searchResult = await exerciseService.searchExercises(
        query,
        filters as AdvancedExerciseFilters,
        {
          field: options.sortBy || 'name',
          direction: options.sortOrder || 'asc'
        },
        options.limit || 50,
        options.offset || 0
      );

      // Remove relevance scores if not requested
      const response = {
        ...searchResult,
        relevanceScores: options.includeRelevanceScores ? searchResult.relevanceScores : undefined
      };

      this.analytics.trackFeatureUsage('exercise_search', 'view', {
        query,
        filterCount: Object.keys(filters).length,
        resultCount: response.exercises.length,
        hasPhase4Filters: this.hasPhase4Filters(filters)
      });

      return {
        data: response,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false, // Would be determined from actual cache status
          totalItems: response.totalCount,
          pagination: {
            page: Math.floor((options.offset || 0) / (options.limit || 50)) + 1,
            limit: options.limit || 50,
            hasMore: response.hasMore || false
          }
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'searchExercises',
        query,
        filters,
        options
      });

      return {
        data: {
          exercises: [],
          totalCount: 0,
          filteredCount: 0,
          searchTime: endTimer()
        },
        success: false,
        message: 'Search failed. Please try again.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get exercises by predefined filter
   */
  async getExercisesByFilter(
    filterKey: keyof typeof PREDEFINED_FILTERS,
    query: string = '',
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'name' | 'popularity' | 'difficulty';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ApiResponse<ExerciseSearchResult>> {
    const filters = PREDEFINED_FILTERS[filterKey];

    return this.searchExercises(query, filters, {
      ...options,
      includeRelevanceScores: false
    });
  }

  /**
   * Get exercise recommendations for a user
   */
  async getRecommendations(
    context: ExerciseRecommendationContext,
    count: number = 10
  ): Promise<ApiResponse<EnhancedExercise[]>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_recommendations');

    try {
      const recommendations = await exerciseService.getExerciseRecommendations(context, count);

      this.analytics.trackFeatureUsage('personalized_recommendations', 'view', {
        userId: context.userId,
        recommendationCount: recommendations.length,
        currentLevel: context.currentLevel,
        goalCount: context.goals.length
      });

      return {
        data: recommendations,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false,
          totalItems: recommendations.length
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getRecommendations',
        context,
        count
      });

      return {
        data: [],
        success: false,
        message: 'Failed to get recommendations.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(exerciseId: string): Promise<ApiResponse<EnhancedExercise | null>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_exercise_by_id');

    try {
      // Search for specific exercise
      const searchResult = await exerciseService.searchExercises('', {}, {}, 1, 0);
      const exercise = searchResult.exercises.find(e => e.id === exerciseId) || null;

      if (exercise) {
        this.analytics.trackExerciseView(exerciseId, {
          source: 'api_get_by_id'
        });
      }

      return {
        data: exercise,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false,
          totalItems: exercise ? 1 : 0
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getExerciseById',
        exerciseId
      });

      return {
        data: null,
        success: false,
        message: 'Exercise not found.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get user progression data
   */
  async getUserProgression(userId: string, exerciseIds?: string[]): Promise<ApiResponse<Map<string, ExerciseProgression>>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_user_progression');

    try {
      const progression = await exerciseService.getUserProgression(userId, exerciseIds);

      return {
        data: progression,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false,
          totalItems: progression.size
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getUserProgression',
        userId,
        exerciseIds
      });

      return {
        data: new Map(),
        success: false,
        message: 'Failed to get progression data.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Record a workout session
   */
  async recordSession(session: Omit<ProgressionSession, 'id' | 'quality' | 'avgFormRating'>): Promise<ApiResponse<ProgressionSession>> {
    const endTimer = this.analytics.startPerformanceTimer('api_record_session');

    try {
      const recordedSession = await progressionTrackingService.recordSession(session);

      this.analytics.trackFeatureUsage('progress_tracking', 'interact', {
        action: 'session_completed',
        exerciseId: session.exerciseId,
        setsCount: session.sets.length,
        quality: recordedSession.quality
      });

      return {
        data: recordedSession,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'recordSession',
        session
      });

      return {
        data: {} as ProgressionSession,
        success: false,
        message: 'Failed to record session.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get progression analytics
   */
  async getProgressionAnalytics(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ApiResponse<ProgressionAnalytics>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_progression_analytics');

    try {
      const analytics = await progressionTrackingService.getProgressionAnalytics(userId, timeRange);

      return {
        data: analytics,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getProgressionAnalytics',
        userId,
        timeRange
      });

      return {
        data: {} as ProgressionAnalytics,
        success: false,
        message: 'Failed to get analytics.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string, limit: number = 50): Promise<ApiResponse<UserAchievement[]>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_user_achievements');

    try {
      const achievements = await progressionTrackingService.getUserAchievements(userId, limit);

      return {
        data: achievements,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false,
          totalItems: achievements.length
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getUserAchievements',
        userId,
        limit
      });

      return {
        data: [],
        success: false,
        message: 'Failed to get achievements.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get progression recommendations
   */
  async getProgressionRecommendations(userId: string): Promise<ApiResponse<ProgressionRecommendation[]>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_progression_recommendations');

    try {
      const recommendations = await progressionTrackingService.getProgressionRecommendations(userId);

      return {
        data: recommendations,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false,
          totalItems: recommendations.length
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getProgressionRecommendations',
        userId
      });

      return {
        data: [],
        success: false,
        message: 'Failed to get recommendations.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Celebrate achievement
   */
  async celebrateAchievement(achievementId: string, share: boolean = false): Promise<ApiResponse<{ success: boolean }>> {
    const endTimer = this.analytics.startPerformanceTimer('api_celebrate_achievement');

    try {
      await progressionTrackingService.celebrateAchievement(achievementId, share);

      this.analytics.trackFeatureUsage('progress_tracking', 'interact', {
        action: 'celebrate_achievement',
        achievementId,
        shared: share
      });

      return {
        data: { success: true },
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'celebrateAchievement',
        achievementId,
        share
      });

      return {
        data: { success: false },
        success: false,
        message: 'Failed to celebrate achievement.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get Phase 4 statistics
   */
  async getPhase4Statistics(): Promise<ApiResponse<any>> {
    const endTimer = this.analytics.startPerformanceTimer('api_get_phase4_statistics');

    try {
      const stats = await exerciseService.getPhase4Statistics();

      return {
        data: stats,
        success: true,
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    } catch (error) {
      trackError(error as Error, {
        operation: 'getPhase4Statistics'
      });

      return {
        data: {},
        success: false,
        message: 'Failed to get statistics.',
        metadata: {
          responseTime: endTimer(),
          cached: false
        }
      };
    }
  }

  /**
   * Get available balance requirements
   */
  getBalanceRequirements(): BalanceRequirement[] {
    return ['none', 'static', 'dynamic', 'advanced'];
  }

  /**
   * Get available flexibility types
   */
  getFlexibilityTypes(): FlexibilityType[] {
    return ['static', 'dynamic', 'proprioceptive'];
  }

  /**
   * Get available power metrics
   */
  getPowerMetrics(): PowerMetric[] {
    return ['explosive', 'rotational', 'plyometric'];
  }

  /**
   * Get available progression levels
   */
  getProgressionLevels(): ProgressionLevel[] {
    return [1, 2, 3, 4, 5];
  }

  /**
   * Get available medicine ball weights
   */
  getMedicineBallWeights(): MedicineBallWeight[] {
    return [2, 4, 6, 8, 10, 12];
  }

  /**
   * Get available stability ball sizes
   */
  getStabilityBallSizes(): StabilityBallSize[] {
    return [55, 65, 75];
  }

  /**
   * Check if filters contain Phase 4 specific filters
   */
  private hasPhase4Filters(filters: Partial<AdvancedExerciseFilters>): boolean {
    return !!(
      filters.balanceRequirements?.length ||
      filters.flexibilityTypes?.length ||
      filters.powerMetrics?.length ||
      filters.stabilityRequirements?.length ||
      filters.medicineBallWeights?.length ||
      filters.stabilityBallSizes?.length ||
      filters.cardiovascularIntensity?.length ||
      filters.movementPatterns?.length ||
      filters.rangeOfMotion?.length
    );
  }

  /**
   * Clear caches for a user
   */
  clearUserCache(userId: string): void {
    exerciseService.clearAllCaches();
    progressionTrackingService.clearUserCache(userId);

    this.analytics.trackEvent('cache_cleared', {
      operation: 'clear_user_cache',
      userId
    });
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ApiResponse<{
    exerciseService: boolean;
    progressionService: boolean;
    analytics: boolean;
    cacheStatus: {
      exerciseService: number;
      progressionService: number;
    };
    metrics: any;
  }>> {
    try {
      const exerciseMetrics = exerciseService.getServiceMetrics();

      return {
        data: {
          exerciseService: true,
          progressionService: true,
          analytics: true,
          cacheStatus: {
            exerciseService: 0, // Would get actual cache size
            progressionService: 0
          },
          metrics: {
            exerciseService: exerciseMetrics
          }
        },
        success: true,
        metadata: {
          responseTime: 0,
          cached: false
        }
      };
    } catch (error) {
      return {
        data: {
          exerciseService: false,
          progressionService: false,
          analytics: false,
          cacheStatus: {
            exerciseService: 0,
            progressionService: 0
          },
          metrics: {}
        },
        success: false,
        message: 'Service health check failed.',
        metadata: {
          responseTime: 0,
          cached: false
        }
      };
    }
  }
}

// Create and export singleton instance
export const exerciseApi = new ExerciseApi();

// Export convenience functions for common operations
export const {
  searchExercises,
  getExercisesByFilter,
  getRecommendations,
  getExerciseById,
  getUserProgression,
  recordSession,
  getProgressionAnalytics,
  getUserAchievements,
  getProgressionRecommendations,
  celebrateAchievement,
  getPhase4Statistics,
  clearUserCache,
  getHealthStatus,
  getBalanceRequirements,
  getFlexibilityTypes,
  getPowerMetrics,
  getProgressionLevels,
  getMedicineBallWeights,
  getStabilityBallSizes
} = exerciseApi;

export default exerciseApi;
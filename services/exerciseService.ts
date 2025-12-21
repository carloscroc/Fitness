/**
 * Phase 4 Enhanced Exercise Service
 *
 * Comprehensive service supporting all Phase 4 capabilities including:
 * - New exercise categories (flexibility, balance, medicine ball, stability ball, advanced cardio)
 * - Enhanced filtering capabilities with Phase 4 attributes
 * - Progression tracking integration
 * - Advanced search features with relevance scoring
 * - Performance monitoring and analytics
 * - Intelligent caching and error handling
 */

import { supabase } from './supabaseClient';
import { getExerciseLibraryAnalytics } from './exerciseLibraryAnalytics';
import { trackError } from './errorTracking';
import type {
  Exercise,
  ExerciseFilterOptions,
  ExerciseSortOptions,
  ExerciseSearchResult,
  ExerciseWithSource,
  BalanceRequirement,
  FlexibilityType,
  PowerMetric,
  ProgressionLevel,
  EquipmentModifiers,
  MedicineBallWeight,
  StabilityBallSize
} from '../types/exercise';

/**
 * Phase 4 Exercise Categories
 */
export const PHASE_4_CATEGORIES = [
  'flexibility',
  'balance',
  'medicine_ball',
  'stability_ball',
  'advanced_cardio'
] as const;

export type Phase4Category = typeof PHASE_4_CATEGORIES[number];

/**
 * Enhanced Exercise interface with Phase 4 attributes
 */
export interface EnhancedExercise extends Exercise {
  // Phase 4 specific attributes
  balanceRequirement?: BalanceRequirement;
  flexibilityType?: FlexibilityType;
  powerMetrics?: PowerMetric[];
  progressionLevel?: ProgressionLevel;
  rangeOfMotion?: 'low' | 'medium' | 'high' | 'full';
  stabilityRequirement?: 'none' | 'minimal' | 'moderate' | 'high';

  // Equipment modifiers for specialized equipment
  equipmentModifiers?: EquipmentModifiers;

  // Performance and progression tracking
  avgCompletionTime?: number; // in seconds
  difficultyRating?: number; // 1-10 user-rated difficulty
  popularityScore?: number; // based on usage

  // Advanced metadata
  movementPatterns?: string[]; // e.g., ['rotational', 'linear', 'circular']
  impactLevel?: 'low' | 'medium' | 'high';
  cardiovascularIntensity?: 'low' | 'moderate' | 'vigorous' | 'max';
}

/**
 * Progression data interface
 */
export interface ExerciseProgression {
  userId: string;
  exerciseId: string;
  currentLevel: ProgressionLevel;
  completedSets: number;
  totalReps: number;
  avgWeight?: number; // for weighted exercises
  avgTime?: number; // for timed exercises
  avgFormRating?: number; // 1-10
  lastCompleted: Date;
  improvementRate: number; // percentage improvement
  milestoneAchievements: string[];
  nextMilestone?: {
    type: 'level' | 'reps' | 'weight' | 'time';
    target: number;
    current: number;
    description: string;
  };
}

/**
 * Advanced search filters for Phase 4
 */
export interface AdvancedExerciseFilters extends ExerciseFilterOptions {
  // Balance and stability filters
  balanceRequirements?: BalanceRequirement[];
  stabilityRequirements?: Array<'none' | 'minimal' | 'moderate' | 'high'>;

  // Flexibility filters
  flexibilityTypes?: FlexibilityType[];
  rangeOfMotion?: Array<'low' | 'medium' | 'high' | 'full'>;

  // Power and intensity filters
  powerMetrics?: PowerMetric[];
  impactLevels?: Array<'low' | 'medium' | 'high'>;
  cardiovascularIntensity?: Array<'low' | 'moderate' | 'vigorous' | 'max'>;

  // Progression filters
  progressionLevels?: ProgressionLevel[];
  minImprovementRate?: number;
  hasMilestones?: boolean;

  // Equipment-specific filters
  medicineBallWeights?: MedicineBallWeight[];
  stabilityBallSizes?: StabilityBallSize[];

  // Movement pattern filters
  movementPatterns?: string[];

  // Performance filters
  minCompletionRate?: number;
  minFormRating?: number;
  maxAvgTime?: number; // in seconds

  // Popularity filters
  minPopularityScore?: number;
  userRatedOnly?: boolean;
}

/**
 * Search relevance configuration
 */
export interface SearchRelevanceConfig {
  nameWeight: number;
  descriptionWeight: number;
  categoryWeight: number;
  muscleWeight: number;
  equipmentWeight: number;
  phase4AttributeWeight: number;
  popularityWeight: number;
}

/**
 * Exercise recommendation context
 */
export interface ExerciseRecommendationContext {
  userId: string;
  currentLevel: ProgressionLevel;
  goals: string[]; // e.g., ['flexibility', 'balance', 'power']
  availableEquipment: string[];
  limitations?: string[]; // e.g., ['knee_issues', 'lower_back_pain']
  preferences?: {
    preferredDuration?: number; // in minutes
    preferredIntensity?: 'low' | 'moderate' | 'high';
    avoidCategories?: string[];
  };
  sessionContext?: {
    completedExercises?: string[];
    currentEnergyLevel?: 1 | 2 | 3 | 4 | 5;
    timeAvailable?: number; // in minutes
  };
}

/**
 * Exercise service performance metrics
 */
export interface ExerciseServiceMetrics {
  searchResponseTime: number;
  cacheHitRate: number;
  searchSuccessRate: number;
  errorRate: number;
  activeSearches: number;
  cachedQueries: number;
  progressionUpdateRate: number;
}

class ExerciseService {
  private analytics = getExerciseLibraryAnalytics();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private cacheStats = { hits: 0, misses: 0 };
  private searchTimers = new Map<string, number>();
  private metrics: ExerciseServiceMetrics = {
    searchResponseTime: 0,
    cacheHitRate: 0,
    searchSuccessRate: 0,
    errorRate: 0,
    activeSearches: 0,
    cachedQueries: 0,
    progressionUpdateRate: 0
  };

  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SEARCH_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly PROGRESSION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.initializeCacheCleanup();
    this.setupPerformanceMonitoring();
  }

  /**
   * Initialize periodic cache cleanup
   */
  private initializeCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Track cache hit rate
    setInterval(() => {
      const total = this.cacheStats.hits + this.cacheStats.misses;
      this.metrics.cacheHitRate = total > 0 ? this.cacheStats.hits / total : 0;
      this.cacheStats = { hits: 0, misses: 0 }; // Reset for next interval
    }, 30 * 1000);
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cached data or return null
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.cacheStats.hits++;
      return cached.data;
    }
    this.cacheStats.misses++;
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached data with TTL
   */
  private setCachedData<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Start performance timer for operation tracking
   */
  private startTimer(operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.analytics.trackPerformance({
        name: `exercise_service_${operation}`,
        value: duration,
        unit: 'ms',
        category: 'api'
      });

      if (operation === 'search') {
        this.metrics.searchResponseTime = duration;
      }
    };
  }

  /**
   * Map database row to EnhancedExercise with Phase 4 attributes
   */
  private mapDbRowToEnhancedExercise(row: any): EnhancedExercise {
    // Extract metadata for Phase 4 attributes
    const metadata = row.metadata || {};

    // Determine Phase 4 specific attributes based on category and metadata
    const phase4Attributes = this.extractPhase4Attributes(row.category, metadata);

    return {
      // Base exercise fields
      id: row.id || `sup-${row.name}`,
      name: row.name || '',
      muscle: row.primary_muscle || row.muscle || 'General',
      equipment: this.formatEquipment(row.equipment, metadata),
      image: row.image_url || row.image || '',
      video: row.video_url || row.video,
      description: row.description || row.overview || '',
      overview: row.overview || row.description || '',
      steps: this.parseInstructions(row.instructions),
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      bpm: row.bpm || 0,
      difficulty: (row.difficulty as Exercise['difficulty']) || 'Beginner',
      videoContext: row.video_context || '',
      equipmentList: Array.isArray(row.equipment) ? row.equipment : [],
      calories: row.calories || 0,

      // Phase 4 attributes
      ...phase4Attributes,

      // Performance metrics (would be populated from analytics data)
      avgCompletionTime: metadata.avg_completion_time,
      difficultyRating: metadata.difficulty_rating,
      popularityScore: metadata.popularity_score || 0
    };
  }

  /**
   * Extract Phase 4 specific attributes from exercise data
   */
  private extractPhase4Attributes(category: string, metadata: any): Partial<EnhancedExercise> {
    const attributes: Partial<EnhancedExercise> = {};

    switch (category) {
      case 'flexibility':
        attributes.flexibilityType = metadata.flexibility_type || 'static';
        attributes.rangeOfMotion = metadata.range_of_motion || 'medium';
        attributes.cardiovascularIntensity = 'low';
        break;

      case 'balance':
        attributes.balanceRequirement = metadata.balance_requirement || 'static';
        attributes.stabilityRequirement = metadata.stability_requirement || 'moderate';
        attributes.cardiovascularIntensity = 'low';
        break;

      case 'medicine_ball':
        attributes.powerMetrics = metadata.power_metrics || ['explosive'];
        attributes.equipmentModifiers = {
          medicineBallWeight: metadata.medicine_ball_weights || [6, 8]
        };
        attributes.impactLevel = metadata.impact_level || 'medium';
        attributes.movementPatterns = metadata.movement_patterns || ['rotational', 'linear'];
        break;

      case 'stability_ball':
        attributes.stabilityRequirement = metadata.stability_requirement || 'high';
        attributes.balanceRequirement = metadata.balance_requirement || 'dynamic';
        attributes.equipmentModifiers = {
          stabilityBallSize: metadata.stability_ball_sizes || [65]
        };
        attributes.movementPatterns = metadata.movement_patterns || ['circular', 'linear'];
        break;

      case 'advanced_cardio':
        attributes.cardiovascularIntensity = metadata.cardiovascular_intensity || 'vigorous';
        attributes.impactLevel = metadata.impact_level || 'high';
        attributes.powerMetrics = metadata.power_metrics || ['plyometric'];
        attributes.movementPatterns = metadata.movement_patterns || ['linear', 'circular'];
        break;
    }

    // Common Phase 4 attributes
    attributes.progressionLevel = metadata.progression_level || 1;
    attributes.movementPatterns = attributes.movementPatterns || metadata.movement_patterns || [];

    return attributes;
  }

  /**
   * Parse instructions from various formats
   */
  private parseInstructions(instructions: any): string[] {
    if (!instructions) return [];

    if (Array.isArray(instructions)) {
      return instructions;
    }

    if (typeof instructions === 'string') {
      try {
        const parsed = JSON.parse(instructions);
        return Array.isArray(parsed) ? parsed : instructions.split('\n').filter(Boolean);
      } catch {
        return instructions.split('\n').filter(Boolean);
      }
    }

    return [];
  }

  /**
   * Format equipment string from array or include modifiers
   */
  private formatEquipment(equipment: any, metadata: any): string {
    if (Array.isArray(equipment)) {
      let equipString = equipment.join(', ');

      // Add Phase 4 equipment modifiers
      if (metadata.equipment_modifiers) {
        const modifiers = [];
        if (metadata.equipment_modifiers.medicine_ball_weights?.length) {
          modifiers.push(`Medicine Ball: ${metadata.equipment_modifiers.medicine_ball_weights.join('kg, ')}kg`);
        }
        if (metadata.equipment_modifiers.stability_ball_sizes?.length) {
          modifiers.push(`Stability Ball: ${metadata.equipment_modifiers.stability_ball_sizes.join('cm, ')}cm`);
        }

        if (modifiers.length > 0) {
          equipString += ` (${modifiers.join(', ')})`;
        }
      }

      return equipString;
    }

    return equipment || 'None';
  }

  /**
   * Enhanced search with Phase 4 support and relevance scoring
   */
  async searchExercises(
    query: string = '',
    filters: AdvancedExerciseFilters = {},
    sort: ExerciseSortOptions = { field: 'name', direction: 'asc' },
    limit: number = 50,
    offset: number = 0,
    relevanceConfig: Partial<SearchRelevanceConfig> = {}
  ): Promise<ExerciseSearchResult & { relevanceScores?: Map<string, number> }> {
    const endTimer = this.startTimer('search');
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.activeSearches++;
    this.searchTimers.set(searchId, Date.now());

    try {
      // Create cache key
      const cacheKey = `enhanced_search_${JSON.stringify({ query, filters, sort, limit, offset })}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        this.metrics.cachedQueries++;
        this.analytics.trackFeatureUsage('enhanced_search', 'view', { cached: true });
        return cached;
      }

      let supabaseQuery = supabase
        .from('exercises')
        .select('*', { count: 'exact' });

      // Apply text search with enhanced matching
      if (query.trim()) {
        const searchConditions = [
          `name.ilike.%${query}%`,
          `overview.ilike.%${query}%`,
          `instructions::text.ilike.%${query}%`,
          `benefits::text.ilike.%${query}%`
        ];

        // Add Phase 4 metadata search
        if (this.hasPhase4Filters(filters)) {
          searchConditions.push(`metadata::text.ilike.%${query}%`);
        }

        supabaseQuery = supabaseQuery.or(searchConditions.join(','));
      }

      // Apply Phase 4 specific filters
      supabaseQuery = this.applyPhase4Filters(supabaseQuery, filters);

      // Apply standard filters
      supabaseQuery = this.applyStandardFilters(supabaseQuery, filters);

      // Apply sorting
      supabaseQuery = this.applySorting(supabaseQuery, sort, filters);

      // Apply pagination
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      let enhancedExercises = (data || []).map(row => this.mapDbRowToEnhancedExercise(row));

      // Apply client-side filtering for complex Phase 4 attributes
      enhancedExercises = this.applyClientSideFilters(enhancedExercises, filters);

      // Calculate relevance scores if query provided
      const relevanceScores = new Map<string, number>();
      if (query.trim()) {
        enhancedExercises.forEach(exercise => {
          const score = this.calculateRelevanceScore(exercise, query, relevanceConfig);
          relevanceScores.set(exercise.id, score);
        });

        // Sort by relevance if primary sort is by relevance
        if (sort.field === 'relevance') {
          enhancedExercises.sort((a, b) => {
            const aScore = relevanceScores.get(a.id) || 0;
            const bScore = relevanceScores.get(b.id) || 0;
            return sort.direction === 'asc' ? aScore - bScore : bScore - aScore;
          });
        }
      }

      const searchResult: ExerciseSearchResult & { relevanceScores?: Map<string, number> } = {
        exercises: enhancedExercises,
        totalCount: count || 0,
        filteredCount: enhancedExercises.length,
        searchTime: Date.now() - (this.searchTimers.get(searchId) || Date.now()),
        hasMore: offset + limit < (count || 0),
        relevanceScores: relevanceScores.size > 0 ? relevanceScores : undefined
      };

      // Cache results
      this.setCachedData(cacheKey, searchResult, this.SEARCH_TTL);

      // Track analytics
      this.analytics.trackExerciseFilter(filters);
      this.analytics.trackEvent('enhanced_search_completed', {
        query,
        resultCount: enhancedExercises.length,
        hasPhase4Filters: this.hasPhase4Filters(filters),
        searchTime: searchResult.searchTime
      });

      return searchResult;
    } catch (error) {
      this.metrics.errorRate++;
      trackError(error as Error, {
        operation: 'searchExercises',
        query,
        filters,
        sort,
        limit,
        offset
      });

      throw error;
    } finally {
      endTimer();
      this.metrics.activeSearches--;
      this.searchTimers.delete(searchId);

      // Update success rate
      this.metrics.searchSuccessRate = 1 - (this.metrics.errorRate / Math.max(1, this.metrics.activeSearches + this.metrics.cachedQueries));
    }
  }

  /**
   * Check if filters contain Phase 4 specific filters
   */
  private hasPhase4Filters(filters: AdvancedExerciseFilters): boolean {
    return !!(
      filters.balanceRequirements?.length ||
      filters.flexibilityTypes?.length ||
      filters.powerMetrics?.length ||
      filters.rangeOfMotion?.length ||
      filters.stabilityRequirements?.length ||
      filters.medicineBallWeights?.length ||
      filters.stabilityBallSizes?.length ||
      filters.cardiovascularIntensity?.length ||
      filters.movementPatterns?.length
    );
  }

  /**
   * Apply Phase 4 specific filters to Supabase query
   */
  private applyPhase4Filters(query: any, filters: AdvancedExerciseFilters): any {
    // Filter by Phase 4 categories
    if (filters.categories?.length) {
      const phase4Categories = filters.categories.filter(cat =>
        PHASE_4_CATEGORIES.includes(cat as Phase4Category)
      );
      if (phase4Categories.length > 0) {
        query = query.in('category', phase4Categories);
      }
    }

    // Apply metadata-based filters for Phase 4 attributes
    if (filters.balanceRequirements?.length) {
      query = query.contains('metadata->balance_requirement', filters.balanceRequirements);
    }

    if (filters.flexibilityTypes?.length) {
      query = query.contains('metadata->flexibility_type', filters.flexibilityTypes);
    }

    if (filters.powerMetrics?.length) {
      query = query.contains('metadata->power_metrics', filters.powerMetrics);
    }

    if (filters.medicineBallWeights?.length) {
      query = query.contains('metadata->equipment_modifiers->medicine_ball_weights', filters.medicineBallWeights);
    }

    if (filters.stabilityBallSizes?.length) {
      query = query.contains('metadata->equipment_modifiers->stability_ball_sizes', filters.stabilityBallSizes);
    }

    if (filters.cardiovascularIntensity?.length) {
      query = query.contains('metadata->cardiovascular_intensity', filters.cardiovascularIntensity);
    }

    if (filters.movementPatterns?.length) {
      query = query.contains('metadata->movement_patterns', filters.movementPatterns);
    }

    return query;
  }

  /**
   * Apply standard filters to Supabase query
   */
  private applyStandardFilters(query: any, filters: AdvancedExerciseFilters): any {
    // Apply non-Phase 4 category filters
    if (filters.categories?.length) {
      const standardCategories = filters.categories.filter(cat =>
        !PHASE_4_CATEGORIES.includes(cat as Phase4Category)
      );
      if (standardCategories.length > 0) {
        query = query.in('category', standardCategories);
      }
    }

    if (filters.muscles?.length) {
      query = query.in('primary_muscle', filters.muscles);
    }

    if (filters.equipment?.length) {
      query = query.contains('equipment', filters.equipment);
    }

    if (filters.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty);
    }

    if (filters.hasVideo === true) {
      query = query.not('video_url', 'is', null);
    } else if (filters.hasVideo === false) {
      query = query.is('video_url', null);
    }

    if (filters.hasImage === true) {
      query = query.not('image_url', 'is', null);
    } else if (filters.hasImage === false) {
      query = query.is('image_url', null);
    }

    return query;
  }

  /**
   * Apply client-side filters for complex Phase 4 attributes
   */
  private applyClientSideFilters(exercises: EnhancedExercise[], filters: AdvancedExerciseFilters): EnhancedExercise[] {
    return exercises.filter(exercise => {
      // Balance requirement filtering
      if (filters.balanceRequirements?.length &&
          (!exercise.balanceRequirement || !filters.balanceRequirements.includes(exercise.balanceRequirement))) {
        return false;
      }

      // Stability requirement filtering
      if (filters.stabilityRequirements?.length &&
          (!exercise.stabilityRequirement || !filters.stabilityRequirements.includes(exercise.stabilityRequirement))) {
        return false;
      }

      // Range of motion filtering
      if (filters.rangeOfMotion?.length &&
          (!exercise.rangeOfMotion || !filters.rangeOfMotion.includes(exercise.rangeOfMotion))) {
        return false;
      }

      // Impact level filtering
      if (filters.impactLevels?.length &&
          (!exercise.impactLevel || !filters.impactLevels.includes(exercise.impactLevel))) {
        return false;
      }

      // Progression level filtering
      if (filters.progressionLevels?.length &&
          (!exercise.progressionLevel || !filters.progressionLevels.includes(exercise.progressionLevel))) {
        return false;
      }

      // Movement pattern filtering
      if (filters.movementPatterns?.length &&
          (!exercise.movementPatterns || !filters.movementPatterns.some(pattern =>
            exercise.movementPatterns!.includes(pattern)))) {
        return false;
      }

      // Equipment modifier filtering
      if (filters.medicineBallWeights?.length &&
          (!exercise.equipmentModifiers?.medicineBallWeight ||
           !filters.medicineBallWeights.some(weight =>
            exercise.equipmentModifiers!.medicineBallWeight!.includes(weight)))) {
        return false;
      }

      if (filters.stabilityBallSizes?.length &&
          (!exercise.equipmentModifiers?.stabilityBallSize ||
           !filters.stabilityBallSizes.some(size =>
            exercise.equipmentModifiers!.stabilityBallSize!.includes(size)))) {
        return false;
      }

      // Performance-based filters
      if (filters.minCompletionRate !== undefined && exercise.avgCompletionTime) {
        // This would need to be calculated from actual user data
      }

      if (filters.minFormRating !== undefined &&
          (!exercise.difficultyRating || exercise.difficultyRating < filters.minFormRating)) {
        return false;
      }

      if (filters.maxAvgTime !== undefined &&
          (!exercise.avgCompletionTime || exercise.avgCompletionTime > filters.maxAvgTime)) {
        return false;
      }

      if (filters.minPopularityScore !== undefined &&
          (!exercise.popularityScore || exercise.popularityScore < filters.minPopularityScore)) {
        return false;
      }

      if (filters.userRatedOnly && !exercise.difficultyRating) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply sorting to query
   */
  private applySorting(query: any, sort: ExerciseSortOptions, filters: AdvancedExerciseFilters): any {
    // Handle Phase 4 specific sorting
    if (sort.field === 'progressionLevel') {
      // This would require metadata access, fallback to name for now
      return query.order('name', { ascending: sort.direction === 'asc' });
    }

    if (sort.field === 'popularity') {
      // Sort by popularity score in metadata
      return query.order('metadata->popularity_score', {
        ascending: sort.direction === 'asc',
        nullsFirst: false
      });
    }

    if (sort.field === 'relevance') {
      // Relevance sorting is handled client-side
      return query.order('name', { ascending: sort.direction === 'asc' });
    }

    // Standard sorting
    const sortField = sort.field === 'difficulty' ? 'difficulty' :
                    sort.field === 'calories' ? 'calories' :
                    sort.field === 'bpm' ? 'bpm' : 'name';

    return query.order(sortField, { ascending: sort.direction === 'asc' });
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(
    exercise: EnhancedExercise,
    query: string,
    config: Partial<SearchRelevanceConfig>
  ): number {
    const weights = {
      nameWeight: 3,
      descriptionWeight: 2,
      categoryWeight: 1.5,
      muscleWeight: 1.5,
      equipmentWeight: 1,
      phase4AttributeWeight: 2.5,
      popularityWeight: 0.5,
      ...config
    };

    const queryLower = query.toLowerCase();
    let score = 0;

    // Name matching (highest weight)
    if (exercise.name.toLowerCase().includes(queryLower)) {
      score += weights.nameWeight;
    }

    // Description matching
    if (exercise.description.toLowerCase().includes(queryLower)) {
      score += weights.descriptionWeight;
    }

    // Category matching
    if (exercise.muscle.toLowerCase().includes(queryLower)) {
      score += weights.categoryWeight;
    }

    // Equipment matching
    if (exercise.equipment.toLowerCase().includes(queryLower)) {
      score += weights.equipmentWeight;
    }

    // Phase 4 attribute matching
    const phase4Match = this.searchPhase4Attributes(exercise, queryLower);
    if (phase4Match) {
      score += weights.phase4AttributeWeight * phase4Match;
    }

    // Popularity boost
    if (exercise.popularityScore) {
      score += (exercise.popularityScore / 100) * weights.popularityWeight;
    }

    return score;
  }

  /**
   * Search Phase 4 attributes for query matches
   */
  private searchPhase4Attributes(exercise: EnhancedExercise, query: string): number {
    let matches = 0;
    const queryWords = query.split(/\s+/);

    // Check balance requirement
    if (exercise.balanceRequirement &&
        queryWords.some(word => exercise.balanceRequirement!.toLowerCase().includes(word))) {
      matches++;
    }

    // Check flexibility type
    if (exercise.flexibilityType &&
        queryWords.some(word => exercise.flexibilityType!.toLowerCase().includes(word))) {
      matches++;
    }

    // Check power metrics
    if (exercise.powerMetrics?.length &&
        exercise.powerMetrics.some(metric =>
          queryWords.some(word => metric.toLowerCase().includes(word)))) {
      matches++;
    }

    // Check movement patterns
    if (exercise.movementPatterns?.length &&
        exercise.movementPatterns.some(pattern =>
          queryWords.some(word => pattern.toLowerCase().includes(word)))) {
      matches++;
    }

    // Check equipment modifiers
    if (exercise.equipmentModifiers?.medicineBallWeight &&
        queryWords.some(word => word.includes('ball') || word.includes('medicine'))) {
      matches++;
    }

    if (exercise.equipmentModifiers?.stabilityBallSize &&
        queryWords.some(word => word.includes('ball') || word.includes('stability'))) {
      matches++;
    }

    return matches;
  }

  /**
   * Get exercise recommendations based on user context
   */
  async getExerciseRecommendations(
    context: ExerciseRecommendationContext,
    count: number = 10
  ): Promise<EnhancedExercise[]> {
    const endTimer = this.startTimer('recommendations');

    try {
      const cacheKey = `recommendations_${context.userId}_${JSON.stringify(context)}`;
      const cached = this.getCachedData<EnhancedExercise[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Build filters based on user context
      const filters: AdvancedExerciseFilters = {
        progressionLevels: [context.currentLevel, Math.min(context.currentLevel + 1, 5) as ProgressionLevel],
        equipment: context.availableEquipment
      };

      // Add goal-based filters
      if (context.goals.includes('flexibility')) {
        filters.categories = [...(filters.categories || []), 'flexibility'];
        filters.flexibilityTypes = ['static', 'dynamic'];
      }

      if (context.goals.includes('balance')) {
        filters.categories = [...(filters.categories || []), 'balance'];
        filters.balanceRequirements = ['static', 'dynamic'];
      }

      if (context.goals.includes('power')) {
        filters.categories = [...(filters.categories || []), 'medicine_ball'];
        filters.powerMetrics = ['explosive', 'rotational'];
      }

      // Exclude limited exercises
      if (context.limitations?.length) {
        // This would require a more sophisticated limitation mapping
      }

      // Search for matching exercises
      const searchResult = await this.searchExercises('', filters, { field: 'popularity', direction: 'desc' }, count * 2);

      // Apply additional scoring based on user context
      const scoredExercises = searchResult.exercises.map(exercise => ({
        exercise,
        score: this.calculateRecommendationScore(exercise, context)
      }));

      // Sort by recommendation score and return top exercises
      scoredExercises.sort((a, b) => b.score - a.score);
      const recommendations = scoredExercises.slice(0, count).map(item => item.exercise);

      // Cache recommendations
      this.setCachedData(cacheKey, recommendations, this.PROGRESSION_CACHE_TTL);

      // Track analytics
      this.analytics.trackFeatureUsage('personalized_recommendations', 'view', {
        userId: context.userId,
        goalCount: context.goals.length,
        recommendationCount: recommendations.length,
        currentLevel: context.currentLevel
      });

      return recommendations;
    } catch (error) {
      trackError(error as Error, { operation: 'getExerciseRecommendations', context });
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Calculate recommendation score based on user context
   */
  private calculateRecommendationScore(exercise: EnhancedExercise, context: ExerciseRecommendationContext): number {
    let score = 0;

    // Base score from popularity
    score += (exercise.popularityScore || 0) * 0.3;

    // Progression level matching
    if (exercise.progressionLevel) {
      if (exercise.progressionLevel === context.currentLevel) {
        score += 25;
      } else if (exercise.progressionLevel === context.currentLevel + 1) {
        score += 15;
      } else if (exercise.progressionLevel < context.currentLevel) {
        score += 5;
      }
    }

    // Goal alignment
    if (context.goals.includes('flexibility') && exercise.flexibilityType) {
      score += 20;
    }

    if (context.goals.includes('balance') && exercise.balanceRequirement) {
      score += 20;
    }

    if (context.goals.includes('power') && exercise.powerMetrics?.length) {
      score += 20;
    }

    // Equipment availability
    if (context.availableEquipment.includes('stability ball') &&
        exercise.equipment.toLowerCase().includes('stability ball')) {
      score += 15;
    }

    if (context.availableEquipment.includes('medicine ball') &&
        exercise.equipment.toLowerCase().includes('medicine ball')) {
      score += 15;
    }

    // Intensity preference
    if (context.preferences?.preferredIntensity) {
      const intensityMatch = this.getIntensityMatch(exercise, context.preferences.preferredIntensity);
      score += intensityMatch * 10;
    }

    // Session context scoring
    if (context.sessionContext?.completedExercises?.includes(exercise.id)) {
      score -= 30; // Penalize recently completed exercises
    }

    if (context.sessionContext?.timeAvailable && exercise.avgCompletionTime) {
      const timeFit = this.calculateTimeFit(exercise.avgCompletionTime, context.sessionContext.timeAvailable * 60);
      score += timeFit * 5;
    }

    return Math.max(0, score);
  }

  /**
   * Get intensity match score
   */
  private getIntensityMatch(exercise: EnhancedExercise, preferredIntensity: string): number {
    const exerciseIntensity = exercise.cardiovascularIntensity ||
                            (exercise.impactLevel === 'high' ? 'vigorous' : 'moderate');

    if (exerciseIntensity === preferredIntensity) return 1;
    if (preferredIntensity === 'moderate' && exerciseIntensity === 'low') return 0.7;
    if (preferredIntensity === 'high' && exerciseIntensity === 'vigorous') return 0.9;

    return 0.5; // Partial match
  }

  /**
   * Calculate time fit score
   */
  private calculateTimeFit(exerciseTime: number, availableTime: number): number {
    if (exerciseTime <= availableTime * 0.8) return 1;
    if (exerciseTime <= availableTime) return 0.7;
    return 0.2; // Too long for available time
  }

  /**
   * Get user progression data for exercises
   */
  async getUserProgression(userId: string, exerciseIds?: string[]): Promise<Map<string, ExerciseProgression>> {
    const endTimer = this.startTimer('get_user_progression');

    try {
      const cacheKey = `progression_${userId}_${exerciseIds?.join(',') || 'all'}`;
      const cached = this.getCachedData<Map<string, ExerciseProgression>>(cacheKey);
      if (cached) {
        return cached;
      }

      // In a real implementation, this would query a user_progression table
      // For now, return mock data structure
      const progressionMap = new Map<string, ExerciseProgression>();

      if (exerciseIds) {
        for (const exerciseId of exerciseIds) {
          // Mock progression data - would come from database
          progressionMap.set(exerciseId, {
            userId,
            exerciseId,
            currentLevel: 1,
            completedSets: 0,
            totalReps: 0,
            lastCompleted: new Date(),
            improvementRate: 0,
            milestoneAchievements: []
          });
        }
      }

      this.setCachedData(cacheKey, progressionMap, this.PROGRESSION_CACHE_TTL);

      this.metrics.progressionUpdateRate++;

      return progressionMap;
    } catch (error) {
      trackError(error as Error, { operation: 'getUserProgression', userId, exerciseIds });
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Update user progression data
   */
  async updateUserProgression(
    userId: string,
    exerciseId: string,
    updateData: Partial<ExerciseProgression>
  ): Promise<ExerciseProgression> {
    const endTimer = this.startTimer('update_user_progression');

    try {
      // In a real implementation, this would update the database
      // For now, create updated progression object
      const currentProgression = await this.getUserProgression(userId, [exerciseId]);
      const existing = currentProgression.get(exerciseId);

      const updatedProgression: ExerciseProgression = {
        userId,
        exerciseId,
        currentLevel: existing?.currentLevel || 1,
        completedSets: existing?.completedSets || 0,
        totalReps: existing?.totalReps || 0,
        lastCompleted: new Date(),
        improvementRate: existing?.improvementRate || 0,
        milestoneAchievements: existing?.milestoneAchievements || [],
        ...updateData
      };

      // Check for milestone achievements
      updatedProgression.milestoneAchievements = this.checkMilestones(updatedProgression);
      updatedProgression.nextMilestone = this.getNextMilestone(updatedProgression);

      // Clear cache to force refresh
      this.cache.delete(`progression_${userId}_${exerciseId}`);
      this.cache.delete(`progression_${userId}_all`);

      // Track analytics
      this.analytics.trackProgressUpdate(exerciseId, 'completion', updatedProgression.currentLevel);

      this.metrics.progressionUpdateRate++;

      return updatedProgression;
    } catch (error) {
      trackError(error as Error, { operation: 'updateUserProgression', userId, exerciseId, updateData });
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Check for milestone achievements
   */
  private checkMilestones(progression: ExerciseProgression): string[] {
    const milestones: string[] = [];

    if (progression.currentLevel >= 5) {
      milestones.push('Master Level Achieved');
    } else if (progression.currentLevel >= 3) {
      milestones.push('Intermediate Level Reached');
    }

    if (progression.completedSets >= 100) {
      milestones.push('100 Sets Completed');
    }

    if (progression.totalReps >= 1000) {
      milestones.push('1000 Total Reps');
    }

    if (progression.improvementRate >= 50) {
      milestones.push('50% Improvement Achieved');
    }

    return milestones;
  }

  /**
   * Get next milestone for progression
   */
  private getNextMilestone(progression: ExerciseProgression): ExerciseProgression['nextMilestone'] {
    const currentLevel = progression.currentLevel;

    if (currentLevel < 5) {
      return {
        type: 'level',
        target: currentLevel + 1,
        current: currentLevel,
        description: `Reach Level ${currentLevel + 1}`
      };
    }

    if (progression.completedSets < 100) {
      return {
        type: 'reps',
        target: 100,
        current: progression.completedSets,
        description: 'Complete 100 Sets'
      };
    }

    return undefined; // All milestones achieved
  }

  /**
   * Get Phase 4 category statistics
   */
  async getPhase4Statistics(): Promise<{
    categoryDistribution: Record<Phase4Category, number>;
    attributeDistribution: {
      balanceRequirements: Record<BalanceRequirement, number>;
      flexibilityTypes: Record<FlexibilityType, number>;
      powerMetrics: Record<PowerMetric, number>;
      progressionLevels: Record<ProgressionLevel, number>;
    };
    equipmentUsage: {
      medicineBallWeights: Record<MedicineBallWeight, number>;
      stabilityBallSizes: Record<StabilityBallSize, number>;
    };
    performanceMetrics: {
      avgCompletionTime: number;
      avgFormRating: number;
      popularityRanking: Array<{ exerciseId: string; name: string; score: number }>;
    };
  }> {
    const endTimer = this.startTimer('get_phase4_statistics');

    try {
      const cacheKey = 'phase4_statistics';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Query Phase 4 exercises
      const { data: phase4Exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .in('category', PHASE_4_CATEGORIES);

      if (error) {
        throw new Error(`Failed to fetch Phase 4 statistics: ${error.message}`);
      }

      const stats = {
        categoryDistribution: {} as Record<Phase4Category, number>,
        attributeDistribution: {
          balanceRequirements: {} as Record<BalanceRequirement, number>,
          flexibilityTypes: {} as Record<FlexibilityType, number>,
          powerMetrics: {} as Record<PowerMetric, number>,
          progressionLevels: {} as Record<ProgressionLevel, number>
        },
        equipmentUsage: {
          medicineBallWeights: {} as Record<MedicineBallWeight, number>,
          stabilityBallSizes: {} as Record<StabilityBallSize, number>
        },
        performanceMetrics: {
          avgCompletionTime: 0,
          avgFormRating: 0,
          popularityRanking: [] as Array<{ exerciseId: string; name: string; score: number }>
        }
      };

      // Process exercises for statistics
      const enhancedExercises = (phase4Exercises || []).map(row =>
        this.mapDbRowToEnhancedExercise(row)
      );

      // Category distribution
      enhancedExercises.forEach(exercise => {
        const category = exercise.muscle as Phase4Category;
        if (PHASE_4_CATEGORIES.includes(category)) {
          stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
        }

        // Attribute distributions
        if (exercise.balanceRequirement) {
          stats.attributeDistribution.balanceRequirements[exercise.balanceRequirement] =
            (stats.attributeDistribution.balanceRequirements[exercise.balanceRequirement] || 0) + 1;
        }

        if (exercise.flexibilityType) {
          stats.attributeDistribution.flexibilityTypes[exercise.flexibilityType] =
            (stats.attributeDistribution.flexibilityTypes[exercise.flexibilityType] || 0) + 1;
        }

        if (exercise.powerMetrics?.length) {
          exercise.powerMetrics.forEach(metric => {
            stats.attributeDistribution.powerMetrics[metric] =
              (stats.attributeDistribution.powerMetrics[metric] || 0) + 1;
          });
        }

        if (exercise.progressionLevel) {
          stats.attributeDistribution.progressionLevels[exercise.progressionLevel] =
            (stats.attributeDistribution.progressionLevels[exercise.progressionLevel] || 0) + 1;
        }

        // Equipment usage
        if (exercise.equipmentModifiers?.medicineBallWeight?.length) {
          exercise.equipmentModifiers.medicineBallWeight.forEach(weight => {
            stats.equipmentUsage.medicineBallWeights[weight] =
              (stats.equipmentUsage.medicineBallWeights[weight] || 0) + 1;
          });
        }

        if (exercise.equipmentModifiers?.stabilityBallSize?.length) {
          exercise.equipmentModifiers.stabilityBallSize.forEach(size => {
            stats.equipmentUsage.stabilityBallSizes[size] =
              (stats.equipmentUsage.stabilityBallSizes[size] || 0) + 1;
          });
        }

        // Performance metrics
        if (exercise.avgCompletionTime) {
          stats.performanceMetrics.avgCompletionTime += exercise.avgCompletionTime;
        }

        if (exercise.difficultyRating) {
          stats.performanceMetrics.avgFormRating += exercise.difficultyRating;
        }

        if (exercise.popularityScore) {
          stats.performanceMetrics.popularityRanking.push({
            exerciseId: exercise.id,
            name: exercise.name,
            score: exercise.popularityScore
          });
        }
      });

      // Calculate averages
      const totalExercises = enhancedExercises.length;
      if (totalExercises > 0) {
        stats.performanceMetrics.avgCompletionTime = Math.round(
          stats.performanceMetrics.avgCompletionTime / totalExercises
        );
        stats.performanceMetrics.avgFormRating = Math.round(
          (stats.performanceMetrics.avgFormRating / totalExercises) * 10
        ) / 10;
      }

      // Sort popularity ranking
      stats.performanceMetrics.popularityRanking.sort((a, b) => b.score - a.score);
      stats.performanceMetrics.popularityRanking = stats.performanceMetrics.popularityRanking.slice(0, 20);

      // Cache statistics
      this.setCachedData(cacheKey, stats, 10 * 60 * 1000); // 10 minutes

      return stats;
    } catch (error) {
      trackError(error as Error, { operation: 'getPhase4Statistics' });
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(): ExerciseServiceMetrics {
    return {
      ...this.metrics,
      cacheHitRate: Math.round(this.metrics.cacheHitRate * 100) / 100,
      searchSuccessRate: Math.round(this.metrics.searchSuccessRate * 100) / 100
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cache.clear();
    this.analytics.trackEvent('cache_cleared', {
      operation: 'clear_all',
      cacheSize: this.cache.size
    });
  }

  /**
   * Validate Phase 4 exercise data
   */
  validatePhase4Exercise(exercise: Partial<EnhancedExercise>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!exercise.name?.trim()) {
      errors.push('Exercise name is required');
    }

    if (!exercise.muscle?.trim()) {
      errors.push('Primary muscle group is required');
    }

    // Phase 4 specific validation
    if (exercise.balanceRequirement && !['none', 'static', 'dynamic', 'advanced'].includes(exercise.balanceRequirement)) {
      errors.push('Invalid balance requirement value');
    }

    if (exercise.flexibilityType && !['static', 'dynamic', 'proprioceptive'].includes(exercise.flexibilityType)) {
      errors.push('Invalid flexibility type value');
    }

    if (exercise.powerMetrics?.length) {
      const validMetrics = ['explosive', 'rotational', 'plyometric'];
      exercise.powerMetrics.forEach(metric => {
        if (!validMetrics.includes(metric)) {
          errors.push(`Invalid power metric: ${metric}`);
        }
      });
    }

    if (exercise.progressionLevel && (exercise.progressionLevel < 1 || exercise.progressionLevel > 5)) {
      errors.push('Progression level must be between 1 and 5');
    }

    // Warnings
    if (!exercise.description?.trim()) {
      warnings.push('Exercise description is missing');
    }

    if (!exercise.video && !exercise.image) {
      warnings.push('Exercise has no video or image content');
    }

    if (!exercise.steps?.length) {
      warnings.push('Exercise has no instructions');
    }

    // Equipment modifier validation
    if (exercise.equipmentModifiers?.medicineBallWeight?.length) {
      const validWeights = [2, 4, 6, 8, 10, 12];
      exercise.equipmentModifiers.medicineBallWeight.forEach(weight => {
        if (!validWeights.includes(weight)) {
          errors.push(`Invalid medicine ball weight: ${weight}kg`);
        }
      });
    }

    if (exercise.equipmentModifiers?.stabilityBallSize?.length) {
      const validSizes = [55, 65, 75];
      exercise.equipmentModifiers.stabilityBallSize.forEach(size => {
        if (!validSizes.includes(size)) {
          errors.push(`Invalid stability ball size: ${size}cm`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Create and export singleton instance
export const exerciseService = new ExerciseService();

// Export types for external use
export type {
  EnhancedExercise,
  ExerciseProgression,
  AdvancedExerciseFilters,
  SearchRelevanceConfig,
  ExerciseRecommendationContext,
  ExerciseServiceMetrics
};

export default exerciseService;
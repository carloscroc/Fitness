/**
 * Phase 4 Service Integration
 *
 * Integration points connecting Phase 4 features with existing services:
 * - Exercise service feature detection
 * - Component feature flag checks
 * - User session management
 * - Analytics and monitoring integration
 */

import {
  getEnabledPhase4Features,
  phase4FeatureFlagService,
  Phase4FeatureFlag,
  EvaluationResult,
  FeatureEvaluationContext
} from './phase4FeatureFlagService';
import { rolloutMonitoringService, recordFeatureEvaluation } from './rolloutMonitoringService';
import {
  PHASE4_ROLLOUT_CONFIG
} from '../config/phase4RolloutConfig';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string[];
  instructions: string;
  muscleGroups: string[];
  videoUrl?: string;
  phase4Features?: {
    flexibility?: boolean;
    balance?: boolean;
    medicineBall?: boolean;
    stabilityBall?: boolean;
    advancedCardio?: boolean;
    powerMetrics?: boolean;
    balanceRequirements?: boolean;
    flexibilityTypes?: boolean;
  };
}

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  featuresAccessed: string[];
  exercisesViewed: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    showTips: boolean;
  };
}

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  feature?: string;
  exerciseId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Exercise Service Integration
 */
export class ExerciseServiceIntegration {
  private static instance: ExerciseServiceIntegration;
  private cachedExercises: Map<string, Exercise[]> = new Map();

  static getInstance(): ExerciseServiceIntegration {
    if (!ExerciseServiceIntegration.instance) {
      ExerciseServiceIntegration.instance = new ExerciseServiceIntegration();
    }
    return ExerciseServiceIntegration.instance;
  }

  /**
   * Get exercises with Phase 4 features enabled
   */
  async getPhase4Exercises(
    userId?: string,
    sessionId?: string,
    customContext?: Record<string, any>
  ): Promise<{
    exercises: Exercise[];
    enabledCategories: string[];
    evaluation: EvaluationResult | null;
  }> {
    // Evaluate Phase 4 features for user
    const evaluationContext: FeatureEvaluationContext = customContext || { userId, sessionId };
    const evaluation = await phase4FeatureFlagService.evaluateFeature(
      'PHASE_4_FLEXIBILITY_EXERCISES',
      evaluationContext
    );

    if (!evaluation.enabled) {
      return {
        exercises: [],
        enabledCategories: [],
        evaluation: null
      };
    }

    // Record evaluation for monitoring
    if (userId && sessionId) {
      recordFeatureEvaluation({
        feature: 'PHASE_4_FLEXIBILITY_EXERCISES',
        userId,
        enabled: true,
        evaluationTime: 0,
        timestamp: new Date(),
        segments: evaluation.segments,
        metadata: evaluationContext
      });
    }

    // Get exercises based on enabled features
    const exercises = await this.fetchPhase4Exercises(evaluation);
    const enabledCategories = this.getEnabledCategories(evaluation);

    return {
      exercises,
      enabledCategories,
      evaluation
    };
  }

  /**
   * Fetch Phase 4 exercises from backend or cache
   */
  private async fetchPhase4Exercises(evaluation: EvaluationResult): Promise<Exercise[]> {
    const cacheKey = this.generateCacheKey(evaluation);

    // Check cache first
    if (this.cachedExercises.has(cacheKey)) {
      return this.cachedExercises.get(cacheKey)!;
    }

    // In real implementation, this would fetch from database or API
    // For demo, we'll generate mock exercises
    const exercises = this.generateMockPhase4Exercises(evaluation);

    // Cache results
    this.cachedExercises.set(cacheKey, exercises);

    return exercises;
  }

  /**
   * Generate mock Phase 4 exercises based on enabled features
   */
  private generateMockPhase4Exercises(evaluation: EvaluationResult): Exercise[] {
    const exercises: Exercise[] = [];

    // Flexibility exercises
    if (evaluation.segments.includes('early_adopters') || evaluation.segments.includes('new_users')) {
      exercises.push({
        id: 'phase4-flex-001',
        name: 'Dynamic Flexibility Flow',
        category: 'Flexibility',
        difficulty: 'Intermediate',
        equipment: ['none'],
        instructions: 'Follow the dynamic flexibility movements shown in the video',
        muscleGroups: ['full-body'],
        phase4Features: { flexibility: true },
        videoUrl: '/videos/flexibility-flow.mp4'
      });
    }

    // Balance exercises
    if (evaluation.segments.includes('early_adopters')) {
      exercises.push({
        id: 'phase4-bal-001',
        name: 'Single-leg Balance Reach',
        category: 'Balance',
        difficulty: 'Advanced',
        equipment: ['none'],
        instructions: 'Maintain balance while reaching in different directions',
        muscleGroups: ['core', 'legs'],
        phase4Features: { balance: true },
        videoUrl: '/videos/balance-reach.mp4'
      });
    }

    // Medicine ball exercises
    if (evaluation.segments.includes('power_users') || evaluation.segments.includes('beta_testers')) {
      exercises.push({
        id: 'phase4-med-001',
        name: 'Medicine Ball Power Slam',
        category: 'Medicine Ball',
        difficulty: 'Advanced',
        equipment: ['medicine-ball'],
        instructions: 'Explosive power movement with medicine ball',
        muscleGroups: ['full-body'],
        phase4Features: { medicineBall: true },
        videoUrl: '/videos/medicine-ball-slam.mp4'
      });
    }

    // Stability ball exercises
    if (evaluation.segments.includes('regular_users') || evaluation.segments.includes('new_users')) {
      exercises.push({
        id: 'phase4-stab-001',
        name: 'Stability Ball Pike',
        category: 'Stability Ball',
        difficulty: 'Intermediate',
        equipment: ['stability-ball'],
        instructions: 'Advanced core exercise using stability ball',
        muscleGroups: ['core', 'shoulders'],
        phase4Features: { stabilityBall: true },
        videoUrl: '/videos/stability-ball-pike.mp4'
      });
    }

    return exercises;
  }

  /**
   * Get enabled categories based on evaluation
   */
  private getEnabledCategories(evaluation: EvaluationResult): string[] {
    const categories: string[] = [];

    if (evaluation.segments.includes('early_adopters')) {
      categories.push('Flexibility', 'Balance', 'Medicine Ball');
    }
    if (evaluation.segments.includes('regular_users')) {
      categories.push('Stability Ball');
    }
    if (evaluation.segments.includes('new_users')) {
      categories.push('Flexibility', 'Stability Ball');
    }

    return categories;
  }

  /**
   * Generate cache key based on evaluation
   */
  private generateCacheKey(evaluation: EvaluationResult): string {
    return `${evaluation.percentage}_${evaluation.segments.join('_')}_${Date.now()}`;
  }

  /**
   * Clear exercise cache
   */
  clearCache(): void {
    this.cachedExercises.clear();
  }
}

/**
 * Component Integration Helper
 */
export class ComponentIntegrationHelper {
  /**
   * Check if user has access to enhanced ExerciseCard components
   */
  static async hasEnhancedExerciseCardAccess(
    userId?: string,
    sessionId?: string
  ): Promise<{
    enabled: boolean;
    hasPhase4Indicators: boolean;
    hasCategoryBadges: boolean;
    evaluation: EvaluationResult | null;
  }> {
    const context: FeatureEvaluationContext = { userId, sessionId };
    const evaluation = await phase4FeatureFlagService.evaluateFeature(
      'PHASE_4_EXERCISE_CARD_INDICATORS',
      context
    );

    return {
      enabled: evaluation.enabled,
      hasPhase4Indicators: evaluation.enabled,
      hasCategoryBadges: evaluation.enabled,
      evaluation
    };
  }

  /**
   * Check if FilterPanel enhancements should be shown
   */
  static async shouldShowEnhancedFilters(
    userId?: string,
    sessionId?: string
  ): Promise<{
    enabled: boolean;
    newFiltersAvailable: boolean;
    evaluation: EvaluationResult | null;
  }> {
    const context: FeatureEvaluationContext = { userId, sessionId };
    const evaluation = await phase4FeatureFlagService.evaluateFeature(
      'PHASE_4_FILTER_PANEL_ENHANCEMENTS',
      context
    );

    return {
      enabled: evaluation.enabled,
      newFiltersAvailable: evaluation.enabled,
      evaluation
    };
  }

  /**
   * Get progression tracking capabilities for user
   */
  static async getProgressionTrackingCapabilities(
    userId?: string,
    sessionId?: string
  ): Promise<{
    flexibilityProgression: boolean;
    balanceDifficulty: boolean;
    medicineBallPower: boolean;
    stabilityBallEngagement: boolean;
    evaluation: EvaluationResult | null;
  }> {
    const context: FeatureEvaluationContext = { userId, sessionId };
    const evaluation = await phase4FeatureFlagService.evaluateFeature(
      'PHASE_4_FLEXIBILITY_PROGRESSION',
      context
    );

    return {
      flexibilityProgression: evaluation.enabled,
      balanceDifficulty: evaluation.enabled,
      medicineBallPower: evaluation.enabled,
      stabilityBallEngagement: evaluation.enabled,
      evaluation
    };
  }

  /**
   * Check if advanced features should be available
   */
  static async hasAdvancedFeaturesAccess(
    userId?: string,
    sessionId?: string
  ): Promise<{
    powerMetrics: boolean;
    balanceRequirements: boolean;
    flexibilityTypes: boolean;
    advancedFiltering: boolean;
    evaluation: EvaluationResult | null;
  }> {
    const context: FeatureEvaluationContext = { userId, sessionId };
    const evaluation = await phase4FeatureFlagService.evaluateFeature(
      'PHASE_4_POWER_METRICS',
      context
    );

    return {
      powerMetrics: evaluation.enabled,
      balanceRequirements: evaluation.enabled,
      flexibilityTypes: evaluation.enabled,
      advancedFiltering: evaluation.enabled,
      evaluation
    };
  }
}

/**
 * Analytics Integration
 */
export class AnalyticsIntegration {
  private static instance: AnalyticsIntegration;

  static getInstance(): AnalyticsIntegration {
    if (!AnalyticsIntegration.instance) {
      AnalyticsIntegration.instance = new AnalyticsIntegration();
    }
    return AnalyticsIntegration.instance;
  }

  /**
   * Track Phase 4 feature usage
   */
  async trackFeatureUsage(event: AnalyticsEvent): Promise<void> {
    // Send to analytics service
    if (import.meta.env.DEV) {
      console.log('[Phase4 Analytics]', event);
    }

    // In production, this would send to Google Analytics, Segment, or custom analytics
    await this.sendToAnalyticsService(event);
  }

  /**
   * Track feature evaluation for monitoring
   */
  async trackFeatureEvaluation(evaluation: EvaluationResult): Promise<void> {
    const event: AnalyticsEvent = {
      event: 'feature_evaluation',
      userId: evaluation.context.userId,
      sessionId: evaluation.context.sessionId,
      feature: evaluation.feature,
      timestamp: new Date(),
      metadata: {
        enabled: evaluation.enabled,
        percentage: evaluation.percentage,
        segments: evaluation.segments,
        evaluationTime: evaluation.evaluationTime,
        reason: evaluation.reason
      }
    };

    await this.trackFeatureUsage(event);
  }

  /**
   * Track exercise interaction with Phase 4 features
   */
  async trackExerciseInteraction(
    exerciseId: string,
    featureCategory: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      event: 'exercise_interaction',
      userId,
      sessionId,
      exerciseId,
      feature: featureCategory,
      timestamp: new Date(),
      metadata: {
        phase4Feature: true,
        category: featureCategory
      }
    };

    await this.trackFeatureUsage(event);
  }

  /**
   * Track user segmentation
   */
  async trackUserSegmentation(
    userId: string,
    segments: string[],
    sessionId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      event: 'user_segmentation',
      userId,
      sessionId,
      timestamp: new Date(),
      metadata: {
        segments,
        phase4Rollout: true
      }
    };

    await this.trackFeatureUsage(event);
  }

  /**
   * Send analytics event to service
   */
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    // In real implementation, this would send to analytics endpoint
    // For demo, we'll just log it
    if (import.meta.env.PROD) {
      // Implementation would depend on your analytics provider
      // Example: window.gtag('event', event.event, event.metadata);
    }
  }
}

/**
 * User Session Manager
 */
export class SessionManager {
  private static instance: SessionManager;
  private activeSessions: Map<string, UserSession> = new Map();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Create or update user session
   */
  createOrUpdateSession(
    userId: string,
    sessionId: string,
    preferences: UserSession['preferences']
  ): UserSession {
    const existingSession = this.activeSessions.get(sessionId);

    if (existingSession) {
      // Update existing session
      existingSession.lastActivity = new Date();
      existingSession.preferences = { ...existingSession.preferences, ...preferences };
      return existingSession;
    } else {
      // Create new session
      const newSession: UserSession = {
        userId,
        sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        featuresAccessed: [],
        exercisesViewed: [],
        preferences
      };
      this.activeSessions.set(sessionId, newSession);
      return newSession;
    }
  }

  /**
   * Get user session
   */
  getSession(sessionId: string): UserSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Record feature access in session
   */
  recordFeatureAccess(sessionId: string, feature: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      if (!session.featuresAccessed.includes(feature)) {
        session.featuresAccessed.push(feature);
      }
      session.lastActivity = new Date();
    }
  }

  /**
   * Record exercise view in session
   */
  recordExerciseView(sessionId: string, exerciseId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      if (!session.exercisesViewed.includes(exerciseId)) {
        session.exercisesViewed.push(exerciseId);
      }
      session.lastActivity = new Date();
    }
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.activeSessions.forEach((session, sessionId) => {
      if (session.lastActivity < cutoff) {
        this.activeSessions.delete(sessionId);
      }
    });
  }
}

/**
 * Export singleton instances
 */
export const exerciseServiceIntegration = ExerciseServiceIntegration.getInstance();
export const analyticsIntegration = AnalyticsIntegration.getInstance();
export const sessionManager = SessionManager.getInstance();

/**
 * Convenience functions for common use cases
 */

/**
 * Get Phase 4 exercises for user
 */
export async function getPhase4ExercisesForUser(
  userId?: string,
  sessionId?: string
): Promise<{
  exercises: Exercise[];
  enabledCategories: string[];
  evaluation: EvaluationResult | null;
}> {
  return await exerciseServiceIntegration.getPhase4Exercises(userId, sessionId);
}

/**
 * Check if user has enhanced UI access
 */
export async function hasEnhancedUIAccess(
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  const result = await ComponentIntegrationHelper.hasEnhancedExerciseCardAccess(userId, sessionId);
  return result.enabled;
}

/**
 * Track feature usage
 */
export async function trackPhase4FeatureUsage(
  feature: string,
  userId?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await analyticsIntegration.trackFeatureUsage({
    event: 'feature_usage',
    userId,
    sessionId,
    feature,
    timestamp: new Date(),
    metadata
  });
}

/**
 * Get user session
 */
export function getUserSession(sessionId: string): UserSession | undefined {
  return sessionManager.getSession(sessionId);
}

/**
 * Create user session
 */
export function createUserSession(
  userId: string,
  sessionId: string,
  preferences: UserSession['preferences']
): UserSession {
  return sessionManager.createOrUpdateSession(userId, sessionId, preferences);
}
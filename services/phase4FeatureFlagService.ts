/**
 * Phase 4 Feature Flag Service
 *
 * Provides runtime feature flag evaluation with user segment detection,
 * A/B testing integration, and performance monitoring for Phase 4 features.
 */

import {
  PHASE4_ROLLOUT_CONFIG,
  getCurrentEnvironment,
  getUserRolloutPercentage,
  isUserInSegment,
  getFeatureCategoryStatus,
  PHASE4_ROLLOUT_STRATEGIES,
  PHASE4_USER_SEGMENTS
} from '../config/phase4RolloutConfig';
import { FeatureFlag, isFeatureEnabled, setFeatureFlag } from './featureFlags';

export interface FeatureEvaluationContext {
  userId?: string;
  sessionId?: string;
  environment?: string;
  userAgent?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface EvaluationResult {
  enabled: boolean;
  percentage: number;
  segments: string[];
  reason: string;
  evaluationTime: number;
  feature: string;
  context: FeatureEvaluationContext;
}

export interface ABTestConfig {
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number;
    enabled: boolean;
  }[];
  features: string[];
  trafficAllocation: number;
  endDate?: Date;
}

export interface MonitoringData {
  feature: string;
  userId?: string;
  enabled: boolean;
  evaluationTime: number;
  timestamp: Date;
  segments: string[];
  metadata?: Record<string, any>;
}

/**
 * Phase 4 Feature Flags
 */
export const PHASE4_FEATURE_FLAGS = {
  // New Exercise Categories
  PHASE_4_FLEXIBILITY_EXERCISES: 'phase-4-flexibility-exercises',
  PHASE_4_BALANCE_EXERCISES: 'phase-4-balance-exercises',
  PHASE_4_MEDICINE_BALL_EXERCISES: 'phase-4-medicine-ball-exercises',
  PHASE_4_STABILITY_BALL_EXERCISES: 'phase-4-stability-ball-exercises',
  PHASE_4_ADVANCED_CARDIO_EXERCISES: 'phase-4-advanced-cardio-exercises',

  // Progression Tracking
  PHASE_4_FLEXIBILITY_PROGRESSION: 'phase-4-flexibility-progression',
  PHASE_4_BALANCE_DIFFICULTY: 'phase-4-balance-difficulty',
  PHASE_4_MEDICINE_BALL_POWER: 'phase-4-medicine-ball-power',
  PHASE_4_STABILITY_BALL_ENGAGEMENT: 'phase-4-stability-ball-engagement',

  // Enhanced UI Components
  PHASE_4_EXERCISE_CARD_INDICATORS: 'phase-4-exercise-card-indicators',
  PHASE_4_FILTER_PANEL_ENHANCEMENTS: 'phase-4-filter-panel-enhancements',
  PHASE_4_CATEGORY_BADGES: 'phase-4-category-badges',

  // Advanced Features
  PHASE_4_POWER_METRICS: 'phase-4-power-metrics',
  PHASE_4_BALANCE_REQUIREMENTS: 'phase-4-balance-requirements',
  PHASE_4_FLEXIBILITY_TYPES: 'phase-4-flexibility-types',
  PHASE_4_ADVANCED_FILTERING: 'phase-4-advanced-filtering',

  // Service Capabilities
  PHASE_4_PROGRESSION_SERVICE: 'phase-4-progression-service',
  PHASE_4_RECOMMENDATION_ENGINE: 'phase-4-recommendation-engine',
  PHASE_4_ANALYTICS_SERVICE: 'phase-4-analytics-service'
} as const;

export type Phase4FeatureFlag = keyof typeof PHASE4_FEATURE_FLAGS;

/**
 * Main Phase 4 Feature Flag Service
 */
export class Phase4FeatureFlagService {
  private monitoringData: MonitoringData[] = [];
  private abTests: ABTestConfig[] = [];
  private cache = new Map<string, EvaluationResult>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL

  constructor() {
    this.initializeABTests();
  }

  /**
   * Initialize A/B tests
   */
  private initializeABTests(): void {
    this.abTests = [
      {
        name: 'flexibility_experiment',
        variants: [
          { id: 'control', name: 'Control', weight: 50, enabled: true },
          { id: 'enhanced', name: 'Enhanced UX', weight: 50, enabled: true }
        ],
        features: [PHASE4_FEATURE_FLAGS.PHASE_4_FLEXIBILITY_EXERCISES],
        trafficAllocation: 20, // 20% of users
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        name: 'balance_tracking_experiment',
        variants: [
          { id: 'basic', name: 'Basic Tracking', weight: 60, enabled: true },
          { id: 'advanced', name: 'Advanced Analytics', weight: 40, enabled: true }
        ],
        features: [PHASE4_FEATURE_FLAGS.PHASE_4_BALANCE_DIFFICULTY],
        trafficAllocation: 15, // 15% of users
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days
      }
    ];
  }

  /**
   * Evaluate a single Phase 4 feature flag
   */
  async evaluateFeature(
    feature: Phase4FeatureFlag,
    context: FeatureEvaluationContext = {}
  ): Promise<EvaluationResult> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(feature, context);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.evaluationTime < this.cacheTTL) {
      return cached;
    }

    // Get feature configuration
    const featureConfig = this.getFeatureConfig(feature);
    if (!featureConfig) {
      const result: EvaluationResult = {
        enabled: false,
        percentage: 0,
        segments: [],
        reason: 'Feature not configured',
        evaluationTime: performance.now() - startTime,
        feature,
        context
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Check environment overrides
    const envResult = this.checkEnvironmentOverrides(feature, context);
    if (envResult !== null) {
      const result: EvaluationResult = {
        ...envResult,
        evaluationTime: performance.now() - startTime,
        feature,
        context
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Evaluate user segments
    const segmentEvaluation = await this.evaluateUserSegments(feature, context);

    // Check A/B tests
    const abTestResult = await this.evaluateABTest(feature, context);

    // Final evaluation
    const enabled = segmentEvaluation.enabled || abTestResult.enabled;
    const percentage = Math.max(segmentEvaluation.percentage, abTestResult.percentage);
    const segments = [...new Set([...segmentEvaluation.segments, ...abTestResult.segments])];

    const result: EvaluationResult = {
      enabled,
      percentage,
      segments,
      reason: segmentEvaluation.reason || abTestResult.reason,
      evaluationTime: performance.now() - startTime,
      feature,
      context
    };

    // Cache result
    this.cache.set(cacheKey, result);

    // Record monitoring data
    this.recordMonitoringData(result);

    return result;
  }

  /**
   * Evaluate multiple Phase 4 feature flags at once
   */
  async evaluateFeatures(
    features: Phase4FeatureFlag[],
    context: FeatureEvaluationContext = {}
  ): Promise<Record<Phase4FeatureFlag, EvaluationResult>> {
    const results: Record<Phase4FeatureFlag, EvaluationResult> = {} as any;

    // Evaluate features in parallel for better performance
    const evaluationPromises = features.map(async (feature) => {
      const result = await this.evaluateFeature(feature, context);
      results[feature] = result;
      return result;
    });

    await Promise.all(evaluationPromises);

    // Remove disabled features from results for cleaner output
    Object.keys(results).forEach(feature => {
      if (!results[feature as Phase4FeatureFlag].enabled) {
        delete results[feature as Phase4FeatureFlag];
      }
    });

    return results;
  }

  /**
   * Check if user belongs to a specific segment
   */
  async evaluateUserSegments(
    feature: Phase4FeatureFlag,
    context: FeatureEvaluationContext = {}
  ): Promise<{
    enabled: boolean;
    percentage: number;
    segments: string[];
    reason: string;
  }> {
    const userId = context.userId;
    const segments: string[] = [];
    let highestPercentage = 0;

    for (const segment of PHASE4_ROLLOUT_CONFIG.userSegments) {
      const isInSegment = await this.isUserInSegment(segment, context);
      if (isInSegment) {
        segments.push(segment.id);
        highestPercentage = Math.max(highestPercentage, segment.percentage);
      }
    }

    // Check feature category requirements
    const category = this.getFeatureCategory(feature);
    if (category && category.enabledByDefault) {
      highestPercentage = Math.max(highestPercentage, this.getBaseRolloutPercentage(feature));
    }

    return {
      enabled: highestPercentage > 0,
      percentage: highestPercentage,
      segments,
      reason: highestPercentage > 0 ? `User in segments: ${segments.join(', ')}` : 'No matching segments'
    };
  }

  /**
   * Evaluate A/B tests for feature
   */
  async evaluateABTest(
    feature: Phase4FeatureFlag,
    context: FeatureEvaluationContext = {}
  ): Promise<{
    enabled: boolean;
    percentage: number;
    segments: string[];
    reason: string;
  }> {
    const userId = context.userId;
    let abTestSegment = '';
    let abTestPercentage = 0;

    for (const abTest of this.abTests) {
      // Check if feature is in this A/B test
      if (!abTest.features.includes(PHASE4_FEATURE_FLAGS[feature])) {
        continue;
      }

      // Check if A/B test is active
      if (abTest.endDate && new Date() > abTest.endDate) {
        continue;
      }

      // Check if user is in traffic allocation
      if (userId && this.isInABTestTraffic(userId, abTest.trafficAllocation)) {
        abTestSegment = `ab_${abTest.name}`;
        abTestPercentage = abTest.trafficAllocation;

        // Determine variant
        const variant = this.getABTestVariant(userId, abTest);
        if (variant && variant.enabled && abTest.features.includes(PHASE4_FEATURE_FLAGS[feature])) {
          return {
            enabled: true,
            percentage: abTestPercentage,
            segments: [abTestSegment],
            reason: `A/B test: ${abTest.name} - ${variant.name}`
          };
        }
      }
    }

    return {
      enabled: false,
      percentage: abTestPercentage,
      segments: abTestSegment ? [abTestSegment] : [],
      reason: 'Not in active A/B test'
    };
  }

  /**
   * Get configuration for a feature
   */
  private getFeatureConfig(feature: Phase4FeatureFlag): any {
    const flagName = PHASE4_FEATURE_FLAGS[feature];

    // Find feature category that contains this flag
    for (const category of PHASE4_ROLLOUT_CONFIG.features) {
      if (category.flags.includes(flagName as FeatureFlag)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Get feature category for a flag
   */
  private getFeatureCategory(feature: Phase4FeatureFlag): any {
    const flagName = PHASE4_FEATURE_FLAGS[feature];

    for (const category of PHASE4_ROLLOUT_CONFIG.features) {
      if (category.flags.includes(flagName as FeatureFlag)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Get base rollout percentage for feature
   */
  private getBaseRolloutPercentage(feature: Phase4FeatureFlag): number {
    const strategy = PHASE4_ROLLOUT_STRATEGIES[0]; // Use balanced strategy
    return strategy.segments.earlyAdopters; // Default to early adopters
  }

  /**
   * Check environment overrides
   */
  private checkEnvironmentOverrides(
    feature: Phase4FeatureFlag,
    context: FeatureEvaluationContext
  ): EvaluationResult | null {
    const env = context.environment || getCurrentEnvironment();
    const envConfig = PHASE4_ROLLOUT_CONFIG.environments[env];

    if (!envConfig || !envConfig.enabled) {
      return {
        enabled: false,
        percentage: 0,
        segments: [],
        reason: 'Environment disabled',
        evaluationTime: 0,
        feature,
        context
      };
    }

    // Check environment-specific override percentage
    if (envConfig.rolloutPercentage !== undefined) {
      return {
        enabled: true,
        percentage: envConfig.rolloutPercentage,
        segments: ['environment_override'],
        reason: `Environment override: ${env} - ${envConfig.rolloutPercentage}%`,
        evaluationTime: 0,
        feature,
        context
      };
    }

    return null;
  }

  /**
   * Check if user is in A/B test traffic
   */
  private isInABTestTraffic(userId: string, trafficAllocation: number): boolean {
    const hash = this.hashString(userId + '_ab_test');
    return (hash % 100) < trafficAllocation;
  }

  /**
   * Get A/B test variant for user
   */
  private getABTestVariant(userId: string, abTest: ABTestConfig) {
    const hash = this.hashString(userId + '_' + abTest.name);
    const variantIndex = hash % 100;

    let accumulated = 0;
    for (const variant of abTest.variants) {
      accumulated += variant.weight;
      if (variantIndex < accumulated) {
        return variant;
      }
    }

    return abTest.variants[0]; // Fallback to first variant
  }

  /**
   * Check if user is in segment (simplified for demo)
   */
  private async isUserInSegment(
    segment: typeof PHASE4_ROLLOUT_CONFIG.userSegments[0],
    context: FeatureEvaluationContext = {}
  ): Promise<boolean> {
    const userId = context.userId;

    if (!userId) return false;

    // Simplified segment logic - in real implementation, this would check user data
    const segmentHash = this.hashString(userId + segment.id);
    const segmentPercentage = Math.abs(segmentHash) % 100;

    return segmentPercentage < segment.percentage;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(feature: Phase4FeatureFlag, context: FeatureEvaluationContext): string {
    const parts = [
      feature,
      context.userId || 'anonymous',
      context.environment || getCurrentEnvironment(),
      context.sessionId || 'no_session'
    ];
    return parts.join('|');
  }

  /**
   * Record monitoring data
   */
  private recordMonitoringData(data: MonitoringData): void {
    this.monitoringData.push(data);

    // Keep only recent data (last 1000 entries)
    if (this.monitoringData.length > 1000) {
      this.monitoringData = this.monitoringData.slice(-1000);
    }

    // In real implementation, this would send to analytics service
    if (import.meta.env.DEV) {
      console.log('[Phase4 FF Monitor]', data);
    }
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    totalEvaluations: number;
    averageEvaluationTime: number;
    topFeatures: Array<{ feature: string; count: number }>;
    segmentDistribution: Record<string, number>;
  } {
    if (this.monitoringData.length === 0) {
      return {
        totalEvaluations: 0,
        averageEvaluationTime: 0,
        topFeatures: [],
        segmentDistribution: {}
      };
    }

    const featureCount = new Map<string, number>();
    const segmentCount = new Map<string, number>();
    let totalTime = 0;

    this.monitoringData.forEach(data => {
      // Count feature usage
      if (data.enabled) {
        featureCount.set(data.feature, (featureCount.get(data.feature) || 0) + 1);
      }

      // Count segment usage
      data.segments.forEach(segment => {
        segmentCount.set(segment, (segmentCount.get(segment) || 0) + 1);
      });

      totalTime += data.evaluationTime;
    });

    const topFeatures = Array.from(featureCount.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const segmentDistribution = Array.from(segmentCount.entries())
      .reduce((acc, [segment, count]) => {
        acc[segment] = count;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalEvaluations: this.monitoringData.length,
      averageEvaluationTime: totalTime / this.monitoringData.length,
      topFeatures,
      segmentDistribution
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Emergency disable all Phase 4 features
   */
  emergencyDisableAll(): void {
    Object.values(PHASE4_FEATURE_FLAGS).forEach(flag => {
      setFeatureFlag(flag as FeatureFlag, false);
    });
    this.clearCache();

    if (import.meta.env.DEV) {
      console.log('[Phase4 FF Service] Emergency disable triggered');
    }
  }

  /**
   * Get all active A/B tests
   */
  getActiveABTests(): ABTestConfig[] {
    const now = new Date();
    return this.abTests.filter(test =>
      (!test.endDate || now < test.endDate) &&
      test.trafficAllocation > 0
    );
  }

  /**
   * Update A/B test configuration
   */
  updateABTest(testName: string, updates: Partial<ABTestConfig>): boolean {
    const test = this.abTests.find(t => t.name === testName);
    if (!test) return false;

    Object.assign(test, updates);
    this.clearCache();
    return true;
  }
}

/**
 * Create and export singleton instance
 */
export const phase4FeatureFlagService = new Phase4FeatureFlagService();

/**
 * Convenience functions for common use cases
 */

/**
 * Check if Phase 4 feature is enabled for user
 */
export async function isPhase4FeatureEnabled(
  feature: Phase4FeatureFlag,
  context: FeatureEvaluationContext = {}
): Promise<boolean> {
  const result = await phase4FeatureFlagService.evaluateFeature(feature, context);
  return result.enabled;
}

/**
 * Get all enabled Phase 4 features for user
 */
export async function getEnabledPhase4Features(
  context: FeatureEvaluationContext = {}
): Promise<Record<Phase4FeatureFlag, EvaluationResult>> {
  const allFeatures = Object.keys(PHASE4_FEATURE_FLAGS) as Phase4FeatureFlag[];
  return await phase4FeatureFlagService.evaluateFeatures(allFeatures, context);
}

/**
 * Get rollout percentage for user
 */
export function getUserPhase4RolloutPercentage(userId?: string): number {
  return getUserRolloutPercentage(userId);
}

/**
 * Check if user is in specific Phase 4 segment
 */
export function isUserInPhase4Segment(userId?: string, segmentId?: string): boolean {
  return isUserInSegment(userId, segmentId);
}

/**
 * Get feature category status
 */
export function getPhase4FeatureCategoryStatus(categoryId: string): {
  enabled: boolean;
  rolloutPercentage: number;
  segments: string[];
} {
  return getFeatureCategoryStatus(categoryId);
}

/**
 * Export monitoring data
 */
export function exportPhase4MonitoringData(): string {
  return JSON.stringify(phase4FeatureFlagService.getMonitoringStats(), null, 2);
}
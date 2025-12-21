/**
 * Phase 4 Rollout Configuration
 *
 * Comprehensive rollout configuration for Phase 4 features including:
 * - New exercise categories (Flexibility, Balance, Medicine Ball, Stability Ball, Advanced Cardio)
 * - Progression tracking features
 * - Enhanced UI components
 * - Advanced features and capabilities
 * - Service capabilities and monitoring
 */

import { FeatureFlag } from '../services/featureFlags';

export interface Phase4FeatureCategory {
  id: string;
  name: string;
  description: string;
  flags: FeatureFlag[];
  dependencies?: FeatureFlag[];
  rolloutPhase: number;
  successMetrics: SuccessMetric[];
  rollbackCriteria: RollbackCriterion[];
  enabledByDefault: boolean;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    registrationDate?: {
      from?: Date;
      to?: Date;
    };
    activityLevel?: 'low' | 'medium' | 'high' | 'power';
    subscriptionTier?: 'free' | 'premium' | 'pro';
    totalWorkouts?: {
      min?: number;
      max?: number;
    };
    lastActive?: {
      from?: Date;
      to?: Date;
    };
    engagementScore?: {
      min?: number;
      max?: number;
    };
    isNewUser?: boolean;
    isBetaTester?: boolean;
    isPowerUser?: boolean;
  };
  percentage: number;
}

export interface RolloutStrategy {
  id: string;
  name: string;
  description: string;
  segments: {
    earlyAdopters: number; // 75% rollout
    regularUsers: number; // 40% rollout
    newUsers: number; // 60% rollout
  };
  schedule?: {
    startTime: Date;
    endTime?: Date;
    rampUpPeriod: number; // in days
  };
  dependencies?: string[]; // Other feature categories this depends on
  monitoringEnabled: boolean;
  autoRollback: boolean;
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  target: number;
  current?: number;
  unit: 'percentage' | 'count' | 'score' | 'time';
  threshold: {
    minimum: number;
    optimum: number;
    critical: number;
  };
  measurementWindow: '24h' | '7d' | '30d';
  category: string;
}

export interface RollbackCriterion {
  id: string;
  name: string;
  description: string;
  threshold: number;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  timeWindow: '1h' | '6h' | '24h' | '72h';
  autoRollback: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Phase4Configuration {
  id: string;
  name: string;
  description: string;
  version: string;
  features: Phase4FeatureCategory[];
  rolloutStrategies: RolloutStrategy[];
  userSegments: UserSegment[];
  globalSettings: {
    enablePercentageRollout: boolean;
    enableMonitoring: boolean;
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enableFeedbackCollection: boolean;
    autoRollbackEnabled: boolean;
    rolloutSpeed: 'conservative' | 'moderate' | 'aggressive';
    emergencyDisable: boolean;
  };
  successMetrics: SuccessMetric[];
  rollbackCriteria: RollbackCriterion[];
  environments: {
    development: RolloutEnvironment;
    staging: RolloutEnvironment;
    production: RolloutEnvironment;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RolloutEnvironment {
  name: string;
  currentPhase: number;
  enabled: boolean;
  overrideSettings?: Partial<Phase4Configuration>;
  rolloutPercentage?: number;
  featureOverrides?: Record<string, boolean>;
}

/**
 * Phase 4 Feature Categories
 */
export const PHASE4_FEATURE_CATEGORIES: Phase4FeatureCategory[] = [
  {
    id: 'new-exercise-categories',
    name: 'New Exercise Categories',
    description: 'Flexibility, Balance, Medicine Ball, Stability Ball, Advanced Cardio exercises',
    flags: [
      'PHASE_4_FLEXIBILITY_EXERCISES',
      'PHASE_4_BALANCE_EXERCISES',
      'PHASE_4_MEDICINE_BALL_EXERCISES',
      'PHASE_4_STABILITY_BALL_EXERCISES',
      'PHASE_4_ADVANCED_CARDIO_EXERCISES'
    ],
    rolloutPhase: 4,
    enabledByDefault: false,
    successMetrics: [
      {
        id: 'exercise_diversity',
        name: 'Exercise Diversity',
        description: '40% increase in category variety',
        target: 40,
        unit: 'percentage',
        threshold: { minimum: 25, optimum: 40, critical: 15 },
        measurementWindow: '30d',
        category: 'new-exercise-categories'
      }
    ],
    rollbackCriteria: [
      {
        id: 'low_diversity_adoption',
        name: 'Low Diversity Adoption',
        description: 'Rollback if diversity adoption is too low',
        threshold: 15,
        metric: 'exercise_diversity',
        operator: '<',
        timeWindow: '72h',
        autoRollback: false,
        severity: 'medium'
      }
    ]
  },
  {
    id: 'progression-tracking',
    name: 'Progression Tracking',
    description: 'Advanced progression tracking for balance and flexibility',
    flags: [
      'PHASE_4_FLEXIBILITY_PROGRESSION',
      'PHASE_4_BALANCE_DIFFICULTY',
      'PHASE_4_MEDICINE_BALL_POWER',
      'PHASE_4_STABILITY_BALL_ENGAGEMENT'
    ],
    dependencies: [
      'PHASE_4_FLEXIBILITY_EXERCISES',
      'PHASE_4_BALANCE_EXERCISES',
      'PHASE_4_MEDICINE_BALL_EXERCISES',
      'PHASE_4_STABILITY_BALL_EXERCISES'
    ],
    rolloutPhase: 4,
    enabledByDefault: false,
    successMetrics: [
      {
        id: 'balance_exercise_adoption',
        name: 'Balance Exercise Adoption',
        description: '25% of users try within 2 weeks',
        target: 25,
        unit: 'percentage',
        threshold: { minimum: 15, optimum: 25, critical: 5 },
        measurementWindow: '7d',
        category: 'progression-tracking'
      },
      {
        id: 'flexibility_usage',
        name: 'Flexibility Exercise Usage',
        description: '30% of users include in routines',
        target: 30,
        unit: 'percentage',
        threshold: { minimum: 20, optimum: 30, critical: 10 },
        measurementWindow: '30d',
        category: 'progression-tracking'
      }
    ],
    rollbackCriteria: [
      {
        id: 'low_balance_adoption',
        name: 'Low Balance Adoption',
        description: 'Rollback if balance adoption is critically low',
        threshold: 5,
        metric: 'balance_exercise_adoption',
        operator: '<',
        timeWindow: '72h',
        autoRollback: false,
        severity: 'medium'
      }
    ]
  },
  {
    id: 'enhanced-ui-components',
    name: 'Enhanced UI Components',
    description: 'ExerciseCard Phase 4 indicators and FilterPanel new filters',
    flags: [
      'PHASE_4_EXERCISE_CARD_INDICATORS',
      'PHASE_4_FILTER_PANEL_ENHANCEMENTS',
      'PHASE_4_CATEGORY_BADGES'
    ],
    dependencies: [
      'PHASE_4_FLEXIBILITY_EXERCISES',
      'PHASE_4_BALANCE_EXERCISES'
    ],
    rolloutPhase: 4,
    enabledByDefault: true,
    successMetrics: [
      {
        id: 'ui_engagement',
        name: 'UI Engagement',
        description: 'User interaction with enhanced UI components',
        target: 60,
        unit: 'percentage',
        threshold: { minimum: 40, optimum: 60, critical: 20 },
        measurementWindow: '7d',
        category: 'enhanced-ui-components'
      }
    ],
    rollbackCriteria: [
      {
        id: 'low_ui_engagement',
        name: 'Low UI Engagement',
        description: 'Rollback if UI engagement is critically low',
        threshold: 20,
        metric: 'ui_engagement',
        operator: '<',
        timeWindow: '72h',
        autoRollback: false,
        severity: 'low'
      }
    ]
  },
  {
    id: 'advanced-features',
    name: 'Advanced Features',
    description: 'Power metrics, balance requirements, flexibility types',
    flags: [
      'PHASE_4_POWER_METRICS',
      'PHASE_4_BALANCE_REQUIREMENTS',
      'PHASE_4_FLEXIBILITY_TYPES',
      'PHASE_4_ADVANCED_FILTERING'
    ],
    dependencies: [],
    rolloutPhase: 4,
    enabledByDefault: false,
    successMetrics: [
      {
        id: 'medicine_ball_engagement',
        name: 'Medicine Ball Engagement',
        description: '20% of power users try exercises',
        target: 20,
        unit: 'percentage',
        threshold: { minimum: 10, optimum: 20, critical: 5 },
        measurementWindow: '30d',
        category: 'advanced-features'
      }
    ],
    rollbackCriteria: [
      {
        id: 'low_medicine_ball_engagement',
        name: 'Low Medicine Ball Engagement',
        description: 'Rollback if engagement is critically low',
        threshold: 5,
        metric: 'medicine_ball_engagement',
        operator: '<',
        timeWindow: '72h',
        autoRollback: false,
        severity: 'medium'
      }
    ]
  },
  {
    id: 'service-capabilities',
    name: 'Service Capabilities',
    description: 'Progression tracking, recommendations, analytics',
    flags: [
      'PHASE_4_PROGRESSION_SERVICE',
      'PHASE_4_RECOMMENDATION_ENGINE',
      'PHASE_4_ANALYTICS_SERVICE'
    ],
    dependencies: [
      'PHASE_4_FLEXIBILITY_EXERCISES',
      'PHASE_4_BALANCE_EXERCISES',
      'PHASE_4_MEDICINE_BALL_EXERCISES',
      'PHASE_4_STABILITY_BALL_EXERCISES',
      'PHASE_4_ADVANCED_CARDIO_EXERCISES',
      'PHASE_4_FLEXIBILITY_PROGRESSION',
      'PHASE_4_BALANCE_DIFFICULTY',
      'PHASE_4_MEDICINE_BALL_POWER',
      'PHASE_4_STABILITY_BALL_ENGAGEMENT'
    ],
    rolloutPhase: 4,
    enabledByDefault: false,
    successMetrics: [
      {
        id: 'user_retention',
        name: 'User Retention',
        description: '5% improvement in 30-day retention',
        target: 5,
        unit: 'percentage',
        threshold: { minimum: 2, optimum: 5, critical: 0 },
        measurementWindow: '30d',
        category: 'service-capabilities'
      }
    ],
    rollbackCriteria: [
      {
        id: 'negative_retention_impact',
        name: 'Negative Retention Impact',
        description: 'Rollback if retention decreases',
        threshold: -2,
        metric: 'user_retention',
        operator: '<',
        timeWindow: '72h',
        autoRollback: false,
        severity: 'critical'
      }
    ]
  }
];

/**
 * User Segments for Phase 4 Rollout
 */
export const PHASE4_USER_SEGMENTS: UserSegment[] = [
  {
    id: 'early_adopters',
    name: 'Early Adopters',
    description: 'Power users, beta participants, high-engagement users',
    criteria: {
      activityLevel: 'power',
      totalWorkouts: { min: 100 },
      engagementScore: { min: 8 }
    },
    percentage: 75
  },
  {
    id: 'regular_users',
    name: 'Regular Users',
    description: 'Medium engagement, consistent users',
    criteria: {
      activityLevel: 'medium',
      totalWorkouts: { min: 20, max: 99 }
    },
    percentage: 40
  },
  {
    id: 'new_users',
    name: 'New Users',
    description: 'Recently registered users (< 30 days)',
    criteria: {
      isNewUser: true,
      registrationDate: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    percentage: 60
  },
  {
    id: 'beta_testers',
    name: 'Beta Testers',
    description: 'Users who participated in previous beta programs',
    criteria: {
      isBetaTester: true,
      subscriptionTier: 'premium'
    },
    percentage: 90
  }
];

/**
 * Rollout Strategies
 */
export const PHASE4_ROLLOUT_STRATEGIES: RolloutStrategy[] = [
  {
    id: 'balanced_rollout',
    name: 'Balanced Rollout',
    description: 'Gradual rollout across all user segments',
    segments: {
      earlyAdopters: 75,
      regularUsers: 40,
      newUsers: 60
    },
    schedule: {
      startTime: new Date(),
      rampUpPeriod: 14
    },
    monitoringEnabled: true,
    autoRollback: true
  },
  {
    id: 'conservative_rollout',
    name: 'Conservative Rollout',
    description: 'Slow, controlled rollout with minimal risk',
    segments: {
      earlyAdopters: 25,
      regularUsers: 10,
      newUsers: 15
    },
    monitoringEnabled: true,
    autoRollback: true
  },
  {
    id: 'aggressive_rollout',
    name: 'Aggressive Rollout',
    description: 'Fast rollout for maximum feature availability',
    segments: {
      earlyAdopters: 100,
      regularUsers: 80,
      newUsers: 90
    },
    monitoringEnabled: true,
    autoRollback: false
  }
];

/**
 * Global Success Metrics for Phase 4
 */
export const PHASE4_SUCCESS_METRICS: SuccessMetric[] = [
  {
    id: 'feature_adoption_rate',
    name: 'Feature Adoption Rate',
    description: 'Overall Phase 4 feature adoption across all users',
    target: 35,
    unit: 'percentage',
    threshold: { minimum: 20, optimum: 35, critical: 10 },
    measurementWindow: '7d',
    category: 'global'
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    description: 'Percentage of sessions with Phase 4 related errors',
    target: 2,
    unit: 'percentage',
    threshold: { minimum: 0, optimum: 1, critical: 5 },
    measurementWindow: '24h',
    category: 'global'
  },
  {
    id: 'performance_score',
    name: 'Performance Score',
    description: 'Average load time and responsiveness for Phase 4 features',
    target: 85,
    unit: 'score',
    threshold: { minimum: 70, optimum: 85, critical: 50 },
    measurementWindow: '24h',
    category: 'global'
  },
  {
    id: 'user_satisfaction',
    name: 'User Satisfaction',
    description: 'Average user feedback rating for Phase 4 features',
    target: 4.0,
    unit: 'score',
    threshold: { minimum: 3.5, optimum: 4.5, critical: 2.5 },
    measurementWindow: '7d',
    category: 'global'
  },
  {
    id: 'retention_improvement',
    name: 'Retention Improvement',
    description: '30-day user retention improvement',
    target: 5,
    unit: 'percentage',
    threshold: { minimum: 0, optimum: 5, critical: -5 },
    measurementWindow: '30d',
    category: 'global'
  }
];

/**
 * Global Rollback Criteria
 */
export const PHASE4_ROLLBACK_CRITERIA: RollbackCriterion[] = [
  {
    id: 'critical_error_rate',
    name: 'Critical Error Rate',
    description: 'Roll back if critical errors exceed threshold',
    threshold: 5,
    metric: 'error_rate',
    operator: '>',
    timeWindow: '1h',
    autoRollback: true,
    severity: 'critical'
  },
  {
    id: 'performance_degradation',
    name: 'Performance Degradation',
    description: 'Roll back if performance drops significantly',
    threshold: 30,
    metric: 'performance_score',
    operator: '<',
    timeWindow: '6h',
    autoRollback: true,
    severity: 'high'
  },
  {
    id: 'critical_errors',
    name: 'Critical Errors',
    description: 'Roll back on critical errors',
    threshold: 10,
    metric: 'critical_errors',
    operator: '>',
    timeWindow: '1h',
    autoRollback: true,
    severity: 'critical'
  },
  {
    id: 'user_retention_drop',
    name: 'User Retention Drop',
    description: 'Roll back if user retention drops significantly',
    threshold: -5,
    metric: 'retention_improvement',
    operator: '<',
    timeWindow: '72h',
    autoRollback: false,
    severity: 'high'
  },
  {
    id: 'low_satisfaction',
    name: 'Low User Satisfaction',
    description: 'Consider rollback if satisfaction is too low',
    threshold: 2.5,
    metric: 'user_satisfaction',
    operator: '<',
    timeWindow: '72h',
    autoRollback: false,
    severity: 'medium'
  }
];

/**
 * Environment Configurations
 */
export const PHASE4_ENVIRONMENTS: Record<string, RolloutEnvironment> = {
  development: {
    name: 'development',
    currentPhase: 4,
    enabled: true,
    overrideSettings: {
      globalSettings: {
        enablePercentageRollout: false,
        enableMonitoring: true,
        enableAnalytics: false,
        enableErrorTracking: true,
        enableFeedbackCollection: true,
        autoRollbackEnabled: false,
        rolloutSpeed: 'conservative',
        emergencyDisable: true
      }
    },
    rolloutPercentage: 100
  },
  staging: {
    name: 'staging',
    currentPhase: 4,
    enabled: true,
    overrideSettings: {
      globalSettings: {
        enablePercentageRollout: true,
        enableMonitoring: true,
        enableAnalytics: true,
        enableErrorTracking: true,
        enableFeedbackCollection: true,
        autoRollbackEnabled: true,
        rolloutSpeed: 'aggressive',
        emergencyDisable: true
      }
    },
    rolloutPercentage: 100
  },
  production: {
    name: 'production',
    currentPhase: 4,
    enabled: true,
    overrideSettings: {
      globalSettings: {
        enablePercentageRollout: true,
        enableMonitoring: true,
        enableAnalytics: true,
        enableErrorTracking: true,
        enableFeedbackCollection: true,
        autoRollbackEnabled: true,
        rolloutSpeed: 'moderate',
        emergencyDisable: true
      }
    },
    rolloutPercentage: 0, // Start with 0%, will be controlled by rollout strategies
    featureOverrides: {
      'PHASE_4_ENHANCED_UI_COMPONENTS': true // Enable UI components by default
    }
  }
};

/**
 * Main Phase 4 Configuration
 */
export const PHASE4_ROLLOUT_CONFIG: Phase4Configuration = {
  id: 'phase4-rollout-v1',
  name: 'Phase 4 Expanded Rollout',
  description: 'Comprehensive rollout configuration for Phase 4 features with segment-based targeting and granular controls',
  version: '1.0.0',
  features: PHASE4_FEATURE_CATEGORIES,
  rolloutStrategies: PHASE4_ROLLOUT_STRATEGIES,
  userSegments: PHASE4_USER_SEGMENTS,
  globalSettings: {
    enablePercentageRollout: true,
    enableMonitoring: true,
    enableAnalytics: true,
    enableErrorTracking: true,
    enableFeedbackCollection: true,
    autoRollbackEnabled: true,
    rolloutSpeed: 'moderate',
    emergencyDisable: true
  },
  successMetrics: PHASE4_SUCCESS_METRICS,
  rollbackCriteria: PHASE4_ROLLBACK_CRITERIA,
  environments: PHASE4_ENVIRONMENTS,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'deployment-engineer'
};

/**
 * Helper Functions
 */

/**
 * Get current environment configuration
 */
export function getCurrentEnvironment(): string {
  return import.meta.env.NODE_ENV || 'development';
}

/**
 * Get enabled features for current environment
 */
export function getEnabledFeaturesForEnvironment(): Phase4FeatureCategory[] {
  const env = getCurrentEnvironment();
  const envConfig = PHASE4_ROLLOUT_CONFIG.environments[env];

  if (!envConfig || !envConfig.enabled) {
    return [];
  }

  // Apply feature overrides if defined
  return PHASE4_ROLLOUT_CONFIG.features.map(feature => {
    if (envConfig.featureOverrides && envConfig.featureOverrides[feature.id] !== undefined) {
      const overriddenFeature = { ...feature };
      overriddenFeature.enabledByDefault = envConfig.featureOverrides[feature.id];
      return overriddenFeature;
    }
    return feature;
  });
}

/**
 * Check if user belongs to a specific segment
 */
export function isUserInSegment(userId?: string, segmentId?: string): boolean {
  if (!segmentId || !userId) return false;

  const segment = PHASE4_ROLLOUT_CONFIG.userSegments.find(s => s.id === segmentId);
  if (!segment) return false;

  // For demo purposes, use a hash-based approach to determine segment inclusion
  const userHash = hashString(userId);
  const userPercentage = Math.abs(userHash) % 100;

  return userPercentage < segment.percentage;
}

/**
 * Get rollout percentage for user based on segments
 */
export function getUserRolloutPercentage(userId?: string): number {
  let highestPercentage = 0;

  for (const segment of PHASE4_ROLLOUT_CONFIG.userSegments) {
    if (isUserInSegment(userId, segment.id)) {
      highestPercentage = Math.max(highestPercentage, segment.percentage);
    }
  }

  return highestPercentage;
}

/**
 * Get rollout strategy for environment
 */
export function getCurrentRolloutStrategy(): RolloutStrategy {
  const env = getCurrentEnvironment();
  const envConfig = PHASE4_ROLLOUT_CONFIG.environments[env];

  if (!envConfig || !envConfig.enabled) {
    return PHASE4_ROLLOUT_STRATEGIES[0]; // Fallback to balanced rollout
  }

  // For production, use the balanced rollout strategy
  if (env === 'production') {
    return PHASE4_ROLLOUT_STRATEGIES[0]; // Balanced rollout
  }

  // For other environments, use the first available strategy
  return PHASE4_ROLLOUT_STRATEGIES[0];
}

/**
 * Hash function for consistent user segmentation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Get feature status for specific category
 */
export function getFeatureCategoryStatus(categoryId: string): {
  enabled: boolean;
  rolloutPercentage: number;
  segments: string[];
} {
  const category = PHASE4_ROLLOUT_CONFIG.features.find(f => f.id === categoryId);
  if (!category) return { enabled: false, rolloutPercentage: 0, segments: [] };

  const strategy = getCurrentRolloutStrategy();
  const segments: string[] = [];

  Object.entries(strategy.segments).forEach(([segmentName, percentage]) => {
    if (percentage > 0) {
      segments.push(segmentName);
    }
  });

  return {
    enabled: category.enabledByDefault,
    rolloutPercentage: Math.max(...Object.values(strategy.segments)),
    segments
  };
}

/**
 * Export configuration for external services
 */
export function exportPhase4Config(): string {
  return JSON.stringify(PHASE4_ROLLOUT_CONFIG, null, 2);
}

/**
 * Validate Phase 4 configuration
 */
export function validatePhase4Config(config: Phase4Configuration): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate features
  if (!config.features || config.features.length === 0) {
    errors.push('No features defined');
  }

  // Validate user segments
  if (!config.userSegments || config.userSegments.length === 0) {
    errors.push('No user segments defined');
  }

  // Validate rollout strategies
  if (!config.rolloutStrategies || config.rolloutStrategies.length === 0) {
    errors.push('No rollout strategies defined');
  }

  // Check segment percentages
  config.userSegments.forEach((segment, index) => {
    if (segment.percentage < 0 || segment.percentage > 100) {
      errors.push(`Segment ${index} has invalid percentage: ${segment.percentage}`);
    }
  });

  // Check rollout strategy segments
  config.rolloutStrategies.forEach((strategy, index) => {
    Object.values(strategy.segments).forEach(percentage => {
      if (percentage < 0 || percentage > 100) {
        warnings.push(`Strategy ${index} has segment percentage out of bounds: ${percentage}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
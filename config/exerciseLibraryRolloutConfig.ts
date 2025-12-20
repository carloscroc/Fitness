/**
 * Enhanced Exercise Library Rollout Configuration
 *
 * Comprehensive rollout management system for the enhanced exercise library features.
 * Supports percentage-based rollout, user targeting, cohort management, and gradual phase progression.
 */

import { FeatureFlag, EXERCISE_LIBRARY_FEATURE_GROUPS } from '../services/featureFlags';

export interface RolloutPhase {
  id: string;
  name: string;
  description: string;
  percentage: number;
  startDate?: Date;
  endDate?: Date;
  featureGroups: string[];
  targetCriteria: TargetCriteria;
  successMetrics: SuccessMetric[];
  rollbackCriteria: RollbackCriterion[];
  monitoringEnabled: boolean;
  status: 'pending' | 'active' | 'completed' | 'rolled_back';
  metadata?: Record<string, any>;
}

export interface TargetCriteria {
  // Percentage-based targeting
  percentage: number;

  // User segment targeting
  userSegments?: UserSegment[];

  // Specific user targeting
  userIds?: string[];

  // Exclude specific users
  excludedUserIds?: string[];

  // Cohort-based targeting
  cohorts?: CohortTarget[];

  // Geographic targeting
  regions?: string[];

  // Device/platform targeting
  platforms?: Platform[];

  // Behavior-based targeting
  userBehaviors?: UserBehavior[];
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: {
    registrationDate?: {
      from?: Date;
      to?: Date;
    };
    activityLevel?: 'low' | 'medium' | 'high';
    subscriptionTier?: 'free' | 'premium' | 'pro';
    totalWorkouts?: {
      min?: number;
      max?: number;
    };
    lastActive?: {
      from?: Date;
      to?: Date;
    };
  };
}

export interface CohortTarget {
  id: string;
  name: string;
  percentage: number;
  description?: string;
}

export interface UserBehavior {
  type: 'exercise_completion_rate' | 'workout_frequency' | 'feature_adoption' | 'engagement_score';
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  timeWindow?: '7d' | '30d' | '90d';
}

export type Platform = 'ios' | 'android' | 'web' | 'desktop';

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  target: number;
  current?: number;
  unit: 'percentage' | 'count' | 'score';
  threshold: {
    minimum: number;
    optimum: number;
  };
  measurementWindow: '24h' | '7d' | '30d';
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
}

export interface RolloutEnvironment {
  name: 'development' | 'staging' | 'production';
  currentPhase: number;
  enabled: boolean;
  overrideSettings?: Partial<RolloutPhase>;
}

export interface RolloutConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  environments: Record<string, RolloutEnvironment>;
  phases: RolloutPhase[];
  globalSettings: {
    enablePercentageRollout: boolean;
    enableMonitoring: boolean;
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enableFeedbackCollection: boolean;
    autoRollbackEnabled: boolean;
    rolloutSpeed: 'conservative' | 'moderate' | 'aggressive';
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

/**
 * Default User Segments for Rollout
 */
export const DEFAULT_USER_SEGMENTS: UserSegment[] = [
  {
    id: 'internal_team',
    name: 'Internal Team',
    criteria: {
      activityLevel: 'high'
    }
  },
  {
    id: 'beta_testers',
    name: 'Beta Testers',
    criteria: {
      activityLevel: 'high',
      subscriptionTier: 'premium'
    }
  },
  {
    id: 'power_users',
    name: 'Power Users',
    criteria: {
      activityLevel: 'high',
      totalWorkouts: {
        min: 50
      }
    }
  },
  {
    id: 'new_users',
    name: 'New Users',
    criteria: {
      registrationDate: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  },
  {
    id: 'inactive_users',
    name: 'Inactive Users',
    criteria: {
      activityLevel: 'low',
      lastActive: {
        to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Not active in last 30 days
      }
    }
  }
];

/**
 * Default Success Metrics
 */
export const DEFAULT_SUCCESS_METRICS: SuccessMetric[] = [
  {
    id: 'adoption_rate',
    name: 'Feature Adoption Rate',
    description: 'Percentage of users who try the new exercise library features',
    target: 70,
    unit: 'percentage',
    threshold: {
      minimum: 50,
      optimum: 80
    },
    measurementWindow: '7d'
  },
  {
    id: 'retention_rate',
    name: 'User Retention Rate',
    description: 'Percentage of users who continue using the features after initial trial',
    target: 60,
    unit: 'percentage',
    threshold: {
      minimum: 40,
      optimum: 70
    },
    measurementWindow: '30d'
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    description: 'Percentage of sessions with errors',
    target: 2,
    unit: 'percentage',
    threshold: {
      minimum: 0,
      optimum: 1
    },
    measurementWindow: '24h'
  },
  {
    id: 'performance_score',
    name: 'Performance Score',
    description: 'Average load time and responsiveness score',
    target: 90,
    unit: 'score',
    threshold: {
      minimum: 80,
      optimum: 95
    },
    measurementWindow: '24h'
  },
  {
    id: 'user_satisfaction',
    name: 'User Satisfaction Score',
    description: 'Average user feedback rating',
    target: 4.0,
    unit: 'score',
    threshold: {
      minimum: 3.5,
      optimum: 4.5
    },
    measurementWindow: '7d'
  }
];

/**
 * Default Rollback Criteria
 */
export const DEFAULT_ROLLBACK_CRITERIA: RollbackCriterion[] = [
  {
    id: 'critical_errors',
    name: 'Critical Error Rate',
    description: 'Roll back if critical errors exceed threshold',
    threshold: 5,
    metric: 'critical_error_rate',
    operator: '>',
    timeWindow: '1h',
    autoRollback: true
  },
  {
    id: 'performance_degradation',
    name: 'Performance Degradation',
    description: 'Roll back if performance drops significantly',
    threshold: 30,
    metric: 'performance_degradation',
    operator: '>',
    timeWindow: '6h',
    autoRollback: true
  },
  {
    id: 'low_adoption',
    name: 'Low Adoption Rate',
    description: 'Consider rollback if adoption is too low',
    threshold: 20,
    metric: 'adoption_rate',
    operator: '<',
    timeWindow: '72h',
    autoRollback: false
  }
];

/**
 * Default Rollout Phases for Enhanced Exercise Library
 */
export const DEFAULT_ROLLOUT_PHASES: RolloutPhase[] = [
  {
    id: 'phase_1_internal',
    name: 'Phase 1 - Internal Testing',
    description: 'Enable features for internal development and QA team',
    percentage: 0.1, // 0.1% for internal team
    featureGroups: ['Core Library'],
    targetCriteria: {
      percentage: 0.1,
      userSegments: [DEFAULT_USER_SEGMENTS[0]], // Internal team
      userIds: [] // Will be populated with actual internal user IDs
    },
    successMetrics: DEFAULT_SUCCESS_METRICS.map(m => ({ ...m, target: m.target * 0.5 })),
    rollbackCriteria: DEFAULT_ROLLBACK_CRITERIA,
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 1,
      expectedDuration: '3-5 days',
      goNoGoMeeting: true
    }
  },
  {
    id: 'phase_2_beta',
    name: 'Phase 2 - Beta Users',
    description: 'Expand to trusted beta testers and power users',
    percentage: 5, // 5% of users
    featureGroups: ['Core Library', 'Analytics & Tracking'],
    targetCriteria: {
      percentage: 5,
      userSegments: [DEFAULT_USER_SEGMENTS[1], DEFAULT_USER_SEGMENTS[2]] // Beta testers, power users
    },
    successMetrics: DEFAULT_SUCCESS_METRICS,
    rollbackCriteria: DEFAULT_ROLLBACK_CRITERIA,
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 2,
      expectedDuration: '1-2 weeks',
      feedbackCollection: true
    }
  },
  {
    id: 'phase_3_limited',
    name: 'Phase 3 - Limited Rollout',
    description: 'Roll out to 20% of users with full feature set',
    percentage: 20, // 20% of users
    featureGroups: ['Core Library', 'Media & Content', 'Analytics & Tracking', 'Advanced Features'],
    targetCriteria: {
      percentage: 20,
      userSegments: [DEFAULT_USER_SEGMENTS[3]], // New users
      excludedUserIds: [] // Users who opted out
    },
    successMetrics: DEFAULT_SUCCESS_METRICS.map(m => ({ ...m, target: m.target * 0.8 })),
    rollbackCriteria: DEFAULT_ROLLBACK_CRITERIA.filter(c => !c.autoRollback),
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 3,
      expectedDuration: '2-3 weeks',
      aBTesting: true
    }
  },
  {
    id: 'phase_4_expanded',
    name: 'Phase 4 - Expanded Rollout',
    description: 'Expand to 50% of users including personalization features',
    percentage: 50, // 50% of users
    featureGroups: ['Core Library', 'Media & Content', 'Analytics & Tracking', 'Advanced Features', 'Personalization'],
    targetCriteria: {
      percentage: 50,
      userSegments: [DEFAULT_USER_SEGMENTS[4]] // Include inactive users for re-engagement
    },
    successMetrics: DEFAULT_SUCCESS_METRICS,
    rollbackCriteria: DEFAULT_ROLLBACK_CRITERIA.filter(c => c.metric === 'critical_error_rate'),
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 4,
      expectedDuration: '2-4 weeks',
      fullAnalytics: true
    }
  },
  {
    id: 'phase_5_social',
    name: 'Phase 5 - Social Features',
    description: 'Enable social features for 75% of users',
    percentage: 75, // 75% of users
    featureGroups: ['Core Library', 'Media & Content', 'Analytics & Tracking', 'Advanced Features', 'Personalization', 'Social & Engagement'],
    targetCriteria: {
      percentage: 75
    },
    successMetrics: DEFAULT_SUCCESS_METRICS.map(m => ({
      ...m,
      target: m.target * 0.9,
      id: `social_${m.id}`
    })),
    rollbackCriteria: DEFAULT_ROLLBACK_CRITERIA.filter(c => c.autoRollback),
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 5,
      expectedDuration: '3-4 weeks',
      socialMonitoring: true
    }
  },
  {
    id: 'phase_6_full',
    name: 'Phase 6 - Full Rollout',
    description: 'Complete rollout to 100% of users with all features',
    percentage: 100, // 100% of users
    featureGroups: ['Core Library', 'Media & Content', 'Analytics & Tracking', 'Advanced Features', 'Personalization', 'Social & Engagement', 'AI & Coaching'],
    targetCriteria: {
      percentage: 100
    },
    successMetrics: DEFAULT_SUCCESS_METRICS,
    rollbackCriteria: [], // No rollback at this stage
    monitoringEnabled: true,
    status: 'pending',
    metadata: {
      phase: 6,
      expectedDuration: 'Ongoing',
      postLaunchMonitoring: true
    }
  }
];

/**
 * Default Environment Configurations
 */
export const DEFAULT_ENVIRONMENTS: Record<string, RolloutEnvironment> = {
  development: {
    name: 'development',
    currentPhase: 0,
    enabled: true,
    overrideSettings: {
      percentage: 100,
      status: 'active',
      targetCriteria: {
        percentage: 100,
        userIds: ['dev_user_1', 'dev_user_2']
      }
    }
  },
  staging: {
    name: 'staging',
    currentPhase: 1,
    enabled: true,
    overrideSettings: {
      percentage: 100,
      status: 'active'
    }
  },
  production: {
    name: 'production',
    currentPhase: 0,
    enabled: false
  }
};

/**
 * Main Rollout Configuration
 */
export const EXERCISE_LIBRARY_ROLLOUT_CONFIG: RolloutConfig = {
  id: 'exercise_library_v2',
  name: 'Enhanced Exercise Library Rollout',
  description: 'Progressive rollout of enhanced exercise library features with comprehensive monitoring and controls',
  version: '2.0.0',
  environments: DEFAULT_ENVIRONMENTS,
  phases: DEFAULT_ROLLOUT_PHASES,
  globalSettings: {
    enablePercentageRollout: true,
    enableMonitoring: true,
    enableAnalytics: true,
    enableErrorTracking: true,
    enableFeedbackCollection: true,
    autoRollbackEnabled: true,
    rolloutSpeed: 'moderate'
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system'
};

/**
 * Rollout Management Functions
 */

export function getCurrentPhase(environment?: string): RolloutPhase | null {
  const env = environment || import.meta.env.NODE_ENV || 'development';
  const envConfig = EXERCISE_LIBRARY_ROLLOUT_CONFIG.environments[env];

  if (!envConfig || !envConfig.enabled) {
    return null;
  }

  const phaseIndex = envConfig.currentPhase;
  const phases = envConfig.overrideSettings ?
    [envConfig.overrideSettings as RolloutPhase] :
    EXERCISE_LIBRARY_ROLLOUT_CONFIG.phases;

  return phaseIndex < phases.length ? phases[phaseIndex] : null;
}

export function shouldUserGetFeatures(userId?: string, environment?: string): boolean {
  const currentPhase = getCurrentPhase(environment);

  if (!currentPhase || currentPhase.status !== 'active') {
    return false;
  }

  const criteria = currentPhase.targetCriteria;

  // Check if user is in excluded list
  if (criteria.excludedUserIds && userId && criteria.excludedUserIds.includes(userId)) {
    return false;
  }

  // Check if user is specifically included
  if (criteria.userIds && criteria.userIds.length > 0) {
    return userId ? criteria.userIds.includes(userId) : false;
  }

  // Check percentage-based rollout
  if (criteria.percentage > 0) {
    return isUserInRolloutPercentage(criteria.percentage, userId);
  }

  return false;
}

function isUserInRolloutPercentage(percentage: number, userId?: string): boolean {
  const identifier = userId || getUserIdentifier();
  const hash = hashString(identifier);
  const userPercentage = Math.abs(hash) % 100;
  return userPercentage < percentage;
}

function getUserIdentifier(): string {
  if (typeof window !== 'undefined') {
    let stored = localStorage.getItem('rollout_user_id');
    if (!stored) {
      stored = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rollout_user_id', stored);
    }
    return stored;
  }
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function getEnabledFeatureGroups(userId?: string, environment?: string): string[] {
  const currentPhase = getCurrentPhase(environment);

  if (!currentPhase || !shouldUserGetFeatures(userId, environment)) {
    return [];
  }

  return currentPhase.featureGroups;
}

export function advanceToNextPhase(environment?: string): boolean {
  const env = environment || import.meta.env.NODE_ENV || 'development';
  const envConfig = EXERCISE_LIBRARY_ROLLOUT_CONFIG.environments[env];

  if (!envConfig) {
    return false;
  }

  const nextPhase = envConfig.currentPhase + 1;
  if (nextPhase >= EXERCISE_LIBRARY_ROLLOUT_CONFIG.phases.length) {
    return false; // Already at the last phase
  }

  envConfig.currentPhase = nextPhase;
  EXERCISE_LIBRARY_ROLLOUT_CONFIG.updatedAt = new Date();

  return true;
}

export function rollbackToPreviousPhase(environment?: string): boolean {
  const env = environment || import.meta.env.NODE_ENV || 'development';
  const envConfig = EXERCISE_LIBRARY_ROLLOUT_CONFIG.environments[env];

  if (!envConfig) {
    return false;
  }

  const prevPhase = envConfig.currentPhase - 1;
  if (prevPhase < 0) {
    return false; // Already at the first phase
  }

  envConfig.currentPhase = prevPhase;
  EXERCISE_LIBRARY_ROLLOUT_CONFIG.updatedAt = new Date();

  return true;
}

export function updatePhaseStatus(phaseId: string, status: RolloutPhase['status'], environment?: string): boolean {
  const env = environment || import.meta.env.NODE_ENV || 'development';
  const envConfig = EXERCISE_LIBRARY_ROLLOUT_CONFIG.environments[env];

  if (!envConfig) {
    return false;
  }

  const phaseIndex = envConfig.overrideSettings ?
    0 :
    EXERCISE_LIBRARY_ROLLOUT_CONFIG.phases.findIndex(p => p.id === phaseId);

  if (phaseIndex === -1) {
    return false;
  }

  if (envConfig.overrideSettings && envConfig.overrideSettings.id === phaseId) {
    envConfig.overrideSettings.status = status;
  } else {
    EXERCISE_LIBRARY_ROLLOUT_CONFIG.phases[phaseIndex].status = status;
  }

  EXERCISE_LIBRARY_ROLLOUT_CONFIG.updatedAt = new Date();

  return true;
}

/**
 * Export configuration for external services
 */
export function exportRolloutConfig(): string {
  return JSON.stringify(EXERCISE_LIBRARY_ROLLOUT_CONFIG, null, 2);
}

/**
 * Validate rollout configuration
 */
export function validateRolloutConfig(config: RolloutConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate phases
  if (!config.phases || config.phases.length === 0) {
    errors.push('No rollout phases defined');
  }

  // Validate phase progression
  let lastPercentage = -1;
  config.phases.forEach((phase, index) => {
    if (phase.percentage < 0 || phase.percentage > 100) {
      errors.push(`Phase ${index + 1} has invalid percentage: ${phase.percentage}`);
    }

    if (phase.percentage < lastPercentage) {
      warnings.push(`Phase ${index + 1} has lower percentage than previous phase`);
    }

    lastPercentage = phase.percentage;
  });

  // Validate environments
  Object.entries(config.environments).forEach(([envName, env]) => {
    if (env.currentPhase < 0 || env.currentPhase >= config.phases.length) {
      errors.push(`Environment ${envName} has invalid phase index: ${env.currentPhase}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
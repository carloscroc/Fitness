/**
 * Rollout Configuration for Exercise Migration
 *
 * Manages the gradual rollout of backend exercise data to users.
 * Supports percentage-based rollout, user targeting, and gradual phase progression.
 */

export interface RolloutPhase {
  name: string;
  description: string;
  percentage: number;
  enableBackendExercises: boolean;
  enableDataIndicators: boolean;
  enableAutoGitHubIssues: boolean;
  targetUsers?: string[]; // Specific user IDs or segments
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
}

export interface RolloutConfig {
  currentPhase: number;
  phases: RolloutPhase[];
  enablePercentageRollout: boolean;
  fallbackToPreviousPhase: boolean;
  monitoringEnabled: boolean;
}

/**
 * Default rollout phases for the exercise migration
 */
export const DEFAULT_ROLLOUT_PHASES: RolloutPhase[] = [
  {
    name: 'Phase 1 - Development Only',
    description: 'Backend exercises enabled only for development and testing',
    percentage: 0,
    enableBackendExercises: false,
    enableDataIndicators: true,
    enableAutoGitHubIssues: false,
    targetUsers: ['dev-team', 'internal-testers']
  },
  {
    name: 'Phase 2 - Internal Testing',
    description: 'Enable backend exercises for internal team testing',
    percentage: 1, // 1% of users
    enableBackendExercises: true,
    enableDataIndicators: true,
    enableAutoGitHubIssues: true,
    targetUsers: ['internal-team', 'beta-testers']
  },
  {
    name: 'Phase 3 - Limited Rollout',
    description: 'Roll out to small percentage of real users',
    percentage: 5, // 5% of users
    enableBackendExercises: true,
    enableDataIndicators: false,
    enableAutoGitHubIssues: true
  },
  {
    name: 'Phase 4 - Expanded Rollout',
    description: 'Expand to larger user base',
    percentage: 25, // 25% of users
    enableBackendExercises: true,
    enableDataIndicators: false,
    enableAutoGitHubIssues: true
  },
  {
    name: 'Phase 5 - Majority Rollout',
    description: 'Roll out to majority of users',
    percentage: 75, // 75% of users
    enableBackendExercises: true,
    enableDataIndicators: false,
    enableAutoGitHubIssues: false
  },
  {
    name: 'Phase 6 - Full Rollout',
    description: 'Complete rollout to all users',
    percentage: 100, // 100% of users
    enableBackendExercises: true,
    enableDataIndicators: false,
    enableAutoGitHubIssues: false
  }
];

/**
 * Current rollout configuration
 */
export const ROLLOUT_CONFIG: RolloutConfig = {
  currentPhase: 0, // Start with Phase 1
  phases: DEFAULT_ROLLOUT_PHASES,
  enablePercentageRollout: true,
  fallbackToPreviousPhase: true,
  monitoringEnabled: true
};

/**
 * Get current rollout phase configuration
 */
export function getCurrentRolloutPhase(): RolloutPhase {
  const config = ROLLOUT_CONFIG;
  const phaseIndex = Math.min(config.currentPhase, config.phases.length - 1);
  return config.phases[phaseIndex];
}

/**
 * Get rollout phase by index
 */
export function getRolloutPhase(phaseIndex: number): RolloutPhase | null {
  if (phaseIndex < 0 || phaseIndex >= ROLLOUT_CONFIG.phases.length) {
    return null;
  }
  return ROLLOUT_CONFIG.phases[phaseIndex];
}

/**
 * Set current rollout phase
 */
export function setCurrentRolloutPhase(phaseIndex: number): boolean {
  if (phaseIndex < 0 || phaseIndex >= ROLLOUT_CONFIG.phases.length) {
    return false;
  }
  ROLLOUT_CONFIG.currentPhase = phaseIndex;
  return true;
}

/**
 * Advance to next rollout phase
 */
export function advanceToNextPhase(): boolean {
  const nextPhase = ROLLOUT_CONFIG.currentPhase + 1;
  if (nextPhase >= ROLLOUT_CONFIG.phases.length) {
    return false; // Already at the last phase
  }
  return setCurrentRolloutPhase(nextPhase);
}

/**
 * Rollback to previous phase
 */
export function rollbackToPreviousPhase(): boolean {
  const prevPhase = ROLLOUT_CONFIG.currentPhase - 1;
  if (prevPhase < 0) {
    return false; // Already at the first phase
  }
  return setCurrentRolloutPhase(prevPhase);
}

/**
 * Check if a user should be included in the current rollout
 */
export function shouldUserGetRollout(userId?: string): boolean {
  const currentPhase = getCurrentRolloutPhase();

  // If percentage rollout is disabled, check current phase setting
  if (!ROLLOUT_CONFIG.enablePercentageRollout) {
    return currentPhase.enableBackendExercises;
  }

  // Check if user is specifically targeted
  if (currentPhase.targetUsers && currentPhase.targetUsers.length > 0) {
    return currentPhase.targetUsers.includes(userId || '');
  }

  // Use percentage-based rollout
  const userHash = hashUserId(userId || '');
  const userPercentage = userHash % 100;
  return userPercentage < currentPhase.percentage;
}

/**
 * Simple hash function for consistent user selection
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get rollout statistics and status
 */
export function getRolloutStatus(): {
  currentPhase: RolloutPhase;
  totalPhases: number;
  progress: number; // 0-100
  rolloutPercentage: number;
  isComplete: boolean;
  nextPhase?: RolloutPhase;
  previousPhase?: RolloutPhase;
} {
  const currentPhase = getCurrentRolloutPhase();
  const totalPhases = ROLLOUT_CONFIG.phases.length;
  const progress = Math.round(((ROLLOUT_CONFIG.currentPhase + 1) / totalPhases) * 100);
  const isComplete = ROLLOUT_CONFIG.currentPhase >= totalPhases - 1;

  const nextPhase = getRolloutPhase(ROLLOUT_CONFIG.currentPhase + 1);
  const previousPhase = getRolloutPhase(ROLLOUT_CONFIG.currentPhase - 1);

  return {
    currentPhase,
    totalPhases,
    progress,
    rolloutPercentage: currentPhase.percentage,
    isComplete,
    nextPhase: nextPhase || undefined,
    previousPhase: previousPhase || undefined
  };
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

  // Check phases
  if (!config.phases || config.phases.length === 0) {
    errors.push('No rollout phases defined');
  } else {
    // Check for valid phase indices
    if (config.currentPhase < 0 || config.currentPhase >= config.phases.length) {
      errors.push(`Invalid current phase index: ${config.currentPhase}`);
    }

    // Check phase progression
    let lastPercentage = -1;
    for (let i = 0; i < config.phases.length; i++) {
      const phase = config.phases[i];

      if (phase.percentage < 0 || phase.percentage > 100) {
        errors.push(`Phase ${i} has invalid percentage: ${phase.percentage}`);
      }

      if (phase.percentage < lastPercentage) {
        warnings.push(`Phase ${i} has lower percentage than previous phase (${phase.percentage}% vs ${lastPercentage}%)`);
      }

      lastPercentage = phase.percentage;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Environment-based configuration override
 */
export function getEnvironmentBasedConfig(): Partial<RolloutConfig> {
  const env = import.meta.env.NODE_ENV || 'development';

  switch (env) {
    case 'development':
      return {
        currentPhase: 0, // Development phase
        enablePercentageRollout: false,
        monitoringEnabled: true
      };

    case 'staging':
      return {
        currentPhase: 1, // Internal testing
        enablePercentageRollout: true,
        monitoringEnabled: true
      };

    case 'production':
      return {
        currentPhase: parseInt(import.meta.env.VITE_ROLLOUT_PHASE || '0', 10),
        enablePercentageRollout: true,
        monitoringEnabled: true
      };

    default:
      return {};
  }
}

/**
 * Apply environment overrides to base configuration
 */
export function getEffectiveRolloutConfig(): RolloutConfig {
  const envConfig = getEnvironmentBasedConfig();

  return {
    ...ROLLOUT_CONFIG,
    ...envConfig,
    phases: ROLLOUT_CONFIG.phases // Keep original phases
  };
}
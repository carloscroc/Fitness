/**
 * Feature Flag Management System
 *
 * Provides controlled rollout of new features with environment variable and localStorage support.
 * This enables gradual deployment and immediate rollback capabilities.
 */

export const FEATURE_FLAGS = {
  // Enable loading exercises from backend Supabase database
  ENABLE_BACKEND_EXERCISES: 'enable-backend-exercises',

  // Show visual indicators of exercise data source (development only)
  SHOW_DATA_SOURCE_INDICATORS: 'show-data-source-indicators',

  // Automatically create GitHub issues for missing exercise data
  AUTO_CREATE_GITHUB_ISSUES: 'auto-create-github-issues',

  // Enable percentage-based rollout for backend exercises
  ENABLE_PERCENTAGE_ROLLOUT: 'enable-percentage-rollout',

  // Debug mode for developers to see data merging logic
  DEBUG_EXERCISE_MERGING: 'debug-exercise-merging'
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature flag is enabled
 * Priority: Environment variables > localStorage > default value
 */
export function isFeatureEnabled(flag: FeatureFlag, defaultValue: boolean = false): boolean {
  // Check environment variable first (highest priority)
  const envValue = import.meta.env[`VITE_FF_${flag.toUpperCase()}`];
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }

  // Check localStorage (second priority)
  const storedValue = localStorage.getItem(`ff_${flag}`);
  if (storedValue !== null) {
    return storedValue === 'true' || storedValue === '1';
  }

  // Return default value
  return defaultValue;
}

/**
 * Set a feature flag value in localStorage
 */
export function setFeatureFlag(flag: FeatureFlag, value: boolean): void {
  localStorage.setItem(`ff_${flag}`, value.toString());
}

/**
 * Get all currently enabled feature flags
 */
export function getEnabledFeatureFlags(): Record<FeatureFlag, boolean> {
  return Object.fromEntries(
    Object.entries(FEATURE_FLAGS).map(([key]) => [
      key as FeatureFlag,
      isFeatureEnabled(key as FeatureFlag)
    ])
  ) as Record<FeatureFlag, boolean>;
}

/**
 * Percentage-based rollout support
 * Uses user ID or random identifier to determine if user is in rollout percentage
 */
export function isUserInRollout(percentage: number, userId?: string): boolean {
  // Use provided userId or generate a persistent random identifier
  const identifier = userId || getUserIdentifier();

  // Generate hash from identifier
  const hash = hashCode(identifier);
  const userPercentage = Math.abs(hash) % 100;

  return userPercentage < percentage;
}

/**
 * Get or create a persistent user identifier for rollout
 */
function getUserIdentifier(): string {
  const stored = localStorage.getItem('user_identifier');
  if (stored) {
    return stored;
  }

  // Generate new identifier
  const identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('user_identifier', identifier);
  return identifier;
}

/**
 * Simple string hash function
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Check if backend exercises should be enabled based on percentage rollout
 */
export function shouldEnableBackendExercises(rolloutPercentage: number = 0): boolean {
  if (!isFeatureEnabled('ENABLE_PERCENTAGE_ROLLOUT', false)) {
    return isFeatureEnabled('ENABLE_BACKEND_EXERCISES', false);
  }

  return isUserInRollout(rolloutPercentage);
}

/**
 * Development helpers
 */
export function enableAllFeatureFlags(): void {
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    setFeatureFlag(flag as FeatureFlag, true);
  });
}

export function disableAllFeatureFlags(): void {
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    setFeatureFlag(flag as FeatureFlag, false);
  });
}

/**
 * Export feature flag status for debugging
 */
export function exportFeatureFlagStatus(): string {
  const flags = getEnabledFeatureFlags();
  return JSON.stringify(flags, null, 2);
}
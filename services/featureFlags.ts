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
  DEBUG_EXERCISE_MERGING: 'debug-exercise-merging',

  // Enhanced Exercise Library Feature Flags
  // ----------------------------------------

  // Enable enhanced exercise library with improved UI/UX
  ENHANCED_EXERCISE_LIBRARY: 'enhanced-exercise-library',

  // Enable advanced exercise filtering and search
  ADVANCED_EXERCISE_FILTERING: 'advanced-exercise-filtering',

  // Enable exercise video integration and playback
  EXERCISE_VIDEO_INTEGRATION: 'exercise-video-integration',

  // Enable personalized exercise recommendations
  PERSONALIZED_RECOMMENDATIONS: 'personalized-recommendations',

  // Enable exercise progress tracking and analytics
  EXERCISE_PROGRESS_TRACKING: 'exercise-progress-tracking',

  // Enable social features for exercises (sharing, comments)
  EXERCISE_SOCIAL_FEATURES: 'exercise-social-features',

  // Enable offline exercise library access
  OFFLINE_EXERCISE_ACCESS: 'offline-exercise-access',

  // Enable exercise difficulty adaptation based on user performance
  ADAPTIVE_DIFFICULTY: 'adaptive-difficulty',

  // Enable exercise alternative suggestions
  EXERCISE_ALTERNATIVES: 'exercise-alternatives',

  // Enable exercise form analysis and feedback
  EXERCISE_FORM_ANALYSIS: 'exercise-form-analysis',

  // Enable workout customization with exercise variations
  WORKOUT_CUSTOMIZATION: 'workout-customization',

  // Enable exercise performance metrics dashboard
  PERFORMANCE_DASHBOARD: 'performance-dashboard',

  // Enable AI-powered exercise coaching
  AI_EXERCISE_COACHING: 'ai-exercise-coaching',

  // Enable exercise library export/import functionality
  EXERCISE_EXPORT_IMPORT: 'exercise-export-import',

  // Enable multi-language support for exercise library
  MULTILINGUAL_EXERCISES: 'multilingual-exercises',

  // Enable exercise equipment filtering and recommendations
  EQUIPMENT_FILTERING: 'equipment-filtering',

  // Enable exercise muscle group targeting features
  MUSCLE_GROUP_TARGETING: 'muscle-group-targeting',

  // Enable exercise history and logging
  EXERCISE_HISTORY_LOGGING: 'exercise-history-logging',

  // Enable exercise challenge system
  EXERCISE_CHALLENGES: 'exercise-challenges',

  // Phase 1: Foundation Exercises Rollout
  // ----------------------------------------

  // Enable Phase 1 exercises (Back, Core, Bodyweight, Beginner)
  PHASE_1_FOUNDATION_EXERCISES: 'phase-1-foundation-exercises',

  // Enable progressive rollout of Phase 1 exercises
  PHASE_1_PERCENTAGE_ROLLOUT: 'phase-1-percentage-rollout',

  // Enable Phase 1 exercise categories individually
  PHASE_1_BACK_EXERCISES: 'phase-1-back-exercises',
  PHASE_1_CORE_EXERCISES: 'phase-1-core-exercises',
  PHASE_1_BODYWEIGHT_EXERCISES: 'phase-1-bodyweight-exercises',
  PHASE_1_BEGINNER_EXERCISES: 'phase-1-beginner-exercises',

  // Phase 2: Equipment Expansion Rollout
  // ----------------------------------------

  // Enable Phase 2 equipment diversity exercises
  PHASE_2_EQUIPMENT_DIVERSITY: 'phase-2-equipment-diversity',

  // Enable progressive rollout of Phase 2 exercises
  PHASE_2_PERCENTAGE_ROLLOUT: 'phase-2-percentage-rollout',

  // Enable Phase 2 exercise categories individually
  PHASE_2_KETTLEBELL_EXERCISES: 'phase-2-kettlebell-exercises',
  PHASE_2_RESISTANCE_BAND_EXERCISES: 'phase-2-resistance-band-exercises',
  PHASE_2_DUMBBELL_VARIATIONS: 'phase-2-dumbbell-variations',
  PHASE_2_CARDIO_CONDITIONING: 'phase-2-cardio-conditioning'
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

/**
 * Enhanced Exercise Library Feature Group Management
 */

export interface FeatureGroup {
  name: string;
  description: string;
  flags: FeatureFlag[];
  dependencies?: FeatureFlag[];
  rolloutPhase: number;
}

export const EXERCISE_LIBRARY_FEATURE_GROUPS: FeatureGroup[] = [
  {
    name: 'Core Library',
    description: 'Basic enhanced exercise library functionality',
    flags: ['ENHANCED_EXERCISE_LIBRARY', 'ADVANCED_EXERCISE_FILTERING'],
    rolloutPhase: 1
  },
  {
    name: 'Media & Content',
    description: 'Exercise videos and rich content',
    flags: ['EXERCISE_VIDEO_INTEGRATION', 'MULTILINGUAL_EXERCISES'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY'],
    rolloutPhase: 2
  },
  {
    name: 'Personalization',
    description: 'Personalized recommendations and adaptive features',
    flags: ['PERSONALIZED_RECOMMENDATIONS', 'ADAPTIVE_DIFFICULTY', 'EXERCISE_ALTERNATIVES'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'EXERCISE_PROGRESS_TRACKING'],
    rolloutPhase: 3
  },
  {
    name: 'Analytics & Tracking',
    description: 'Progress tracking and performance analytics',
    flags: ['EXERCISE_PROGRESS_TRACKING', 'PERFORMANCE_DASHBOARD', 'EXERCISE_HISTORY_LOGGING'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY'],
    rolloutPhase: 2
  },
  {
    name: 'Social & Engagement',
    description: 'Social features and challenges',
    flags: ['EXERCISE_SOCIAL_FEATURES', 'EXERCISE_CHALLENGES'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'EXERCISE_PROGRESS_TRACKING'],
    rolloutPhase: 4
  },
  {
    name: 'AI & Coaching',
    description: 'AI-powered features and coaching',
    flags: ['AI_EXERCISE_COACHING', 'EXERCISE_FORM_ANALYSIS'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'PERSONALIZED_RECOMMENDATIONS', 'EXERCISE_PROGRESS_TRACKING'],
    rolloutPhase: 5
  },
  {
    name: 'Advanced Features',
    description: 'Advanced customization and utility features',
    flags: ['WORKOUT_CUSTOMIZATION', 'EXERCISE_EXPORT_IMPORT', 'OFFLINE_EXERCISE_ACCESS', 'EQUIPMENT_FILTERING', 'MUSCLE_GROUP_TARGETING'],
    dependencies: ['ENHANCED_EXERCISE_LIBRARY'],
    rolloutPhase: 3
  }
];

/**
 * Check if a feature group is enabled
 */
export function isFeatureGroupEnabled(groupName: string): boolean {
  const group = EXERCISE_LIBRARY_FEATURE_GROUPS.find(g => g.name === groupName);
  if (!group) return false;

  // Check dependencies first
  if (group.dependencies) {
    const dependenciesMet = group.dependencies.every(dep => isFeatureEnabled(dep));
    if (!dependenciesMet) return false;
  }

  // Check if all flags in the group are enabled
  return group.flags.every(flag => isFeatureEnabled(flag));
}

/**
 * Enable a feature group and its dependencies
 */
export function enableFeatureGroup(groupName: string): void {
  const group = EXERCISE_LIBRARY_FEATURE_GROUPS.find(g => g.name === groupName);
  if (!group) return;

  // Enable dependencies first
  if (group.dependencies) {
    group.dependencies.forEach(dep => setFeatureFlag(dep, true));
  }

  // Enable all flags in the group
  group.flags.forEach(flag => setFeatureFlag(flag, true));
}

/**
 * Disable a feature group
 */
export function disableFeatureGroup(groupName: string): void {
  const group = EXERCISE_LIBRARY_FEATURE_GROUPS.find(g => g.name === groupName);
  if (!group) return;

  // Disable all flags in the group
  group.flags.forEach(flag => setFeatureFlag(flag, false));
}

/**
 * Get features available for a specific rollout phase
 */
export function getFeaturesForPhase(phase: number): FeatureFlag[] {
  return EXERCISE_LIBRARY_FEATURE_GROUPS
    .filter(group => group.rolloutPhase <= phase)
    .flatMap(group => group.flags);
}

/**
 * Check if user has access to enhanced exercise library based on rollout
 */
export function hasEnhancedExerciseLibraryAccess(userId?: string): boolean {
  // Check if the main feature is enabled
  if (!isFeatureEnabled('ENHANCED_EXERCISE_LIBRARY')) {
    return false;
  }

  // If percentage rollout is enabled, check user inclusion
  if (isFeatureEnabled('ENABLE_PERCENTAGE_ROLLOUT')) {
    // Get current rollout percentage from environment or default to 0
    const rolloutPercentage = parseInt(
      import.meta.env.VITE_ENHANCED_LIBRARY_ROLLOUT_PERCENTAGE || '0',
      10
    );
    return isUserInRollout(rolloutPercentage, userId);
  }

  return true;
}

/**
 * Get available features for current user based on rollout phase
 */
export function getAvailableFeaturesForUser(userId?: string): FeatureFlag[] {
  if (!hasEnhancedExerciseLibraryAccess(userId)) {
    return [];
  }

  const currentPhase = parseInt(
    import.meta.env.VITE_EXERCISE_LIBRARY_PHASE || '1',
    10
  );

  return getFeaturesForPhase(currentPhase);
}

/**
 * Feature flag analytics tracking
 */
export function trackFeatureUsage(feature: FeatureFlag, userId?: string, metadata?: Record<string, any>): void {
  // This would integrate with your analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'feature_used', {
      feature_name: feature,
      user_id: userId || 'anonymous',
      ...metadata
    });
  }

  // Console logging for development
  if (import.meta.env.DEV) {
    console.log(`[Feature Flag] ${feature} used by user ${userId || 'anonymous'}`, metadata);
  }
}

/**
 * Safely execute code only if feature is enabled
 */
export function executeWithFeature<T>(
  feature: FeatureFlag,
  callback: () => T,
  fallback?: () => T,
  trackUsage?: boolean
): T | undefined {
  if (isFeatureEnabled(feature)) {
    if (trackUsage) {
      trackFeatureUsage(feature);
    }
    return callback();
  }
  return fallback?.();
}

/**
 * Batch feature flag operations
 */
export interface BatchFeatureOperation {
  flag: FeatureFlag;
  value: boolean;
}

export function batchSetFeatureFlags(operations: BatchFeatureOperation[]): void {
  operations.forEach(({ flag, value }) => {
    setFeatureFlag(flag, value);
  });
}

/**
 * Get feature flag dependencies
 */
export function getFeatureDependencies(feature: FeatureFlag): FeatureFlag[] {
  const group = EXERCISE_LIBRARY_FEATURE_GROUPS.find(g => g.flags.includes(feature));
  return group?.dependencies || [];
}

/**
 * Check if feature dependencies are met
 */
export function areFeatureDependenciesMet(feature: FeatureFlag): boolean {
  const dependencies = getFeatureDependencies(feature);
  return dependencies.every(dep => isFeatureEnabled(dep));
}

/**
 * Phase 1 Exercise Rollout Functions
 */

/**
 * Check if Phase 1 foundation exercises should be enabled based on percentage rollout
 */
export function shouldEnablePhase1Exercises(rolloutPercentage: number = 10): boolean {
  // Check if individual Phase 1 feature is enabled
  if (!isFeatureEnabled('PHASE_1_PERCENTAGE_ROLLOUT', false)) {
    return isFeatureEnabled('PHASE_1_FOUNDATION_EXERCISES', false);
  }

  return isUserInRollout(rolloutPercentage);
}

/**
 * Check if specific Phase 1 exercise categories are enabled
 */
export function shouldEnablePhase1Category(category: 'back' | 'core' | 'bodyweight' | 'beginner'): boolean {
  const categoryFlags = {
    back: 'PHASE_1_BACK_EXERCISES',
    core: 'PHASE_1_CORE_EXERCISES',
    bodyweight: 'PHASE_1_BODYWEIGHT_EXERCISES',
    beginner: 'PHASE_1_BEGINNER_EXERCISES'
  };

  return shouldEnablePhase1Exercises() && isFeatureEnabled(categoryFlags[category], true);
}

/**
 * Get all Phase 1 exercises that should be available to the user
 */
export function getPhase1AvailableCategories(): {
  back: boolean;
  core: boolean;
  bodyweight: boolean;
  beginner: boolean;
} {
  return {
    back: shouldEnablePhase1Category('back'),
    core: shouldEnablePhase1Category('core'),
    bodyweight: shouldEnablePhase1Category('bodyweight'),
    beginner: shouldEnablePhase1Category('beginner')
  };
}

/**
 * Enable Phase 1 exercises with specified rollout percentage
 */
export function enablePhase1Rollout(percentage: number = 10): void {
  setFeatureFlag('PHASE_1_PERCENTAGE_ROLLOUT', true);
  // You would set the percentage via environment variable: VITE_PHASE_1_ROLLOUT_PERCENTAGE
  console.log(`Phase 1 exercises enabled for ${percentage}% of users`);
}

/**
 * Disable Phase 1 exercises (rollback)
 */
export function disablePhase1Exercises(): void {
  setFeatureFlag('PHASE_1_FOUNDATION_EXERCISES', false);
  setFeatureFlag('PHASE_1_PERCENTAGE_ROLLOUT', false);
  setFeatureFlag('PHASE_1_BACK_EXERCISES', false);
  setFeatureFlag('PHASE_1_CORE_EXERCISES', false);
  setFeatureFlag('PHASE_1_BODYWEIGHT_EXERCISES', false);
  setFeatureFlag('PHASE_1_BEGINNER_EXERCISES', false);
  console.log('Phase 1 exercises disabled (rollback)');
}

/**
 * Phase 2 Equipment Expansion Functions
 */

/**
 * Check if Phase 2 equipment diversity exercises should be enabled based on percentage rollout
 */
export function shouldEnablePhase2Exercises(rolloutPercentage: number = 25): boolean {
  // Check if individual Phase 2 feature is enabled
  if (!isFeatureEnabled('PHASE_2_PERCENTAGE_ROLLOUT', false)) {
    return isFeatureEnabled('PHASE_2_EQUIPMENT_DIVERSITY', false);
  }

  return isUserInRollout(rolloutPercentage);
}

/**
 * Check if specific Phase 2 exercise categories are enabled
 */
export function shouldEnablePhase2Category(category: 'kettlebell' | 'resistance-band' | 'dumbbell-variations' | 'cardio-conditioning'): boolean {
  const categoryFlags = {
    kettlebell: 'PHASE_2_KETTLEBELL_EXERCISES',
    'resistance-band': 'PHASE_2_RESISTANCE_BAND_EXERCISES',
    'dumbbell-variations': 'PHASE_2_DUMBBELL_VARIATIONS',
    'cardio-conditioning': 'PHASE_2_CARDIO_CONDITIONING'
  };

  return shouldEnablePhase2Exercises() && isFeatureEnabled(categoryFlags[category], true);
}

/**
 * Get all Phase 2 exercise categories that should be available to the user
 */
export function getPhase2AvailableCategories(): {
  kettlebell: boolean;
  'resistance-band': boolean;
  'dumbbell-variations': boolean;
  'cardio-conditioning': boolean;
} {
  return {
    kettlebell: shouldEnablePhase2Category('kettlebell'),
    'resistance-band': shouldEnablePhase2Category('resistance-band'),
    'dumbbell-variations': shouldEnablePhase2Category('dumbbell-variations'),
    'cardio-conditioning': shouldEnablePhase2Category('cardio-conditioning')
  };
}

/**
 * Enable Phase 2 exercises with specified rollout percentage
 */
export function enablePhase2Rollout(percentage: number = 25): void {
  setFeatureFlag('PHASE_2_PERCENTAGE_ROLLOUT', true);
  // You would set the percentage via environment variable: VITE_PHASE_2_ROLLOUT_PERCENTAGE
  console.log(`Phase 2 exercises enabled for ${percentage}% of users`);
}

/**
 * Disable Phase 2 exercises (rollback)
 */
export function disablePhase2Exercises(): void {
  setFeatureFlag('PHASE_2_EQUIPMENT_DIVERSITY', false);
  setFeatureFlag('PHASE_2_PERCENTAGE_ROLLOUT', false);
  setFeatureFlag('PHASE_2_KETTLEBELL_EXERCISES', false);
  setFeatureFlag('PHASE_2_RESISTANCE_BAND_EXERCISES', false);
  setFeatureFlag('PHASE_2_DUMBBELL_VARIATIONS', false);
  setFeatureFlag('PHASE_2_CARDIO_CONDITIONING', false);
  console.log('Phase 2 exercises disabled (rollback)');
}
/**
 * useExerciseLibraryRollout Hook
 *
 * Custom hook for managing enhanced exercise library rollout logic.
 * Provides feature flag checks, rollout status, user targeting, and analytics tracking.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  isFeatureEnabled,
  hasEnhancedExerciseLibraryAccess,
  getAvailableFeaturesForUser,
  trackFeatureUsage,
  FeatureFlag,
  executeWithFeature
} from '../services/featureFlags';
import {
  getCurrentPhase,
  shouldUserGetFeatures,
  getEnabledFeatureGroups,
  advanceToNextPhase,
  rollbackToPreviousPhase,
  updatePhaseStatus,
  RolloutPhase
} from '../config/exerciseLibraryRolloutConfig';

interface UseExerciseLibraryRolloutOptions {
  userId?: string;
  environment?: string;
  autoTrack?: boolean;
  enableDebug?: boolean;
}

interface RolloutStatus {
  hasAccess: boolean;
  currentPhase: RolloutPhase | null;
  enabledFeatureGroups: string[];
  availableFeatures: FeatureFlag[];
  rolloutPercentage: number;
  isPercentageRollout: boolean;
  environment: string;
  debugInfo?: {
    userId: string;
    userHash: number;
    rolloutThreshold: number;
    userPercentage: number;
    reasons: string[];
  };
}

interface FeatureAccess {
  [key: string]: {
    enabled: boolean;
    reason?: string;
    dependencies?: FeatureFlag[];
  };
}

export const useExerciseLibraryRollout = (options: UseExerciseLibraryRolloutOptions = {}) => {
  const {
    userId,
    environment = import.meta.env.NODE_ENV || 'development',
    autoTrack = true,
    enableDebug = import.meta.env.DEV
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Memoized user ID (generate if not provided)
  const effectiveUserId = useMemo(() => {
    if (userId) return userId;

    // Generate persistent user ID if not provided
    const stored = localStorage.getItem('rollout_user_id');
    if (stored) return stored;

    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('rollout_user_id', newId);
    return newId;
  }, [userId]);

  // Get current rollout status
  const rolloutStatus = useMemo<RolloutStatus>(() => {
    const currentPhase = getCurrentPhase(environment);
    const hasAccess = shouldUserGetFeatures(effectiveUserId, environment);
    const enabledFeatureGroups = getEnabledFeatureGroups(effectiveUserId, environment);
    const availableFeatures = getAvailableFeaturesForUser(effectiveUserId);
    const isPercentageRollout = isFeatureEnabled('ENABLE_PERCENTAGE_ROLLOUT');
    const rolloutPercentage = currentPhase?.percentage || 0;

    const debugInfo = enableDebug ? {
      userId: effectiveUserId,
      userHash: hashString(effectiveUserId),
      rolloutThreshold: rolloutPercentage,
      userPercentage: Math.abs(hashString(effectiveUserId)) % 100,
      reasons: getAccessReasons(hasAccess, currentPhase, effectiveUserId, isPercentageRollout)
    } : undefined;

    return {
      hasAccess,
      currentPhase,
      enabledFeatureGroups,
      availableFeatures,
      rolloutPercentage,
      isPercentageRollout,
      environment,
      debugInfo
    };
  }, [effectiveUserId, environment, enableDebug, forceRefresh]);

  // Check specific feature access
  const featureAccess = useMemo<FeatureAccess>(() => {
    const access: FeatureAccess = {};

    // Core features
    access.enhancedLibrary = {
      enabled: rolloutStatus.hasAccess,
      reason: rolloutStatus.hasAccess ? 'User has access to enhanced library' : 'User not in rollout'
    };

    access.advancedFiltering = {
      enabled: rolloutStatus.availableFeatures.includes('ADVANCED_EXERCISE_FILTERING'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY']
    };

    access.videoIntegration = {
      enabled: rolloutStatus.availableFeatures.includes('EXERCISE_VIDEO_INTEGRATION'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY']
    };

    access.personalization = {
      enabled: rolloutStatus.availableFeatures.includes('PERSONALIZED_RECOMMENDATIONS'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'EXERCISE_PROGRESS_TRACKING']
    };

    access.progressTracking = {
      enabled: rolloutStatus.availableFeatures.includes('EXERCISE_PROGRESS_TRACKING'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY']
    };

    access.socialFeatures = {
      enabled: rolloutStatus.availableFeatures.includes('EXERCISE_SOCIAL_FEATURES'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'EXERCISE_PROGRESS_TRACKING']
    };

    access.aiCoaching = {
      enabled: rolloutStatus.availableFeatures.includes('AI_EXERCISE_COACHING'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY', 'PERSONALIZED_RECOMMENDATIONS', 'EXERCISE_PROGRESS_TRACKING']
    };

    access.offlineAccess = {
      enabled: rolloutStatus.availableFeatures.includes('OFFLINE_EXERCISE_ACCESS'),
      dependencies: ['ENHANCED_EXERCISE_LIBRARY']
    };

    return access;
  }, [rolloutStatus]);

  // Initialize hook
  useEffect(() => {
    setIsInitialized(true);
    setLastCheck(new Date());

    if (enableDebug) {
      console.log('[useExerciseLibraryRollout] Initialized', {
        userId: effectiveUserId,
        environment,
        hasAccess: rolloutStatus.hasAccess,
        currentPhase: rolloutStatus.currentPhase?.name
      });
    }
  }, [effectiveUserId, environment]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = useCallback((feature: FeatureFlag): boolean => {
    const enabled = isFeatureEnabled(feature);

    if (autoTrack && enabled) {
      trackFeatureUsage(feature, effectiveUserId, {
        environment,
        phase: rolloutStatus.currentPhase?.id,
        featureGroups: rolloutStatus.enabledFeatureGroups
      });
    }

    return enabled;
  }, [autoTrack, effectiveUserId, environment, rolloutStatus]);

  // Execute code only if feature is enabled
  const withFeature = useCallback(<T,>(
    feature: FeatureFlag,
    callback: () => T,
    fallback?: () => T
  ): T | undefined => {
    return executeWithFeature(feature, callback, fallback, autoTrack);
  }, [autoTrack]);

  // Check if user belongs to a specific segment
  const isInSegment = useCallback((segment: string): boolean => {
    // This would typically check against a user segmentation service
    // For now, we'll use basic heuristics
    switch (segment) {
      case 'internal_team':
        return effectiveUserId.startsWith('dev_') || effectiveUserId.startsWith('admin_');
      case 'beta_tester':
        return localStorage.getItem('beta_tester') === 'true';
      case 'power_user':
        const workoutCount = parseInt(localStorage.getItem('total_workouts') || '0', 10);
        return workoutCount > 50;
      case 'new_user':
        const registrationDate = localStorage.getItem('registration_date');
        if (!registrationDate) return true;
        const daysSinceReg = (Date.now() - new Date(registrationDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceReg <= 30;
      default:
        return false;
    }
  }, [effectiveUserId]);

  // Track feature usage manually
  const trackUsage = useCallback((
    feature: FeatureFlag,
    metadata?: Record<string, any>
  ) => {
    trackFeatureUsage(feature, effectiveUserId, {
      environment,
      phase: rolloutStatus.currentPhase?.id,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }, [effectiveUserId, environment, rolloutStatus]);

  // Get rollout metrics for analytics
  const getMetrics = useCallback(() => {
    return {
      userId: effectiveUserId,
      environment,
      hasAccess: rolloutStatus.hasAccess,
      currentPhase: rolloutStatus.currentPhase?.id,
      rolloutPercentage: rolloutStatus.rolloutPercentage,
      enabledFeatures: rolloutStatus.availableFeatures,
      featureGroups: rolloutStatus.enabledFeatureGroups,
      lastCheck: lastCheck?.toISOString()
    };
  }, [effectiveUserId, environment, rolloutStatus, lastCheck]);

  // Refresh rollout status
  const refresh = useCallback(() => {
    setForceRefresh(prev => prev + 1);
    setLastCheck(new Date());
  }, []);

  // Admin functions (only available in development or with proper permissions)
  const adminActions = useMemo(() => {
    const isAdmin = import.meta.env.DEV || localStorage.getItem('rollout_admin') === 'true';

    if (!isAdmin) {
      return null;
    }

    return {
      advancePhase: () => advanceToNextPhase(environment),
      rollbackPhase: () => rollbackToPreviousPhase(environment),
      updatePhaseStatus: (phaseId: string, status: RolloutPhase['status']) =>
        updatePhaseStatus(phaseId, status, environment),
      forceEnableFeature: (feature: FeatureFlag) => {
        localStorage.setItem(`ff_${feature}`, 'true');
        refresh();
      },
      forceDisableFeature: (feature: FeatureFlag) => {
        localStorage.setItem(`ff_${feature}`, 'false');
        refresh();
      }
    };
  }, [environment, refresh]);

  // Export configuration for debugging
  const exportDebugInfo = useCallback(() => {
    const info = {
      userId: effectiveUserId,
      environment,
      rolloutStatus,
      featureAccess,
      featureFlags: Object.fromEntries(
        Object.keys(rolloutStatus.availableFeatures).map(flag => [
          flag,
          isFeatureEnabled(flag as FeatureFlag)
        ])
      ),
      localStorage: Object.fromEntries(
        Object.entries(localStorage).filter(([key]) => key.startsWith('ff_') || key.startsWith('rollout_'))
      ),
      timestamp: new Date().toISOString()
    };

    if (enableDebug) {
      console.log('[useExerciseLibraryRollout] Debug Info:', info);
    }

    return info;
  }, [effectiveUserId, environment, rolloutStatus, featureAccess, enableDebug]);

  return {
    // State
    isInitialized,
    rolloutStatus,
    featureAccess,
    lastCheck,

    // Feature checks
    hasAccess: rolloutStatus.hasAccess,
    isFeatureEnabled,
    withFeature,
    isInSegment,

    // Analytics
    trackUsage,
    getMetrics,

    // Utilities
    refresh,
    exportDebugInfo,

    // Admin (development only)
    adminActions
  };
};

// Helper function to hash strings
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Helper function to get access reasons
function getAccessReasons(
  hasAccess: boolean,
  currentPhase: RolloutPhase | null,
  userId: string,
  isPercentageRollout: boolean
): string[] {
  const reasons: string[] = [];

  if (!currentPhase) {
    reasons.push('No active rollout phase');
    return reasons;
  }

  if (!hasAccess) {
    if (currentPhase.status !== 'active') {
      reasons.push(`Phase ${currentPhase.status}`);
    }

    if (currentPhase.targetCriteria.userIds?.length > 0) {
      if (currentPhase.targetCriteria.userIds.includes(userId)) {
        reasons.push('User explicitly included');
      } else {
        reasons.push('User not in target list');
      }
    }

    if (isPercentageRollout && currentPhase.targetCriteria.percentage > 0) {
      const userHash = Math.abs(hashString(userId)) % 100;
      if (userHash >= currentPhase.targetCriteria.percentage) {
        reasons.push(`User percentage (${userHash}%) above threshold (${currentPhase.targetCriteria.percentage}%)`);
      }
    }

    if (currentPhase.targetCriteria.excludedUserIds?.includes(userId)) {
      reasons.push('User explicitly excluded');
    }
  } else {
    if (currentPhase.targetCriteria.userIds?.includes(userId)) {
      reasons.push('User explicitly included');
    } else if (isPercentageRollout) {
      reasons.push('User within rollout percentage');
    } else {
      reasons.push('Feature enabled for all users');
    }
  }

  return reasons;
}

export default useExerciseLibraryRollout;
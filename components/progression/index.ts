/**
 * Progression Tracking Components Index
 *
 * Exports all Phase 4 progression tracking components for easy importing
 */

// Main Components
export { default as FlexibilityProgressionTracker } from './FlexibilityProgressionTracker';
export { default as BalanceDifficultyIndicator } from './BalanceDifficultyIndicator';
export { default as MedicineBallPowerTracker } from './MedicineBallPowerTracker';
export { default as StabilityBallEngagementTracker } from './StabilityBallEngagementTracker';

// Types and Utilities
export * from './types';
export * from './utils';

// Component Configuration Defaults
export const DEFAULT_FLEXIBILITY_CONFIG = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 5000,
  autoSave: true
};

export const DEFAULT_BALANCE_CONFIG = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 1000,
  autoSave: true
};

export const DEFAULT_POWER_CONFIG = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 100,
  autoSave: true
};

export const DEFAULT_STABILITY_CONFIG = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 500,
  autoSave: true
};

// Visualization Defaults
export const DEFAULT_VISUALIZATION_CONFIG = {
  chartType: 'line' as const,
  colorScheme: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  showGridlines: true,
  showLabels: true,
  showLegend: true,
  interactive: true,
  animationDuration: 300
};

// Accessibility Defaults
export const DEFAULT_ACCESSIBILITY_CONFIG = {
  enableHighContrast: false,
  enableReducedMotion: false,
  enableScreenReader: true,
  fontSize: 'medium' as const,
  colorBlindMode: 'none' as const
};
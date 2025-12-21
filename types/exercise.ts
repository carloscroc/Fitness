/**
 * Enhanced Exercise Types for Migration
 *
 * This file extends the base Exercise interface with migration-specific fields
 * while maintaining backward compatibility with existing code.
 */

import { Exercise } from '../data/exercises';

/**
 * Data source types for exercises
 */
export type DataSource = 'frontend' | 'backend' | 'merged';

/**
 * Exercise quality metrics
 */
export interface ExerciseQuality {
  hasVideo: boolean;
  hasInstructions: boolean;
  hasBenefits: boolean;
  hasImage: boolean;
  hasMetadata: boolean;
  completeness: number; // 0-100 percentage
}

/**
 * Exercise matching information
 */
export interface ExerciseMatch {
  id: string;
  confidence: number; // 0-1 match confidence
  matchType: 'exact' | 'fuzzy' | 'manual' | 'none';
  source: DataSource;
  originalName?: string;
  matchedName?: string;
}

/**
 * Enhanced exercise interface that extends the base Exercise type
 */
export interface ExerciseWithSource extends Exercise {
  // Migration metadata
  dataSource: DataSource;
  isOriginal?: boolean; // Marks the original 7 frontend exercises
  libraryId?: string; // Backend library identifier

  // Quality and completeness
  quality: ExerciseQuality;

  // Matching information (if this exercise was matched/migrated)
  matchInfo?: ExerciseMatch;

  // Backend-specific fields that may not exist in frontend
  category?: string; // e.g., 'strength', 'cardio', 'stretching'
  primaryMuscle?: string; // More specific than muscle field
  secondaryMuscles?: string[]; // Additional muscle groups
  instructions?: string; // Backend instructions (may be less detailed than steps)
  metadata?: Record<string, any>; // Raw backend metadata

  // Migration tracking
  migratedAt?: string; // When this exercise was migrated
  version?: number; // Exercise data version for updates
}

/**
 * Exercise cache entry for performance optimization
 */
export interface ExerciseCacheEntry {
  exercises: ExerciseWithSource[];
  timestamp: number;
  ttl: number;
  version: string;
  source: DataSource;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  enableBackend: boolean;
  enablePercentageRollout: boolean;
  rolloutPercentage: number;
  preserveOriginalExercises: boolean;
  enableDataIndicators: boolean;
  debugMode: boolean;
}

/**
 * Missing data information for GitHub issues
 */
export interface MissingDataInfo {
  exerciseId: string;
  exerciseName: string;
  missingFields: string[];
  priority: 'high' | 'medium' | 'low';
  suggestedData?: Record<string, any>;
  dataSource: DataSource;
}

/**
 * Exercise merge strategy
 */
export type MergeStrategy = 'frontend-priority' | 'backend-priority' | 'field-merge' | 'preserve-original';

/**
 * Exercise filter options
 */
export interface ExerciseFilterOptions {
  dataSources?: DataSource[];
  categories?: string[];
  muscles?: string[];
  equipment?: string[];
  difficulty?: Exercise['difficulty'][];
  hasVideo?: boolean;
  hasImage?: boolean;
  minCompleteness?: number;

  // Phase 4 Advanced Filters
  balanceRequirements?: BalanceRequirement[];
  flexibilityTypes?: FlexibilityType[];
  powerMetrics?: PowerMetric[];
  progressionLevel?: ProgressionLevel;
  equipmentModifiers?: EquipmentModifiers;
}

/**
 * Exercise sorting options
 */
export interface ExerciseSortOptions {
  field: 'name' | 'difficulty' | 'calories' | 'bpm' | 'completeness';
  direction: 'asc' | 'desc';
}

/**
 * Exercise search result
 */
export interface ExerciseSearchResult {
  exercises: ExerciseWithSource[];
  totalCount: number;
  filteredCount: number;
  searchTime: number;
  hasMore?: boolean;
}

/**
 * Exercise migration statistics
 */
export interface MigrationStats {
  totalFrontendExercises: number;
  totalBackendExercises: number;
  totalMergedExercises: number;
  matchedExercises: number;
  unmatchedExercises: number;
  dataCompleteness: {
    withVideo: number;
    withInstructions: number;
    withBenefits: number;
    withImage: number;
    complete: number;
  };
}

/**
 * Exercise validation result
 */
export interface ExerciseValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  qualityScore: number;
}

/**
 * Exercise export format
 */
export interface ExerciseExport {
  exercises: ExerciseWithSource[];
  exportDate: string;
  version: string;
  source: DataSource;
  metadata: {
    totalCount: number;
    dataSources: Record<DataSource, number>;
    categories: string[];
    averageQuality: number;
  };
}

/**
 * Phase 4 Filter Type Definitions
 */

/**
 * Balance requirement levels for exercises
 */
export type BalanceRequirement = 'none' | 'static' | 'dynamic' | 'advanced';

/**
 * Flexibility types for stretching exercises
 */
export type FlexibilityType = 'static' | 'dynamic' | 'proprioceptive';

/**
 * Power metrics for explosive and rotational movements
 */
export type PowerMetric = 'explosive' | 'rotational' | 'plyometric';

/**
 * Progression levels for progressive training (1-5)
 */
export type ProgressionLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Equipment modifiers for specialized equipment
 */
export interface EquipmentModifiers {
  medicineBallWeight?: MedicineBallWeight[];
  stabilityBallSize?: StabilityBallSize[];
}

/**
 * Medicine ball weight options (in kg)
 */
export type MedicineBallWeight = 2 | 4 | 6 | 8 | 10 | 12;

/**
 * Stability ball size options (in cm)
 */
export type StabilityBallSize = 55 | 65 | 75;

/**
 * Type guards
 */
export function isExerciseWithSource(exercise: any): exercise is ExerciseWithSource {
  return exercise && typeof exercise === 'object' && 'dataSource' in exercise;
}

export function hasQualityMetrics(exercise: any): exercise is ExerciseWithSource {
  return isExerciseWithSource(exercise) && 'quality' in exercise;
}

export function isOriginalExercise(exercise: any): exercise is ExerciseWithSource {
  return isExerciseWithSource(exercise) && exercise.isOriginal === true;
}

/**
 * Utility functions for type safety
 */
export function createExerciseWithSource(
  baseExercise: Exercise,
  dataSource: DataSource,
  overrides: Partial<ExerciseWithSource> = {}
): ExerciseWithSource {
  return {
    ...baseExercise,
    dataSource,
    isOriginal: dataSource === 'frontend',
    quality: calculateExerciseQuality(baseExercise),
    ...overrides
  };
}

/**
 * Calculate exercise quality score based on available data
 */
export function calculateExerciseQuality(exercise: Exercise): ExerciseQuality {
  const hasVideo = !!exercise.video;
  const hasInstructions = exercise.steps.length > 0;
  const hasBenefits = exercise.benefits.length > 0;
  const hasImage = !!exercise.image;
  const hasMetadata = exercise.calories > 0 && exercise.bpm > 0 && !!exercise.difficulty;

  const completenessItems = [hasVideo, hasInstructions, hasBenefits, hasImage, hasMetadata];
  const completeness = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return {
    hasVideo,
    hasInstructions,
    hasBenefits,
    hasImage,
    hasMetadata,
    completeness
  };
}
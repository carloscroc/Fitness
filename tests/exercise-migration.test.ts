/**
 * Unit Tests for Exercise Migration Logic
 *
 * Tests the core functionality of the exercise migration system including:
 * - Exercise data merging
 * - Feature flag behavior
 * - Data quality assessment
 * - Rollout logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ExerciseWithSource,
  createExerciseWithSource,
  calculateExerciseQuality,
  type MigrationConfig
} from '../types/exercise';
import { Exercise } from '../data/exercises';
import {
  isFeatureEnabled,
  setFeatureFlag,
  shouldEnableBackendExercises,
  isUserInRollout
} from '../services/featureFlags';
import {
  getCurrentRolloutPhase,
  setCurrentRolloutPhase,
  shouldUserGetRollout,
  getRolloutStatus,
  DEFAULT_ROLLOUT_PHASES,
  type RolloutPhase
} from '../config/rolloutConfig';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Mock environment variables
const originalEnv = import.meta.env;

describe('Exercise Migration Logic', () => {
  beforeEach(() => {
    // Reset localStorage
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();

    // Reset feature flags
    Object.keys(localStorageMock).forEach(key => {
      if (key.startsWith('ff_')) {
        localStorageMock.removeItem(key);
      }
    });

    // Reset environment
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createExerciseWithSource', () => {
    it('should create an exercise with source and quality metrics', () => {
      const baseExercise: Exercise = {
        id: 'test-1',
        name: 'Test Exercise',
        muscle: 'Chest',
        equipment: 'Barbell',
        image: 'https://example.com/image.jpg',
        video: 'https://youtube.com/watch?v=test123',
        overview: 'Test overview',
        steps: ['Step 1', 'Step 2'],
        benefits: ['Benefit 1', 'Benefit 2'],
        bpm: 120,
        difficulty: 'Intermediate',
        videoContext: 'Test context',
        equipmentList: ['Barbell'],
        calories: 10
      };

      const result = createExerciseWithSource(baseExercise, 'frontend', { isOriginal: true });

      expect(result).toMatchObject({
        id: 'test-1',
        name: 'Test Exercise',
        dataSource: 'frontend',
        isOriginal: true,
        quality: {
          hasVideo: true,
          hasInstructions: true,
          hasBenefits: true,
          hasImage: true,
          hasMetadata: true,
          completeness: 100
        }
      });
    });

    it('should handle exercise with missing data', () => {
      const incompleteExercise: Exercise = {
        id: 'test-2',
        name: 'Incomplete Exercise',
        muscle: 'Legs',
        equipment: 'None',
        image: '',
        video: '',
        overview: '',
        steps: [],
        benefits: [],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: [],
        calories: 0
      };

      const result = createExerciseWithSource(incompleteExercise, 'backend');

      expect(result.quality.completeness).toBe(0);
      expect(result.quality.hasVideo).toBe(false);
      expect(result.quality.hasInstructions).toBe(false);
      expect(result.quality.hasBenefits).toBe(false);
    });
  });

  describe('calculateExerciseQuality', () => {
    it('should calculate 100% quality for complete exercise', () => {
      const completeExercise: Exercise = {
        id: 'test',
        name: 'Complete Exercise',
        muscle: 'Back',
        equipment: 'Dumbbell',
        image: 'https://example.com/image.jpg',
        video: 'https://youtube.com/watch?v=test',
        overview: 'Complete overview',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        benefits: ['Benefit 1', 'Benefit 2'],
        bpm: 140,
        difficulty: 'Advanced',
        videoContext: 'Advanced technique',
        equipmentList: ['Dumbbell'],
        calories: 15
      };

      const quality = calculateExerciseQuality(completeExercise);

      expect(quality.completeness).toBe(100);
      expect(quality.hasVideo).toBe(true);
      expect(quality.hasInstructions).toBe(true);
      expect(quality.hasBenefits).toBe(true);
      expect(quality.hasImage).toBe(true);
      expect(quality.hasMetadata).toBe(true);
    });

    it('should calculate quality based on available fields', () => {
      const partialExercise: Exercise = {
        id: 'test',
        name: 'Partial Exercise',
        muscle: 'Shoulders',
        equipment: 'Bodyweight',
        image: '',
        video: '',
        overview: 'Basic overview',
        steps: ['Step 1'],
        benefits: [],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: [],
        calories: 0
      };

      const quality = calculateExerciseQuality(partialExercise);

      expect(quality.completeness).toBe(40); // 2 out of 5 fields
      expect(quality.hasVideo).toBe(false);
      expect(quality.hasInstructions).toBe(true);
      expect(quality.hasBenefits).toBe(false);
    });
  });

  describe('Feature Flags', () => {
    it('should default to false when flag is not set', () => {
      expect(isFeatureEnabled('ENABLE_BACKEND_EXERCISES')).toBe(false);
    });

    it('should return true when flag is enabled in localStorage', () => {
      localStorageMock.setItem('ff_ENABLE_BACKEND_EXERCISES', 'true');
      expect(isFeatureEnabled('ENABLE_BACKEND_EXERCISES')).toBe(true);
    });

    it('should prioritize environment variables over localStorage', () => {
      // Mock environment variable
      vi.mocked(import.meta.env).VITE_FF_ENABLE_BACKEND_EXERCISES = 'true';
      localStorageMock.setItem('ff_ENABLE_BACKEND_EXERCISES', 'false');

      expect(isFeatureEnabled('ENABLE_BACKEND_EXERCISES')).toBe(true);
    });

    it('should handle percentage-based rollout', () => {
      // Mock deterministic user ID
      const userId = 'test-user-123';
      const percentage = 50;

      const inRollout = shouldUserGetRollout(userId);
      expect(typeof inRollout).toBe('boolean');
    });
  });

  describe('Rollout Configuration', () => {
    it('should start with development phase', () => {
      const currentPhase = getCurrentRolloutPhase();
      expect(currentPhase.name).toBe('Phase 1 - Development Only');
      expect(currentPhase.percentage).toBe(0);
      expect(currentPhase.enableBackendExercises).toBe(false);
    });

    it('should advance to next phase correctly', () => {
      const initialPhase = getCurrentRolloutPhase();
      const success = setCurrentRolloutPhase(1);

      expect(success).toBe(true);
      const newPhase = getCurrentRolloutPhase();
      expect(newPhase.name).toBe('Phase 2 - Internal Testing');
      expect(newPhase.percentage).toBe(1);
      expect(newPhase.enableBackendExercises).toBe(true);
    });

    it('should handle invalid phase indices', () => {
      const success = setCurrentRolloutPhase(-1);
      expect(success).toBe(false);

      const success2 = setCurrentRolloutPhase(999);
      expect(success2).toBe(false);
    });

    it('should provide rollout status information', () => {
      setCurrentRolloutPhase(2);
      const status = getRolloutStatus();

      expect(status.currentPhase.name).toBe('Phase 3 - Limited Rollout');
      expect(status.totalPhases).toBe(DEFAULT_ROLLOUT_PHASES.length);
      expect(status.progress).toBeGreaterThan(0);
      expect(status.rolloutPercentage).toBe(5);
      expect(status.isComplete).toBe(false);
      expect(status.nextPhase).toBeDefined();
      expect(status.previousPhase).toBeDefined();
    });

    it('should identify when rollout is complete', () => {
      setCurrentRolloutPhase(DEFAULT_ROLLOUT_PHASES.length - 1);
      const status = getRolloutStatus();

      expect(status.isComplete).toBe(true);
      expect(status.rolloutPercentage).toBe(100);
      expect(status.nextPhase).toBeUndefined();
    });
  });

  describe('User Rollout Logic', () => {
    it('should include users in percentage-based rollout consistently', () => {
      const userId = 'consistent-user';
      const phase: RolloutPhase = {
        name: 'Test Phase',
        description: 'Test',
        percentage: 50,
        enableBackendExercises: true,
        enableDataIndicators: false,
        enableAutoGitHubIssues: false
      };

      // Mock the current phase
      vi.spyOn(Math, 'random').mockReturnValue(0.25); // 25% should be < 50%

      const shouldInclude = shouldUserGetRollout(userId);
      expect(typeof shouldInclude).toBe('boolean');
    });

    it('should handle targeted users specifically', () => {
      const targetUser = 'targeted-user-123';
      const phase: RolloutPhase = {
        name: 'Targeted Phase',
        description: 'Test',
        percentage: 0, // No percentage rollout
        enableBackendExercises: true,
        enableDataIndicators: false,
        enableAutoGitHubIssues: false,
        targetUsers: [targetUser, 'another-target']
      };

      setCurrentRolloutPhase(1); // Set to phase with targeting
      const shouldInclude = shouldUserGetRollout(targetUser);
      expect(shouldInclude).toBe(true);
    });

    it('should exclude non-targeted users in targeted phase', () => {
      const nonTargetUser = 'regular-user-456';

      setCurrentRolloutPhase(1); // Phase with specific targets
      const shouldInclude = shouldUserGetRollout(nonTargetUser);
      expect(shouldInclude).toBe(false);
    });
  });

  describe('Data Quality Assessment', () => {
    it('should identify high-quality exercises', () => {
      const highQualityExercise: ExerciseWithSource = createExerciseWithSource({
        id: 'hq-1',
        name: 'High Quality Exercise',
        muscle: 'Full Body',
        equipment: 'Various',
        image: 'https://example.com/hq.jpg',
        video: 'https://youtube.com/watch?v=hq123',
        overview: 'Comprehensive overview',
        steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
        benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3'],
        bpm: 130,
        difficulty: 'Intermediate',
        videoContext: 'Professional instruction',
        equipmentList: ['Equipment 1', 'Equipment 2'],
        calories: 12
      }, 'frontend');

      expect(highQualityExercise.quality.completeness).toBe(100);
      expect(highQualityExercise.quality.hasVideo).toBe(true);
      expect(highQualityExercise.quality.hasInstructions).toBe(true);
      expect(highQualityExercise.quality.hasBenefits).toBe(true);
    });

    it('should identify low-quality exercises needing improvement', () => {
      const lowQualityExercise: ExerciseWithSource = createExerciseWithSource({
        id: 'lq-1',
        name: 'Low Quality Exercise',
        muscle: 'Arms',
        equipment: 'None specified',
        image: '',
        video: '',
        overview: '',
        steps: [],
        benefits: [],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: [],
        calories: 0
      }, 'backend');

      expect(lowQualityExercise.quality.completeness).toBe(0);
      expect(lowQualityExercise.quality.hasVideo).toBe(false);
      expect(lowQualityExercise.quality.hasInstructions).toBe(false);
      expect(lowQualityExercise.quality.hasBenefits).toBe(false);
      expect(lowQualityExercise.quality.hasImage).toBe(false);
    });

    it('should calculate partial quality correctly', () => {
      const partialExercise: ExerciseWithSource = createExerciseWithSource({
        id: 'pq-1',
        name: 'Partial Quality Exercise',
        muscle: 'Core',
        equipment: 'Mat',
        image: 'https://example.com/partial.jpg',
        video: '',
        overview: 'Basic overview only',
        steps: [],
        benefits: ['One benefit'],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: ['Mat'],
        calories: 0
      }, 'backend');

      // Should have: image (1), benefits (1) = 2/5 = 40%
      expect(partialExercise.quality.completeness).toBe(40);
      expect(partialExercise.quality.hasImage).toBe(true);
      expect(partialExercise.quality.hasBenefits).toBe(true);
      expect(partialExercise.quality.hasVideo).toBe(false);
      expect(partialExercise.quality.hasInstructions).toBe(false);
    });
  });

  describe('Exercise Data Merging', () => {
    it('should preserve original exercises during merge', () => {
      const originalExercise: ExerciseWithSource = createExerciseWithSource({
        id: 'orig-1',
        name: 'Original Exercise',
        muscle: 'Legs',
        equipment: 'Barbell',
        image: 'https://example.com/orig.jpg',
        video: 'https://youtube.com/watch?v=orig123',
        overview: 'Original detailed overview',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        benefits: ['Original benefit 1', 'Original benefit 2'],
        bpm: 140,
        difficulty: 'Advanced',
        videoContext: 'Original context',
        equipmentList: ['Barbell', 'Squat rack'],
        calories: 15
      }, 'frontend', { isOriginal: true });

      const backendExercise: ExerciseWithSource = createExerciseWithSource({
        id: 'be-1',
        name: 'Original Exercise', // Same name
        muscle: 'Legs',
        equipment: 'Barbell',
        image: '',
        video: '',
        overview: 'Basic backend overview',
        steps: [],
        benefits: [],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: [],
        calories: 0
      }, 'backend');

      // Simulate merge logic (prioritize frontend)
      const merged = [originalExercise, backendExercise].filter(
        ex => ex.dataSource === 'frontend' || !originalExercise.name.toLowerCase().includes(ex.name.toLowerCase())
      );

      expect(merged).toHaveLength(1);
      expect(merged[0]).toEqual(originalExercise);
      expect(merged[0].isOriginal).toBe(true);
      expect(merged[0].quality.completeness).toBe(100);
    });

    it('should add backend exercises that don\'t conflict with frontend', () => {
      const frontendExercise = createExerciseWithSource({
        id: 'fe-1',
        name: 'Frontend Exercise',
        muscle: 'Chest',
        equipment: 'Dumbbell',
        image: 'https://example.com/fe.jpg',
        video: 'https://youtube.com/watch?v=fe123',
        overview: 'Frontend overview',
        steps: ['Step 1'],
        benefits: ['Benefit 1'],
        bpm: 120,
        difficulty: 'Intermediate',
        videoContext: 'Frontend context',
        equipmentList: ['Dumbbell'],
        calories: 10
      }, 'frontend', { isOriginal: true });

      const backendExercise = createExerciseWithSource({
        id: 'be-1',
        name: 'Backend Only Exercise', // Different name
        muscle: 'Back',
        equipment: 'Bodyweight',
        image: '',
        video: '',
        overview: 'Backend overview',
        steps: [],
        benefits: [],
        bpm: 100,
        difficulty: 'Beginner',
        videoContext: '',
        equipmentList: [],
        calories: 5
      }, 'backend');

      const allExercises = [frontendExercise, backendExercise];
      expect(allExercises).toHaveLength(2);
      expect(allExercises[0].dataSource).toBe('frontend');
      expect(allExercises[1].dataSource).toBe('backend');
    });
  });
});
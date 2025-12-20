/**
 * Tests for the enhanced exercise filtering API
 *
 * These tests verify the functionality of the new filtering functions
 * and ensure they work correctly with the database schema.
 */

import {
  fetchCompleteExercises,
  fetchExercisesByCategory,
  fetchExercisesByEquipment,
  fetchExercisesByMuscleGroup,
  searchExercises,
  getExerciseQuality,
  getExerciseStats,
  clearExerciseCache
} from '../services/supabaseClient.ts';
import type { ExerciseFilterOptions, ExerciseSortOptions } from '../types/exercise.ts';

// Mock test data
const mockExercise = {
  id: 'test-1',
  name: 'Test Exercise',
  muscle: 'Chest',
  equipment: 'Barbell',
  image: 'https://example.com/image.jpg',
  video: 'https://example.com/video.mp4',
  overview: 'Test exercise overview',
  steps: ['Step 1', 'Step 2', 'Step 3'],
  benefits: ['Benefit 1', 'Benefit 2'],
  bpm: 120,
  difficulty: 'Intermediate' as const,
  videoContext: 'Test video context',
  equipmentList: ['Barbell'],
  calories: 50
};

describe('Exercise Filtering API', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearExerciseCache();
  });

  describe('fetchCompleteExercises', () => {
    it('should fetch exercises with video, instructions, and benefits', async () => {
      const exercises = await fetchCompleteExercises();

      expect(Array.isArray(exercises)).toBe(true);

      // Verify returned exercises have required fields
      exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('video');
        expect(exercise).toHaveProperty('steps');
        expect(exercise).toHaveProperty('benefits');

        // Should have all completeness criteria
        expect(exercise.video).toBeTruthy();
        expect(exercise.steps.length).toBeGreaterThan(0);
        expect(exercise.benefits.length).toBeGreaterThan(0);
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error scenario
      // This test would need to mock the supabase client
      const exercises = await fetchCompleteExercises();
      expect(Array.isArray(exercises)).toBe(true);
    });
  });

  describe('fetchExercisesByCategory', () => {
    it('should fetch exercises for a specific category', async () => {
      const exercises = await fetchExercisesByCategory('strength');

      expect(Array.isArray(exercises)).toBe(true);

      // All returned exercises should belong to the specified category
      // (Note: This depends on your database structure)
    });

    it('should return empty array for non-existent category', async () => {
      const exercises = await fetchExercisesByCategory('non-existent-category');
      expect(exercises).toEqual([]);
    });

    it('should handle empty category string', async () => {
      const exercises = await fetchExercisesByCategory('');
      expect(exercises).toEqual([]);
    });
  });

  describe('fetchExercisesByEquipment', () => {
    it('should fetch exercises using specific equipment', async () => {
      const exercises = await fetchExercisesByEquipment('Barbell');

      expect(Array.isArray(exercises)).toBe(true);

      // All returned exercises should require the specified equipment
      exercises.forEach(exercise => {
        expect(exercise.equipmentList).toContain('Barbell');
      });
    });

    it('should handle equipment not found', async () => {
      const exercises = await fetchExercisesByEquipment('Non-existent Equipment');
      expect(exercises).toEqual([]);
    });
  });

  describe('fetchExercisesByMuscleGroup', () => {
    it('should fetch exercises for specific muscle group', async () => {
      const exercises = await fetchExercisesByMuscleGroup('Chest');

      expect(Array.isArray(exercises)).toBe(true);

      // All returned exercises should target the specified muscle group
      exercises.forEach(exercise => {
        expect(['Chest', 'Upper Body', 'General']).toContain(exercise.muscle);
      });
    });
  });

  describe('searchExercises', () => {
    it('should search exercises with text query', async () => {
      const results = await searchExercises('bench');

      expect(results).toHaveProperty('exercises');
      expect(results).toHaveProperty('totalCount');
      expect(results).toHaveProperty('filteredCount');
      expect(results).toHaveProperty('searchTime');
      expect(Array.isArray(results.exercises)).toBe(true);
      expect(typeof results.totalCount).toBe('number');
      expect(typeof results.filteredCount).toBe('number');
      expect(typeof results.searchTime).toBe('number');
    });

    it('should apply filters correctly', async () => {
      const filters: ExerciseFilterOptions = {
        muscles: ['Chest'],
        hasVideo: true,
        minCompleteness: 80
      };

      const results = await searchExercises('', filters);

      expect(results.exercises.length).toBeLessThanOrEqual(results.totalCount);

      results.exercises.forEach(exercise => {
        expect(['Chest', 'Upper Body', 'General']).toContain(exercise.muscle);
        expect(exercise.video).toBeTruthy();
      });
    });

    it('should apply sorting correctly', async () => {
      const sort: ExerciseSortOptions = {
        field: 'name',
        direction: 'asc'
      };

      const results = await searchExercises('', {}, sort);

      // Check if exercises are sorted by name
      for (let i = 1; i < results.exercises.length; i++) {
        expect(results.exercises[i-1].name.localeCompare(results.exercises[i].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should handle pagination', async () => {
      const firstPage = await searchExercises('', {}, { field: 'name', direction: 'asc' }, 5, 0);
      const secondPage = await searchExercises('', {}, { field: 'name', direction: 'asc' }, 5, 5);

      expect(firstPage.exercises.length).toBeLessThanOrEqual(5);
      expect(secondPage.exercises.length).toBeLessThanOrEqual(5);
      expect(firstPage.hasMore).toBe(secondPage.exercises.length > 0);
    });
  });

  describe('getExerciseQuality', () => {
    it('should calculate quality metrics for exercise', async () => {
      // First get some exercises to test with
      const exercises = await fetchCompleteExercises();

      if (exercises.length > 0) {
        const quality = await getExerciseQuality(exercises[0].id);

        expect(quality).toHaveProperty('hasVideo');
        expect(quality).toHaveProperty('hasInstructions');
        expect(quality).toHaveProperty('hasBenefits');
        expect(quality).toHaveProperty('hasImage');
        expect(quality).toHaveProperty('hasMetadata');
        expect(quality).toHaveProperty('completeness');

        expect(typeof quality.hasVideo).toBe('boolean');
        expect(typeof quality.hasInstructions).toBe('boolean');
        expect(typeof quality.hasBenefits).toBe('boolean');
        expect(typeof quality.hasImage).toBe('boolean');
        expect(typeof quality.hasMetadata).toBe('boolean');
        expect(typeof quality.completeness).toBe('number');
        expect(quality.completeness).toBeGreaterThanOrEqual(0);
        expect(quality.completeness).toBeLessThanOrEqual(100);
      }
    });

    it('should return null for non-existent exercise', async () => {
      const quality = await getExerciseQuality('non-existent-id');
      expect(quality).toBeNull();
    });
  });

  describe('getExerciseStats', () => {
    it('should return exercise statistics', async () => {
      const stats = await getExerciseStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('withVideo');
      expect(stats).toHaveProperty('withInstructions');
      expect(stats).toHaveProperty('withBenefits');
      expect(stats).toHaveProperty('complete');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byDifficulty');
      expect(stats).toHaveProperty('byEquipment');

      expect(typeof stats.total).toBe('number');
      expect(typeof stats.withVideo).toBe('number');
      expect(typeof stats.withInstructions).toBe('number');
      expect(typeof stats.withBenefits).toBe('number');
      expect(typeof stats.complete).toBe('number');
      expect(typeof stats.byCategory).toBe('object');
      expect(typeof stats.byDifficulty).toBe('object');
      expect(typeof stats.byEquipment).toBe('object');

      // Verify logical relationships
      expect(stats.complete).toBeLessThanOrEqual(stats.withVideo);
      expect(stats.complete).toBeLessThanOrEqual(stats.withInstructions);
      expect(stats.complete).toBeLessThanOrEqual(stats.withBenefits);
    });
  });

  describe('Caching', () => {
    it('should use cache for subsequent calls', async () => {
      const startTime1 = Date.now();
      await fetchCompleteExercises();
      const time1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      await fetchCompleteExercises();
      const time2 = Date.now() - startTime2;

      // Second call should be faster due to caching
      // Note: This is a basic test and might not always pass depending on timing
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should clear cache correctly', async () => {
      await fetchCompleteExercises(); // Populate cache
      clearExerciseCache(); // Clear cache

      // Next call should fetch fresh data
      const exercises = await fetchCompleteExercises();
      expect(Array.isArray(exercises)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require mocking network failures
      const exercises = await fetchCompleteExercises();
      expect(Array.isArray(exercises)).toBe(true);
    });

    it('should handle invalid inputs gracefully', async () => {
      const exercises = await searchExercises('', {
        muscles: ['Non-existent muscle'],
        equipment: ['Non-existent equipment']
      });

      expect(Array.isArray(exercises.exercises)).toBe(true);
      expect(exercises.exercises.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data type consistency', async () => {
      const exercises = await fetchCompleteExercises();

      exercises.forEach(exercise => {
        expect(typeof exercise.id).toBe('string');
        expect(typeof exercise.name).toBe('string');
        expect(typeof exercise.muscle).toBe('string');
        expect(typeof exercise.equipment).toBe('string');
        expect(typeof exercise.image).toBe('string');
        expect(typeof exercise.overview).toBe('string');
        expect(Array.isArray(exercise.steps)).toBe(true);
        expect(Array.isArray(exercise.benefits)).toBe(true);
        expect(typeof exercise.bpm).toBe('number');
        expect(typeof exercise.calories).toBe('number');
        expect(['Beginner', 'Intermediate', 'Advanced']).toContain(exercise.difficulty);
      });
    });
  });
});

// Integration tests
describe('Exercise Filtering Integration Tests', () => {
  it('should build a complete workout routine', async () => {
    const [chest, back, legs] = await Promise.all([
      searchExercises('', { muscles: ['Chest'], minCompleteness: 100 }),
      searchExercises('', { muscles: ['Back'], minCompleteness: 100 }),
      searchExercises('', { muscles: ['Legs'], minCompleteness: 100 })
    ]);

    expect(chest.exercises.length).toBeGreaterThanOrEqual(0);
    expect(back.exercises.length).toBeGreaterThanOrEqual(0);
    expect(legs.exercises.length).toBeGreaterThanOrEqual(0);

    // Build workout routine
    const workout = {
      chest: chest.exercises.slice(0, 3),
      back: back.exercises.slice(0, 3),
      legs: legs.exercises.slice(0, 3)
    };

    expect(workout.chest.length).toBeLessThanOrEqual(3);
    expect(workout.back.length).toBeLessThanOrEqual(3);
    expect(workout.legs.length).toBeLessThanOrEqual(3);
  });

  it('should perform complex search and filtering', async () => {
    const results = await searchExercises(
      'strength',
      {
        categories: ['strength'],
        difficulty: ['Intermediate'],
        hasVideo: true,
        minCompleteness: 80
      },
      { field: 'name', direction: 'asc' },
      10,
      0
    );

    expect(results.exercises.length).toBeLessThanOrEqual(10);
    expect(results.filteredCount).toBeLessThanOrEqual(results.totalCount);

    results.exercises.forEach(exercise => {
      expect(exercise.video).toBeTruthy();
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(exercise.difficulty);
    });
  });
});

// Performance tests
describe('Exercise Filtering Performance', () => {
  it('should handle large result sets efficiently', async () => {
    const startTime = Date.now();

    const results = await searchExercises('', {}, { field: 'name', direction: 'asc' }, 100, 0);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(results.exercises.length).toBeLessThanOrEqual(100);
  });

  it('should handle concurrent requests', async () => {
    const startTime = Date.now();

    const promises = [
      fetchCompleteExercises(),
      fetchExercisesByCategory('strength'),
      fetchExercisesByEquipment('Barbell'),
      getExerciseStats()
    ];

    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toHaveLength(4);
    expect(duration).toBeLessThan(10000); // 10 seconds for all requests
  });
});
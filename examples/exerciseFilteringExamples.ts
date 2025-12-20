/**
 * Examples of using the enhanced exercise filtering API
 *
 * This file demonstrates usage of the new filtering functions
 * for fetching complete exercises from the backend.
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
} from './services/supabaseClient.ts';
import type { ExerciseFilterOptions, ExerciseSortOptions } from './types/exercise.ts';

/**
 * Example 1: Fetch only complete exercises (with video, instructions, and benefits)
 */
export async function getHighQualityExercises() {
  try {
    const completeExercises = await fetchCompleteExercises();
    console.log(`Found ${completeExercises.length} complete exercises`);

    // You can now use these high-quality exercises in your app
    return completeExercises;
  } catch (error) {
    console.error('Error fetching complete exercises:', error);
    return [];
  }
}

/**
 * Example 2: Get exercises for a specific workout category
 */
export async function getWorkoutByCategory(category: string) {
  try {
    const exercises = await fetchExercisesByCategory(category);
    console.log(`Found ${exercises.length} exercises for category: ${category}`);

    return exercises;
  } catch (error) {
    console.error('Error fetching exercises by category:', error);
    return [];
  }
}

/**
 * Example 3: Find exercises based on available equipment
 */
export async function findExercisesByEquipment(equipment: string) {
  try {
    const exercises = await fetchExercisesByEquipment(equipment);
    console.log(`Found ${exercises.length} exercises using: ${equipment}`);

    return exercises;
  } catch (error) {
    console.error('Error fetching exercises by equipment:', error);
    return [];
  }
}

/**
 * Example 4: Target specific muscle groups
 */
export async function getMuscleGroupExercises(muscle: string) {
  try {
    const exercises = await fetchExercisesByMuscleGroup(muscle);
    console.log(`Found ${exercises.length} exercises for muscle: ${muscle}`);

    return exercises;
  } catch (error) {
    console.error('Error fetching exercises by muscle group:', error);
    return [];
  }
}

/**
 * Example 5: Advanced search with multiple filters
 */
export async function searchWorkoutExamples() {
  try {
    // Example 1: Search for chest exercises with videos
    const chestExercisesWithVideo = await searchExercises(
      'chest',
      {
        muscles: ['Chest'],
        hasVideo: true,
        minCompleteness: 80
      },
      { field: 'name', direction: 'asc' }
    );

    console.log(`Found ${chestExercisesWithVideo.exercises.length} chest exercises with videos`);

    // Example 2: Search for bodyweight exercises
    const bodyweightExercises = await searchExercises(
      '',
      {
        equipment: ['Bodyweight'],
        hasVideo: true
      },
      { field: 'name', direction: 'asc' },
      20, // limit
      0   // offset
    );

    console.log(`Found ${bodyweightExercises.exercises.length} bodyweight exercises`);

    // Example 3: Search for beginner-friendly complete exercises
    const beginnerComplete = await searchExercises(
      '',
      {
        difficulty: ['Beginner'],
        minCompleteness: 100,
        hasVideo: true
      },
      { field: 'completeness', direction: 'desc' }
    );

    console.log(`Found ${beginnerComplete.exercises.length} complete beginner exercises`);

    return {
      chestWithVideo: chestExercisesWithVideo,
      bodyweight: bodyweightExercises,
      beginnerComplete
    };
  } catch (error) {
    console.error('Error in advanced search:', error);
    return null;
  }
}

/**
 * Example 6: Get exercise quality metrics
 */
export async function analyzeExerciseQuality(exerciseId: string) {
  try {
    const quality = await getExerciseQuality(exerciseId);

    if (quality) {
      console.log('Exercise Quality Analysis:');
      console.log(`- Has Video: ${quality.hasVideo ? '✅' : '❌'}`);
      console.log(`- Has Instructions: ${quality.hasInstructions ? '✅' : '❌'}`);
      console.log(`- Has Benefits: ${quality.hasBenefits ? '✅' : '❌'}`);
      console.log(`- Has Image: ${quality.hasImage ? '✅' : '❌'}`);
      console.log(`- Has Metadata: ${quality.hasMetadata ? '✅' : '❌'}`);
      console.log(`- Overall Completeness: ${quality.completeness}%`);

      return quality;
    } else {
      console.log('Exercise not found');
      return null;
    }
  } catch (error) {
    console.error('Error analyzing exercise quality:', error);
    return null;
  }
}

/**
 * Example 7: Get overall exercise statistics
 */
export async function getExerciseAnalytics() {
  try {
    const stats = await getExerciseStats();

    console.log('Exercise Library Analytics:');
    console.log(`- Total Exercises: ${stats.total}`);
    console.log(`- With Video: ${stats.withVideo} (${((stats.withVideo / stats.total) * 100).toFixed(1)}%)`);
    console.log(`- With Instructions: ${stats.withInstructions} (${((stats.withInstructions / stats.total) * 100).toFixed(1)}%)`);
    console.log(`- With Benefits: ${stats.withBenefits} (${((stats.withBenefits / stats.total) * 100).toFixed(1)}%)`);
    console.log(`- Complete (All 3): ${stats.complete} (${((stats.complete / stats.total) * 100).toFixed(1)}%)`);

    console.log('\nBy Category:');
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}`);
    });

    console.log('\nBy Difficulty:');
    Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
      console.log(`- ${difficulty}: ${count}`);
    });

    console.log('\nBy Equipment:');
    Object.entries(stats.byEquipment).forEach(([equipment, count]) => {
      console.log(`- ${equipment}: ${count}`);
    });

    return stats;
  } catch (error) {
    console.error('Error getting exercise stats:', error);
    return null;
  }
}

/**
 * Example 8: Building a workout routine with quality filters
 */
export async function buildQualityWorkoutRoutine() {
  try {
    // Get high-quality exercises for different muscle groups
    const [chestExercises, backExercises, legExercises] = await Promise.all([
      searchExercises('', {
        muscles: ['Chest'],
        minCompleteness: 100,
        hasVideo: true,
        difficulty: ['Intermediate', 'Advanced']
      }),
      searchExercises('', {
        muscles: ['Back'],
        minCompleteness: 100,
        hasVideo: true,
        difficulty: ['Intermediate', 'Advanced']
      }),
      searchExercises('', {
        muscles: ['Legs'],
        minCompleteness: 100,
        hasVideo: true,
        difficulty: ['Intermediate', 'Advanced']
      })
    ]);

    const workoutRoutine = {
      chest: chestExercises.exercises.slice(0, 3), // Top 3 chest exercises
      back: backExercises.exercises.slice(0, 3),   // Top 3 back exercises
      legs: legExercises.exercises.slice(0, 3),    // Top 3 leg exercises
      totalExercises: chestExercises.exercises.length + backExercises.exercises.length + legExercises.exercises.length
    };

    console.log('Built workout routine with high-quality exercises:');
    console.log(`- Chest: ${workoutRoutine.chest.length} exercises`);
    console.log(`- Back: ${workoutRoutine.back.length} exercises`);
    console.log(`- Legs: ${workoutRoutine.legs.length} exercises`);
    console.log(`- Total Available: ${workoutRoutine.totalExercises} exercises`);

    return workoutRoutine;
  } catch (error) {
    console.error('Error building workout routine:', error);
    return null;
  }
}

/**
 * Example 9: Refresh cache when data is updated
 */
export async function refreshExerciseData() {
  // Clear the cache to ensure fresh data
  clearExerciseCache();
  console.log('Exercise cache cleared - fresh data will be fetched on next request');
}

/**
 * Example usage in a React component
 */
export function useCompleteExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCompleteExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const completeExercises = await fetchCompleteExercises();
      setExercises(completeExercises);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompleteExercises();
  }, []);

  return { exercises, loading, error, refetch: loadCompleteExercises };
}

// Export all functions for easy importing
export default {
  getHighQualityExercises,
  getWorkoutByCategory,
  findExercisesByEquipment,
  getMuscleGroupExercises,
  searchWorkoutExercises,
  analyzeExerciseQuality,
  getExerciseAnalytics,
  buildQualityWorkoutRoutine,
  refreshExerciseData
};
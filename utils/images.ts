
/**
 * Image Utility Functions
 * 
 * Helper functions for handling exercise images and providing high-quality fallbacks.
 */

// High-quality Unsplash images for each muscle group/category
export const MUSCLE_IMAGES: Record<string, string> = {
  'Chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop', // Bench press / Chest
  'Back': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop', // Back workout
  'Legs': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop', // Legs/Squat
  'Shoulders': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop', // Overhead press
  'Arms': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop', // Biceps/Triceps
  'Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', // Abs
  'Cardio': 'https://images.unsplash.com/photo-1538805060512-e21960175b08?q=80&w=800&auto=format&fit=crop', // Running
  'Full Body': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', // Gym general
  'Other': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
};

/**
 * Gets a display image for an exercise.
 * Prioritizes the exercise's specific image, then falls back to a muscle-specific image.
 */
export const getExerciseImage = (exercise: { image?: string; muscle?: string; name?: string }): string => {
  if (exercise.image && exercise.image.length > 5) {
    return exercise.image;
  }
  
  if (exercise.muscle && MUSCLE_IMAGES[exercise.muscle]) {
    return MUSCLE_IMAGES[exercise.muscle];
  }

  // Specific name checks for better fallbacks if muscle is generic or missing (rare)
  const name = exercise.name?.toLowerCase() || '';
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) return MUSCLE_IMAGES['Legs'];
  if (name.includes('bench') || name.includes('push up') || name.includes('chest')) return MUSCLE_IMAGES['Chest'];
  if (name.includes('deadlift') || name.includes('row') || name.includes('pull')) return MUSCLE_IMAGES['Back'];
  if (name.includes('press') || name.includes('shoulder')) return MUSCLE_IMAGES['Shoulders'];
  if (name.includes('curl') || name.includes('tricep') || name.includes('arm')) return MUSCLE_IMAGES['Arms'];
  if (name.includes('run') || name.includes('cardio')) return MUSCLE_IMAGES['Cardio'];

  return MUSCLE_IMAGES['Other'];
};

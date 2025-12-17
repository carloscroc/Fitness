import { useCallback, useEffect, useState, useMemo } from 'react';
import { EXERCISE_DB, Exercise } from '../data/exercises';
import { fetchRemoteExercises } from '../services/supabaseClient';
import {
  isFeatureEnabled,
  shouldEnableBackendExercises,
  getEnabledFeatureFlags,
  type FeatureFlag
} from '../services/featureFlags';
import {
  ExerciseWithSource,
  DataSource,
  createExerciseWithSource,
  calculateExerciseQuality,
  type MigrationConfig,
  type MigrationStats,
  type MissingDataInfo
} from '../types/exercise';

const CACHE_KEY = 'fitness_exercises_cache_v2';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

/**
 * Enhanced configuration for exercise loading
 */
function getMigrationConfig(): MigrationConfig {
  const flags = getEnabledFeatureFlags();

  return {
    enableBackend: flags.ENABLE_BACKEND_EXERCISES,
    enablePercentageRollout: flags.ENABLE_PERCENTAGE_ROLLOUT,
    rolloutPercentage: parseInt(import.meta.env.VITE_ROLLOUT_PERCENTAGE || '0', 10),
    preserveOriginalExercises: true, // Always preserve original exercises
    enableDataIndicators: flags.SHOW_DATA_SOURCE_INDICATORS,
    debugMode: flags.DEBUG_EXERCISE_MERGING
  };
}

/**
 * Check if backend exercises should be loaded based on feature flags and rollout
 */
function shouldLoadBackendExercises(): boolean {
  const config = getMigrationConfig();

  if (!config.enableBackend) {
    return false;
  }

  if (config.enablePercentageRollout) {
    return shouldEnableBackendExercises(config.rolloutPercentage);
  }

  return true;
}

/**
 * Normalize video URLs to YouTube embed format
 */
function normalizeVideoUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const url = raw.trim();
    // YouTube short link youtu.be/ID
    let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`;
    // watch?v=ID or watch?v=ID&... or &t= -> extract v
    m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`;
    // embed/ID
    m = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i);
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`;
    // If it's already an MP4 or other direct file, return as-is
    if (/\.(mp4|webm|ogg)(?:\?|$)/i.test(url)) return url;
    // Unknown or unsupported provider: return original to preserve value
    return url;
  } catch {
    return raw;
  }
}

/**
 * Convert backend exercise to ExerciseWithSource
 */
function convertBackendExercise(backendEx: any): ExerciseWithSource {
  const baseExercise: Exercise = {
    id: backendEx.id ?? `backend-${backendEx.library_id ?? backendEx.name}`,
    name: backendEx.name,
    muscle: backendEx.primary_muscle || backendEx.muscle || 'General',
    equipment: Array.isArray(backendEx.equipment)
      ? backendEx.equipment.join(', ')
      : (backendEx.equipment || 'None'),
    image: backendEx.image_url || '',
    video: normalizeVideoUrl(backendEx.video_url),
    overview: backendEx.overview || backendEx.description || '',
    steps: Array.isArray(backendEx.instructions)
      ? backendEx.instructions
      : (backendEx.instructions ? [backendEx.instructions] : []),
    benefits: [], // Backend exercises typically don't have benefits
    bpm: backendEx.bpm || 0,
    difficulty: backendEx.difficulty || 'Beginner',
    videoContext: '',
    equipmentList: Array.isArray(backendEx.equipment) ? backendEx.equipment : [backendEx.equipment || 'None'],
    calories: backendEx.calories || 0
  };

  return createExerciseWithSource(baseExercise, 'backend', {
    libraryId: backendEx.library_id,
    category: backendEx.category,
    primaryMuscle: backendEx.primary_muscle,
    secondaryMuscles: backendEx.secondary_muscles || [],
    instructions: backendEx.description,
    metadata: backendEx.metadata
  });
}

/**
 * Merge frontend and backend exercises while preserving originals
 */
function mergeExercises(
  frontendExercises: Exercise[],
  backendExercises: any[] = [],
  config: MigrationConfig
): ExerciseWithSource[] {
  // Convert frontend exercises to ExerciseWithSource
  const frontendWithSource: ExerciseWithSource[] = frontendExercises.map(ex =>
    createExerciseWithSource(ex, 'frontend', { isOriginal: true })
  );

  if (!config.enableBackend || !shouldLoadBackendExercises()) {
    if (config.debugMode) {
      console.log('🏋️ Backend exercises disabled by feature flags');
    }
    return frontendWithSource;
  }

  // Convert backend exercises
  const backendWithSource: ExerciseWithSource[] = backendExercises.map(convertBackendExercise);

  // Remove exact duplicates by name (prioritize frontend)
  const frontendNames = new Set(frontendWithSource.map(ex => ex.name.toLowerCase()));
  const filteredBackend = backendWithSource.filter(
    ex => !frontendNames.has(ex.name.toLowerCase())
  );

  const merged = [...frontendWithSource, ...filteredBackend];

  if (config.debugMode) {
    console.log(`🏋️ Exercise migration summary:`, {
      frontend: frontendWithSource.length,
      backend: backendWithSource.length,
      duplicatesRemoved: backendWithSource.length - filteredBackend.length,
      total: merged.length
    });
  }

  return merged;
}

/**
 * Calculate migration statistics
 */
function calculateMigrationStats(exercises: ExerciseWithSource[]): MigrationStats {
  const frontend = exercises.filter(ex => ex.dataSource === 'frontend');
  const backend = exercises.filter(ex => ex.dataSource === 'backend');

  return {
    totalFrontendExercises: frontend.length,
    totalBackendExercises: backend.length,
    totalMergedExercises: exercises.length,
    matchedExercises: 0, // TODO: Implement matching logic
    unmatchedExercises: backend.length,
    dataCompleteness: {
      withVideo: exercises.filter(ex => ex.quality.hasVideo).length,
      withInstructions: exercises.filter(ex => ex.quality.hasInstructions).length,
      withBenefits: exercises.filter(ex => ex.quality.hasBenefits).length,
      withImage: exercises.filter(ex => ex.quality.hasImage).length,
      complete: exercises.filter(ex => ex.quality.completeness === 100).length
    }
  };
}

/**
 * Cache management functions
 */
function loadCache(): { items: any[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !parsed.items) return null;
    if ((Date.now() - parsed.ts) > CACHE_MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(items: any[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch (error) {
    console.warn('Failed to save exercises cache:', error);
  }
}

/**
 * Generate missing data information for GitHub issues
 */
function generateMissingDataInfo(exercises: ExerciseWithSource[]): MissingDataInfo[] {
  const missingData: MissingDataInfo[] = [];

  exercises.forEach(exercise => {
    const missingFields: string[] = [];

    if (!exercise.video) missingFields.push('video');
    if (exercise.steps.length === 0) missingFields.push('steps');
    if (exercise.benefits.length === 0) missingFields.push('benefits');
    if (!exercise.image) missingFields.push('image');
    if (exercise.calories === 0) missingFields.push('calories');
    if (exercise.bpm === 0) missingFields.push('bpm');
    if (!exercise.difficulty || exercise.difficulty === 'Beginner') missingFields.push('difficulty');

    if (missingFields.length > 0 && exercise.dataSource === 'backend') {
      const priority = missingFields.includes('video') ? 'high' : 'medium';

      missingData.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        missingFields,
        priority: priority as 'high' | 'medium',
        dataSource: exercise.dataSource,
        suggestedData: {
          video: 'Add YouTube video URL',
          steps: ['Add detailed step-by-step instructions'],
          benefits: ['List exercise benefits'],
          image: 'Add high-quality exercise image URL'
        }
      });
    }
  });

  return missingData;
}

/**
 * Enhanced useExercises hook with feature flag support and migration capabilities
 */
export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseWithSource[]>(() => {
    const cached = loadCache();
    if (cached && Array.isArray(cached.items) && (Date.now() - cached.ts) < CACHE_MAX_AGE) {
      const config = getMigrationConfig();
      return mergeExercises(EXERCISE_DB, cached.items, config);
    }

    // Return only frontend exercises initially
    const config = getMigrationConfig();
    return mergeExercises(EXERCISE_DB, [], config);
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<number | null>(() => {
    const cached = loadCache();
    return cached ? cached.ts : null;
  });

  // Memoize migration statistics
  const migrationStats = useMemo(() =>
    calculateMigrationStats(exercises),
    [exercises]
  );

  // Memoize missing data info
  const missingDataInfo = useMemo(() =>
    generateMissingDataInfo(exercises),
    [exercises]
  );

  const refresh = useCallback(async (force = false) => {
    const config = getMigrationConfig();

    if (!config.enableBackend) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (!navigator.onLine && !force) {
        console.log('🏋️ Offline mode - skipping refresh');
        return;
      }

      const remote = await fetchRemoteExercises();
      if (remote && remote.length > 0) {
        saveCache(remote);
        const merged = mergeExercises(EXERCISE_DB, remote, config);
        setExercises(merged);
        setLastSync(Date.now());

        if (config.debugMode) {
          console.log('🏋️ Refresh completed - exercises loaded:', merged.length);
        }
      }
    } catch (error) {
      console.warn('🏋️ Exercise refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const config = getMigrationConfig();

    (async () => {
      if (navigator.onLine && config.enableBackend) {
        try {
          const remote = await fetchRemoteExercises();
          if (!mounted) return;

          if (remote && remote.length > 0) {
            saveCache(remote);
            const merged = mergeExercises(EXERCISE_DB, remote, config);
            setExercises(merged);
            setLastSync(Date.now());

            if (config.debugMode) {
              console.log('🏋️ Initial load completed - exercises loaded:', merged.length);
            }
          }
        } catch (error) {
          console.warn('🏋️ Initial remote load failed:', error);
        }
      }

      if (mounted) setLoading(false);
    })();

    const onOnline = () => { refresh(); };
    window.addEventListener('online', onOnline);

    return () => {
      mounted = false;
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]);

  return {
    exercises,
    loading,
    lastSync,
    refresh,
    migrationStats,
    missingDataInfo,
    config: getMigrationConfig()
  };
}

/**
 * Legacy export for backward compatibility
 * Returns base Exercise array for components that don't need migration features
 */
export function useBaseExercises() {
  const { exercises, loading, lastSync, refresh } = useExercises();

  // Convert back to base Exercise type for legacy components
  const baseExercises: Exercise[] = exercises.map(({
    dataSource,
    quality,
    matchInfo,
    libraryId,
    category,
    primaryMuscle,
    secondaryMuscles,
    instructions,
    metadata,
    isOriginal,
    migratedAt,
    version,
    ...exercise
  }) => exercise);

  return { exercises: baseExercises, loading, lastSync, refresh };
}
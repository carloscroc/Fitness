import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Exercise } from '../data/exercises.ts';
import type {
  ExerciseFilterOptions,
  ExerciseSortOptions,
  ExerciseSearchResult,
  ExerciseQuality,
  ExerciseWithSource
} from '../types/exercise.ts';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '') as string;
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string;

function makeNoopClient(): SupabaseClient {
  const noop = {
    from: (_table: string) => ({
      select: (_sel?: string) => ({
        // support .order(...)
        order: async () => ({ data: [], error: null }),
      }),
    }),
  } as unknown as SupabaseClient;
  return noop;
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set — using noop Supabase client');
}

export const supabase: SupabaseClient = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : makeNoopClient();

/**
 * Fetch exercises from Supabase 'exercises' table and map to local `Exercise` shape.
 * Adjust the field names if your Supabase table uses different columns.
 */
export async function fetchRemoteExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('Supabase fetchRemoteExercises error', error);
    return [];
  }

  return (data || []).map((row: any) => {
    const id = row.id !== undefined && row.id !== null ? String(row.id) : `sup-${row.name}`;
    return {
      id,
      name: row.name ?? row.title ?? '',
      muscle: row.muscle ?? row.category ?? 'General',
      equipment: row.equipment ?? 'None',
      image: row.image_url ?? row.image ?? '',
      video: row.video_url ?? row.video ?? undefined,
      description: row.description ?? row.overview ?? '',
      overview: row.overview ?? row.description ?? '',
      steps: row.steps ?? (row.instructions ? String(row.instructions).split('\n') : []),
      benefits: row.benefits ?? [],
      bpm: row.bpm ?? 0,
      difficulty: (row.difficulty as Exercise['difficulty']) ?? 'Beginner',
      videoContext: row.video_context ?? '',
      equipmentList: row.equipment_list ?? [],
      calories: row.calories ?? 0
    } as Exercise;
  });
}

// Cache for performance optimization
const exerciseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic cache helper
 */
function getCachedData<T>(key: string): T | null {
  const cached = exerciseCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  exerciseCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  exerciseCache.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Map database row to Exercise interface with enhanced field mapping
 */
function mapDbRowToExercise(row: any): Exercise {
  const id = row.id !== undefined && row.id !== null ? String(row.id) : `sup-${row.name}`;

  // Handle instructions from JSONB or fallback to string array
  let steps: string[] = [];
  if (row.instructions) {
    if (Array.isArray(row.instructions)) {
      steps = row.instructions;
    } else if (typeof row.instructions === 'string') {
      try {
        const parsed = JSON.parse(row.instructions);
        steps = Array.isArray(parsed) ? parsed : [row.instructions];
      } catch {
        steps = row.instructions.split('\n').filter(Boolean);
      }
    }
  }

  // Handle equipment array
  let equipmentString = 'None';
  if (row.equipment) {
    if (Array.isArray(row.equipment)) {
      equipmentString = row.equipment.join(', ');
    } else {
      equipmentString = String(row.equipment);
    }
  }

  return {
    id,
    name: row.name ?? row.title ?? '',
    muscle: row.primary_muscle ?? row.muscle ?? row.category ?? 'General',
    equipment: equipmentString,
    image: row.image_url ?? row.image ?? '',
    video: row.video_url ?? row.video ?? undefined,
    description: row.description ?? row.overview ?? '',
    overview: row.overview ?? row.description ?? '',
    steps,
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    bpm: row.bpm ?? 0,
    difficulty: (row.difficulty as Exercise['difficulty']) ?? 'Beginner',
    videoContext: row.video_context ?? '',
    equipmentList: Array.isArray(row.equipment) ? row.equipment : [],
    calories: row.calories ?? 0
  };
}

/**
 * Calculate exercise quality score based on available data
 */
function calculateExerciseQuality(exercise: Exercise): ExerciseQuality {
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

/**
 * Fetch only complete exercises (has video + instructions + benefits)
 */
export async function fetchCompleteExercises(): Promise<Exercise[]> {
  const cacheKey = 'complete_exercises';
  const cached = getCachedData<Exercise[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .not('video_url', 'is', null)
      .not('instructions', 'is', null)
      .not('benefits', 'is', null)
      .not('benefits', 'eq', '{}')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchCompleteExercises error', error);
      return [];
    }

    const exercises = (data || []).map(mapDbRowToExercise);
    setCachedData(cacheKey, exercises);
    return exercises;
  } catch (err) {
    console.error('Error fetching complete exercises:', err);
    return [];
  }
}

/**
 * Fetch exercises by category
 */
export async function fetchExercisesByCategory(category: string): Promise<Exercise[]> {
  if (!category) return [];

  const cacheKey = `exercises_category_${category}`;
  const cached = getCachedData<Exercise[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchExercisesByCategory error', error);
      return [];
    }

    const exercises = (data || []).map(mapDbRowToExercise);
    setCachedData(cacheKey, exercises);
    return exercises;
  } catch (err) {
    console.error('Error fetching exercises by category:', err);
    return [];
  }
}

/**
 * Fetch exercises by equipment type
 */
export async function fetchExercisesByEquipment(equipment: string): Promise<Exercise[]> {
  if (!equipment) return [];

  const cacheKey = `exercises_equipment_${equipment}`;
  const cached = getCachedData<Exercise[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .contains('equipment', [equipment])
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchExercisesByEquipment error', error);
      return [];
    }

    const exercises = (data || []).map(mapDbRowToExercise);
    setCachedData(cacheKey, exercises);
    return exercises;
  } catch (err) {
    console.error('Error fetching exercises by equipment:', err);
    return [];
  }
}

/**
 * Fetch exercises by primary muscle group
 */
export async function fetchExercisesByMuscleGroup(muscle: string): Promise<Exercise[]> {
  if (!muscle) return [];

  const cacheKey = `exercises_muscle_${muscle}`;
  const cached = getCachedData<Exercise[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('primary_muscle', muscle)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetchExercisesByMuscleGroup error', error);
      return [];
    }

    const exercises = (data || []).map(mapDbRowToExercise);
    setCachedData(cacheKey, exercises);
    return exercises;
  } catch (err) {
    console.error('Error fetching exercises by muscle group:', err);
    return [];
  }
}

/**
 * Advanced exercise search with multiple filters
 */
export async function searchExercises(
  query: string = '',
  filters: ExerciseFilterOptions = {},
  sort: ExerciseSortOptions = { field: 'name', direction: 'asc' },
  limit: number = 50,
  offset: number = 0
): Promise<ExerciseSearchResult> {
  const startTime = Date.now();

  // Create cache key based on all parameters
  const cacheKey = `search_${JSON.stringify({ query, filters, sort, limit, offset })}`;
  const cached = getCachedData<ExerciseSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    let supabaseQuery = supabase
      .from('exercises')
      .select('*', { count: 'exact' });

    // Apply text search if query provided
    if (query.trim()) {
      // Use PostgreSQL full-text search on name and overview
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,overview.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.categories?.length) {
      supabaseQuery = supabaseQuery.in('category', filters.categories);
    }

    if (filters.muscles?.length) {
      supabaseQuery = supabaseQuery.in('primary_muscle', filters.muscles);
    }

    if (filters.equipment?.length) {
      supabaseQuery = supabaseQuery.contains('equipment', filters.equipment);
    }

    if (filters.difficulty?.length) {
      supabaseQuery = supabaseQuery.in('difficulty', filters.difficulty);
    }

    if (filters.hasVideo === true) {
      supabaseQuery = supabaseQuery.not('video_url', 'is', null);
    } else if (filters.hasVideo === false) {
      supabaseQuery = supabaseQuery.is('video_url', null);
    }

    if (filters.hasImage === true) {
      supabaseQuery = supabaseQuery.not('image_url', 'is', null);
    } else if (filters.hasImage === false) {
      supabaseQuery = supabaseQuery.is('image_url', null);
    }

    if (filters.minCompleteness) {
      // For completeness filtering, we need to fetch and filter client-side
      // since it's a calculated metric
    }

    // Apply sorting
    const sortField = sort.field === 'completeness' ? 'name' : sort.field; // Fallback for complex field
    supabaseQuery = supabaseQuery.order(sortField, { ascending: sort.direction === 'asc' });

    // Apply pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.warn('Supabase searchExercises error', error);
      return {
        exercises: [],
        totalCount: 0,
        filteredCount: 0,
        searchTime: Date.now() - startTime
      };
    }

    let exercises = (data || []).map(mapDbRowToExercise);

    // Apply client-side filtering for completeness
    if (filters.minCompleteness) {
      exercises = exercises.filter(exercise => {
        const quality = calculateExerciseQuality(exercise);
        return quality.completeness >= filters.minCompleteness!;
      });
    }

    // Apply client-side sorting for completeness
    if (sort.field === 'completeness') {
      exercises.sort((a, b) => {
        const aQuality = calculateExerciseQuality(a);
        const bQuality = calculateExerciseQuality(b);
        return sort.direction === 'asc'
          ? aQuality.completeness - bQuality.completeness
          : bQuality.completeness - aQuality.completeness;
      });
    }

    const searchResult: ExerciseSearchResult = {
      exercises,
      totalCount: count || 0,
      filteredCount: exercises.length,
      searchTime: Date.now() - startTime,
      hasMore: offset + limit < (count || 0)
    };

    setCachedData(cacheKey, searchResult);
    return searchResult;
  } catch (err) {
    console.error('Error searching exercises:', err);
    return {
      exercises: [],
      totalCount: 0,
      filteredCount: 0,
      searchTime: Date.now() - startTime
    };
  }
}

/**
 * Get exercise quality metrics for a single exercise
 */
export async function getExerciseQuality(exerciseId: string): Promise<ExerciseQuality | null> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error || !data) {
      return null;
    }

    const exercise = mapDbRowToExercise(data);
    return calculateExerciseQuality(exercise);
  } catch (err) {
    console.error('Error getting exercise quality:', err);
    return null;
  }
}

/**
 * Get quality metrics for multiple exercises
 */
export async function getExercisesQualityBatch(exerciseIds: string[]): Promise<Map<string, ExerciseQuality>> {
  if (!exerciseIds.length) return new Map();

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .in('id', exerciseIds);

    if (error) {
      console.warn('Supabase getExercisesQualityBatch error', error);
      return new Map();
    }

    const qualityMap = new Map<string, ExerciseQuality>();
    (data || []).forEach(row => {
      const exercise = mapDbRowToExercise(row);
      const quality = calculateExerciseQuality(exercise);
      qualityMap.set(String(row.id), quality);
    });

    return qualityMap;
  } catch (err) {
    console.error('Error getting batch exercise quality:', err);
    return new Map();
  }
}

/**
 * Clear exercise cache (useful for data updates)
 */
export function clearExerciseCache(): void {
  exerciseCache.clear();
}

/**
 * Get exercise statistics for analytics
 */
export async function getExerciseStats(): Promise<{
  total: number;
  withVideo: number;
  withInstructions: number;
  withBenefits: number;
  complete: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  byEquipment: Record<string, number>;
}> {
  const cacheKey = 'exercise_stats';
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    // Get counts for quality metrics
    const { count: videoCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .not('video_url', 'is', null);

    const { count: instructionsCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .not('instructions', 'is', null);

    const { count: benefitsCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .not('benefits', 'is', null)
      .not('benefits', 'eq', '{}');

    // Get complete exercises (all three criteria)
    const { count: completeCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .not('video_url', 'is', null)
      .not('instructions', 'is', null)
      .not('benefits', 'is', null)
      .not('benefits', 'eq', '{}');

    // Get all exercises for category/difficulty/equipment analysis
    const { data: allExercises } = await supabase
      .from('exercises')
      .select('category, difficulty, equipment');

    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const byEquipment: Record<string, number> = {};

    (allExercises || []).forEach(exercise => {
      if (exercise.category) {
        byCategory[exercise.category] = (byCategory[exercise.category] || 0) + 1;
      }
      if (exercise.difficulty) {
        byDifficulty[exercise.difficulty] = (byDifficulty[exercise.difficulty] || 0) + 1;
      }
      if (Array.isArray(exercise.equipment)) {
        exercise.equipment.forEach((eq: string) => {
          if (eq) {
            byEquipment[eq] = (byEquipment[eq] || 0) + 1;
          }
        });
      }
    });

    const stats = {
      total: totalCount || 0,
      withVideo: videoCount || 0,
      withInstructions: instructionsCount || 0,
      withBenefits: benefitsCount || 0,
      complete: completeCount || 0,
      byCategory,
      byDifficulty,
      byEquipment
    };

    setCachedData(cacheKey, stats, 10 * 60 * 1000); // 10 minutes cache for stats
    return stats;
  } catch (err) {
    console.error('Error getting exercise stats:', err);
    return {
      total: 0,
      withVideo: 0,
      withInstructions: 0,
      withBenefits: 0,
      complete: 0,
      byCategory: {},
      byDifficulty: {},
      byEquipment: {}
    };
  }
}

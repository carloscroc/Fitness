import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Exercise } from '../data/exercises.ts';

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

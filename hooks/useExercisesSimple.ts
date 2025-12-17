import { useEffect, useState, useCallback } from 'react';
import { Exercise, EXERCISE_DB } from '../data/exercises';

const CACHE_KEY = 'exercises_local_cache_v1';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

type UseExercisesResult = {
  exercises: Exercise[];
  loading: boolean;
  lastSync: number | null;
  refresh: (force?: boolean) => Promise<void>;
};

async function fetchExercisesJson(): Promise<Exercise[] | null> {
  try {
    const res = await fetch('/exercises/exercises.json');
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json)) return null;
    return json as Exercise[];
  } catch (err) {
    console.warn('fetchExercisesJson failed', err);
    return null;
  }
}

function loadCache(): { ts: number; items: Exercise[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !Array.isArray(parsed.items)) return null;
    if (Date.now() - parsed.ts > CACHE_MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(items: Exercise[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch (e) {
    console.warn('Failed to save exercises cache', e);
  }
}

export function useExercisesSimple(): UseExercisesResult {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const cached = loadCache();
    if (cached) return cached.items;
    return EXERCISE_DB;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<number | null>(() => {
    const cached = loadCache();
    return cached ? cached.ts : null;
  });

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    try {
      if (!navigator.onLine && !force) {
        setLoading(false);
        return;
      }

      const remote = await fetchExercisesJson();
      if (remote && remote.length > 0) {
        setExercises(remote);
        saveCache(remote);
        setLastSync(Date.now());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Try to load remote metadata once on mount
      const cached = loadCache();
      if (cached && Date.now() - cached.ts < CACHE_MAX_AGE) {
        setLoading(false);
        return;
      }

      const remote = await fetchExercisesJson();
      if (!mounted) return;
      if (remote && remote.length > 0) {
        setExercises(remote);
        saveCache(remote);
        setLastSync(Date.now());
      }
      setLoading(false);
    })();

    const onOnline = () => { refresh(); };
    window.addEventListener('online', onOnline);

    return () => {
      mounted = false;
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]);

  return { exercises, loading, lastSync, refresh };
}

export function useBaseExercisesSimple() {
  const { exercises, loading, lastSync, refresh } = useExercisesSimple();
  return { exercises, loading, lastSync, refresh };
}

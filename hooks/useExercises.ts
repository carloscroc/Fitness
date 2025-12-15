import { useCallback, useEffect, useState } from 'react';
import { EXERCISE_DB, Exercise } from '../data/exercises';
import { fetchRemoteExercises } from '../services/supabaseClient';

const CACHE_KEY = 'fitness_exercises_cache_v1';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

function mergeLocalAndRemote(local: Exercise[], remote: Partial<Exercise>[] = []) {
  const byName = new Map<string, Exercise>();
  for (const l of local) byName.set(l.name, l);

  // Helper: normalize video URLs — convert YouTube watch/embed/short links to canonical embed URL
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
  for (const r of remote) {
    if (!r.name) continue;
    if (!byName.has(r.name)) {
      byName.set(r.name, {
        id: r.id ?? `sup-${r.name}`,
        name: r.name,
        muscle: (r.muscle as string) ?? 'General',
        equipment: (r.equipment as string) ?? 'None',
        image: (r.image as string) ?? '',
      video: normalizeVideoUrl((r.video as string) ?? undefined),
        overview: (r.overview as string) ?? '',
        steps: (r.steps as string[]) ?? [],
        benefits: (r.benefits as string[]) ?? [],
        bpm: (r.bpm as number) ?? 0,
        difficulty: (r.difficulty as 'Beginner'|'Intermediate'|'Advanced') ?? 'Beginner',
        videoContext: (r.videoContext as string) ?? '',
        equipmentList: (r.equipmentList as string[]) ?? [],
        calories: (r.calories as number) ?? 0
      });
    }
  }
  return Array.from(byName.values());
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !parsed.items) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(items: any[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch {}
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const cached = loadCache();
    if (cached && Array.isArray(cached.items) && (Date.now() - cached.ts) < CACHE_MAX_AGE) {
      return mergeLocalAndRemote(EXERCISE_DB, cached.items);
    }
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
      const remote = await fetchRemoteExercises();
      if (remote && remote.length > 0) {
        saveCache(remote);
        setExercises(prev => mergeLocalAndRemote(EXERCISE_DB, remote));
        setLastSync(Date.now());
      }
    } catch (e) {
      console.warn('useExercises refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (navigator.onLine) {
        try {
          const remote = await fetchRemoteExercises();
          if (!mounted) return;
          if (remote && remote.length > 0) {
            saveCache(remote);
            setExercises(mergeLocalAndRemote(EXERCISE_DB, remote));
            setLastSync(Date.now());
          }
        } catch (e) {
          console.warn('Initial remote load failed', e);
        }
      }
      if (mounted) setLoading(false);
    })();
    const onOnline = () => { refresh(); };
    window.addEventListener('online', onOnline);
    return () => { mounted = false; window.removeEventListener('online', onOnline); };
  }, [refresh]);

  return { exercises, loading, lastSync, refresh };
}

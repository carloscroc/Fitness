import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { Exercise } from '../data/exercises.ts'
import { EXERCISE_DB } from '../data/exercises.ts'
import {
  ExerciseWithSource,
  DataSource,
  createExerciseWithSource,
  type MigrationConfig,
  type MigrationStats
} from '../types/exercise'
import { fetchRemoteExercises } from '../services/supabaseClient'

// Enhanced configuration with better caching defaults
const EXERCISES_PER_PAGE = 20
const CACHE_KEYS = {
  exercises: ['exercises'],
  exercise: (id: string) => ['exercise', id],
  categories: ['exercise-categories'],
  search: (query: string) => ['exercise-search', query]
} as const

/**
 * Simple migration config for now
 */
function getMigrationConfig(): MigrationConfig {
  return {
    enableBackend: process.env.VITE_ENABLE_BACKEND_EXERCISES === 'true',
    enablePercentageRollout: false,
    rolloutPercentage: 0,
    preserveOriginalExercises: true,
    enableDataIndicators: true,
    debugMode: process.env.NODE_ENV === 'development'
  }
}

/**
 * Simple backend check
 */
function shouldLoadBackendExercises(): boolean {
  return process.env.VITE_ENABLE_BACKEND_EXERCISES === 'true'
}

/**
 * Normalize video URLs to YouTube embed format
 */
function normalizeVideoUrl(raw?: string): string | undefined {
  if (!raw) return undefined
  try {
    const url = raw.trim()
    // YouTube short link youtu.be/ID
    let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i)
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`
    // watch?v=ID or watch?v=ID&... or &t= -> extract v
    m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/i)
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`
    // embed/ID
    m = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i)
    if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`
    // If it's already an MP4 or other direct file, return as-is
    if (/\.(mp4|webm|ogg)(?:\?|$)/i.test(url)) return url
    return url
  } catch {
    return raw
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
    benefits: [],
    bpm: backendEx.bpm || 0,
    difficulty: backendEx.difficulty || 'Beginner',
    videoContext: '',
    equipmentList: Array.isArray(backendEx.equipment) ? backendEx.equipment : [backendEx.equipment || 'None'],
    calories: backendEx.calories || 0
  }

  return createExerciseWithSource(baseExercise, 'backend', {
    libraryId: backendEx.library_id,
    category: backendEx.category,
    primaryMuscle: backendEx.primary_muscle,
    secondaryMuscles: backendEx.secondary_muscles || [],
    instructions: backendEx.description,
    metadata: backendEx.metadata
  })
}

/**
 * Fetch exercises with filtering, pagination, and search
 */
async function fetchExercises({
  pageParam = 0,
  category = 'All',
  search = '',
  includeBackend = true
}): Promise<{
  exercises: ExerciseWithSource[]
  hasMore: boolean
  nextCursor?: number
}> {
  // Simulate minimal network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 50))

  const config = getMigrationConfig()
  let allExercises: ExerciseWithSource[]

  // Start with frontend exercises
  const frontendWithSource: ExerciseWithSource[] = EXERCISE_DB.map(ex =>
    createExerciseWithSource(ex, 'frontend', { isOriginal: true })
  )

  if (includeBackend && config.enableBackend && shouldLoadBackendExercises()) {
    try {
      const backendExercises = await fetchRemoteExercises()
      const backendWithSource: ExerciseWithSource[] = backendExercises.map(convertBackendExercise)

      // Remove duplicates by name (prioritize frontend)
      const frontendNames = new Set(frontendWithSource.map(ex => ex.name.toLowerCase()))
      const filteredBackend = backendWithSource.filter(
        ex => !frontendNames.has(ex.name.toLowerCase())
      )

      allExercises = [...frontendWithSource, ...filteredBackend]
    } catch (error) {
      console.warn('Failed to fetch backend exercises:', error)
      allExercises = frontendWithSource
    }
  } else {
    allExercises = frontendWithSource
  }

  // Apply category filter
  let filteredExercises = allExercises
  if (category !== 'All') {
    filteredExercises = allExercises.filter(ex =>
      ex.muscle === category ||
      ex.equipment.includes(category) ||
      ex.equipmentList.includes(category)
    )
  }

  // Apply search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase()
    filteredExercises = filteredExercises.filter(ex =>
      ex.name.toLowerCase().includes(searchLower) ||
      ex.overview.toLowerCase().includes(searchLower) ||
      ex.benefits.some(benefit => benefit.toLowerCase().includes(searchLower)) ||
      ex.steps.some(step => step.toLowerCase().includes(searchLower))
    )
  }

  // Apply pagination
  const startIndex = pageParam * EXERCISES_PER_PAGE
  const exercises = filteredExercises.slice(startIndex, startIndex + EXERCISES_PER_PAGE)
  const hasMore = startIndex + EXERCISES_PER_PAGE < filteredExercises.length

  return {
    exercises,
    hasMore,
    nextCursor: hasMore ? pageParam + 1 : undefined
  }
}

/**
 * Enhanced hook for infinite scrolling exercise list with caching
 */
export function useExercisesInfinite(category = 'All', search = '') {
  return useInfiniteQuery({
    queryKey: [...CACHE_KEYS.exercises, { category, search }],
    queryFn: ({ pageParam = 0 }) => fetchExercises({ pageParam, category, search }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status >= 400 && status < 500) return false
      }
      return failureCount < 3
    }
  })
}

/**
 * Hook for paginated exercises (alternative to infinite scroll)
 */
export function useExercisesPaginated(page = 0, category = 'All', search = '') {
  return useQuery({
    queryKey: [...CACHE_KEYS.exercises, { page, category, search, type: 'paginated' }],
    queryFn: () => fetchExercises({ pageParam: page, category, search }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    keepPreviousData: true // Keep previous data while loading new page
  })
}

/**
 * Hook for individual exercise with aggressive caching
 */
export function useExercise(id: string) {
  return useQuery({
    queryKey: CACHE_KEYS.exercise(id),
    queryFn: async () => {
      // Try to find in frontend exercises first
      const frontendEx = EXERCISE_DB.find(ex => ex.id === id)
      if (frontendEx) {
        return createExerciseWithSource(frontendEx, 'frontend', { isOriginal: true })
      }

      // If not found, try to fetch from backend
      const config = getMigrationConfig()
      if (config.enableBackend && shouldLoadBackendExercises()) {
        try {
          const backendExercises = await fetchRemoteExercises()
          const backendWithSource = backendExercises.map(convertBackendExercise)
          const exercise = backendWithSource.find(ex => ex.id === id || ex.libraryId === id)
          if (exercise) return exercise
        } catch (error) {
          console.warn('Failed to fetch exercise from backend:', error)
        }
      }

      throw new Error(`Exercise with id ${id} not found`)
    },
    staleTime: 1000 * 60 * 30, // Cache individual exercises for 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
    enabled: !!id // Only run query if we have an ID
  })
}

/**
 * Hook for exercise search with debounced caching
 */
export function useExerciseSearch(query: string, delay = 300) {
  return useQuery({
    queryKey: CACHE_KEYS.search(query),
    queryFn: async () => {
      if (!query.trim()) return []
      return fetchExercises({ pageParam: 0, search: query }).then(result => result.exercises)
    },
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep for 30 minutes
    enabled: query.trim().length > 2 // Only search after 3 characters
  })
}

/**
 * Hook for prefetching exercises (performance optimization)
 */
export function usePrefetchExercises() {
  const queryClient = useQueryClient()

  return {
    prefetchExercise: useCallback((id: string) => {
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.exercise(id),
        queryFn: async () => {
          const frontendEx = EXERCISE_DB.find(ex => ex.id === id)
          if (frontendEx) {
            return createExerciseWithSource(frontendEx, 'frontend', { isOriginal: true })
          }
          throw new Error(`Exercise with id ${id} not found`)
        },
        staleTime: 1000 * 60 * 30
      })
    }, [queryClient]),

    prefetchCategory: useCallback((category: string) => {
      queryClient.prefetchInfiniteQuery({
        queryKey: [...CACHE_KEYS.exercises, { category, search: '' }],
        queryFn: ({ pageParam = 0 }) => fetchExercises({ pageParam, category }),
        initialPageParam: 0,
        staleTime: 1000 * 60 * 10
      })
    }, [queryClient]),

    prefetchSearch: useCallback((query: string) => {
      if (query.trim().length > 2) {
        queryClient.prefetchQuery({
          queryKey: CACHE_KEYS.search(query),
          queryFn: async () => {
            return fetchExercises({ pageParam: 0, search: query }).then(result => result.exercises)
          },
          staleTime: 1000 * 60 * 5
        })
      }
    }, [queryClient])
  }
}

/**
 * Hook for exercise statistics and migration info
 */
export function useExerciseStats() {
  return useQuery({
    queryKey: ['exercise-stats'],
    queryFn: async () => {
      const exercises = EXERCISE_DB.map(ex =>
        createExerciseWithSource(ex, 'frontend', { isOriginal: true })
      )

      const config = getMigrationConfig()
      let backendCount = 0

      if (config.enableBackend && shouldLoadBackendExercises()) {
        try {
          const backendExercises = await fetchRemoteExercises()
          backendCount = backendExercises.length
        } catch (error) {
          console.warn('Failed to fetch backend stats:', error)
        }
      }

      return {
        frontendCount: exercises.length,
        backendCount,
        totalCount: exercises.length + backendCount,
        categories: [...new Set(exercises.map(ex => ex.muscle))],
        equipmentTypes: [...new Set(exercises.flatMap(ex => ex.equipmentList))]
      }
    },
    staleTime: 1000 * 60 * 60, // Cache stats for 1 hour
    gcTime: 1000 * 60 * 60 * 2 // Keep for 2 hours
  })
}

/**
 * Utility to invalidate exercise caches
 */
export function useInvalidateExercises() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.exercises })
    }, [queryClient]),

    invalidateExercise: useCallback((id: string) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.exercise(id) })
    }, [queryClient]),

    invalidateSearch: useCallback((query: string) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.search(query) })
    }, [queryClient])
  }
}
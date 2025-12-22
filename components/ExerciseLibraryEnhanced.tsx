import React, { useState, useCallback } from 'react'
import { Search, Filter, Loader, ChevronDown } from 'lucide-react'
import { useExercisesInfinite, useExerciseStats, useInvalidateExercises } from '../hooks/useExercisesEnhanced.ts'
import { LazyExerciseDetailModal } from './LazyModal.tsx'
import { Button } from './ui/Button.tsx'

interface ExerciseLibraryEnhancedProps {
  onNavigate?: (view: string, exerciseId?: string) => void
  onAddToSchedule?: (exercise: any) => void
  initialCategory?: string
  initialSearch?: string
}

const EXERCISE_CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio']

export function ExerciseLibraryEnhanced({
  onNavigate,
  onAddToSchedule,
  initialCategory = 'All',
  initialSearch = ''
}: ExerciseLibraryEnhancedProps) {
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Use enhanced infinite scroll hook with caching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    error
  } = useExercisesInfinite(category, debouncedSearch)

  // Get exercise statistics
  const { data: stats } = useExerciseStats()

  // Cache invalidation utility
  const { invalidateAll, invalidateExercise } = useInvalidateExercises()

  // Handle exercise selection
  const handleExerciseClick = useCallback((exerciseId: string) => {
    setSelectedExercise(exerciseId)
  }, [])

  // Handle infinite scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    invalidateAll()
  }, [invalidateAll])

  // Extract all exercises from paginated data
  const exercises = data?.pages.flatMap(page => page.exercises) || []

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with search and filters */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Category filters */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap mb-4">
            {EXERCISE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Stats bar */}
        {stats && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {exercises.length} exercises found
              {category !== 'All' && ` in ${category}`}
              {search && ` for "${search}"`}
            </span>
            <div className="flex items-center gap-4">
              <span>Backend: {stats.backendCount}</span>
              <span>Categories: {stats.categories?.length || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
        {isLoading && exercises.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader size="lg" />
            <p className="ml-4 text-gray-600">Loading exercises...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load exercises</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No exercises found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise.id)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                  {exercise.image ? (
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No image</p>
                      </div>
                    </div>
                  )}

                  {/* Data source indicator */}
                  {exercise.dataSource && (
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white ${
                          exercise.dataSource === 'backend'
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                        }`}
                        title={`Source: ${exercise.dataSource}`}
                      />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{exercise.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {exercise.muscle} • {exercise.equipment}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{exercise.difficulty}</span>
                  <span>{exercise.calories} cal</span>
                </div>

                {/* Quality indicators */}
                <div className="flex items-center gap-1 mt-2">
                  {exercise.quality.hasVideo && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Video
                    </span>
                  )}
                  {exercise.quality.hasInstructions && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      Steps
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center p-8">
            <Loader size="sm" />
            <span className="ml-2 text-gray-600">Loading more...</span>
          </div>
        )}
      </div>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <LazyExerciseDetailModal
          exerciseId={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAddToSchedule={onAddToSchedule}
          onNavigate={onNavigate}
        />
      )}

      {/* Refresh button */}
      {isRefetching && (
        <div className="absolute top-4 right-4">
          <Loader size="sm" />
        </div>
      )}
    </div>
  )
}
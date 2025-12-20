import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  Clock,
  Star,
  Video,
  Image,
  FileText,
  Heart,
  Zap,
  AlertCircle,
  Grid3x3,
  List
} from 'lucide-react';
import { Exercise } from '../data/exercises';
import { ExerciseWithSource, ExerciseSearchResult } from '../types/exercise';
import { Button } from './ui/Button';
import { DIFFICULTY_LEVELS } from '../constants/exerciseFilters';

interface ExerciseSearchResultsProps {
  searchResult: ExerciseSearchResult | null;
  searchQuery?: string;
  onExerciseSelect?: (exercise: Exercise | ExerciseWithSource) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showQualityIndicators?: boolean;
  className?: string;
}

// Text highlighting utility
const highlightText = (text: string, highlight: string): string => {
  if (!highlight.trim()) return text;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase()
      ? `<mark class="bg-[#0A84FF]/30 text-white px-1 rounded">${part}</mark>`
      : part
  ).join('');
};

// Exercise Card Component
const ExerciseCard: React.FC<{
  exercise: Exercise | ExerciseWithSource;
  searchQuery?: string;
  onSelect?: (exercise: Exercise | ExerciseWithSource) => void;
  showQualityIndicators?: boolean;
}> = ({ exercise, searchQuery, onSelect, showQualityIndicators = true }) => {
  const hasQuality = 'quality' in exercise;
  const quality = hasQuality ? exercise.quality : null;

  const highlightedName = searchQuery
    ? highlightText(exercise.name, searchQuery)
    : exercise.name;

  const highlightedMuscle = searchQuery
    ? highlightText(exercise.muscle, searchQuery)
    : exercise.muscle;

  const highlightedEquipment = searchQuery
    ? highlightText(exercise.equipment, searchQuery)
    : exercise.equipment;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(exercise)}
      className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-200"
    >
      {/* Exercise Image */}
      <div className="aspect-video relative overflow-hidden bg-[#2C2C2E]">
        {exercise.image ? (
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">💪</div>
          </div>
        )}

        {/* Quality Indicators */}
        {showQualityIndicators && quality && (
          <div className="absolute top-2 right-2 flex gap-1">
            {quality.hasVideo && (
              <div className="p-1.5 bg-black/60 rounded-full" title="Has Video">
                <Video className="w-3 h-3 text-green-400" />
              </div>
            )}
            {quality.hasImage && (
              <div className="p-1.5 bg-black/60 rounded-full" title="Has Image">
                <Image className="w-3 h-3 text-blue-400" />
              </div>
            )}
            {quality.hasInstructions && (
              <div className="p-1.5 bg-black/60 rounded-full" title="Has Instructions">
                <FileText className="w-3 h-3 text-purple-400" />
              </div>
            )}
          </div>
        )}

        {/* Quality Score */}
        {showQualityIndicators && quality && (
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-full">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white font-medium">
                {quality.completeness}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Info */}
      <div className="p-4">
        <h3
          className="text-white font-semibold mb-2 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: highlightedName }}
        />

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <span
            className="px-2 py-1 bg-[#2C2C2E] rounded"
            dangerouslySetInnerHTML={{ __html: highlightedMuscle }}
          />
          <span
            className="px-2 py-1 bg-[#2C2C2E] rounded"
            dangerouslySetInnerHTML={{ __html: highlightedEquipment }}
          />
        </div>

        {/* Exercise Details */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {exercise.difficulty && (
              <span
                className={`px-2 py-1 rounded font-medium ${
                  exercise.difficulty === 'Beginner'
                    ? 'bg-green-500/20 text-green-400'
                    : exercise.difficulty === 'Intermediate'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {exercise.difficulty}
              </span>
            )}

            {exercise.calories > 0 && (
              <span className="flex items-center gap-1 text-gray-400">
                <Zap className="w-3 h-3" />
                {exercise.calories} cal
              </span>
            )}
          </div>

          {exercise.bpm > 0 && (
            <span className="flex items-center gap-1 text-gray-400">
              <Heart className="w-3 h-3" />
              {exercise.bpm} BPM
            </span>
          )}
        </div>

        {/* Description Preview */}
        {exercise.overview && (
          <p className="mt-3 text-xs text-gray-500 line-clamp-2">
            {exercise.overview}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Loading Skeleton Component
const ExerciseCardSkeleton: React.FC = () => (
  <div className="bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden">
    <div className="aspect-video bg-[#2C2C2E] animate-pulse" />
    <div className="p-4">
      <div className="h-5 bg-[#2C2C2E] rounded mb-2 animate-pulse" />
      <div className="h-4 bg-[#2C2C2E] rounded w-3/4 mb-3 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-6 bg-[#2C2C2E] rounded w-16 animate-pulse" />
        <div className="h-6 bg-[#2C2C2E] rounded w-20 animate-pulse" />
      </div>
    </div>
  </div>
);

// No Results Component
const NoResults: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
  suggestions?: string[];
}> = ({ searchQuery, onClearSearch, suggestions }) => (
  <div className="text-center py-12">
    <div className="mb-4">
      <div className="w-16 h-16 bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        {searchQuery ? 'No exercises found' : 'Start searching for exercises'}
      </h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        {searchQuery
          ? `No exercises match "${searchQuery}". Try different keywords or filters.`
          : 'Use the search bar above to find exercises by name, muscle group, equipment, or use advanced operators.'}
      </p>
    </div>

    {searchQuery && (
      <Button variant="ghost" onClick={onClearSearch} className="mt-4">
        Clear Search
      </Button>
    )}

    {suggestions && suggestions.length > 0 && (
      <div className="mt-6">
        <p className="text-gray-400 text-sm mb-3">Try these searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onClearSearch?.()}
              className="px-3 py-1.5 bg-[#2C2C2E] text-white text-sm rounded-lg hover:bg-[#3A3A3C] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const ExerciseSearchResults: React.FC<ExerciseSearchResultsProps> = ({
  searchResult,
  searchQuery,
  onExerciseSelect,
  onLoadMore,
  isLoading,
  viewMode = 'grid',
  onViewModeChange,
  showQualityIndicators = true,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pagination logic
  const paginatedExercises = useMemo(() => {
    if (!searchResult?.exercises) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchResult.exercises.slice(startIndex, startIndex + itemsPerPage);
  }, [searchResult?.exercises, currentPage]);

  const totalPages = useMemo(() => {
    if (!searchResult?.exercises) return 0;
    return Math.ceil(searchResult.exercises.length / itemsPerPage);
  }, [searchResult?.exercises]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Load more if needed
    if (page === totalPages && searchResult?.hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [totalPages, searchResult?.hasMore, onLoadMore]);

  // Search suggestions when no results
  const searchSuggestions = useMemo(() => {
    if (searchQuery) return [];

    return [
      'chest',
      'legs',
      'equipment:barbell',
      'difficulty:beginner',
      'video:true',
      'equipment:dumbbell muscle:arms'
    ];
  }, [searchQuery]);

  if (!searchResult && !isLoading) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Results Header */}
      {searchResult && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold text-lg">
              Search Results
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{searchResult.filteredCount} exercises</span>
              {searchResult.searchTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {searchResult.searchTime}ms
                </span>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center gap-1 bg-[#1C1C1E] border border-white/10 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !searchResult && (
        <div className={`grid gap-4 ${
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ExerciseCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchResult?.exercises.length === 0 && (
        <NoResults
          searchQuery={searchQuery}
          onClearSearch={() => {
            // This would need to be passed from parent
          }}
          suggestions={searchSuggestions}
        />
      )}

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {searchResult?.exercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {paginatedExercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                searchQuery={searchQuery}
                onSelect={onExerciseSelect}
                showQualityIndicators={showQualityIndicators}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading More */}
      {isLoading && searchResult && (
        <div className={`grid gap-4 mt-4 ${
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ExerciseCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="ghost"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Show More for Infinite Scroll */}
      {searchResult?.hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            isLoading={isLoading}
            className="w-full max-w-xs"
          >
            Load More Exercises
          </Button>
        </div>
      )}
    </div>
  );
};
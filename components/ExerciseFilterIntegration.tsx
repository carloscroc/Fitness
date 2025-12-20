/**
 * ExerciseFilterIntegration Component
 *
 * This component provides a drop-in replacement for the existing filter functionality
 * in ExerciseLibraryModal, integrating all the advanced filtering components
 * with seamless backwards compatibility.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ExerciseFilterPanel from './ExerciseFilterPanel';
import { Button } from './ui/Button';
import {
  ExerciseFilterOptions,
  ExerciseSortOptions,
  MuscleGroup,
  EquipmentType,
  ExerciseCategory,
  DifficultyLevel
} from '../constants/exerciseFilters';

interface ExerciseFilterIntegrationProps {
  // Filter state
  filters: ExerciseFilterOptions;
  onFiltersChange: (filters: ExerciseFilterOptions) => void;

  // Sort state
  sortBy: ExerciseSortOptions;
  onSortChange: (sort: ExerciseSortOptions) => void;

  // Search state
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Results and loading
  totalResults?: number;
  isLoading?: boolean;

  // UI options
  compact?: boolean;
  disabled?: boolean;

  // Integration options
  integrateWithLibraryModal?: boolean;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

/**
 * Enhanced filter integration component that provides advanced filtering
 * capabilities while maintaining backwards compatibility.
 */
export const ExerciseFilterIntegration: React.FC<ExerciseFilterIntegrationProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  totalResults,
  isLoading = false,
  compact = false,
  disabled = false,
  integrateWithLibraryModal = false,
  onApplyFilters,
  onResetFilters
}) => {
  // Local state for managing filter panel
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(!compact);
  const [showQuickFilters, setShowQuickFilters] = useState(true);

  // Calculate active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.muscles?.length) count++;
    if (filters.equipment?.length) count++;
    if (filters.categories?.length) count++;
    if (filters.difficulty?.length) count++;
    if (filters.minCompleteness && filters.minCompleteness > 0) count++;
    if (filters.hasVideo) count++;
    if (filters.hasImage) count++;
    return count;
  }, [filters]);

  // Handle search with debounce
  const handleSearch = useCallback((query: string) => {
    onSearchChange(query);
  }, [onSearchChange]);

  // Handle filter application (for integration)
  const handleApplyFilters = useCallback(() => {
    if (onApplyFilters) {
      onApplyFilters();
    } else if (integrateWithLibraryModal) {
      // Close filter panel when integrated with modal
      setIsFilterPanelOpen(false);
    }
  }, [onApplyFilters, integrateWithLibraryModal]);

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      // Default reset behavior
      onFiltersChange({});
      onSearchChange('');
      onSortChange({ field: 'name', direction: 'asc' });
    }
  }, [onResetFilters, onFiltersChange, onSearchChange, onSortChange]);

  // Generate filter summary for display
  const filterSummary = useMemo(() => {
    const summary: string[] = [];

    if (filters.muscles?.length) {
      summary.push(`${filters.muscles.length} muscles`);
    }
    if (filters.equipment?.length) {
      summary.push(`${filters.equipment.length} equipment`);
    }
    if (filters.categories?.length) {
      summary.push(`${filters.categories.length} categories`);
    }
    if (filters.difficulty?.length) {
      summary.push(`${filters.difficulty.length} difficulty levels`);
    }

    return summary.join(', ');
  }, [filters]);

  // Compact mode - minimal filter UI
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: isFilterPanelOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>▼</span>
            </motion.div>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="text-sm text-zinc-400">
              {filterSummary}
            </div>
          )}

          {/* Results Count */}
          {totalResults !== undefined && (
            <div className="text-sm text-zinc-400">
              {totalResults} results
            </div>
          )}
        </div>

        {/* Expandable Filter Panel */}
        <motion.div
          initial={false}
          animate={{
            height: isFilterPanelOpen ? 'auto' : 0,
            opacity: isFilterPanelOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <ExerciseFilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            totalResults={totalResults}
            isLoading={isLoading}
            compact={true}
            disabled={disabled}
            onSearch={handleSearch}
          />
        </motion.div>

        {/* Action Buttons */}
        {isFilterPanelOpen && activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              disabled={disabled}
              className="flex-1"
            >
              Reset All
            </Button>
            <Button
              variant="brand"
              onClick={handleApplyFilters}
              disabled={disabled}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Full mode - complete filter interface
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by exercise name, muscle, or equipment..."
          disabled={disabled}
          className="w-full pl-12 pr-4 py-4 bg-[#1C1C1E] border border-white/10 rounded-[20px] text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          🔍
        </div>
      </div>

      {/* Main Filter Panel */}
      <ExerciseFilterPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        totalResults={totalResults}
        isLoading={isLoading}
        disabled={disabled}
        onSearch={handleSearch}
      />

      {/* Integration-specific UI */}
      {integrateWithLibraryModal && (
        <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Filter Summary
          </h3>

          <div className="space-y-3 mb-6">
            {activeFilterCount === 0 ? (
              <p className="text-zinc-500 text-sm">
                No filters applied. Showing all exercises.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Active Filters:</span>
                  <span className="text-white font-medium">{activeFilterCount}</span>
                </div>
                {totalResults !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Results:</span>
                    <span className="text-white font-medium">{totalResults} exercises</span>
                  </div>
                )}
                {filterSummary && (
                  <div className="text-zinc-400 text-sm">
                    {filterSummary}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              disabled={disabled}
              className="flex-1"
            >
              Reset Filters
            </Button>
            <Button
              variant="brand"
              onClick={handleApplyFilters}
              disabled={disabled}
              className="flex-1"
            >
              Apply & Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseFilterIntegration;

/**
 * Hook for easy integration with existing ExerciseLibraryModal
 * This hook provides state management and handlers for the filter integration.
 */
export const useExerciseFilterIntegration = (
  initialFilters: ExerciseFilterOptions = {},
  initialSortBy: ExerciseSortOptions = { field: 'name', direction: 'asc' },
  initialSearchQuery: string = ''
) => {
  // Filter state
  const [filters, setFilters] = useState<ExerciseFilterOptions>(initialFilters);
  const [sortBy, setSortBy] = useState<ExerciseSortOptions>(initialSortBy);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has('muscles') || params.has('equipment') || params.has('categories')) {
      const urlFilters: ExerciseFilterOptions = {};

      if (params.get('muscles')) {
        urlFilters.muscles = params.get('muscles')!.split(',') as MuscleGroup[];
      }
      if (params.get('equipment')) {
        urlFilters.equipment = params.get('equipment')!.split(',') as EquipmentType[];
      }
      if (params.get('categories')) {
        urlFilters.categories = params.get('categories')!.split(',') as ExerciseCategory[];
      }
      if (params.get('difficulty')) {
        urlFilters.difficulty = params.get('difficulty')!.split(',') as DifficultyLevel[];
      }
      if (params.get('minQuality')) {
        urlFilters.minCompleteness = parseInt(params.get('minQuality')!);
      }
      if (params.get('hasVideo') === 'true') {
        urlFilters.hasVideo = true;
      }
      if (params.get('hasImage') === 'true') {
        urlFilters.hasImage = true;
      }

      setFilters(urlFilters);

      // Load sort
      if (params.get('sortBy')) {
        setSortBy({
          field: params.get('sortBy') as any,
          direction: (params.get('sortOrder') as any) || 'asc'
        });
      }

      // Load search query
      if (params.get('search')) {
        setSearchQuery(params.get('search')!);
      }
    }
  }, []);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // Add filter parameters
    if (filters.muscles?.length) {
      params.set('muscles', filters.muscles.join(','));
    }
    if (filters.equipment?.length) {
      params.set('equipment', filters.equipment.join(','));
    }
    if (filters.categories?.length) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.difficulty?.length) {
      params.set('difficulty', filters.difficulty.join(','));
    }
    if (filters.minCompleteness) {
      params.set('minQuality', filters.minCompleteness.toString());
    }
    if (filters.hasVideo) {
      params.set('hasVideo', 'true');
    }
    if (filters.hasImage) {
      params.set('hasImage', 'true');
    }

    // Add sort parameters
    if (sortBy.field !== 'name' || sortBy.direction !== 'asc') {
      params.set('sortBy', sortBy.field);
      params.set('sortOrder', sortBy.direction);
    }

    // Add search query
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    // Update URL without page reload
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  }, [filters, sortBy, searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: ExerciseFilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortBy: ExerciseSortOptions) => {
    setSortBy(newSortBy);
  }, []);

  const handleSearchChange = useCallback((newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSortBy({ field: 'name', direction: 'asc' });
    setSearchQuery('');
  }, []);

  // Generate shareable URL
  const getShareableURL = useCallback(() => {
    const params = new URLSearchParams();

    // Add filter parameters
    if (filters.muscles?.length) {
      params.set('muscles', filters.muscles.join(','));
    }
    if (filters.equipment?.length) {
      params.set('equipment', filters.equipment.join(','));
    }
    if (filters.categories?.length) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.difficulty?.length) {
      params.set('difficulty', filters.difficulty.join(','));
    }
    if (filters.minCompleteness) {
      params.set('minQuality', filters.minCompleteness.toString());
    }
    if (filters.hasVideo) {
      params.set('hasVideo', 'true');
    }
    if (filters.hasImage) {
      params.set('hasImage', 'true');
    }

    // Add sort parameters
    params.set('sortBy', sortBy.field);
    params.set('sortOrder', sortBy.direction);

    // Add search query
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [filters, sortBy, searchQuery]);

  return {
    // State
    filters,
    sortBy,
    searchQuery,

    // Handlers
    handleFiltersChange,
    handleSortChange,
    handleSearchChange,
    resetFilters,

    // Utilities
    getShareableURL,

    // Computed values
    hasActiveFilters: Object.keys(filters).length > 0 || searchQuery.length > 0
  };
};
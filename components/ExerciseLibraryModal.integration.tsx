/**
 * Integration Example: Updated ExerciseLibraryModal using ExerciseCard
 *
 * This file demonstrates how to integrate the new ExerciseCard component
 * into the existing ExerciseLibraryModal for better consistency and performance.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, ChevronRight, Filter, Plus, Edit2, Check, Database, Zap,
  ChevronDown, ChevronUp, Loader2, Star, Video, Image, FileText,
  TrendingUp, Clock, Award, Grid3x3, List, ArrowUpDown,
  XCircle, CheckCircle
} from 'lucide-react';
import { Exercise } from '../data/exercises.ts';
import { useExercises, useBaseExercises } from '../hooks/useExercises';
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx';
import { Button } from './ui/Button.tsx';
import { ExerciseWithSource, ExerciseFilterOptions, ExerciseSortOptions } from '../types/exercise';
import { isFeatureEnabled } from '../services/featureFlags';
import { ExerciseCard } from './ExerciseCard.tsx'; // Import the new component

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (exercise: Exercise) => void;
  onMultiSelect?: (exercises: Exercise[]) => void;
  mode?: 'view' | 'select';
  multiSelect?: boolean;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen, onClose, onSelect, onMultiSelect, mode = 'view', multiSelect = false
}) => {
  // Core state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [pendingAutoPlay, setPendingAutoPlay] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Advanced filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [minQuality, setMinQuality] = useState<number>(0);
  const [hasVideoOnly, setHasVideoOnly] = useState(false);
  const [hasImageOnly, setHasImageOnly] = useState(false);

  // Sort state
  const [sortBy, setSortBy] = useState<ExerciseSortOptions>({ field: 'name', direction: 'asc' });
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Use the enhanced hook for migration support
  const { exercises: ALL_EXERCISES_WITH_SOURCE, loading, migrationStats } = useExercises();

  // Filter and sort exercises
  const filteredExercises = useMemo(() => {
    let filtered = ALL_EXERCISES_WITH_SOURCE || [];

    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.muscle.toLowerCase().includes(query) ||
        exercise.equipment.toLowerCase().includes(query) ||
        exercise.overview?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (!selectedCategories.includes('All')) {
      filtered = filtered.filter(exercise =>
        selectedCategories.includes(exercise.muscle)
      );
    }

    // Apply equipment filter
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedEquipment.includes(exercise.equipment) ||
        exercise.equipmentList?.some(eq => selectedEquipment.includes(eq))
      );
    }

    // Apply muscle filter
    if (selectedMuscles.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedMuscles.includes(exercise.muscle)
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(exercise =>
        selectedDifficulty.includes(exercise.difficulty)
      );
    }

    // Apply quality filter
    if (minQuality > 0) {
      filtered = filtered.filter((exercise: ExerciseWithSource) =>
        exercise.quality?.completeness >= minQuality
      );
    }

    // Apply video/image filters
    if (hasVideoOnly) {
      filtered = filtered.filter(exercise => !!exercise.video);
    }

    if (hasImageOnly) {
      filtered = filtered.filter(exercise => !!exercise.image);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];

      if (sortBy.field === 'completeness') {
        const aQuality = (a as ExerciseWithSource).quality?.completeness || 0;
        const bQuality = (b as ExerciseWithSource).quality?.completeness || 0;
        return sortBy.direction === 'asc' ? aQuality - bQuality : bQuality - aQuality;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortBy.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortBy.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [
    ALL_EXERCISES_WITH_SOURCE,
    searchQuery,
    selectedCategories,
    selectedEquipment,
    selectedMuscles,
    selectedDifficulty,
    minQuality,
    hasVideoOnly,
    hasImageOnly,
    sortBy
  ]);

  // Event handlers
  const handleExerciseSelect = useCallback((exercise: Exercise | ExerciseWithSource) => {
    if (multiSelect) {
      // For multi-select mode, show detail modal
      setSelectedExercise(exercise);
      setPendingAutoPlay(false);
    } else if (mode === 'select' && onSelect) {
      // For single-select mode, call onSelect and close
      onSelect(exercise);
      onClose();
    } else {
      // For view mode, show detail modal
      setSelectedExercise(exercise);
      setPendingAutoPlay(false);
    }
  }, [multiSelect, mode, onSelect, onClose]);

  const handleMultiSelectToggle = useCallback((exerciseId: string, isSelected: boolean) => {
    setSelectedIds(prev => {
      if (isSelected) {
        return [...prev, exerciseId];
      } else {
        return prev.filter(id => id !== exerciseId);
      }
    });
  }, []);

  const handleAddToWorkout = useCallback((action?: 'SCHEDULE' | 'START', date?: string) => {
    if (multiSelect && selectedIds.length > 0 && onMultiSelect) {
      const selectedExercises = filteredExercises.filter(exercise =>
        selectedIds.includes(exercise.id)
      );
      onMultiSelect(selectedExercises);
      setSelectedIds([]);
    } else if (selectedExercise && onSelect) {
      onSelect(selectedExercise);
    }
    setSelectedExercise(null);
  }, [multiSelect, selectedIds, filteredExercises, onMultiSelect, onSelect]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      !selectedCategories.includes('All'),
      selectedEquipment.length > 0,
      selectedMuscles.length > 0,
      selectedDifficulty.length > 0,
      minQuality > 0,
      hasVideoOnly,
      hasImageOnly
    ].filter(Boolean).length;
  }, [
    selectedCategories,
    selectedEquipment,
    selectedMuscles,
    selectedDifficulty,
    minQuality,
    hasVideoOnly,
    hasImageOnly
  ]);

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-[#09090b] w-full h-[90vh] md:h-[85vh] md:w-[90vw] xl:w-[95vw] max-w-7xl rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-display text-white">Exercise Library</h2>
            {migrationStats && (
              <div className="hidden lg:flex items-center gap-3 text-xs text-zinc-500">
                <span>{filteredExercises.length} exercises</span>
                <span>•</span>
                <span>{migrationStats.totalFrontendExercises + migrationStats.totalBackendExercises} total</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#1C1C1E] rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid3x3 size={14} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List size={14} />
                List
              </button>
            </div>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-10 h-10 rounded-full p-0"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-[20px] py-4 pl-12 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors font-medium text-[15px]"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="text-xs text-blue-400 font-medium">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`w-8 h-8 rounded-full p-0 ${activeFilterCount > 0 ? 'bg-blue-500 text-white' : ''}`}
              >
                <Filter size={14} />
              </Button>
            </div>
          </div>

          {/* Filter Panel - Simplified for this example */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1C1C1E] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategories(['All']);
                        setSelectedEquipment([]);
                        setSelectedMuscles([]);
                        setSelectedDifficulty([]);
                        setMinQuality(0);
                        setHasVideoOnly(false);
                        setHasImageOnly(false);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Legs', 'Chest', 'Back', 'Arms', 'Shoulders'].map(muscle => (
                    <button
                      key={muscle}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(muscle)
                            ? prev.filter(c => c !== muscle && c !== 'All')
                            : [...prev.filter(c => c !== 'All'), muscle]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategories.includes(muscle)
                          ? 'bg-blue-500 text-white'
                          : 'bg-[#2C2C2E] text-zinc-400 border border-white/10'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                  <button
                    onClick={() => setHasVideoOnly(!hasVideoOnly)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                      hasVideoOnly
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#2C2C2E] text-zinc-400 border border-white/10'
                    }`}
                  >
                    <Video size={10} />
                    Video Only
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise Grid/List - USING NEW EXERCISE CARD */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {[...Array(8)].map((_, i) => (
                <ExerciseCard
                  key={`skeleton-${i}`}
                  variant={viewMode === 'grid' ? 'grid' : 'list'}
                  isLoading
                />
              ))}
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4">
                <Search size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No exercises found</h3>
              <p className="text-zinc-400 mb-4">Try adjusting your search or filters</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories(['All']);
                  setSelectedEquipment([]);
                  setSelectedMuscles([]);
                  setSelectedDifficulty([]);
                  setMinQuality(0);
                  setHasVideoOnly(false);
                  setHasImageOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredExercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  variant={viewMode === 'grid' ? 'grid' : 'list'}
                  multiSelect={multiSelect}
                  selected={selectedIds.includes(exercise.id)}
                  onSelect={handleExerciseSelect}
                  onMultiSelectToggle={handleMultiSelectToggle}
                  showQualityIndicator
                  showDataSource={isFeatureEnabled('SHOW_DATA_SOURCE_INDICATORS', false)}
                  animationDelay={index * 0.05}
                  testId={`exercise-card-${exercise.id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {((multiSelect && selectedIds.length > 0) || (mode === 'select' && !multiSelect)) && (
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                {multiSelect && (
                  <span>{selectedIds.length} exercise{selectedIds.length !== 1 ? 's' : ''} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                {multiSelect && (
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear Selection
                  </Button>
                )}
                <Button
                  onClick={handleAddToWorkout}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  {multiSelect
                    ? `Add ${selectedIds.length} Exercise${selectedIds.length !== 1 ? 's' : ''} to Workout`
                    : 'Add to Workout'
                  }
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Detail Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <ExerciseDetailModal
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
              onAddToWorkout={handleAddToWorkout}
              autoPlay={pendingAutoPlay}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ExerciseLibraryModal;
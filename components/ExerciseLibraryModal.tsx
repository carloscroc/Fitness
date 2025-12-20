
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
import {
  EXERCISE_CATEGORIES,
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  DIFFICULTY_LEVELS,
  SORT_OPTIONS,
  QUALITY_LEVELS,
  PAGINATION_DEFAULTS,
  SEARCH_DEBOUNCE_MS
} from '../constants/exerciseFilters.ts';
import {
  searchExercises,
  fetchExercisesByCategory,
  fetchExercisesByEquipment,
  fetchExercisesByMuscleGroup,
  getExerciseStats
} from '../services/supabaseClient';

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(PAGINATION_DEFAULTS.INITIAL_PAGE);
  const [totalPages, setTotalPages] = useState(1);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<any>(null);

  // Use the enhanced hook for migration support
  const { exercises: ALL_EXERCISES_WITH_SOURCE, loading, migrationStats } = useExercises();

  // Check if we should show data source indicators (development only)
  const showDataIndicators = isFeatureEnabled('SHOW_DATA_SOURCE_INDICATORS', false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch exercise stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getExerciseStats();
        setExerciseStats(stats);
      } catch (error) {
        console.warn('Failed to fetch exercise stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, SEARCH_DEBOUNCE_MS);
    } else {
      setIsSearching(false);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategories, selectedEquipment, selectedMuscles, selectedDifficulty, minQuality, hasVideoOnly, hasImageOnly]);

  // Build filter options
  const filterOptions: ExerciseFilterOptions = useMemo(() => ({
    categories: selectedCategories.includes('All') ? [] : selectedCategories,
    equipment: selectedEquipment,
    muscles: selectedMuscles,
    difficulty: selectedDifficulty as Exercise['difficulty'][],
    hasVideo: hasVideoOnly ? true : undefined,
    hasImage: hasImageOnly ? true : undefined,
    minCompleteness: minQuality > 0 ? minQuality : undefined
  }), [selectedCategories, selectedEquipment, selectedMuscles, selectedDifficulty, minQuality, hasVideoOnly, hasImageOnly]);

  // Perform search with filters
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * PAGINATION_DEFAULTS.PAGE_SIZE;
      const result = await searchExercises(
        searchQuery,
        filterOptions,
        sortBy,
        PAGINATION_DEFAULTS.PAGE_SIZE,
        offset
      );

      setFilteredExercises(result.exercises);
      setTotalPages(Math.ceil(result.totalCount / PAGINATION_DEFAULTS.PAGE_SIZE));
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredExercises([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchQuery, filterOptions, sortBy, currentPage]);

  // State for filtered exercises (will be updated by search)
  const [filteredExercises, setFilteredExercises] = useState<ExerciseWithSource[]>(ALL_EXERCISES_WITH_SOURCE);

  const handleExerciseClick = (ex: Exercise | ExerciseWithSource) => {
    if (multiSelect) {
        setSelectedIds(prev =>
            prev.includes(ex.id)
            ? prev.filter(id => id !== ex.id)
            : [...prev, ex.id]
        );
    } else if (mode === 'select' && onSelect) {
      onSelect(ex);
      onClose();
    } else {
      setSelectedExercise(ex);
      // mark that this open came from a direct user click so the modal may attempt autoplay
      setPendingAutoPlay(true);
    }
  };

  // Component for data source indicator (development only)
  const DataSourceIndicator = ({ exercise }: { exercise: ExerciseWithSource }) => {
    if (!showDataIndicators) return null;

    const isFrontend = exercise.dataSource === 'frontend';
    const isOriginal = exercise.isOriginal;

    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 border border-white/10">
        {isOriginal ? (
          <>
            <Zap size={10} className="text-yellow-400" />
            <span className="text-yellow-400">ORIGINAL</span>
          </>
        ) : isFrontend ? (
          <>
            <Database size={10} className="text-blue-400" />
            <span className="text-blue-400">FRONTEND</span>
          </>
        ) : (
          <>
            <Database size={10} className="text-green-400" />
            <span className="text-green-400">BACKEND</span>
          </>
        )}
      </div>
    );
  };

  // Component for quality indicator badge
  const QualityIndicator = ({ exercise }: { exercise: ExerciseWithSource }) => {
    const quality = exercise.quality || { completeness: 0, hasVideo: false, hasInstructions: false, hasBenefits: false, hasImage: false, hasMetadata: false };
    const { completeness, hasVideo, hasInstructions, hasBenefits } = quality;

    const getColorClass = (completeness: number) => {
      if (completeness >= 100) return 'bg-green-500/20 text-green-400 border-green-500/30';
      if (completeness >= 80) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      if (completeness >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      if (completeness >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getColorClass(completeness)}`}>
        {hasVideo && <Video size={10} />}
        {hasInstructions && <FileText size={10} />}
        {hasBenefits && <Star size={10} />}
        <span>{completeness}%</span>
      </div>
    );
  };

  // Handle category toggle
  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.filter(c => c !== 'All');
        if (newCategories.includes(category)) {
          return newCategories.filter(c => c !== category);
        } else {
          return [...newCategories, category];
        }
      });
    }
    setCurrentPage(1);
  };

  // Handle equipment toggle
  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
    setCurrentPage(1);
  };

  // Handle muscle toggle
  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (field: ExerciseSortOptions['field']) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories(['All']);
    setSelectedEquipment([]);
    setSelectedMuscles([]);
    setSelectedDifficulty([]);
    setMinQuality(0);
    setHasVideoOnly(false);
    setHasImageOnly(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!selectedCategories.includes('All') && selectedCategories.length > 0) count++;
    if (selectedEquipment.length > 0) count++;
    if (selectedMuscles.length > 0) count++;
    if (selectedDifficulty.length > 0) count++;
    if (minQuality > 0) count++;
    if (hasVideoOnly) count++;
    if (hasImageOnly) count++;
    return count;
  }, [selectedCategories, selectedEquipment, selectedMuscles, selectedDifficulty, minQuality, hasVideoOnly, hasImageOnly]);

  const handleConfirmMultiSelect = () => {
      if (onMultiSelect) {
        const selectedExercises = ALL_EXERCISES_WITH_SOURCE.filter(ex => selectedIds.includes(ex.id));
        onMultiSelect(selectedExercises);
          onClose();
          // Reset selection after confirming
          setSelectedIds([]);
      }
  };

  const handleCreateCustom = () => {
    // Create a mock custom exercise
    const newCustomExercise: Exercise = {
        id: `custom-${Date.now()}`,
        name: searchQuery || "Custom Exercise",
        muscle: "General",
        equipment: "None",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        overview: "Custom exercise added by user.",
        steps: ["Perform the exercise as planned."],
        benefits: ["Custom benefit"],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: "",
        equipmentList: [],
        calories: 0
    };
    
    if (multiSelect && onMultiSelect) {
        onMultiSelect([newCustomExercise]);
        onClose();
    } else if (onSelect) {
        onSelect(newCustomExercise);
        onClose();
    } else {
        setSearchQuery('');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed inset-0 z-[1100] bg-black flex flex-col"
        >
          {/* Header */}
          <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-5 pb-4 bg-black/90 backdrop-blur-xl border-b border-white/10 z-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display text-white">
                  {mode === 'select' ? (multiSelect ? 'Select Exercises' : 'Select Exercise') : 'Exercise Library'}
              </h2>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-[#1C1C1E] rounded-full p-1 border border-white/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500'
                    }`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Migration Stats (Development Only) */}
            {showDataIndicators && migrationStats && (
              <div className="mb-4 p-3 rounded-[12px] bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-400 font-medium">
                      🏋️ {migrationStats.totalMergedExercises} exercises
                    </span>
                    <span className="text-zinc-400">
                      {migrationStats.totalFrontendExercises} frontend + {migrationStats.totalBackendExercises} backend
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {migrationStats.dataCompleteness.complete > 0 && (
                      <span className="text-green-400">
                        {migrationStats.dataCompleteness.complete} complete
                      </span>
                    )}
                    {migrationStats.dataCompleteness.withVideo > 0 && (
                      <span className="text-blue-400">
                        {migrationStats.dataCompleteness.withVideo} videos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search with Filters */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by exercise name, muscle, or equipment..."
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-[20px] py-4 pl-12 pr-32 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors font-medium text-[15px]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Sort Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-gray-400"
                  >
                    <ArrowUpDown size={14} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[150px] z-50">
                      {SORT_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortChange(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${
                            sortBy.field === option.value ? 'text-blue-400' : 'text-zinc-400'
                          }`}
                        >
                          <span>{option.label}</span>
                          {sortBy.field === option.value && (
                            sortBy.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    activeFilterCount > 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#2C2C2E] text-gray-400'
                  }`}
                >
                  <Filter size={14} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors text-zinc-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {EXERCISE_CATEGORIES.slice(1).map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedCategories.includes(cat)
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#2C2C2E] text-zinc-500 border border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Equipment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EQUIPMENT_TYPES.slice(0, 8).map(eq => (
                        <button
                          key={eq.value}
                          onClick={() => toggleEquipment(eq.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            selectedEquipment.includes(eq.value)
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#2C2C2E] text-zinc-500 border border-white/10'
                          }`}
                        >
                          <span>{eq.icon}</span>
                          <span>{eq.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Muscle Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.slice(0, 8).map(muscle => (
                        <button
                          key={muscle.value}
                          onClick={() => toggleMuscle(muscle.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedMuscles.includes(muscle.value)
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#2C2C2E] text-zinc-500 border border-white/10'
                          }`}
                        >
                          {muscle.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Minimum Quality</label>
                    <div className="flex items-center gap-2">
                      {QUALITY_LEVELS.filter(q => q.value > 0).map(level => (
                        <button
                          key={level.value}
                          onClick={() => setMinQuality(minQuality === level.value ? 0 : level.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            minQuality === level.value
                              ? `bg-${level.color}-500 text-white`
                              : 'bg-[#2C2C2E] text-zinc-500 border border-white/10'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVideoOnly}
                        onChange={(e) => setHasVideoOnly(e.target.checked)}
                        className="rounded border-white/10 bg-[#2C2C2E] text-blue-500 focus:ring-blue-500"
                      />
                      Has Video
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasImageOnly}
                        onChange={(e) => setHasImageOnly(e.target.checked)}
                        className="rounded border-white/10 bg-[#2C2C2E] text-blue-500 focus:ring-blue-500"
                      />
                      Has Image
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5">
              {EXERCISE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${
                    selectedCategories.includes(cat)
                    ? 'bg-white text-black border-white'
                    : 'bg-[#1C1C1E] text-zinc-500 border-white/10'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List with Enhanced Features */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 bg-black custom-scrollbar">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">
                  {isLoading ? 'Searching...' : `${filteredExercises.length} exercises found`}
                </span>
                {exerciseStats && (
                  <span className="text-xs text-zinc-500">
                    of {exerciseStats.total} total
                  </span>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-xs text-zinc-400 min-w-[40px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
              </div>
            )}

            {/* Exercise Grid/List */}
            {!isLoading && (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
                {filteredExercises.map(ex => {
                  const isSelected = selectedIds.includes(ex.id);
                  const quality = ex.quality || { completeness: 0, hasVideo: false, hasInstructions: false, hasBenefits: false };

                  if (viewMode === 'grid') {
                    return (
                      <motion.div
                        layoutId={`lib-${ex.id}`}
                        key={ex.id}
                        onClick={() => handleExerciseClick(ex)}
                        className={`relative rounded-2xl border overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:bg-[#222] ${
                          isSelected ? 'bg-[#1C1C1E] border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-[#1C1C1E] border-white/5'
                        }`}
                      >
                        {/* Exercise Thumbnail */}
                        <div className="aspect-video bg-[#2C2C2E] overflow-hidden relative">
                          <img
                            src={ex.image}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            alt={ex.name}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <Check size={32} className="text-white drop-shadow-md" strokeWidth={3} />
                            </div>
                          )}
                          {/* Quality Badge */}
                          <div className="absolute top-2 left-2">
                            <QualityIndicator exercise={ex as ExerciseWithSource} />
                          </div>
                          {/* Video Indicator */}
                          {quality.hasVideo && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                              <Video size={12} className="text-white" />
                            </div>
                          )}
                        </div>

                        {/* Exercise Info */}
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              {ex.muscle || ex.primaryMuscle || 'General'}
                            </span>
                            <DataSourceIndicator exercise={ex as ExerciseWithSource} />
                          </div>
                          <h3 className={`text-sm font-bold font-display leading-tight mb-2 ${
                            isSelected ? 'text-blue-400' : 'text-white'
                          }`}>
                            {ex.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              {ex.equipment && ex.equipment !== 'None' && (
                                <span>{ex.equipment}</span>
                              )}
                              {ex.difficulty && (
                                <span>• {ex.difficulty}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div className="absolute top-2 right-2">
                          {multiSelect ? (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-white/10 backdrop-blur-sm'
                            }`}>
                              {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                          ) : mode === 'select' && (
                            <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                              <Plus size={16} strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  } else {
                    // List view
                    return (
                      <motion.div
                        layoutId={`lib-${ex.id}`}
                        key={ex.id}
                        onClick={() => handleExerciseClick(ex)}
                        className={`p-4 rounded-2xl border flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer group hover:bg-[#222] ${
                          isSelected ? 'bg-[#1C1C1E] border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-[#1C1C1E] border-white/5'
                        }`}
                      >
                        {/* Exercise Thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-[#2C2C2E] overflow-hidden relative shrink-0">
                          <img
                            src={ex.image}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            alt={ex.name}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <Check size={24} className="text-white drop-shadow-md" strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Exercise Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              {ex.muscle || ex.primaryMuscle || 'General'}
                            </span>
                            <QualityIndicator exercise={ex as ExerciseWithSource} />
                            <DataSourceIndicator exercise={ex as ExerciseWithSource} />
                          </div>
                          <h3 className={`text-base font-bold font-display leading-tight mb-2 ${
                            isSelected ? 'text-blue-400' : 'text-white'
                          }`}>
                            {ex.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            {ex.equipment && ex.equipment !== 'None' && (
                              <span className="flex items-center gap-1">
                                {EQUIPMENT_TYPES.find(eq => eq.value === ex.equipment)?.icon || '🏋️'}
                                {ex.equipment}
                              </span>
                            )}
                            {ex.difficulty && (
                              <span className="flex items-center gap-1">
                                <TrendingUp size={10} />
                                {ex.difficulty}
                              </span>
                            )}
                            {ex.calories > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {ex.calories} cal
                              </span>
                            )}
                          </div>
                          {ex.overview && (
                            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{ex.overview}</p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className="flex flex-col items-center gap-2">
                          {quality.hasVideo && (
                            <Video size={14} className="text-blue-400" />
                          )}
                          {multiSelect ? (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-transparent'
                            }`}>
                              {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                          ) : mode === 'select' && (
                            <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:border-blue-500 transition-all shadow-lg">
                              <Plus size={20} strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                })}
              </div>
            )}

             {/* Not Found / Custom Add */}
             <div className="mt-6">
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-zinc-500 mb-4 text-sm">No exercises found matching "{searchQuery}"</p>
                        <button 
                            onClick={handleCreateCustom}
                            className="bg-[#1C1C1E] px-6 py-3 rounded-full text-white font-bold text-sm border border-white/10 hover:bg-[#2C2C2E] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} /> Create "{searchQuery}"
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleCreateCustom}
                        className="w-full py-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <Edit2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Create Custom Exercise</span>
                    </button>
                )}
             </div>
          </div>
          
          {/* Multi-Select Floating Footer */}
          {multiSelect && selectedIds.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent safe-area-bottom z-30">
                  <Button onClick={handleConfirmMultiSelect} className="w-full h-14 rounded-[20px] bg-white text-black text-lg font-bold shadow-2xl">
                      Add {selectedIds.length} Exercise{selectedIds.length > 1 ? 's' : ''}
                  </Button>
              </div>
          )}
          
          {selectedExercise && (
             <ExerciseDetailModal 
               exercise={selectedExercise} 
               autoPlay={pendingAutoPlay}
               onClose={() => { setSelectedExercise(null); setPendingAutoPlay(false); }}
               onAddToWorkout={
                   mode === 'select' && onSelect && !multiSelect
                   ? () => { onSelect(selectedExercise); onClose(); } 
                   : undefined
               }
             />
          )}

        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

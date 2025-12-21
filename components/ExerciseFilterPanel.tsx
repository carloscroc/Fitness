/**
 * ExerciseFilterPanel Component
 *
 * A comprehensive filtering interface that combines muscle group selection,
 * equipment filtering, and additional filter options with presets management,
 * URL sharing, and local storage capabilities.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Bookmark,
  Share2,
  RefreshCw,
  Settings,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Clock,
  TrendingUp,
  Star,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import MuscleGroupSelector from './MuscleGroupSelector';
import EquipmentFilter from './EquipmentFilter';
import BalanceRequirementFilter from './BalanceRequirementFilter';
import FlexibilityTypeFilter from './FlexibilityTypeFilter';
import PowerMetricsFilter from './PowerMetricsFilter';
import EquipmentModifiersFilter from './EquipmentModifiersFilter';
import ProgressionLevelFilter from './ProgressionLevelFilter';
import { Button } from './ui/Button';
import {
  ExerciseFilterOptions,
  ExerciseSortOptions,
  FILTER_PRESETS,
  EXERCISE_CATEGORIES,
  DIFFICULTY_LEVELS,
  QUALITY_LEVELS,
  SORT_OPTIONS,
  MuscleGroup,
  EquipmentType,
  ExerciseCategory,
  DifficultyLevel,
  FilterPresetId,
  BalanceRequirement,
  FlexibilityType,
  PowerMetric,
  ProgressionLevel,
  EquipmentModifiers
} from '../constants/exerciseFilters';

interface ExerciseFilterPanelProps {
  filters: ExerciseFilterOptions;
  onFiltersChange: (filters: ExerciseFilterOptions) => void;
  sortBy: ExerciseSortOptions;
  onSortChange: (sort: ExerciseSortOptions) => void;
  totalResults?: number;
  isLoading?: boolean;
  compact?: boolean;
  disabled?: boolean;
  showPresets?: boolean;
  onSearch?: (query: string) => void;
}

interface SavedPreset {
  id: string;
  name: string;
  description?: string;
  filters: ExerciseFilterOptions;
  sortBy: ExerciseSortOptions;
  createdAt: string;
  icon: string;
  color: string;
}

export const ExerciseFilterPanel: React.FC<ExerciseFilterPanelProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  totalResults,
  isLoading = false,
  compact = false,
  disabled = false,
  showPresets = true,
  onSearch
}) => {
  // UI State
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'muscles' | 'equipment' | 'options' | 'advanced'>('muscles');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  // Load saved presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('exercise-filter-presets');
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load saved presets:', error);
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = useCallback((presets: SavedPreset[]) => {
    try {
      localStorage.setItem('exercise-filter-presets', JSON.stringify(presets));
      setSavedPresets(presets);
    } catch (error) {
      console.warn('Failed to save presets:', error);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (onSearch) {
      const timeoutId = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, onSearch]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.muscles && filters.muscles.length > 0) count++;
    if (filters.equipment && filters.equipment.length > 0) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.difficulty && filters.difficulty.length > 0) count++;
    if (filters.minCompleteness && filters.minCompleteness > 0) count++;
    if (filters.hasVideo) count++;
    if (filters.hasImage) count++;

    // Phase 4 filters
    if (filters.balanceRequirements && filters.balanceRequirements.length > 0) count++;
    if (filters.flexibilityTypes && filters.flexibilityTypes.length > 0) count++;
    if (filters.powerMetrics && filters.powerMetrics.length > 0) count++;
    if (filters.progressionLevel) count++;
    if (filters.equipmentModifiers) {
      if (filters.equipmentModifiers.medicineBallWeight && filters.equipmentModifiers.medicineBallWeight.length > 0) count++;
      if (filters.equipmentModifiers.stabilityBallSize && filters.equipmentModifiers.stabilityBallSize.length > 0) count++;
    }

    return count;
  }, [filters]);

  // Handle muscle group changes
  const handleMusclesChange = useCallback((muscles: MuscleGroup[]) => {
    onFiltersChange({
      ...filters,
      muscles: muscles.length > 0 ? muscles : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle equipment changes
  const handleEquipmentChange = useCallback((equipment: EquipmentType[]) => {
    onFiltersChange({
      ...filters,
      equipment: equipment.length > 0 ? equipment : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle category toggle
  const toggleCategory = useCallback((category: ExerciseCategory) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle difficulty toggle
  const toggleDifficulty = useCallback((difficulty: DifficultyLevel) => {
    const currentDifficulty = filters.difficulty || [];
    const newDifficulty = currentDifficulty.includes(difficulty)
      ? currentDifficulty.filter(d => d !== difficulty)
      : [...currentDifficulty, difficulty];

    onFiltersChange({
      ...filters,
      difficulty: newDifficulty.length > 0 ? newDifficulty : undefined
    });
  }, [filters, onFiltersChange]);

  // Phase 4 Filter Handlers

  // Handle balance requirements
  const handleBalanceRequirementsChange = useCallback((balanceRequirements: BalanceRequirement[]) => {
    onFiltersChange({
      ...filters,
      balanceRequirements: balanceRequirements.length > 0 ? balanceRequirements : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle flexibility types
  const handleFlexibilityTypesChange = useCallback((flexibilityTypes: FlexibilityType[]) => {
    onFiltersChange({
      ...filters,
      flexibilityTypes: flexibilityTypes.length > 0 ? flexibilityTypes : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle power metrics
  const handlePowerMetricsChange = useCallback((powerMetrics: PowerMetric[]) => {
    onFiltersChange({
      ...filters,
      powerMetrics: powerMetrics.length > 0 ? powerMetrics : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle progression level
  const handleProgressionLevelChange = useCallback((progressionLevel?: ProgressionLevel) => {
    onFiltersChange({
      ...filters,
      progressionLevel
    });
  }, [filters, onFiltersChange]);

  // Handle equipment modifiers
  const handleEquipmentModifiersChange = useCallback((equipmentModifiers: EquipmentModifiers) => {
    onFiltersChange({
      ...filters,
      equipmentModifiers: (equipmentModifiers.medicineBallWeight?.length || equipmentModifiers.stabilityBallSize?.length)
        ? equipmentModifiers
        : undefined
    });
  }, [filters, onFiltersChange]);

  // Apply preset
  const applyPreset = useCallback((presetId: FilterPresetId) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onFiltersChange(preset.filters);
    }
  }, [onFiltersChange]);

  // Apply saved preset
  const applySavedPreset = useCallback((preset: SavedPreset) => {
    onFiltersChange(preset.filters);
    onSortChange(preset.sortBy);
  }, [onFiltersChange, onSortChange]);

  // Save current filters as preset
  const saveCurrentPreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset: SavedPreset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      description: `Custom preset with ${activeFilterCount} filters`,
      filters,
      sortBy,
      createdAt: new Date().toISOString(),
      icon: '⭐',
      color: '#8B5CF6'
    };

    const updatedPresets = [...savedPresets, newPreset];
    savePresetsToStorage(updatedPresets);
    setPresetName('');
    setShowSavePreset(false);
  }, [presetName, filters, sortBy, activeFilterCount, savedPresets, savePresetsToStorage]);

  // Delete saved preset
  const deletePreset = useCallback((presetId: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    savePresetsToStorage(updatedPresets);
  }, [savedPresets, savePresetsToStorage]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
    setSearchQuery('');
  }, [onFiltersChange]);

  // Generate shareable URL
  const generateShareableUrl = useCallback(() => {
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

    // Add Phase 4 filter parameters
    if (filters.balanceRequirements?.length) {
      params.set('balanceRequirements', filters.balanceRequirements.join(','));
    }
    if (filters.flexibilityTypes?.length) {
      params.set('flexibilityTypes', filters.flexibilityTypes.join(','));
    }
    if (filters.powerMetrics?.length) {
      params.set('powerMetrics', filters.powerMetrics.join(','));
    }
    if (filters.progressionLevel) {
      params.set('progressionLevel', filters.progressionLevel.toString());
    }
    if (filters.equipmentModifiers?.medicineBallWeight?.length) {
      params.set('medicineBallWeights', filters.equipmentModifiers.medicineBallWeight.join(','));
    }
    if (filters.equipmentModifiers?.stabilityBallSize?.length) {
      params.set('stabilityBallSizes', filters.equipmentModifiers.stabilityBallSize.join(','));
    }

    // Add sort parameters
    params.set('sortBy', sortBy.field);
    params.set('sortOrder', sortBy.direction);

    // Add search query
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Show success notification
      console.log('URL copied to clipboard:', url);
    });
  }, [filters, sortBy, searchQuery]);

  // Load filters from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has('muscles') || params.has('equipment') || params.has('categories') ||
        params.has('balanceRequirements') || params.has('flexibilityTypes') ||
        params.has('powerMetrics') || params.has('progressionLevel')) {
      const urlFilters: ExerciseFilterOptions = {};

      // Legacy filters
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

      // Phase 4 filters
      if (params.get('balanceRequirements')) {
        urlFilters.balanceRequirements = params.get('balanceRequirements')!.split(',') as BalanceRequirement[];
      }
      if (params.get('flexibilityTypes')) {
        urlFilters.flexibilityTypes = params.get('flexibilityTypes')!.split(',') as FlexibilityType[];
      }
      if (params.get('powerMetrics')) {
        urlFilters.powerMetrics = params.get('powerMetrics')!.split(',') as PowerMetric[];
      }
      if (params.get('progressionLevel')) {
        urlFilters.progressionLevel = parseInt(params.get('progressionLevel')!) as ProgressionLevel;
      }

      // Equipment modifiers
      const medicineBallWeights = params.get('medicineBallWeights');
      const stabilityBallSizes = params.get('stabilityBallSizes');

      if (medicineBallWeights || stabilityBallSizes) {
        urlFilters.equipmentModifiers = {};
        if (medicineBallWeights) {
          urlFilters.equipmentModifiers.medicineBallWeight = medicineBallWeights
            .split(',')
            .map(w => parseInt(w) as MedicineBallWeight);
        }
        if (stabilityBallSizes) {
          urlFilters.equipmentModifiers.stabilityBallSize = stabilityBallSizes
            .split(',')
            .map(s => parseInt(s) as StabilityBallSize);
        }
      }

      onFiltersChange(urlFilters);

      // Load sort
      if (params.get('sortBy')) {
        onSortChange({
          field: params.get('sortBy') as any,
          direction: (params.get('sortOrder') as any) || 'asc'
        });
      }

      // Load search query
      if (params.get('search')) {
        setSearchQuery(params.get('search')!);
        if (onSearch) {
          onSearch(params.get('search')!);
        }
      }
    }
  }, [onFiltersChange, onSortChange, onSearch]);

  if (compact) {
    return (
      <div className="bg-[#1C1C1E] rounded-2xl border border-white/10">
        {/* Compact Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-zinc-400" />
            <span className="font-medium text-white">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalResults !== undefined && (
              <span className="text-sm text-zinc-500">
                {totalResults} results
              </span>
            )}
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 border-t border-white/10">
                {/* Search */}
                {onSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises..."
                      disabled={disabled}
                      className="w-full pl-10 pr-4 py-2 bg-[#2C2C2E] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-[#2C2C2E] rounded-xl">
                  {(['muscles', 'equipment', 'options', 'advanced'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      disabled={disabled}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        activeTab === tab
                          ? 'bg-blue-500 text-white'
                          : 'text-zinc-400 hover:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'muscles' && (
                    <motion.div
                      key="muscles"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <MuscleGroupSelector
                        selectedMuscles={filters.muscles || []}
                        onMusclesChange={handleMusclesChange}
                        compact
                        disabled={disabled}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'equipment' && (
                    <motion.div
                      key="equipment"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <EquipmentFilter
                        selectedEquipment={filters.equipment || []}
                        onEquipmentChange={handleEquipmentChange}
                        compact
                        disabled={disabled}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'options' && (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Categories */}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {EXERCISE_CATEGORIES.map((category) => (
                            <button
                              key={category.value}
                              onClick={() => toggleCategory(category.value)}
                              disabled={disabled}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filters.categories?.includes(category.value)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {category.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          Difficulty
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {DIFFICULTY_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              onClick={() => toggleDifficulty(level.value)}
                              disabled={disabled}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filters.difficulty?.includes(level.value)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div
                      key="advanced"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Phase 4 Compact Filters */}
                      <BalanceRequirementFilter
                        selectedRequirements={filters.balanceRequirements || []}
                        onRequirementsChange={handleBalanceRequirementsChange}
                        compact
                        disabled={disabled}
                      />

                      <FlexibilityTypeFilter
                        selectedTypes={filters.flexibilityTypes || []}
                        onTypesChange={handleFlexibilityTypesChange}
                        compact
                        disabled={disabled}
                      />

                      <PowerMetricsFilter
                        selectedMetrics={filters.powerMetrics || []}
                        onMetricsChange={handlePowerMetricsChange}
                        compact
                        disabled={disabled}
                      />

                      <ProgressionLevelFilter
                        selectedLevel={filters.progressionLevel}
                        onLevelChange={handleProgressionLevelChange}
                        compact
                        disabled={disabled}
                      />

                      <EquipmentModifiersFilter
                        selectedModifiers={filters.equipmentModifiers || {}}
                        onModifiersChange={handleEquipmentModifiersChange}
                        compact
                        disabled={disabled}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={clearAllFilters}
                      disabled={disabled}
                      className="flex-1 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="brand"
                    onClick={generateShareableUrl}
                    disabled={disabled}
                    className="flex-1 text-xs"
                  >
                    <Share2 size={14} />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal size={24} />
            Exercise Filters
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Find the perfect exercises for your workout
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <Loader2 size={20} className="text-blue-500 animate-spin" />}
          {totalResults !== undefined && (
            <span className="text-sm text-zinc-400">
              {totalResults} results
            </span>
          )}
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {onSearch && (
        <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises by name, muscle, or equipment..."
              disabled={disabled}
              className="w-full pl-12 pr-4 py-3 bg-[#2C2C2E] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                disabled={disabled}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Presets */}
      {showPresets && (
        <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Presets
            </h3>
            <button
              onClick={() => setShowPresetsPanel(!showPresetsPanel)}
              className="p-2 rounded-lg bg-[#2C2C2E] text-zinc-400 hover:text-white hover:bg-[#3A3A3C] transition-colors"
            >
              <Bookmark size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FILTER_PRESETS.map((preset) => (
              <motion.button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                disabled={disabled}
                className="p-4 rounded-xl border transition-all text-left bg-[#2C2C2E] border-white/10 hover:border-white/20 group"
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {preset.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Saved Presets Panel */}
          <AnimatePresence>
            {showPresetsPanel && savedPresets.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
              >
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Your Saved Presets
                </h4>

                <div className="space-y-2">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#2C2C2E] border border-white/10"
                    >
                      <button
                        onClick={() => applySavedPreset(preset)}
                        disabled={disabled}
                        className="flex items-center gap-2 text-left flex-1 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{preset.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {preset.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {new Date(preset.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => deletePreset(preset.id)}
                        disabled={disabled}
                        className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Filter Tabs */}
      <div className="bg-[#1C1C1E] rounded-2xl border border-white/10">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          {(['muscles', 'equipment', 'options', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={disabled}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all capitalize border-b-2 ${
                activeTab === tab
                  ? 'text-blue-400 border-blue-400'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'muscles' && (
              <motion.div
                key="muscles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MuscleGroupSelector
                  selectedMuscles={filters.muscles || []}
                  onMusclesChange={handleMusclesChange}
                  disabled={disabled}
                />
              </motion.div>
            )}

            {activeTab === 'equipment' && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EquipmentFilter
                  selectedEquipment={filters.equipment || []}
                  onEquipmentChange={handleEquipmentChange}
                  disabled={disabled}
                />
              </motion.div>
            )}

            {activeTab === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Exercise Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {EXERCISE_CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => toggleCategory(category.value)}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          filters.categories?.includes(category.value)
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Difficulty Level
                  </h3>
                  <div className="flex gap-3">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => toggleDifficulty(level.value)}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          filters.difficulty?.includes(level.value)
                            ? 'text-white border-2'
                            : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                        }`}
                        style={{
                          backgroundColor: filters.difficulty?.includes(level.value) ? level.color : undefined,
                          borderColor: filters.difficulty?.includes(level.value) ? level.color : undefined
                        }}
                      >
                        <span>{level.icon}</span>
                        <span>{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Filter */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Minimum Quality
                  </h3>
                  <div className="flex gap-3">
                    {QUALITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => onFiltersChange({
                          ...filters,
                          minCompleteness: filters.minCompleteness === level.value ? 0 : level.value
                        })}
                        disabled={disabled}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          filters.minCompleteness === level.value
                            ? 'text-white border-2'
                            : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                        }`}
                        style={{
                          backgroundColor: filters.minCompleteness === level.value ? level.color : undefined,
                          borderColor: filters.minCompleteness === level.value ? level.color : undefined
                        }}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                        Additional Filters
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                          <input
                            type="checkbox"
                            checked={!!filters.hasVideo}
                            onChange={(e) => onFiltersChange({
                              ...filters,
                              hasVideo: e.target.checked || undefined
                            })}
                            disabled={disabled}
                            className="rounded border-white/10 bg-[#1C1C1E] text-blue-500 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Has Video</div>
                            <div className="text-xs text-zinc-500">Include exercises with video demonstrations</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                          <input
                            type="checkbox"
                            checked={!!filters.hasImage}
                            onChange={(e) => onFiltersChange({
                              ...filters,
                              hasImage: e.target.checked || undefined
                            })}
                            disabled={disabled}
                            className="rounded border-white/10 bg-[#1C1C1E] text-blue-500 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">Has Image</div>
                            <div className="text-xs text-zinc-500">Include exercises with images</div>
                          </div>
                        </label>
                      </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Sort By
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onSortChange({
                          field: option.value,
                          direction: sortBy.field === option.value && sortBy.direction === 'asc' ? 'desc' : 'asc'
                        })}
                        disabled={disabled}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          sortBy.field === option.value
                            ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                            : 'bg-[#2C2C2E] border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span>{option.label}</span>
                        {sortBy.field === option.value && (
                          <span className="text-xs">
                            {sortBy.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Phase 4 Advanced Filters */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Phase 4 Advanced Filters
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Enhanced filtering options for specialized exercise selection
                  </p>
                </div>

                {/* Balance Requirements */}
                <BalanceRequirementFilter
                  selectedRequirements={filters.balanceRequirements || []}
                  onRequirementsChange={handleBalanceRequirementsChange}
                  disabled={disabled}
                />

                {/* Flexibility Types */}
                <FlexibilityTypeFilter
                  selectedTypes={filters.flexibilityTypes || []}
                  onTypesChange={handleFlexibilityTypesChange}
                  disabled={disabled}
                />

                {/* Power Metrics */}
                <PowerMetricsFilter
                  selectedMetrics={filters.powerMetrics || []}
                  onMetricsChange={handlePowerMetricsChange}
                  disabled={disabled}
                />

                {/* Progression Level */}
                <ProgressionLevelFilter
                  selectedLevel={filters.progressionLevel}
                  onLevelChange={handleProgressionLevelChange}
                  disabled={disabled}
                />

                {/* Equipment Modifiers */}
                <EquipmentModifiersFilter
                  selectedModifiers={filters.equipmentModifiers || {}}
                  onModifiersChange={handleEquipmentModifiersChange}
                  disabled={disabled}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Filters ({activeFilterCount})
              </h3>
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                disabled={disabled}
                size="sm"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {filters.muscles && filters.muscles.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Muscles:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filters.equipment && filters.equipment.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Equipment:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.equipment.map((equipment) => (
                      <span
                        key={equipment}
                        className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs"
                      >
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filters.categories && filters.categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Categories:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 4 Active Filters */}
              {filters.balanceRequirements && filters.balanceRequirements.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Balance:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.balanceRequirements.map((balance) => (
                      <span
                        key={balance}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs"
                      >
                        {balance}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filters.flexibilityTypes && filters.flexibilityTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Flexibility:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.flexibilityTypes.map((flexibility) => (
                      <span
                        key={flexibility}
                        className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs"
                      >
                        {flexibility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filters.powerMetrics && filters.powerMetrics.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Power:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.powerMetrics.map((power) => (
                      <span
                        key={power}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"
                      >
                        {power}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filters.progressionLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Progression:</span>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                    Level {filters.progressionLevel}
                  </span>
                </div>
              )}

              {filters.equipmentModifiers && (
                <>
                  {filters.equipmentModifiers.medicineBallWeight && filters.equipmentModifiers.medicineBallWeight.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase">Medicine Ball:</span>
                      <div className="flex flex-wrap gap-2">
                        {filters.equipmentModifiers.medicineBallWeight.map((weight) => (
                          <span
                            key={weight}
                            className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs"
                          >
                            {weight}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {filters.equipmentModifiers.stabilityBallSize && filters.equipmentModifiers.stabilityBallSize.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase">Stability Ball:</span>
                      <div className="flex flex-wrap gap-2">
                        {filters.equipmentModifiers.stabilityBallSize.map((size) => (
                          <span
                            key={size}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs"
                          >
                            {size}cm
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => setShowSavePreset(true)}
          disabled={disabled || activeFilterCount === 0}
          className="flex-1"
        >
          <Save size={16} />
          Save as Preset
        </Button>
        <Button
          variant="brand"
          onClick={generateShareableUrl}
          disabled={disabled}
          className="flex-1"
        >
          <Share2 size={16} />
          Share Filters
        </Button>
      </div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {showSavePreset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSavePreset(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Save Filter Preset</h3>

              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="w-full px-4 py-3 bg-[#2C2C2E] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors mb-4"
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowSavePreset(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  onClick={saveCurrentPreset}
                  disabled={!presetName.trim()}
                  className="flex-1"
                >
                  Save Preset
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseFilterPanel;
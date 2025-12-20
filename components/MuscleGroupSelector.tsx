/**
 * MuscleGroupSelector Component
 *
 * A visual muscle group picker with human body diagram for intuitive exercise filtering.
 * Supports multiple muscle group selection with color-coded feedback.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  Circle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_COMBINATIONS,
  BODY_MUSCLE_REGIONS,
  MuscleGroup,
  getMuscleGroupsByRegion,
  getMuscleGroupColor
} from '../constants/exerciseFilters';

interface MuscleGroupSelectorProps {
  selectedMuscles: MuscleGroup[];
  onMusclesChange: (muscles: MuscleGroup[]) => void;
  maxSelections?: number;
  showCombinations?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

interface MuscleRegion {
  id: string;
  label: string;
  muscles: typeof MUSCLE_GROUPS;
}

export const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  selectedMuscles,
  onMusclesChange,
  maxSelections,
  showCombinations = true,
  compact = false,
  disabled = false
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);

  // Group muscles by region
  const muscleRegions: MuscleRegion[] = useMemo(() => [
    {
      id: 'upper',
      label: 'Upper Body',
      muscles: getMuscleGroupsByRegion('upper')
    },
    {
      id: 'core',
      label: 'Core',
      muscles: getMuscleGroupsByRegion('core')
    },
    {
      id: 'lower',
      label: 'Lower Body',
      muscles: getMuscleGroupsByRegion('lower')
    },
    {
      id: 'full',
      label: 'Full Body',
      muscles: getMuscleGroupsByRegion('full')
    }
  ], []);

  // Handle muscle selection
  const toggleMuscle = useCallback((muscle: MuscleGroup) => {
    if (disabled) return;

    if (maxSelections && selectedMuscles.length >= maxSelections && !selectedMuscles.includes(muscle)) {
      return; // Max selections reached
    }

    const newSelection = selectedMuscles.includes(muscle)
      ? selectedMuscles.filter(m => m !== muscle)
      : [...selectedMuscles, muscle];

    onMusclesChange(newSelection);
  }, [selectedMuscles, onMusclesChange, maxSelections, disabled]);

  // Handle combination selection
  const selectCombination = useCallback((combination: typeof MUSCLE_GROUP_COMBINATIONS[0]) => {
    if (disabled) return;

    const newSelection = [...new Set([...selectedMuscles, ...combination.muscles])];
    onMusclesChange(newSelection);
  }, [selectedMuscles, onMusclesChange, disabled]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    if (disabled) return;
    onMusclesChange([]);
  }, [onMusclesChange, disabled]);

  // Check if muscle is selected
  const isMuscleSelected = useCallback((muscle: MuscleGroup) => {
    return selectedMuscles.includes(muscle);
  }, [selectedMuscles]);

  // Get muscle opacity based on selection and hover
  const getMuscleOpacity = useCallback((muscle: string) => {
    const isSelected = isMuscleSelected(muscle as MuscleGroup);
    const isHovered = hoveredMuscle === muscle;

    if (isSelected) return 1;
    if (isHovered) return 0.7;
    return 0.3;
  }, [selectedMuscles, hoveredMuscle, isMuscleSelected]);

  // Render SVG body diagram
  const renderBodyDiagram = () => {
    const regions = BODY_MUSCLE_REGIONS[view];

    return (
      <div className="relative">
        <svg
          width="300"
          height="400"
          viewBox="0 0 300 400"
          className="w-full h-auto"
        >
          {/* Background body outline */}
          <g
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            opacity={0.3}
          >
            {/* Front/Back body outline */}
            <path
              d={
                view === 'front'
                  ? "M150,50 L130,80 L130,300 L150,350 L170,300 L170,80 Z"
                  : "M150,50 L130,80 L130,300 L150,350 L170,300 L170,80 Z"
              }
            />
            {/* Arms */}
            <path d="M130,100 L80,150 L80,250 L100,280 L130,200" />
            <path d="M170,100 L220,150 L220,250 L200,280 L170,200" />
            {/* Head */}
            <circle cx="150" cy="30" r="20" />
          </g>

          {/* Muscle groups */}
          {regions.map((region) => {
            const isSelected = selectedMuscles.includes(region.group as MuscleGroup);
            const isHovered = hoveredMuscle === region.group;
            const muscleColor = getMuscleGroupColor(region.group as MuscleGroup);

            return (
              <g key={region.id}>
                <motion.path
                  d={region.path}
                  fill={isSelected ? muscleColor : '#6B7280'}
                  fillOpacity={getMuscleOpacity(region.group)}
                  stroke={isSelected ? muscleColor : '#9CA3AF'}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ cursor: disabled ? 'default' : 'pointer' }}
                  whileHover={{ scale: disabled ? 1 : 1.05 }}
                  whileTap={{ scale: disabled ? 1 : 0.95 }}
                  onClick={() => !disabled && toggleMuscle(region.group as MuscleGroup)}
                  onMouseEnter={() => setHoveredMuscle(region.group as MuscleGroup)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  transition={{ duration: 0.2 }}
                />

                {/* Muscle label on hover */}
                {(isHovered || isSelected) && (
                  <motion.text
                    x={parseInt(region.path.split(',')[0].split('M')[1])}
                    y={parseInt(region.path.split(',')[1]) + 5}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {region.label}
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>

        {/* View toggle */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setView(view === 'front' ? 'back' : 'front')}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1C1C1E] text-white border border-white/10 hover:bg-[#2C2C2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <User size={14} />
            {view === 'front' ? 'Front View' : 'Back View'}
          </button>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Muscle pills */}
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((muscle) => {
            const isSelected = isMuscleSelected(muscle.value);
            return (
              <button
                key={muscle.value}
                onClick={() => toggleMuscle(muscle.value)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'text-white border-2'
                    : 'bg-[#1C1C1E] text-zinc-400 border border-white/10 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: isSelected ? muscle.color : undefined,
                  borderColor: isSelected ? muscle.color : undefined
                }}
              >
                <span>{muscle.icon}</span>
                <span>{muscle.label}</span>
                {isSelected && <CheckCircle size={12} />}
              </button>
            );
          })}
        </div>

        {/* Clear button */}
        {selectedMuscles.length > 0 && (
          <button
            onClick={clearSelection}
            disabled={disabled}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear selection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={20} />
            Target Muscles
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Click on muscles or use quick combinations below
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMuscles.length > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              {selectedMuscles.length} selected
            </span>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg bg-[#1C1C1E] text-zinc-400 hover:text-white hover:bg-[#2C2C2E] transition-colors"
          >
            {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Diagram */}
        <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Visual Selector
            </h4>
            {selectedMuscles.length > 0 && (
              <button
                onClick={clearSelection}
                disabled={disabled}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="flex justify-center">
            {renderBodyDiagram()}
          </div>

          {/* Instructions */}
          <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            <p>
              Click on muscle groups to select them. Toggle between front and back views to target different muscles.
            </p>
          </div>
        </div>

        {/* Muscle List & Combinations */}
        <div className="space-y-6">
          {/* Muscle Groups by Region */}
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10 overflow-hidden"
            >
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                By Region
              </h4>

              <div className="space-y-4">
                {muscleRegions.map((region) => (
                  <div key={region.id}>
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      {region.label}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {region.muscles.map((muscle) => {
                        const isSelected = isMuscleSelected(muscle.value);
                        return (
                          <button
                            key={muscle.value}
                            onClick={() => toggleMuscle(muscle.value)}
                            disabled={disabled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? 'text-white border-2'
                                : 'bg-[#2C2C2E] text-zinc-400 border border-white/10 hover:border-white/20'
                            }`}
                            style={{
                              backgroundColor: isSelected ? muscle.color : undefined,
                              borderColor: isSelected ? muscle.color : undefined
                            }}
                          >
                            <span>{muscle.icon}</span>
                            <span>{muscle.label}</span>
                            {isSelected && <CheckCircle size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Combinations */}
          {showCombinations && (
            <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/10">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Quick Combinations
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {MUSCLE_GROUP_COMBINATIONS.map((combination) => {
                  const isFullySelected = combination.muscles.every(m => selectedMuscles.includes(m));
                  const isPartiallySelected = combination.muscles.some(m => selectedMuscles.includes(m));

                  return (
                    <motion.button
                      key={combination.id}
                      onClick={() => selectCombination(combination)}
                      disabled={disabled}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        isFullySelected
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : isPartiallySelected
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                          : 'bg-[#2C2C2E] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      whileHover={{ scale: disabled ? 1 : 1.02 }}
                      whileTap={{ scale: disabled ? 1 : 0.98 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{combination.icon}</span>
                        <span className="text-sm font-bold">{combination.name}</span>
                      </div>
                      <div className="text-xs opacity-75">
                        {combination.muscles.length} muscle groups
                      </div>
                      {isFullySelected && (
                        <div className="mt-2 text-xs font-medium">
                          ✓ All selected
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Muscles Summary */}
      <AnimatePresence>
        {selectedMuscles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Selected Muscles ({selectedMuscles.length})
              </h4>
              <button
                onClick={clearSelection}
                disabled={disabled}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedMuscles.map((muscle) => {
                const muscleData = MUSCLE_GROUPS.find(m => m.value === muscle);
                if (!muscleData) return null;

                return (
                  <div
                    key={muscle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: muscleData.color }}
                  >
                    <span>{muscleData.icon}</span>
                    <span>{muscleData.label}</span>
                    <button
                      onClick={() => toggleMuscle(muscle)}
                      disabled={disabled}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MuscleGroupSelector;
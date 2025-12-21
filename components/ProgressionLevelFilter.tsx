/**
 * ProgressionLevelFilter Component
 *
 * A filter for progression levels with range slider, visual indicators,
 * and step-based filtering for progressive training.
 */

import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROGRESSION_LEVELS } from '../constants/exerciseFilters';
import { ProgressionLevel } from '../types/exercise';

interface ProgressionLevelFilterProps {
  selectedLevel?: ProgressionLevel;
  onLevelChange: (level?: ProgressionLevel) => void;
  compact?: boolean;
  disabled?: boolean;
  showDescriptions?: boolean;
}

export const ProgressionLevelFilter: React.FC<ProgressionLevelFilterProps> = memo(({
  selectedLevel,
  onLevelChange,
  compact = false,
  disabled = false,
  showDescriptions = true
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<ProgressionLevel | undefined>();

  const handleLevelSelect = useCallback((level?: ProgressionLevel) => {
    onLevelChange(level === selectedLevel ? undefined : level);
  }, [selectedLevel, onLevelChange]);

  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(event.target.value) as ProgressionLevel;
    onLevelChange(level);
  }, [onLevelChange]);

  const getLevelColor = useCallback((level: ProgressionLevel) => {
    const levelData = PROGRESSION_LEVELS.find(l => l.value === level);
    return levelData?.color || '#95A5A6';
  }, []);

  const getLevelIcon = useCallback((level: ProgressionLevel) => {
    const levelData = PROGRESSION_LEVELS.find(l => l.value === level);
    return levelData?.icon || '📊';
  }, []);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Progression Level
        </h4>
        <input
          type="range"
          min="1"
          max="5"
          value={selectedLevel || 1}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: selectedLevel
              ? `linear-gradient(to right, ${getLevelColor(selectedLevel)} 0%, ${getLevelColor(selectedLevel)} ${(selectedLevel - 1) * 25}%, rgba(255,255,255,0.1) ${(selectedLevel - 1) * 25}%, rgba(255,255,255,0.1) 100%)`
              : 'rgba(255,255,255,0.1)'
          }}
        />
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Level {selectedLevel || 1}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Progression Level
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Select exercises based on your training progression and skill level
        </p>
      </div>

      {/* Progression Level Visual */}
      <div className="space-y-6">
        {/* Progression Path */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />

          {/* Active Progress Line */}
          {selectedLevel && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((selectedLevel - 1) / 4) * 100}%` }}
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: getLevelColor(selectedLevel) }}
            />
          )}

          {/* Level Nodes */}
          <div className="relative flex justify-between">
            {PROGRESSION_LEVELS.map((level, index) => {
              const isActive = selectedLevel === level.value;
              const isCompleted = selectedLevel && selectedLevel > level.value;
              const isHovered = hoveredLevel === level.value;

              return (
                <motion.button
                  key={level.value}
                  onClick={() => handleLevelSelect(level.value)}
                  onMouseEnter={() => setHoveredLevel(level.value)}
                  onMouseLeave={() => setHoveredLevel(undefined)}
                  disabled={disabled}
                  className={`relative z-10 flex flex-col items-center gap-3 transition-all ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  whileHover={!disabled ? { scale: 1.1 } : undefined}
                  whileTap={!disabled ? { scale: 0.95 } : undefined}
                  aria-label={`Select ${level.label}: ${level.description}`}
                  aria-pressed={isActive}
                  role="radio"
                  aria-checked={isActive}
                >
                  {/* Level Node */}
                  <div
                    className={`w-12 h-12 rounded-full border-3 flex items-center justify-center text-xl transition-all ${
                      isActive
                        ? 'border-2 shadow-xl transform scale-110'
                        : isCompleted
                        ? 'border-2 bg-white/20'
                        : 'border-white/20 bg-[#2C2C2E]'
                    }`}
                    style={{
                      borderColor: isActive || isCompleted ? level.color : undefined,
                      backgroundColor: isActive ? level.color : undefined
                    }}
                  >
                    <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                      {level.icon}
                    </span>
                  </div>

                  {/* Level Number */}
                  <div className="text-xs font-bold text-white">
                    {level.value}
                  </div>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full mb-2 px-3 py-2 rounded-lg bg-[#1C1C1E] border border-white/10 text-xs text-white whitespace-nowrap z-20"
                        style={{ borderColor: level.color + '50' }}
                      >
                        <div className="font-semibold text-zinc-200">
                          {level.label}
                        </div>
                        <div className="text-zinc-400">
                          {level.description}
                        </div>
                        {/* Arrow */}
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                          style={{ borderTopColor: level.color + '50' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Level Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {PROGRESSION_LEVELS.map((level) => {
            const isActive = selectedLevel === level.value;
            const isCompleted = selectedLevel && selectedLevel > level.value;

            return (
              <motion.button
                key={level.value}
                onClick={() => handleLevelSelect(level.value)}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'shadow-xl transform -translate-y-1'
                    : isCompleted
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: isActive || isCompleted ? level.color : undefined,
                  backgroundColor: isActive ? level.color + '20' : undefined
                }}
                whileHover={!disabled ? { scale: 1.02 } : undefined}
                whileTap={!disabled ? { scale: 0.98 } : undefined}
                aria-label={`Select ${level.label}: ${level.description}`}
                aria-pressed={isActive}
                role="radio"
                aria-checked={isActive}
              >
                {/* Selection indicator */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: level.color }}
                  >
                    ✓
                  </div>
                )}

                {/* Completion indicator */}
                {isCompleted && !isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: level.color + '80' }}
                  >
                    ✓
                  </div>
                )}

                <div className="text-center">
                  <span
                    className="text-3xl mb-2 block"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${level.color}60)` : undefined
                    }}
                  >
                    {level.icon}
                  </span>

                  <div className="text-white font-bold text-lg mb-1">
                    Level {level.value}
                  </div>

                  {showDescriptions && (
                    <div className="text-xs text-zinc-400">
                      {level.description}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Slider Control */}
        <div className="p-4 rounded-xl bg-[#2C2C2E] border border-white/10">
          <label className="block text-sm font-medium text-white mb-3">
            Quick Level Selection
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="5"
              value={selectedLevel || 1}
              onChange={handleSliderChange}
              disabled={disabled}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: selectedLevel
                  ? `linear-gradient(to right, ${getLevelColor(selectedLevel)} 0%, ${getLevelColor(selectedLevel)} ${(selectedLevel - 1) * 25}%, rgba(255,255,255,0.1) ${(selectedLevel - 1) * 25}%, rgba(255,255,255,0.1) 100%)`
                  : 'rgba(255,255,255,0.1)'
              }}
            />
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Beginner</span>
              <span className="text-zinc-400">Expert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected level summary */}
      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-6 rounded-xl bg-gradient-to-r from-[#2C2C2E] to-[#3A3A3C] border border-white/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <span
              className="text-4xl"
              style={{ filter: `drop-shadow(0 0 8px ${getLevelColor(selectedLevel)}60)` }}
            >
              {getLevelIcon(selectedLevel)}
            </span>
            <div>
              <h4 className="text-lg font-bold text-white">
                Progression Level {selectedLevel}
              </h4>
              <p className="text-sm text-zinc-400">
                {PROGRESSION_LEVELS.find(l => l.value === selectedLevel)?.description}
              </p>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 rounded-full transition-all ${
                  level <= selectedLevel
                    ? 'opacity-100'
                    : 'opacity-20'
                }`}
                style={{
                  backgroundColor: level <= selectedLevel ? getLevelColor(selectedLevel) : undefined
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Training guidance */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-lg">📈</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-1">
              Progression Training Tips
            </h4>
            <p className="text-xs text-blue-300 leading-relaxed">
              Progress gradually through levels to ensure proper technique and prevent injury.
              Master movements at your current level before advancing. Consider working with a trainer
              for higher-level progressions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

ProgressionLevelFilter.displayName = 'ProgressionLevelFilter';

export default ProgressionLevelFilter;
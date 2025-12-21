/**
 * BalanceRequirementFilter Component
 *
 * A specialized filter for balance requirement levels with visual indicators
 * and difficulty progression for users to select appropriate balance exercises.
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BALANCE_REQUIREMENTS } from '../constants/exerciseFilters';
import { BalanceRequirement } from '../types/exercise';

interface BalanceRequirementFilterProps {
  selectedRequirements: BalanceRequirement[];
  onRequirementsChange: (requirements: BalanceRequirement[]) => void;
  compact?: boolean;
  disabled?: boolean;
  showDescriptions?: boolean;
}

export const BalanceRequirementFilter: React.FC<BalanceRequirementFilterProps> = memo(({
  selectedRequirements,
  onRequirementsChange,
  compact = false,
  disabled = false,
  showDescriptions = true
}) => {
  const toggleRequirement = useCallback((requirement: BalanceRequirement) => {
    const newRequirements = selectedRequirements.includes(requirement)
      ? selectedRequirements.filter(r => r !== requirement)
      : [...selectedRequirements, requirement];

    onRequirementsChange(newRequirements);
  }, [selectedRequirements, onRequirementsChange]);

  const getDifficultyBorder = useCallback((difficulty: number) => {
    const borders = ['border-green-500', 'border-blue-500', 'border-yellow-500', 'border-red-500'];
    return borders[difficulty - 1] || 'border-gray-500';
  }, []);

  const getDifficultyBackground = useCallback((color: string) => {
    return color.replace('#', '') + '20'; // Add 20 opacity to color
  }, []);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Balance Requirement
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {BALANCE_REQUIREMENTS.map((requirement) => (
            <button
              key={requirement.value}
              onClick={() => toggleRequirement(requirement.value)}
              disabled={disabled}
              className={`relative p-3 rounded-lg text-xs font-medium transition-all ${
                selectedRequirements.includes(requirement.value)
                  ? 'border-2 shadow-lg transform scale-105'
                  : 'border border-white/10 bg-[#2C2C2E] hover:border-white/20'
              } ${getDifficultyBorder(requirement.difficulty)} disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                backgroundColor: selectedRequirements.includes(requirement.value)
                  ? getDifficultyBackground(requirement.color)
                  : undefined,
                borderColor: selectedRequirements.includes(requirement.value)
                  ? requirement.color
                  : undefined
              }}
              aria-label={`Toggle ${requirement.label} balance requirement: ${requirement.description}`}
              aria-pressed={selectedRequirements.includes(requirement.value)}
              role="checkbox"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{requirement.icon}</span>
                <span className="font-semibold">{requirement.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Balance Requirement
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Select exercises based on balance difficulty and stability requirements
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BALANCE_REQUIREMENTS.map((requirement, index) => (
          <motion.button
            key={requirement.value}
            onClick={() => toggleRequirement(requirement.value)}
            disabled={disabled}
            className={`relative p-6 rounded-2xl border-2 transition-all ${
              selectedRequirements.includes(requirement.value)
                ? 'shadow-xl transform -translate-y-1'
                : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
            } ${getDifficultyBorder(requirement.difficulty)} disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              backgroundColor: selectedRequirements.includes(requirement.value)
                ? getDifficultyBackground(requirement.color)
                : undefined,
              borderColor: selectedRequirements.includes(requirement.value)
                ? requirement.color
                : undefined
            }}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            aria-label={`Toggle ${requirement.label} balance requirement: ${requirement.description}`}
            aria-pressed={selectedRequirements.includes(requirement.value)}
            role="checkbox"
          >
            {/* Selection indicator */}
            {selectedRequirements.includes(requirement.value) && (
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: requirement.color }}
              >
                ✓
              </div>
            )}

            {/* Difficulty indicator */}
            <div className="absolute top-2 left-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: requirement.color }}
              />
            </div>

            <div className="flex flex-col items-center gap-3 mt-4">
              <span
                className="text-3xl filter drop-shadow-sm"
                style={{ filter: selectedRequirements.includes(requirement.value)
                  ? `drop-shadow(0 0 8px ${requirement.color}40)`
                  : undefined
                }}
              >
                {requirement.icon}
              </span>

              <div className="text-center">
                <h4 className="text-white font-bold text-lg mb-1">
                  {requirement.label}
                </h4>

                {showDescriptions && (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {requirement.description}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected requirements summary */}
      {selectedRequirements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 rounded-xl bg-[#2C2C2E] border border-white/10"
        >
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Selected Balance Requirements
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedRequirements.map((requirement) => {
              const reqData = BALANCE_REQUIREMENTS.find(r => r.value === requirement);
              return (
                <span
                  key={requirement}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: reqData?.color + '80' }}
                >
                  <span>{reqData?.icon}</span>
                  <span>{reqData?.label}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Help text */}
      <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-lg">💡</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-1">
              Balance Training Tips
            </h4>
            <p className="text-xs text-blue-300 leading-relaxed">
              Start with easier balance requirements and progress gradually.
              Advanced balance exercises require solid foundation in static and dynamic balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

BalanceRequirementFilter.displayName = 'BalanceRequirementFilter';

export default BalanceRequirementFilter;
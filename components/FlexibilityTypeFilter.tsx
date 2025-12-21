/**
 * FlexibilityTypeFilter Component
 *
 * A specialized filter for flexibility types with clear icons, descriptions,
 * and educational content about different stretching approaches.
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FLEXIBILITY_TYPES } from '../constants/exerciseFilters';
import { FlexibilityType } from '../types/exercise';

interface FlexibilityTypeFilterProps {
  selectedTypes: FlexibilityType[];
  onTypesChange: (types: FlexibilityType[]) => void;
  compact?: boolean;
  disabled?: boolean;
  showPurpose?: boolean;
}

export const FlexibilityTypeFilter: React.FC<FlexibilityTypeFilterProps> = memo(({
  selectedTypes,
  onTypesChange,
  compact = false,
  disabled = false,
  showPurpose = true
}) => {
  const toggleType = useCallback((type: FlexibilityType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];

    onTypesChange(newTypes);
  }, [selectedTypes, onTypesChange]);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Flexibility Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {FLEXIBILITY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleType(type.value)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedTypes.includes(type.value)
                  ? 'border-2 shadow-lg'
                  : 'border border-white/10 bg-[#2C2C2E] hover:border-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                borderColor: selectedTypes.includes(type.value) ? type.color : undefined,
                backgroundColor: selectedTypes.includes(type.value) ? type.color + '20' : undefined
              }}
              aria-label={`Toggle ${type.label} stretching: ${type.description}`}
              aria-pressed={selectedTypes.includes(type.value)}
              role="checkbox"
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
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
          Flexibility Type
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Choose stretching approaches based on your training goals and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FLEXIBILITY_TYPES.map((type, index) => (
          <motion.button
            key={type.value}
            onClick={() => toggleType(type.value)}
            disabled={disabled}
            className={`relative p-6 rounded-2xl border-2 transition-all ${
              selectedTypes.includes(type.value)
                ? 'shadow-xl transform -translate-y-1'
                : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              borderColor: selectedTypes.includes(type.value) ? type.color : undefined,
              backgroundColor: selectedTypes.includes(type.value) ? type.color + '15' : undefined
            }}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            aria-label={`Toggle ${type.label} stretching: ${type.description}`}
            aria-pressed={selectedTypes.includes(type.value)}
            role="checkbox"
          >
            {/* Selection indicator */}
            {selectedTypes.includes(type.value) && (
              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{ backgroundColor: type.color }}
              >
                ✓
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <span
                  className="text-5xl filter drop-shadow-lg"
                  style={{
                    filter: selectedTypes.includes(type.value)
                      ? `drop-shadow(0 0 12px ${type.color}60)`
                      : undefined
                  }}
                >
                  {type.icon}
                </span>
                {selectedTypes.includes(type.value) && (
                  <div
                    className="absolute inset-0 rounded-full opacity-20 animate-ping"
                    style={{ backgroundColor: type.color }}
                  />
                )}
              </div>

              <div>
                <h4 className="text-white font-bold text-xl mb-2">
                  {type.label}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {type.description}
                </p>

                {showPurpose && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <span className="font-semibold text-zinc-200">Purpose:</span>{' '}
                      {type.purpose}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected types summary */}
      {selectedTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 rounded-xl bg-[#2C2C2E] border border-white/10"
        >
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Selected Stretching Types
          </h4>
          <div className="flex flex-wrap gap-3">
            {selectedTypes.map((type) => {
              const typeData = FLEXIBILITY_TYPES.find(t => t.value === type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: typeData?.color + '90' }}
                >
                  <span className="text-base">{typeData?.icon}</span>
                  <span>{typeData?.label}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Educational content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <span>🕐</span> Static Stretches
          </h5>
          <p className="text-xs text-blue-300 leading-relaxed">
            Hold each stretch for 15-60 seconds. Best for post-workout recovery.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <h5 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <span>🔄</span> Dynamic Stretches
          </h5>
          <p className="text-xs text-orange-300 leading-relaxed">
            Controlled movements through full range. Ideal for warm-ups.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <h5 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <span>🧠</span> PNF Techniques
          </h5>
          <p className="text-xs text-purple-300 leading-relaxed">
            Contract-relax cycles for maximum flexibility gains.
          </p>
        </div>
      </div>

      {/* Safety tips */}
      <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">
              Stretching Safety
            </h4>
            <p className="text-xs text-yellow-300 leading-relaxed">
              Never stretch to the point of pain. Warm up before stretching and breathe deeply throughout.
              Consult a professional if you have injuries or medical conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

FlexibilityTypeFilter.displayName = 'FlexibilityTypeFilter';

export default FlexibilityTypeFilter;
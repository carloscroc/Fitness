/**
 * EquipmentModifiersFilter Component
 *
 * A specialized filter for equipment modifiers including medicine ball weights
 * and stability ball sizes with visual indicators and equipment availability.
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MEDICINE_BALL_WEIGHTS,
  STABILITY_BALL_SIZES
} from '../constants/exerciseFilters';
import {
  MedicineBallWeight,
  StabilityBallSize,
  EquipmentModifiers
} from '../types/exercise';

interface EquipmentModifiersFilterProps {
  selectedModifiers: EquipmentModifiers;
  onModifiersChange: (modifiers: EquipmentModifiers) => void;
  compact?: boolean;
  disabled?: boolean;
  showAvailability?: boolean;
}

export const EquipmentModifiersFilter: React.FC<EquipmentModifiersFilterProps> = memo(({
  selectedModifiers,
  onModifiersChange,
  compact = false,
  disabled = false,
  showAvailability = true
}) => {
  const toggleMedicineBallWeight = useCallback((weight: MedicineBallWeight) => {
    const currentWeights = selectedModifiers.medicineBallWeight || [];
    const newWeights = currentWeights.includes(weight)
      ? currentWeights.filter(w => w !== weight)
      : [...currentWeights, weight];

    onModifiersChange({
      ...selectedModifiers,
      medicineBallWeight: newWeights.length > 0 ? newWeights : undefined
    });
  }, [selectedModifiers, onModifiersChange]);

  const toggleStabilityBallSize = useCallback((size: StabilityBallSize) => {
    const currentSizes = selectedModifiers.stabilityBallSize || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];

    onModifiersChange({
      ...selectedModifiers,
      stabilityBallSize: newSizes.length > 0 ? newSizes : undefined
    });
  }, [selectedModifiers, onModifiersChange]);

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Medicine Ball Weights */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Medicine Ball Weight
          </h4>
          <div className="flex flex-wrap gap-2">
            {MEDICINE_BALL_WEIGHTS.map((weight) => (
              <button
                key={weight.value}
                onClick={() => toggleMedicineBallWeight(weight.value)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedModifiers.medicineBallWeight?.includes(weight.value)
                    ? 'border-2 text-white shadow-lg'
                    : 'border border-white/10 bg-[#2C2C2E] text-zinc-400 hover:border-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: selectedModifiers.medicineBallWeight?.includes(weight.value)
                    ? weight.color
                    : undefined,
                  backgroundColor: selectedModifiers.medicineBallWeight?.includes(weight.value)
                    ? weight.color + '80'
                    : undefined
                }}
                aria-label={`Toggle ${weight.label} medicine ball`}
                aria-pressed={selectedModifiers.medicineBallWeight?.includes(weight.value)}
                role="checkbox"
              >
                {weight.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stability Ball Sizes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Stability Ball Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {STABILITY_BALL_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => toggleStabilityBallSize(size.value)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedModifiers.stabilityBallSize?.includes(size.value)
                    ? 'border-2 text-white shadow-lg'
                    : 'border border-white/10 bg-[#2C2C2E] text-zinc-400 hover:border-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: selectedModifiers.stabilityBallSize?.includes(size.size)
                    ? size.color
                    : undefined,
                  backgroundColor: selectedModifiers.stabilityBallSize?.includes(size.size)
                    ? size.color + '80'
                    : undefined
                }}
                aria-label={`Toggle ${size.label} stability ball`}
                aria-pressed={selectedModifiers.stabilityBallSize?.includes(size.size)}
                role="checkbox"
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Medicine Ball Weights Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Medicine Ball Weights
          </h3>
          <p className="text-xs text-zinc-500">
            Select appropriate weights for your strength level and training goals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {MEDICINE_BALL_WEIGHTS.map((weight, index) => (
            <motion.button
              key={weight.value}
              onClick={() => toggleMedicineBallWeight(weight.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedModifiers.medicineBallWeight?.includes(weight.value)
                  ? 'shadow-lg transform scale-105'
                  : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                borderColor: selectedModifiers.medicineBallWeight?.includes(weight.value)
                  ? weight.color
                  : undefined,
                backgroundColor: selectedModifiers.medicineBallWeight?.includes(weight.value)
                  ? weight.color + '20'
                  : undefined
              }}
              whileHover={!disabled ? { scale: 1.05 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              aria-label={`Toggle ${weight.label} medicine ball`}
              aria-pressed={selectedModifiers.medicineBallWeight?.includes(weight.value)}
              role="checkbox"
            >
              {/* Selection indicator */}
              {selectedModifiers.medicineBallWeight?.includes(weight.value) && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: weight.color }}
                >
                  ✓
                </div>
              )}

              <div className="text-center">
                <div
                  className="w-8 h-8 mx-auto mb-2 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    borderColor: weight.color,
                    backgroundColor: selectedModifiers.medicineBallWeight?.includes(weight.value)
                      ? weight.color
                      : 'transparent'
                  }}
                >
                  {weight.value}
                </div>

                <div className="text-white font-bold text-sm mb-1">
                  {weight.label}
                </div>

                <div className="text-xs text-zinc-400">
                  {weight.level}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stability Ball Sizes Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Stability Ball Sizes
          </h3>
          <p className="text-xs text-zinc-500">
            Choose size based on your height for proper form and effectiveness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STABILITY_BALL_SIZES.map((size, index) => (
            <motion.button
              key={size.value}
              onClick={() => toggleStabilityBallSize(size.value)}
              disabled={disabled}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                selectedModifiers.stabilityBallSize?.includes(size.value)
                  ? 'shadow-xl transform -translate-y-1'
                  : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                borderColor: selectedModifiers.stabilityBallSize?.includes(size.value)
                  ? size.color
                  : undefined,
                backgroundColor: selectedModifiers.stabilityBallSize?.includes(size.value)
                  ? size.color + '15'
                  : undefined
              }}
              whileHover={!disabled ? { scale: 1.02 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              aria-label={`Toggle ${size.label} stability ball`}
              aria-pressed={selectedModifiers.stabilityBallSize?.includes(size.size)}
              role="checkbox"
            >
              {/* Selection indicator */}
              {selectedModifiers.stabilityBallSize?.includes(size.value) && (
                <div
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: size.color }}
                >
                  ✓
                </div>
              )}

              <div className="text-center">
                {/* Visual ball representation */}
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-full border-4 flex items-center justify-center text-2xl transition-transform"
                  style={{
                    borderColor: size.color,
                    backgroundColor: selectedModifiers.stabilityBallSize?.includes(size.value)
                      ? size.color + '30'
                      : 'transparent',
                    transform: selectedModifiers.stabilityBallSize?.includes(size.value)
                      ? 'scale(1.1)'
                      : 'scale(1)'
                  }}
                >
                  ⚪
                </div>

                <div className="text-white font-bold text-xl mb-2">
                  {size.label}
                </div>

                <div className="text-xs text-zinc-400 leading-relaxed">
                  {size.height}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected modifiers summary */}
      {(selectedModifiers.medicineBallWeight?.length || selectedModifiers.stabilityBallSize?.length) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 rounded-xl bg-[#2C2C2E] border border-white/10"
        >
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            Selected Equipment Modifiers
          </h4>

          <div className="space-y-3">
            {selectedModifiers.medicineBallWeight && selectedModifiers.medicineBallWeight.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-500 mb-1 block">Medicine Ball Weights:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedModifiers.medicineBallWeight.map((weight) => {
                    const weightData = MEDICINE_BALL_WEIGHTS.find(w => w.value === weight);
                    return (
                      <span
                        key={weight}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: weightData?.color + '90' }}
                      >
                        <span>{weightData?.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedModifiers.stabilityBallSize && selectedModifiers.stabilityBallSize.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-500 mb-1 block">Stability Ball Sizes:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedModifiers.stabilityBallSize.map((size) => {
                    const sizeData = STABILITY_BALL_SIZES.find(s => s.value === size);
                    return (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: sizeData?.color + '90' }}
                      >
                        <span>{sizeData?.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Equipment recommendations */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <h5 className="text-sm font-semibold text-green-400 mb-2">
            Medicine Ball Selection Tips
          </h5>
          <ul className="text-xs text-green-300 space-y-1">
            <li>• Start with lighter weights for explosive movements</li>
            <li>• Heavier balls for strength-based exercises</li>
            <li>• Consider your training experience and goals</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h5 className="text-sm font-semibold text-blue-400 mb-2">
            Stability Ball Guidelines
          </h5>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• Ensure proper inflation for stability</li>
            <li>• Size based on height for optimal form</li>
            <li>• Start with basic exercises before progressing</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

EquipmentModifiersFilter.displayName = 'EquipmentModifiersFilter';

export default EquipmentModifiersFilter;
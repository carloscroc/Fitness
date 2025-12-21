/**
 * PowerMetricsFilter Component
 *
 * A specialized filter for power metrics targeting power training users,
      with visual representation of power types and example exercises.
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { POWER_METRICS } from '../constants/exerciseFilters';
import { PowerMetric } from '../types/exercise';

interface PowerMetricsFilterProps {
  selectedMetrics: PowerMetric[];
  onMetricsChange: (metrics: PowerMetric[]) => void;
  compact?: boolean;
  disabled?: boolean;
  showExamples?: boolean;
}

export const PowerMetricsFilter: React.FC<PowerMetricsFilterProps> = memo(({
  selectedMetrics,
  onMetricsChange,
  compact = false,
  disabled = false,
  showExamples = true
}) => {
  const toggleMetric = useCallback((metric: PowerMetric) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter(m => m !== metric)
      : [...selectedMetrics, metric];

    onMetricsChange(newMetrics);
  }, [selectedMetrics, onMetricsChange]);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Power Metrics
        </h4>
        <div className="flex flex-wrap gap-2">
          {POWER_METRICS.map((metric) => (
            <button
              key={metric.value}
              onClick={() => toggleMetric(metric.value)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedMetrics.includes(metric.value)
                  ? 'border-2 shadow-lg text-white'
                  : 'border border-white/10 bg-[#2C2C2E] text-zinc-400 hover:border-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                borderColor: selectedMetrics.includes(metric.value) ? metric.color : undefined,
                backgroundColor: selectedMetrics.includes(metric.value) ? metric.color + '80' : undefined
              }}
              aria-label={`Toggle ${metric.label} power training: ${metric.description}`}
              aria-pressed={selectedMetrics.includes(metric.value)}
              role="checkbox"
            >
              <span>{metric.icon}</span>
              <span>{metric.label}</span>
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
          Power Metrics
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Select exercises based on power output characteristics and movement patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {POWER_METRICS.map((metric, index) => (
          <motion.div
            key={metric.value}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <button
              onClick={() => toggleMetric(metric.value)}
              disabled={disabled}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedMetrics.includes(metric.value)
                  ? 'shadow-xl transform -translate-y-1'
                  : 'border-white/10 bg-[#2C2C2E] hover:border-white/20 hover:bg-[#3A3A3C]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                borderColor: selectedMetrics.includes(metric.value) ? metric.color : undefined,
                backgroundColor: selectedMetrics.includes(metric.value) ? metric.color + '15' : undefined
              }}
              whileHover={!disabled ? { scale: 1.02 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              aria-label={`Toggle ${metric.label} power training: ${metric.description}`}
              aria-pressed={selectedMetrics.includes(metric.value)}
              role="checkbox"
            >
              {/* Selection indicator */}
              {selectedMetrics.includes(metric.value) && (
                <div
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: metric.color }}
                >
                  ✓
                </div>
              )}

              {/* Power type indicator with animation */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <span
                    className="text-4xl filter drop-shadow-lg"
                    style={{
                      filter: selectedMetrics.includes(metric.value)
                        ? `drop-shadow(0 0 12px ${metric.color}80)`
                        : undefined,
                      animation: selectedMetrics.includes(metric.value) ? 'pulse 2s infinite' : undefined
                    }}
                  >
                    {metric.icon}
                  </span>
                  {selectedMetrics.includes(metric.value) && (
                    <div
                      className="absolute inset-0 rounded-full opacity-20 animate-ping"
                      style={{ backgroundColor: metric.color }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">
                    {metric.label}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {metric.description}
                </p>

                {showExamples && metric.examples && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Example Exercises
                    </h5>
                    <ul className="text-xs text-zinc-300 space-y-1">
                      {metric.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: metric.color }}
                          />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Power level indicator */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Power Level</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: level <= 3 ? metric.color : 'rgba(255,255,255,0.1)',
                          opacity: level <= 3 ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Selected metrics summary with training focus */}
      {selectedMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-6 rounded-xl bg-gradient-to-r from-[#2C2C2E] to-[#3A3A3C] border border-white/10"
        >
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Power Training Focus
          </h4>

          <div className="flex flex-wrap gap-3 mb-4">
            {selectedMetrics.map((metric) => {
              const metricData = POWER_METRICS.find(m => m.value === metric);
              return (
                <span
                  key={metric}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg"
                  style={{ backgroundColor: metricData?.color + '90' }}
                >
                  <span className="text-lg">{metricData?.icon}</span>
                  <span>{metricData?.label}</span>
                </span>
              );
            })}
          </div>

          {/* Training recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMetrics.includes('explosive') && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <h5 className="text-xs font-semibold text-red-400 mb-1">Explosive Training</h5>
                <p className="text-xs text-red-300">
                  Focus on maximum force production in minimum time. Allow full recovery between sets.
                </p>
              </div>
            )}

            {selectedMetrics.includes('rotational') && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <h5 className="text-xs font-semibold text-orange-400 mb-1">Rotational Power</h5>
                <p className="text-xs text-orange-300">
                  Develop core stability and rotational force transfer. Essential for sports performance.
                </p>
              </div>
            )}

            {selectedMetrics.includes('plyometric') && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h5 className="text-xs font-semibold text-blue-400 mb-1">Plyometric Training</h5>
                <p className="text-xs text-blue-300">
                  Enhance stretch-shortening cycle efficiency. Limit to 2-3 sessions per week.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Safety and progression information */}
      <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <span className="text-yellow-400 text-lg">⚡</span>
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">
              Power Training Guidelines
            </h4>
            <p className="text-xs text-yellow-300 leading-relaxed">
              Power training requires proper technique and adequate rest. Always warm up thoroughly,
              focus on explosive movements with controlled form, and progress gradually in intensity.
              Consider your fitness level and experience before attempting advanced power exercises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PowerMetricsFilter.displayName = 'PowerMetricsFilter';

export default PowerMetricsFilter;
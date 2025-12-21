/**
 * BalanceDifficultyIndicator Component
 *
 * Visualizes balance exercise difficulty and progression with real-time balance scale,
 * safety modifications, and progress tracking for balance improvement metrics.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { Scale, Shield, AlertTriangle, TrendingUp, Award, Clock, Activity, Zap, Eye, Footprints, Brain } from 'lucide-react';

import {
  BalanceProgressionData,
  BalanceLevel,
  BalanceImprovementMetrics,
  BalanceScaleVisualization,
  ProgressionTrackerConfig,
  VisualizationConfig,
  AccessibilityConfig,
  ProgressionCelebration
} from './types';
import {
  ProgressionStorage,
  BalanceCalculations,
  ProgressionCalculations,
  ProgressionAnimations,
  ProgressionErrorHandler
} from './utils';

interface BalanceDifficultyIndicatorProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  balanceType: 'static' | 'dynamic';
  bodyweight?: number;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: BalanceProgressionData[]) => void;
  onLevelAchieved?: (level: BalanceLevel) => void;
  className?: string;
}

const DEFAULT_CONFIG: ProgressionTrackerConfig = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 1000, // Real-time updates for balance
  autoSave: true
};

const DEFAULT_VISUALIZATION: VisualizationConfig = {
  chartType: 'radar',
  colorScheme: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  showGridlines: true,
  showLabels: true,
  showLegend: true,
  interactive: true,
  animationDuration: 300
};

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  enableHighContrast: false,
  enableReducedMotion: false,
  enableScreenReader: true,
  fontSize: 'medium',
  colorBlindMode: 'none'
};

const BALANCE_LEVELS: BalanceLevel[] = [
  {
    level: 1,
    name: 'Foundation',
    description: 'Basic static balance with support',
    requirements: ['Maintain balance for 10 seconds with support', 'Keep eyes open'],
    achieved: false
  },
  {
    level: 2,
    name: 'Beginner',
    description: 'Unsupported static balance',
    requirements: ['Maintain balance for 15 seconds unsupported', 'Minimal wobble'],
    achieved: false
  },
  {
    level: 3,
    name: 'Developing',
    description: 'Improved stability and control',
    requirements: ['Maintain balance for 30 seconds', 'Reduced wobble index below 50'],
    achieved: false
  },
  {
    level: 4,
    name: 'Intermediate',
    description: 'Advanced static balance techniques',
    requirements: ['Hold for 45+ seconds', 'Eyes-closed balance for 10 seconds'],
    achieved: false
  },
  {
    level: 5,
    name: 'Advanced',
    description: 'Expert balance and stability',
    requirements: ['Minute-long holds', 'Dynamic transitions', 'Complex movements'],
    achieved: false
  }
];

export const BalanceDifficultyIndicator: React.FC<BalanceDifficultyIndicatorProps> = ({
  userId,
  exerciseId,
  exerciseName,
  balanceType,
  bodyweight = 70,
  config = {},
  visualization = {},
  accessibility = {},
  onDataUpdate,
  onLevelAchieved,
  className = ''
}) => {
  const [progressionData, setProgressionData] = useState<BalanceProgressionData[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(1);
  const [stabilityTime, setStabilityTime] = useState<number>(0);
  const [wobbleIndex, setWobbleIndex] = useState<number>(100);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<ProgressCelebration | null>(null);
  const [balanceVisualization, setBalanceVisualization] = useState<BalanceScaleVisualization | null>(null);
  const [improvementMetrics, setImprovementMetrics] = useState<BalanceImprovementMetrics | null>(null);
  const [safetyModifications, setSafetyModifications] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const finalVisualization = useMemo(() => ({ ...DEFAULT_VISUALIZATION, ...visualization }), [visualization]);
  const finalAccessibility = useMemo(() => ({ ...DEFAULT_ACCESSIBILITY, ...accessibility }), [accessibility]);

  // Load progression data on mount
  useEffect(() => {
    const loadProgressionData = async () => {
      try {
        const data = ProgressionStorage.loadProgressData<BalanceProgressionData>(
          `balance_${exerciseId}`,
          userId,
          finalConfig.dataRetentionDays
        );
        setProgressionData(data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setCurrentDifficulty(latestData.difficultyLevel);
          setStabilityTime(latestData.stabilityTime);
          setWobbleIndex(latestData.wobbleIndex);
        }

        // Calculate current difficulty based on performance
        const calculatedDifficulty = BalanceCalculations.calculateDifficultyLevel(data);
        setCurrentDifficulty(calculatedDifficulty);

        // Generate safety modifications
        const modifications = BalanceCalculations.generateSafetyModifications(calculatedDifficulty);
        setSafetyModifications(modifications);

        // Calculate improvement metrics
        const metrics = calculateImprovementMetrics(data);
        setImprovementMetrics(metrics);

        // Generate balance visualization
        const visualization = generateBalanceVisualization(data, calculatedDifficulty);
        setBalanceVisualization(visualization);

        if (onDataUpdate) {
          onDataUpdate(data);
        }
      } catch (err) {
        const errorMessage = 'Failed to load balance progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'data_load',
          message: errorMessage,
          code: 'BALANCE_LOAD_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    };

    loadProgressionData();
  }, [userId, exerciseId, finalConfig.dataRetentionDays, onDataUpdate]);

  // Real-time balance tracking simulation
  useEffect(() => {
    if (!isTracking || !finalConfig.enableAnimations) return;

    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        setStabilityTime(elapsed);

        // Simulate wobble index changes (more realistic with device integration)
        const baseWobble = Math.max(10, 100 - (currentDifficulty * 8));
        const randomWobble = Math.random() * 20 - 10;
        const newWobble = Math.max(5, Math.min(100, baseWobble + randomWobble));
        setWobbleIndex(newWobble);
      }
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [isTracking, startTime, currentDifficulty, finalConfig]);

  // Auto-save data
  const saveProgressData = useCallback((newData: BalanceProgressionData[]) => {
    if (finalConfig.autoSave) {
      try {
        ProgressionStorage.saveProgressData(`balance_${exerciseId}`, newData, userId);
      } catch (err) {
        const errorMessage = 'Failed to save balance progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'storage',
          message: errorMessage,
          code: 'BALANCE_SAVE_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    }
  }, [exerciseId, userId, finalConfig.autoSave]);

  const calculateImprovementMetrics = (data: BalanceProgressionData[]): BalanceImprovementMetrics => {
    if (data.length < 2) {
      return {
        stabilityImprovement: 0,
        balanceConfidence: 50,
        progressionPath: BALANCE_LEVELS.slice(0, 2),
        skillLevel: 'novice'
      };
    }

    const recentData = data.slice(-10);
    const olderData = data.slice(-20, -10);

    const avgRecentStability = recentData.reduce((sum, d) => sum + d.stabilityTime, 0) / recentData.length;
    const avgOlderStability = olderData.length > 0 ? olderData.reduce((sum, d) => sum + d.stabilityTime, 0) / olderData.length : avgRecentStability;

    const stabilityImprovement = avgOlderStability > 0 ? ((avgRecentStability - avgOlderStability) / avgOlderStability) * 100 : 0;
    const balanceConfidence = Math.min(100, (avgRecentStability / 60) * 100); // 60 seconds = 100% confidence

    // Determine skill level based on performance
    const avgWobble = recentData.reduce((sum, d) => sum + d.wobbleIndex, 0) / recentData.length;
    let skillLevel: BalanceImprovementMetrics['skillLevel'] = 'novice';

    if (avgRecentStability > 60 && avgWobble < 20) {
      skillLevel = 'expert';
    } else if (avgRecentStability > 45 && avgWobble < 30) {
      skillLevel = 'advanced';
    } else if (avgRecentStability > 30 && avgWobble < 40) {
      skillLevel = 'intermediate';
    } else if (avgRecentStability > 15 && avgWobble < 60) {
      skillLevel = 'beginner';
    }

    // Generate progression path
    const achievedLevels = BALANCE_LEVELS.filter(level => level.achieved);
    const currentLevel = BALANCE_LEVELS.find(level => level.level === currentDifficulty);
    const nextLevels = currentLevel ? BALANCE_LEVELS.filter(level => level.level > currentLevel.level).slice(0, 3) : BALANCE_LEVELS.slice(0, 3);
    const progressionPath = [...achievedLevels, ...nextLevels];

    return {
      stabilityImprovement: Math.round(stabilityImprovement),
      balanceConfidence: Math.round(balanceConfidence),
      progressionPath,
      skillLevel
    };
  };

  const generateBalanceVisualization = (data: BalanceProgressionData[], currentLevel: number): BalanceScaleVisualization => {
    const recentData = data.slice(-10);
    const instabilityZones: number[] = [];

    // Calculate instability zones (difficulty levels where user struggles)
    BALANCE_LEVELS.forEach(level => {
      const levelData = data.filter(d => d.difficultyLevel === level.level);
      if (levelData.length > 0) {
        const avgWobble = levelData.reduce((sum, d) => sum + d.wobbleIndex, 0) / levelData.length;
        if (avgWobble > 60) {
          instabilityZones.push(level.level);
        }
      }
    });

    // Calculate improvement rate
    const trend = ProgressionCalculations.calculateTrend(
      recentData.map(d => ({ date: d.timestamp, value: d.stabilityTime }))
    );

    return {
      currentLevel,
      targetLevel: Math.min(10, currentLevel + 2),
      progressPercentage: ((currentLevel - 1) / 9) * 100,
      instabilityZones,
      improvementRate: trend.rate
    };
  };

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setStartTime(Date.now());
    setStabilityTime(0);
    setWobbleIndex(100);
  }, []);

  const stopTracking = useCallback(() => {
    if (!isTracking || !startTime) return;

    setIsTracking(false);
    const finalTime = stabilityTime;
    const finalWobble = wobbleIndex;

    // Determine achieved level based on performance
    let achievedLevel = 1;
    for (const level of BALANCE_LEVELS) {
      if (finalTime >= 15 * level.level && finalWobble <= 100 - (level.level * 10)) {
        achievedLevel = level.level;
      }
    }

    const newDataPoint: BalanceProgressionData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      userId,
      timestamp: new Date(),
      difficultyLevel: achievedLevel,
      balanceType,
      stabilityTime: finalTime,
      wobbleIndex: finalWobble,
      safetyModifications,
      improvementMetrics: calculateImprovementMetrics([...progressionData, {
        id: '',
        exerciseId,
        userId,
        timestamp: new Date(),
        difficultyLevel: achievedLevel,
        balanceType,
        stabilityTime: finalTime,
        wobbleIndex: finalWobble,
        safetyModifications,
        improvementMetrics: {
          stabilityImprovement: 0,
          balanceConfidence: 0,
          progressionPath: [],
          skillLevel: 'novice'
        }
      }])
    };

    const newData = [...progressionData, newDataPoint];
    setProgressionData(newData);
    setCurrentDifficulty(achievedLevel);
    saveProgressData(newData);

    // Check for level achievements
    checkLevelAchievements(achievedLevel);

    // Update metrics
    const metrics = calculateImprovementMetrics(newData);
    setImprovementMetrics(metrics);

    const visualization = generateBalanceVisualization(newData, achievedLevel);
    setBalanceVisualization(visualization);

    if (onDataUpdate) {
      onDataUpdate(newData);
    }

    setStartTime(null);
  }, [isTracking, startTime, stabilityTime, wobbleIndex, exerciseId, userId, balanceType, safetyModifications, progressionData, saveProgressData, onDataUpdate]);

  const checkLevelAchievements = (newLevel: number) => {
    const level = BALANCE_LEVELS.find(l => l.level === newLevel);
    if (level && !level.achieved) {
      level.achieved = true;
      level.achievedDate = new Date();

      if (finalConfig.enableCelebrations) {
        setCelebration({
          type: 'milestone',
          title: 'Balance Level Achieved!',
          description: `You've reached ${level.name} level`,
          achievement: `${level.name}: ${level.description}`,
          unlocked: true,
          icon: 'award',
          animation: ProgressionAnimations.generateCelebrationAnimation('milestone')
        });
      }

      if (onLevelAchieved) {
        onLevelAchieved(level);
      }
    }
  };

  const getChartData = useMemo(() => {
    return progressionData.map(d => ({
      date: new Date(d.timestamp).toLocaleDateString(),
      stability: d.stabilityTime,
      wobble: 100 - d.wobbleIndex, // Invert wobble for better visualization
      difficulty: d.difficultyLevel
    }));
  }, [progressionData]);

  const getRadarData = useMemo(() => {
    if (!balanceVisualization) return [];

    return BALANCE_LEVELS.map((level, index) => {
      const isInstabilityZone = balanceVisualization.instabilityZones.includes(level.level);
      const isCurrent = level.level === currentDifficulty;
      const isAchieved = level.achieved;

      let value = isAchieved ? 100 : isCurrent ? balanceVisualization.progressPercentage : 0;
      if (isInstabilityZone) value = Math.max(value, 30); // Show some progress even in struggle zones

      return {
        level: level.name,
        value,
        fullMark: 100
      };
    });
  }, [balanceVisualization, currentDifficulty]);

  const getScaleData = useMemo(() => {
    if (!balanceVisualization) return [];

    return Array.from({ length: 10 }, (_, i) => {
      const level = i + 1;
      const isInstabilityZone = balanceVisualization.instabilityZones.includes(level);
      const isCurrent = level === currentDifficulty;
      const isAchieved = BALANCE_LEVELS.find(l => l.level === level)?.achieved || false;

      return {
        level,
        name: `Level ${level}`,
        achieved: isAchieved,
        current: isCurrent,
        unstable: isInstabilityZone,
        progress: level <= currentDifficulty ? 100 : 0
      };
    });
  }, [balanceVisualization, currentDifficulty]);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`balance-difficulty-indicator ${className}`} role="region" aria-label="Balance Difficulty Indicator">
      {/* Celebration Modal */}
      <AnimatePresence>
        {celebration && finalConfig.enableCelebrations && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setCelebration(null)}
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-lg p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{celebration.title}</h2>
                <p className="text-gray-600 mb-4">{celebration.description}</p>
                <div className="text-lg font-semibold text-purple-600 mb-6">{celebration.achievement}</div>
                <button
                  onClick={() => setCelebration(null)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Balance Scale */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Balance Scale</h3>
            <Scale className="w-5 h-5 text-purple-600" />
          </div>

          {/* Visual Balance Scale */}
          <div className="relative mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-64 h-8">
                {/* Scale Base */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gray-800 rounded-t-sm"></div>

                {/* Scale Beam */}
                <motion.div
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-60 h-1 bg-gray-600 origin-center"
                  animate={{
                    rotate: isTracking ? ((wobbleIndex - 50) / 50) * 15 : 0
                  }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  {/* Left Weight */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full"></div>
                  {/* Right Weight */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-red-600 rounded-full"></div>
                </motion.div>
              </div>
            </div>

            {/* Balance Status */}
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {isTracking ? 'Balancing...' : 'Ready'}
              </div>
              <div className="text-gray-600">
                Difficulty Level: {currentDifficulty}/10
              </div>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stabilityTime.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Stability Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{wobbleIndex.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Wobble Index</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              aria-label={isTracking ? 'Stop balance tracking' : 'Start balance tracking'}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>
        </div>

        {/* Difficulty Progression */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Difficulty Progression</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          {/* Level Scale */}
          <div className="space-y-2 mb-6">
            {getScaleData.map((level) => (
              <div key={level.level} className="flex items-center gap-3">
                <div className="w-12 text-sm font-medium text-gray-700">L{level.level}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${level.progress}%` }}
                      transition={{ duration: 0.5, delay: level.level * 0.05 }}
                      className={`h-2 rounded-full ${
                        level.achieved
                          ? 'bg-green-500'
                          : level.current
                          ? 'bg-blue-600'
                          : level.unstable
                          ? 'bg-red-400'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {level.achieved && <Award className="w-4 h-4 text-green-600" />}
                  {level.current && <Activity className="w-4 h-4 text-blue-600" />}
                  {level.unstable && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Improvement Metrics */}
          {improvementMetrics && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    +{improvementMetrics.stabilityImprovement}%
                  </div>
                  <div className="text-sm text-gray-600">Stability Improvement</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {improvementMetrics.balanceConfidence}%
                  </div>
                  <div className="text-sm text-gray-600">Balance Confidence</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Skill Profile</h3>
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={getRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="level" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Skill Level"
                dataKey="value"
                stroke={finalVisualization.colorScheme[0]}
                fill={finalVisualization.colorScheme[0]}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Safety Modifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Safety Modifications</h3>
            <Shield className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="space-y-3">
            {safetyModifications.map((modification, index) => (
              <div key={index} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 text-sm">{modification}</p>
              </div>
            ))}
          </div>

          {balanceType === 'dynamic' && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Dynamic Balance</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Ensure adequate space and clear surroundings for dynamic movements.
              </p>
            </div>
          )}
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          {progressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={getChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="stability"
                  stroke={finalVisualization.colorScheme[0]}
                  fill={finalVisualization.colorScheme[0]}
                  fillOpacity={0.6}
                  name="Stability Time (s)"
                />
                <Area
                  type="monotone"
                  dataKey="wobble"
                  stroke={finalVisualization.colorScheme[1]}
                  fill={finalVisualization.colorScheme[1]}
                  fillOpacity={0.6}
                  name="Stability Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No balance data yet. Start tracking to see your progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceDifficultyIndicator;
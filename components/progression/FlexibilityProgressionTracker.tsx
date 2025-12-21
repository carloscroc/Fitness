/**
 * FlexibilityProgressionTracker Component
 *
 * Tracks range of motion improvements and flexibility milestones with
 * advanced visualization and AI-driven modification suggestions.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Target, Activity, AlertCircle, CheckCircle, Clock, Zap, Brain } from 'lucide-react';

import {
  FlexibilityProgressionData,
  FlexibilityMilestone,
  FlexibilityAssessment,
  ProgressionTrackerConfig,
  VisualizationConfig,
  AccessibilityConfig,
  ProgressionCelebration,
  ProgressionPrediction
} from './types';
import {
  ProgressionStorage,
  FlexibilityCalculations,
  ProgressionCalculations,
  ProgressionAnimations,
  ProgressionErrorHandler
} from './utils';

interface FlexibilityProgressionTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: FlexibilityProgressionData[]) => void;
  onMilestoneAchieved?: (milestone: FlexibilityMilestone) => void;
  className?: string;
}

const DEFAULT_CONFIG: ProgressionTrackerConfig = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 5000,
  autoSave: true
};

const DEFAULT_VISUALIZATION: VisualizationConfig = {
  chartType: 'line',
  colorScheme: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
  showGridlines: true,
  showLabels: true,
  showLegend: true,
  interactive: true,
  animationDuration: 500
};

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  enableHighContrast: false,
  enableReducedMotion: false,
  enableScreenReader: true,
  fontSize: 'medium',
  colorBlindMode: 'none'
};

const FLEXIBILITY_MILESTONES: FlexibilityMilestone[] = [
  {
    level: 'beginner',
    name: 'Basic Range',
    description: 'Achieve fundamental flexibility and basic range of motion',
    targetROM: 40,
    achieved: false
  },
  {
    level: 'intermediate',
    name: 'Enhanced Flexibility',
    description: 'Develop improved range of motion and muscle elasticity',
    targetROM: 70,
    achieved: false
  },
  {
    level: 'advanced',
    name: 'Peak Flexibility',
    description: 'Reach maximum flexibility potential and advanced range of motion',
    targetROM: 90,
    achieved: false
  }
];

export const FlexibilityProgressionTracker: React.FC<FlexibilityProgressionTrackerProps> = ({
  userId,
  exerciseId,
  exerciseName,
  config = {},
  visualization = {},
  accessibility = {},
  onDataUpdate,
  onMilestoneAchieved,
  className = ''
}) => {
  const [progressionData, setProgressionData] = useState<FlexibilityProgressionData[]>([]);
  const [currentROM, setCurrentROM] = useState<number>(0);
  const [flexibilityType, setFlexibilityType] = useState<'static' | 'dynamic' | 'proprioceptive'>('static');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [celebration, setCelebration] = useState<ProgressCelebration | null>(null);
  const [assessment, setAssessment] = useState<FlexibilityAssessment | null>(null);
  const [prediction, setPrediction] = useState<ProgressPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const finalVisualization = useMemo(() => ({ ...DEFAULT_VISUALIZATION, ...visualization }), [visualization]);
  const finalAccessibility = useMemo(() => ({ ...DEFAULT_ACCESSIBILITY, ...accessibility }), [accessibility]);

  // Load progression data on mount
  useEffect(() => {
    const loadProgressionData = async () => {
      try {
        setIsLoading(true);
        const data = ProgressionStorage.loadProgressData<FlexibilityProgressionData>(
          `flexibility_${exerciseId}`,
          userId,
          finalConfig.dataRetentionDays
        );
        setProgressionData(data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setCurrentROM(latestData.romPercentage);
          setFlexibilityType(latestData.flexibilityType);
        }

        // Calculate assessment
        const assessmentScore = FlexibilityCalculations.calculateAssessmentScore(data);
        const suggestions = FlexibilityCalculations.generateModificationSuggestions(data);
        const nextMilestone = FLEXIBILITY_MILESTONES.find(m => !m.achieved) || FLEXIBILITY_MILESTONES[FLEXIBILITY_MILESTONES.length - 1];

        setAssessment({
          overallScore: assessmentScore,
          staticScore: calculateTypeScore(data, 'static'),
          dynamicScore: calculateTypeScore(data, 'dynamic'),
          proprioceptiveScore: calculateTypeScore(data, 'proprioceptive'),
          recommendations: suggestions,
          nextMilestone
        });

        // Generate prediction if enabled
        if (finalConfig.enablePredictions && data.length >= 5) {
          const dataPoints = data.map(d => ({ date: d.timestamp, value: d.romPercentage }));
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + 30);

          const pred = ProgressionCalculations.generatePrediction(dataPoints, targetDate);
          setPrediction(pred);
        }

        if (onDataUpdate) {
          onDataUpdate(data);
        }
      } catch (err) {
        const errorMessage = 'Failed to load progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'data_load',
          message: errorMessage,
          code: 'LOAD_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressionData();
  }, [userId, exerciseId, finalConfig.dataRetentionDays, finalConfig.enablePredictions, onDataUpdate]);

  // Auto-save data
  const saveProgressData = useCallback((newData: FlexibilityProgressionData[]) => {
    if (finalConfig.autoSave) {
      try {
        ProgressionStorage.saveProgressData(`flexibility_${exerciseId}`, newData, userId);
      } catch (err) {
        const errorMessage = 'Failed to save progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'storage',
          message: errorMessage,
          code: 'SAVE_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    }
  }, [exerciseId, userId, finalConfig.autoSave]);

  // Record new progression data
  const recordProgression = useCallback((romPercentage: number, holdTime?: number, repetitions?: number) => {
    const newDataPoint: FlexibilityProgressionData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      userId,
      timestamp: new Date(),
      romPercentage,
      flexibilityType,
      milestone: getCurrentMilestone(romPercentage),
      assessmentScore: FlexibilityCalculations.calculateAssessmentScore([...progressionData, {
        id: '',
        exerciseId,
        userId,
        timestamp: new Date(),
        romPercentage,
        flexibilityType,
        milestone: getCurrentMilestone(romPercentage),
        assessmentScore: 0,
        modificationSuggestions: []
      }]),
      holdTime,
      repetitions,
      modificationSuggestions: []
    };

    const newData = [...progressionData, newDataPoint];
    setProgressionData(newData);
    setCurrentROM(romPercentage);
    saveProgressData(newData);

    // Check for milestone achievements
    checkMilestoneAchievements(newDataPoint);

    if (onDataUpdate) {
      onDataUpdate(newData);
    }
  }, [exerciseId, userId, progressionData, flexibilityType, saveProgressData, onDataUpdate]);

  const getCurrentMilestone = (rom: number): FlexibilityMilestone => {
    for (const milestone of FLEXIBILITY_MILESTONES) {
      if (rom >= milestone.targetROM) {
        return { ...milestone, achieved: true, achievedDate: new Date() };
      }
    }
    return { ...FLEXIBILITY_MILESTONES[0], achieved: false };
  };

  const checkMilestoneAchievements = (dataPoint: FlexibilityProgressionData) => {
    FLEXIBILITY_MILESTONES.forEach((milestone, index) => {
      if (!milestone.achieved && dataPoint.romPercentage >= milestone.targetROM) {
        const achievedMilestone = { ...milestone, achieved: true, achievedDate: new Date() };
        FLEXIBILITY_MILESTONES[index] = achievedMilestone;

        if (finalConfig.enableCelebrations) {
          setCelebration({
            type: 'milestone',
            title: 'Flexibility Milestone Achieved!',
            description: `You've reached ${milestone.name}`,
            achievement: `Achieved ${milestone.targetROM}% ROM`,
            unlocked: true,
            icon: 'award',
            animation: ProgressionAnimations.generateCelebrationAnimation('milestone')
          });
        }

        if (onMilestoneAchieved) {
          onMilestoneAchieved(achievedMilestone);
        }
      }
    });
  };

  const calculateTypeScore = (data: FlexibilityProgressionData[], type: 'static' | 'dynamic' | 'proprioceptive'): number => {
    const typeData = data.filter(d => d.flexibilityType === type);
    return typeData.length > 0 ? FlexibilityCalculations.calculateAssessmentScore(typeData) : 0;
  };

  const getChartData = useMemo(() => {
    return progressionData.map(d => ({
      date: new Date(d.timestamp).toLocaleDateString(),
      rom: d.romPercentage,
      assessment: d.assessmentScore,
      type: d.flexibilityType
    }));
  }, [progressionData]);

  const getRadialData = useMemo(() => {
    if (!assessment) return [];
    return [
      { name: 'Static', value: assessment.staticScore, fill: finalVisualization.colorScheme[0] },
      { name: 'Dynamic', value: assessment.dynamicScore, fill: finalVisualization.colorScheme[1] },
      { name: 'Proprioceptive', value: assessment.proprioceptiveScore, fill: finalVisualization.colorScheme[2] }
    ];
  }, [assessment, finalVisualization.colorScheme]);

  const getMilestoneProgress = useMemo(() => {
    return FLEXIBILITY_MILESTONES.map(milestone => ({
      name: milestone.name,
      target: milestone.targetROM,
      current: currentROM,
      achieved: milestone.achieved,
      progress: Math.min(100, (currentROM / milestone.targetROM) * 100)
    }));
  }, [currentROM]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flexibility-progression-tracker ${className}`} role="region" aria-label="Flexibility Progression Tracker">
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
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{celebration.title}</h2>
                <p className="text-gray-600 mb-4">{celebration.description}</p>
                <div className="text-lg font-semibold text-blue-600 mb-6">{celebration.achievement}</div>
                <button
                  onClick={() => setCelebration(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current ROM Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Range of Motion</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">{currentROM}%</div>
            <div className="text-gray-600 mb-4">Flexibility Achieved</div>
            <div className="flex justify-center gap-2 mb-4">
              {(['static', 'dynamic', 'proprioceptive'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFlexibilityType(type)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    flexibilityType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-pressed={flexibilityType === type}
                  aria-label={`Select ${type} flexibility type`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <input
                type="number"
                min="0"
                max="100"
                value={currentROM}
                onChange={(e) => setCurrentROM(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                aria-label="Range of motion percentage"
              />
              <button
                onClick={() => recordProgression(currentROM)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                aria-label="Record current progression"
              >
                Record Progress
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Score */}
        {assessment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Flexibility Assessment</h3>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-purple-600 mb-2">{assessment.overallScore}</div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={getRadialData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Over Time</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          {progressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rom"
                  stroke={finalVisualization.colorScheme[0]}
                  strokeWidth={2}
                  name="Range of Motion (%)"
                />
                <Line
                  type="monotone"
                  dataKey="assessment"
                  stroke={finalVisualization.colorScheme[1]}
                  strokeWidth={2}
                  name="Assessment Score"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No progression data yet. Start tracking to see your progress!
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="space-y-4">
            {getMilestoneProgress.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{milestone.name}</span>
                    <span className="text-sm text-gray-600">{milestone.current}/{milestone.target}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        milestone.achieved ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                    />
                  </div>
                </div>
                {milestone.achieved && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {assessment && assessment.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-3">
              {assessment.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prediction */}
        {prediction && finalConfig.enablePredictions && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">30-Day Prediction</h3>
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {Math.round(prediction.predictedValue)}%
              </div>
              <div className="text-gray-600 mb-4">Predicted ROM in 30 days</div>
              <div className="text-sm text-gray-500">
                Confidence: {prediction.confidence}%
              </div>
              {prediction.requirements.length > 0 && (
                <div className="mt-4 text-left">
                  <div className="font-medium text-gray-900 mb-2">To achieve this:</div>
                  <ul className="space-y-1">
                    {prediction.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlexibilityProgressionTracker;
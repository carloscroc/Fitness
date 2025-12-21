/**
 * StabilityBallEngagementTracker Component
 *
 * Monitors core engagement and stability metrics for stability ball exercises with
 * real-time muscle activation heat maps, form quality feedback, and endurance tracking.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Brain, Heart, Target, AlertCircle, CheckCircle, TrendingUp, Award, Clock, Zap, Shield, Wind, Gauge } from 'lucide-react';

import {
  StabilityBallProgressionData,
  CoreEngagementMetrics,
  MuscleActivationMap,
  FormQualityMetrics,
  FormFeedback,
  EngagementPattern,
  StabilityImprovementMetrics,
  StabilityMilestone,
  ProgressionTrackerConfig,
  VisualizationConfig,
  AccessibilityConfig,
  ProgressionCelebration
} from './types';
import {
  ProgressionStorage,
  StabilityCalculations,
  ProgressionCalculations,
  ProgressionAnimations,
  ProgressionErrorHandler
} from './utils';

interface StabilityBallEngagementTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  difficultyLevel?: number;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: StabilityBallProgressionData[]) => void;
  onMilestoneAchieved?: (milestone: StabilityMilestone) => void;
  className?: string;
}

const DEFAULT_CONFIG: ProgressionTrackerConfig = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 500,
  autoSave: true
};

const DEFAULT_VISUALIZATION: VisualizationConfig = {
  chartType: 'radar',
  colorScheme: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  showGridlines: true,
  showLabels: true,
  showLegend: true,
  interactive: true,
  animationDuration: 400
};

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  enableHighContrast: false,
  enableReducedMotion: false,
  enableScreenReader: true,
  fontSize: 'medium',
  colorBlindMode: 'none'
};

const STABILITY_MILESTONES: StabilityMilestone[] = [
  {
    name: 'Foundation',
    description: 'Basic core engagement and stability awareness',
    requiredScore: 25,
    achieved: false,
    benefits: ['Improved posture awareness', 'Basic core activation']
  },
  {
    name: 'Developing',
    description: 'Consistent core engagement during basic exercises',
    requiredScore: 50,
    achieved: false,
    benefits: ['Enhanced stability', 'Better exercise form']
  },
  {
    name: 'Proficient',
    description: 'Advanced core control and endurance',
    requiredScore: 75,
    achieved: false,
    benefits: ['Injury prevention', 'Advanced exercise performance']
  },
  {
    name: 'Expert',
    description: 'Elite-level core stability and control',
    requiredScore: 90,
    achieved: false,
    benefits: ['Peak athletic performance', 'Maximum injury resistance']
  }
];

const MUSCLE_GROUPS = [
  { name: 'Rectus Abdominis', key: 'rectusAbdominis', icon: '💪' },
  { name: 'Obliques', key: 'obliques', icon: '🔥' },
  { name: 'Transverse Abdominis', key: 'transverseAbdominis', icon: '🎯' },
  { name: 'Erector Spinae', key: 'erectorSpinae', icon: '⚡' },
  { name: 'Glutes', key: 'glutes', icon: '🏋️' },
  { name: 'Hip Flexors', key: 'hipFlexors', icon: '🦵' }
];

export const StabilityBallEngagementTracker: React.FC<StabilityBallEngagementTrackerProps> = ({
  userId,
  exerciseId,
  exerciseName,
  difficultyLevel = 1,
  config = {},
  visualization = {},
  accessibility = {},
  onDataUpdate,
  onMilestoneAchieved,
  className = ''
}) => {
  const [progressionData, setProgressionData] = useState<StabilityBallProgressionData[]>([]);
  const [stabilityIndex, setStabilityIndex] = useState<number>(1);
  const [enduranceTime, setEnduranceTime] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<ProgressCelebration | null>(null);
  const [improvementMetrics, setImprovementMetrics] = useState<StabilityImprovementMetrics | null>(null);
  const [coreEngagement, setCoreEngagement] = useState<CoreEngagementMetrics>({
    overallEngagement: 0,
    muscleActivation: {
      rectusAbdominis: 0,
      obliques: 0,
      transverseAbdominis: 0,
      erectorSpinae: 0,
      glutes: 0,
      hipFlexors: 0
    },
    stabilizerEngagement: 0,
    enduranceScore: 0
  });
  const [formQuality, setFormQuality] = useState<FormQualityMetrics>({
    overallScore: 0,
    spinalAlignment: 0,
    breathing: 0,
    control: 0,
    stability: 0,
    feedback: []
  });
  const [formFeedback, setFormFeedback] = useState<FormFeedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const finalVisualization = useMemo(() => ({ ...DEFAULT_VISUALIZATION, ...visualization }), [visualization]);
  const finalAccessibility = useMemo(() => ({ ...DEFAULT_ACCESSIBILITY, ...accessibility }), [accessibility]);

  // Load progression data on mount
  useEffect(() => {
    const loadProgressionData = async () => {
      try {
        const data = ProgressionStorage.loadProgressData<StabilityBallProgressionData>(
          `stability_${exerciseId}`,
          userId,
          finalConfig.dataRetentionDays
        );
        setProgressionData(data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setStabilityIndex(latestData.stabilityIndex);
          setEnduranceTime(latestData.enduranceTime);
          setCoreEngagement(latestData.coreEngagement);
          setFormQuality(latestData.formQuality);
        }

        // Calculate current stability index
        const calculatedStability = StabilityCalculations.calculateStabilityIndex(data);
        setStabilityIndex(calculatedStability);

        // Generate form feedback
        const feedback = StabilityCalculations.generateFormFeedback(data);
        setFormFeedback(feedback);

        // Calculate improvement metrics
        const metrics = calculateImprovementMetrics(data);
        setImprovementMetrics(metrics);

        if (onDataUpdate) {
          onDataUpdate(data);
        }
      } catch (err) {
        const errorMessage = 'Failed to load stability progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'data_load',
          message: errorMessage,
          code: 'STABILITY_LOAD_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    };

    loadProgressionData();
  }, [userId, exerciseId, finalConfig.dataRetentionDays, onDataUpdate]);

  // Real-time tracking simulation (would integrate with sensors in production)
  useEffect(() => {
    if (!isTracking || !finalConfig.enableAnimations) return;

    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        setEnduranceTime(elapsed);

        // Simulate realistic muscle activation patterns
        const baseEngagement = Math.min(100, 50 + (difficultyLevel * 5) + (elapsed / 10));
        const muscleVariation = Math.sin(Date.now() / 2000) * 10;

        const newMuscleActivation: MuscleActivationMap = {
          rectusAbdominis: Math.max(20, Math.min(95, baseEngagement + muscleVariation)),
          obliques: Math.max(15, Math.min(90, baseEngagement - muscleVariation / 2)),
          transverseAbdominis: Math.max(30, Math.min(100, baseEngagement + muscleVariation / 3)),
          erectorSpinae: Math.max(25, Math.min(85, baseEngagement - muscleVariation / 4)),
          glutes: Math.max(20, Math.min(80, baseEngagement + muscleVariation / 5)),
          hipFlexors: Math.max(15, Math.min(75, baseEngagement - muscleVariation / 6))
        };

        const overallEngagement = Object.values(newMuscleActivation).reduce((sum, val) => sum + val, 0) / 6;

        setCoreEngagement({
          overallEngagement,
          muscleActivation: newMuscleActivation,
          stabilizerEngagement: Math.min(100, baseEngagement + 10),
          enduranceScore: Math.min(100, (elapsed / 60) * 100) // 60 seconds = 100% endurance score
        });

        // Update form quality based on engagement and fatigue
        const fatigueFactor = Math.max(0, 1 - (elapsed / 300)); // Fatigue after 5 minutes
        const newFormQuality: FormQualityMetrics = {
          overallScore: Math.max(30, Math.min(100, baseEngagement * fatigueFactor)),
          spinalAlignment: Math.max(40, Math.min(100, (baseEngagement + 10) * fatigueFactor)),
          breathing: Math.max(35, Math.min(95, (baseEngagement + 5) * fatigueFactor)),
          control: Math.max(30, Math.min(90, baseEngagement * fatigueFactor)),
          stability: Math.max(40, Math.min(100, (baseEngagement + 15) * fatigueFactor)),
          feedback: []
        };

        setFormQuality(newFormQuality);

        // Update stability index
        const enduranceScore = Math.min(100, (elapsed / 60) * 100);
        const engagementScore = overallEngagement;
        const formScore = newFormQuality.overallScore;

        const newStabilityIndex = Math.round((enduranceScore + engagementScore + formScore) / 3);
        setStabilityIndex(newStabilityIndex);
      }
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [isTracking, startTime, difficultyLevel, finalConfig.enableAnimations, finalConfig.refreshInterval]);

  // Auto-save data
  const saveProgressData = useCallback((newData: StabilityBallProgressionData[]) => {
    if (finalConfig.autoSave) {
      try {
        ProgressionStorage.saveProgressData(`stability_${exerciseId}`, newData, userId);
      } catch (err) {
        const errorMessage = 'Failed to save stability progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'storage',
          message: errorMessage,
          code: 'STABILITY_SAVE_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    }
  }, [exerciseId, userId, finalConfig.autoSave]);

  const calculateImprovementMetrics = (data: StabilityBallProgressionData[]): StabilityImprovementMetrics => {
    if (data.length < 2) {
      return {
        stabilityGain: 0,
        enduranceImprovement: 0,
        formProgression: [],
        stabilityMilestones: STABILITY_MILESTONES
      };
    }

    const recentData = data.slice(-5);
    const olderData = data.slice(-10, -5);

    const avgRecentStability = recentData.reduce((sum, d) => sum + d.stabilityIndex, 0) / recentData.length;
    const avgOlderStability = olderData.length > 0 ? olderData.reduce((sum, d) => sum + d.stabilityIndex, 0) / olderData.length : avgRecentStability;

    const stabilityGain = avgOlderStability > 0 ? ((avgRecentStability - avgOlderStability) / avgOlderStability) * 100 : 0;

    const avgRecentEndurance = recentData.reduce((sum, d) => sum + d.enduranceTime, 0) / recentData.length;
    const avgOlderEndurance = olderData.length > 0 ? olderData.reduce((sum, d) => sum + d.enduranceTime, 0) / olderData.length : avgRecentEndurance;

    const enduranceImprovement = avgRecentEndurance - avgOlderEndurance;

    const formProgression: FormProgressionData[] = data.slice(-10).map(d => ({
      date: d.timestamp,
      overallScore: d.formQuality.overallScore,
      specificMetrics: {
        spinalAlignment: d.formQuality.spinalAlignment,
        breathing: d.formQuality.breathing,
        control: d.formQuality.control,
        stability: d.formQuality.stability
      }
    }));

    // Update milestone achievements
    const updatedMilestones = STABILITY_MILESTONES.map(milestone => ({
      ...milestone,
      achieved: avgRecentStability >= milestone.requiredScore
    }));

    return {
      stabilityGain: Math.round(stabilityGain),
      enduranceImprovement: Math.round(enduranceImprovement * 10) / 10,
      formProgression,
      stabilityMilestones: updatedMilestones
    };
  };

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setStartTime(Date.now());
    setEnduranceTime(0);
    setStabilityIndex(1);
  }, []);

  const stopTracking = useCallback(() => {
    if (!isTracking || !startTime) return;

    setIsTracking(false);
    const finalTime = enduranceTime;

    const newDataPoint: StabilityBallProgressionData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      userId,
      timestamp: new Date(),
      stabilityIndex,
      coreEngagement,
      enduranceTime: finalTime,
      formQuality,
      engagementPattern: {
        exercise: exerciseName,
        primaryMuscles: ['rectusAbdominis', 'transverseAbdominis'],
        secondaryMuscles: ['obliques', 'erectorSpinae'],
        stabilizationMuscles: ['glutes', 'hipFlexors'],
        activationTimeline: []
      }
    };

    const newData = [...progressionData, newDataPoint];
    setProgressionData(newData);
    saveProgressData(newData);

    // Update form feedback
    const feedback = StabilityCalculations.generateFormFeedback(newData);
    setFormFeedback(feedback);

    // Update improvement metrics
    const metrics = calculateImprovementMetrics(newData);
    setImprovementMetrics(metrics);

    // Check for milestone achievements
    checkMilestoneAchievements(metrics.stabilityMilestones);

    if (onDataUpdate) {
      onDataUpdate(newData);
    }

    setStartTime(null);
  }, [isTracking, startTime, enduranceTime, stabilityIndex, coreEngagement, formQuality, exerciseId, userId, exerciseName, progressionData, saveProgressData, onDataUpdate]);

  const checkMilestoneAchievements = (milestones: StabilityMilestone[]) => {
    milestones.forEach((milestone) => {
      if (milestone.achieved && !STABILITY_MILESTONES.find(m => m.name === milestone.name)?.achieved) {
        const originalMilestone = STABILITY_MILESTONES.find(m => m.name === milestone.name);
        if (originalMilestone) {
          originalMilestone.achieved = true;

          if (finalConfig.enableCelebrations) {
            setCelebration({
              type: 'milestone',
              title: 'Stability Milestone Achieved!',
              description: `You've reached ${milestone.name} level`,
              achievement: `${milestone.name}: ${milestone.description}`,
              unlocked: true,
              icon: 'award',
              animation: ProgressionAnimations.generateCelebrationAnimation('milestone')
            });
          }

          if (onMilestoneAchieved) {
            onMilestoneAchieved(milestone);
          }
        }
      }
    });
  };

  const getChartData = useMemo(() => {
    return progressionData.map(d => ({
      date: new Date(d.timestamp).toLocaleDateString(),
      stability: d.stabilityIndex,
      endurance: d.enduranceTime,
      engagement: d.coreEngagement.overallEngagement,
      form: d.formQuality.overallScore
    }));
  }, [progressionData]);

  const getMuscleActivationData = useMemo(() => {
    return Object.entries(coreEngagement.muscleActivation).map(([key, value]) => {
      const muscle = MUSCLE_GROUPS.find(m => m.key === key);
      return {
        name: muscle?.name || key,
        activation: value,
        icon: muscle?.icon || '💪'
      };
    });
  }, [coreEngagement.muscleActivation]);

  const getFormProgressionData = useMemo(() => {
    return improvementMetrics?.formProgression.map(d => ({
      date: new Date(d.date).toLocaleDateString(),
      spinalAlignment: d.specificMetrics.spinalAlignment,
      breathing: d.specificMetrics.breathing,
      control: d.specificMetrics.control,
      stability: d.specificMetrics.stability
    })) || [];
  }, [improvementMetrics]);

  const getActivationHeatmapData = useMemo(() => {
    const muscle = MUSCLE_GROUPS.map(m => ({
      muscle: m.name,
      activation: coreEngagement.muscleActivation[m.key],
      level: getActivationLevel(coreEngagement.muscleActivation[m.key])
    }));
    return muscle;
  }, [coreEngagement.muscleActivation]);

  const getActivationLevel = (activation: number): 'low' | 'medium' | 'high' => {
    if (activation < 40) return 'low';
    if (activation < 70) return 'medium';
    return 'high';
  };

  const getActivationColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // yellow
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

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
    <div className={`stability-ball-engagement-tracker ${className}`} role="region" aria-label="Stability Ball Engagement Tracker">
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
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{celebration.title}</h2>
                <p className="text-gray-600 mb-4">{celebration.description}</p>
                <div className="text-lg font-semibold text-green-600 mb-6">{celebration.achievement}</div>
                <button
                  onClick={() => setCelebration(null)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stability Index Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stability Index</h3>
            <Gauge className="w-5 h-5 text-green-600" />
          </div>

          {/* Stability Gauge */}
          <div className="text-center mb-6">
            <motion.div
              className="text-6xl font-bold mb-2"
              animate={{
                color: stabilityIndex > 75 ? '#10b981' : stabilityIndex > 50 ? '#f59e0b' : '#ef4444'
              }}
              transition={{ duration: 0.5 }}
            >
              {stabilityIndex}
            </motion.div>
            <div className="text-gray-600 mb-4">Overall Stability Score</div>

            {/* Stability Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <motion.div
                className="h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${stabilityIndex}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Core Engagement */}
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {coreEngagement.overallEngagement.toFixed(0)}%
            </div>
            <div className="text-gray-600">Core Engagement</div>
          </div>

          {/* Endurance Timer */}
          <div className="text-center mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">{enduranceTime.toFixed(1)}s</span>
            </div>
            <div className="text-sm text-gray-700">Endurance Time</div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isTracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              aria-label={isTracking ? 'Stop stability tracking' : 'Start stability tracking'}
            >
              {isTracking ? (
                <>
                  <Activity className="w-4 h-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Start Tracking
                </>
              )}
            </button>
          </div>
        </div>

        {/* Muscle Activation Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Muscle Activation</h3>
            <Zap className="w-5 h-5 text-purple-600" />
          </div>

          {/* Visual Heatmap */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {getActivationHeatmapData.map((muscle, index) => (
              <motion.div
                key={muscle.muscle}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border-2"
                style={{
                  borderColor: getActivationColor(muscle.level),
                  backgroundColor: `${getActivationColor(muscle.level)}20`
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{muscle.icon}</div>
                  <div className="font-medium text-gray-900 text-sm mb-1">{muscle.muscle}</div>
                  <div className={`text-lg font-bold ${
                    muscle.level === 'high' ? 'text-red-600' :
                    muscle.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {muscle.activation.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{muscle.level}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Muscle Activation Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getMuscleActivationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activation" fill={finalVisualization.colorScheme[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Form Quality Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Form Quality</h3>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-4 mb-6">
            {[
              { metric: 'Spinal Alignment', value: formQuality.spinalAlignment, icon: Shield, color: 'blue' },
              { metric: 'Breathing', value: formQuality.breathing, icon: Wind, color: 'green' },
              { metric: 'Control', value: formQuality.control, icon: Brain, color: 'purple' },
              { metric: 'Stability', value: formQuality.stability, icon: Activity, color: 'orange' }
            ].map(({ metric, value, icon: Icon, color }) => (
              <div key={metric} className="flex items-center gap-3">
                <Icon className={`w-4 h-4 text-${color}-600`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{metric}</span>
                    <span className="text-sm font-bold text-gray-900">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-2 rounded-full bg-${color}-600`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Form Feedback */}
          {formFeedback.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Form Feedback</h4>
              <div className="space-y-2">
                {formFeedback.slice(0, 3).map((feedback, index) => (
                  <div key={index} className={`flex items-start gap-2 p-2 rounded-lg ${
                    feedback.type === 'positive' ? 'bg-green-50' :
                    feedback.type === 'improvement' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    {feedback.type === 'positive' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                    {feedback.type === 'improvement' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                    {feedback.type === 'critical' && <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                    <p className="text-sm text-gray-700">{feedback.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stability Milestones</h3>
            <Award className="w-5 h-5 text-yellow-600" />
          </div>

          <div className="space-y-4">
            {improvementMetrics?.stabilityMilestones.map((milestone, index) => (
              <div key={milestone.name} className="border-l-4 pl-4" style={{
                borderColor: milestone.achieved ? '#10b981' : '#e5e7eb'
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{milestone.name}</span>
                  {milestone.achieved && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-sm text-gray-600 mb-2">{milestone.description}</div>
                <div className="text-xs text-gray-500">
                  Required: {milestone.requiredScore} points | Current: {stabilityIndex} points
                </div>
                {milestone.achieved && (
                  <div className="mt-2 text-xs text-green-700">
                    Benefits: {milestone.benefits.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          {progressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stability"
                  stroke={finalVisualization.colorScheme[0]}
                  strokeWidth={2}
                  name="Stability Index"
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke={finalVisualization.colorScheme[1]}
                  strokeWidth={2}
                  name="Core Engagement (%)"
                />
                <Line
                  type="monotone"
                  dataKey="form"
                  stroke={finalVisualization.colorScheme[2]}
                  strokeWidth={2}
                  name="Form Quality (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No stability data yet. Start tracking to see your progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StabilityBallEngagementTracker;
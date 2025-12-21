/**
 * MedicineBallPowerTracker Component
 *
 * Tracks power output metrics for medicine ball exercises with real-time power calculations,
 * consistency scoring, and explosive index measurements for athletic performance.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ComposedChart, Area } from 'recharts';
import { Zap, Target, TrendingUp, Award, Activity, Gauge, Stopwatch, Wind, AlertCircle, CheckCircle, Flame, Battery } from 'lucide-react';

import {
  MedicineBallProgressionData,
  PowerTechniqueMetrics,
  PowerProgressionMetrics,
  PowerRecord,
  PowerDevelopmentChart,
  ConsistencyData,
  ExplosiveProgressData,
  ProgressionTrackerConfig,
  VisualizationConfig,
  AccessibilityConfig,
  ProgressionCelebration
} from './types';
import {
  ProgressionStorage,
  PowerCalculations,
  ProgressionCalculations,
  ProgressionAnimations,
  ProgressionErrorHandler
} from './utils';

interface MedicineBallPowerTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  ballWeight?: number; // kg
  bodyweight?: number; // kg
  powerType?: 'rotational' | 'explosive' | 'plyometric';
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: MedicineBallProgressionData[]) => void;
  onRecordAchieved?: (record: PowerRecord) => void;
  className?: string;
}

const DEFAULT_CONFIG: ProgressionTrackerConfig = {
  enableAnimations: true,
  enableCelebrations: true,
  enablePredictions: true,
  enableAISuggestions: true,
  dataRetentionDays: 365,
  refreshInterval: 100,
  autoSave: true
};

const DEFAULT_VISUALIZATION: VisualizationConfig = {
  chartType: 'line',
  colorScheme: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
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

const POWER_ZONES = [
  { name: 'Beginner', min: 0, max: 200, color: '#10b981' },
  { name: 'Intermediate', min: 200, max: 400, color: '#3b82f6' },
  { name: 'Advanced', min: 400, max: 600, color: '#f59e0b' },
  { name: 'Elite', min: 600, max: 1000, color: '#ef4444' }
];

export const MedicineBallPowerTracker: React.FC<MedicineBallPowerTrackerProps> = ({
  userId,
  exerciseId,
  exerciseName,
  ballWeight = 3,
  bodyweight = 70,
  powerType = 'explosive',
  config = {},
  visualization = {},
  accessibility = {},
  onDataUpdate,
  onRecordAchieved,
  className = ''
}) => {
  const [progressionData, setProgressionData] = useState<MedicineBallProgressionData[]>([]);
  const [currentPower, setCurrentPower] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [consistencyScore, setConsistencyScore] = useState<number>(0);
  const [explosiveIndex, setExplosiveIndex] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<ProgressCelebration | null>(null);
  const [peakRecords, setPeakRecords] = useState<PowerRecord[]>([]);
  const [progressionMetrics, setProgressionMetrics] = useState<PowerProgressionMetrics | null>(null);
  const [techniqueMetrics, setTechniqueMetrics] = useState<PowerTechniqueMetrics>({
    formScore: 0,
    accuracy: 0,
    followThrough: 0,
    synchronization: 0
  });
  const [error, setError] = useState<string | null>(null);

  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const finalVisualization = useMemo(() => ({ ...DEFAULT_VISUALIZATION, ...visualization }), [visualization]);
  const finalAccessibility = useMemo(() => ({ ...DEFAULT_ACCESSIBILITY, ...accessibility }), [accessibility]);

  // Load progression data on mount
  useEffect(() => {
    const loadProgressionData = async () => {
      try {
        const data = ProgressionStorage.loadProgressData<MedicineBallProgressionData>(
          `power_${exerciseId}`,
          userId,
          finalConfig.dataRetentionDays
        );
        setProgressionData(data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setCurrentPower(latestData.powerOutput);
          setCurrentSpeed(latestData.speed);
          setCurrentDistance(latestData.distance);
          setTechniqueMetrics(latestData.technique);
        }

        // Calculate consistency score
        const consistency = PowerCalculations.calculateConsistencyScore(data);
        setConsistencyScore(consistency);

        // Generate peak records
        const records = PowerCalculations.generatePowerRecords(data);
        setPeakRecords(records);

        // Calculate explosive index
        if (data.length > 0) {
          const latestExplosiveIndex = PowerCalculations.calculateExplosiveIndex(
            latestData.powerOutput,
            bodyweight,
            ballWeight
          );
          setExplosiveIndex(latestExplosiveIndex);
        }

        // Generate progression metrics
        const metrics = generateProgressionMetrics(data);
        setProgressionMetrics(metrics);

        if (onDataUpdate) {
          onDataUpdate(data);
        }
      } catch (err) {
        const errorMessage = 'Failed to load power progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'data_load',
          message: errorMessage,
          code: 'POWER_LOAD_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    };

    loadProgressionData();
  }, [userId, exerciseId, finalConfig.dataRetentionDays, bodyweight, ballWeight, onDataUpdate]);

  // Power measurement simulation (would integrate with sensor data in production)
  useEffect(() => {
    if (!isMeasuring || !finalConfig.enableAnimations) return;

    const interval = setInterval(() => {
      // Simulate realistic power measurements
      const basePower = 200 + (Math.random() * 300);
      const variation = Math.sin(Date.now() / 1000) * 50;
      const newPower = Math.max(50, basePower + variation);

      setCurrentPower(newPower);

      // Calculate derived metrics
      const speed = newPower * 0.15; // Simplified speed calculation
      const distance = newPower * 0.08; // Simplified distance calculation

      setCurrentSpeed(speed);
      setCurrentDistance(distance);

      // Update explosive index
      const newExplosiveIndex = PowerCalculations.calculateExplosiveIndex(newPower, bodyweight, ballWeight);
      setExplosiveIndex(newExplosiveIndex);

      // Update technique metrics (would come from sensors/ML in production)
      setTechniqueMetrics({
        formScore: Math.min(100, 70 + Math.random() * 30),
        accuracy: Math.min(100, 60 + Math.random() * 40),
        followThrough: Math.min(100, 65 + Math.random() * 35),
        synchronization: Math.min(100, 75 + Math.random() * 25)
      });
    }, finalConfig.refreshInterval);

    return () => clearInterval(interval);
  }, [isMeasuring, finalConfig.enableAnimations, finalConfig.refreshInterval, bodyweight, ballWeight]);

  // Auto-save data
  const saveProgressData = useCallback((newData: MedicineBallProgressionData[]) => {
    if (finalConfig.autoSave) {
      try {
        ProgressionStorage.saveProgressData(`power_${exerciseId}`, newData, userId);
      } catch (err) {
        const errorMessage = 'Failed to save power progression data';
        setError(errorMessage);
        ProgressionErrorHandler.logError({
          type: 'storage',
          message: errorMessage,
          code: 'POWER_SAVE_ERROR',
          timestamp: new Date(),
          context: { exerciseId, userId, error: err }
        });
      }
    }
  }, [exerciseId, userId, finalConfig.autoSave]);

  const generateProgressionMetrics = (data: MedicineBallProgressionData[]): PowerProgressionMetrics => {
    const powerDevelopment: PowerDevelopmentChart[] = data.map(d => ({
      date: d.timestamp,
      powerOutput: d.powerOutput,
      speed: d.speed,
      distance: d.distance,
      explosiveIndex: PowerCalculations.calculateExplosiveIndex(d.powerOutput, bodyweight, ballWeight)
    }));

    const consistencyTrend: ConsistencyData[] = [];
    if (data.length >= 3) {
      for (let i = 0; i <= data.length - 3; i++) {
        const window = data.slice(i, i + 3);
        const powers = window.map(d => d.powerOutput);
        const consistency = PowerCalculations.calculateConsistencyScore(window);
        const variance = Math.pow(powers.reduce((sum, p) => sum + p, 0) / powers.length - powers.reduce((sum, p) => sum + p, 0) / powers.length, 2);

        consistencyTrend.push({
          sessionId: `session_${i}`,
          consistencyScore: consistency,
          variance,
          improvementRate: i > 0 ? consistency - (consistencyTrend[i - 1]?.consistencyScore || 0) : 0
        });
      }
    }

    const explosiveProgress: ExplosiveProgressData[] = data.map(d => ({
      measurement: PowerCalculations.calculateExplosiveIndex(d.powerOutput, bodyweight, ballWeight),
      date: d.timestamp,
      bodyweight,
      powerGenerated: d.powerOutput,
      exercise: exerciseName
    }));

    return {
      powerDevelopment,
      consistencyTrend,
      explosiveProgress,
      peakPowerRecords: PowerCalculations.generatePowerRecords(data)
    };
  };

  const startMeasurement = useCallback(() => {
    setIsMeasuring(true);
    setCurrentPower(0);
    setCurrentSpeed(0);
    setCurrentDistance(0);
  }, []);

  const stopMeasurement = useCallback(() => {
    if (!isMeasuring) return;

    setIsMeasuring(false);

    const newDataPoint: MedicineBallProgressionData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId,
      userId,
      timestamp: new Date(),
      powerOutput: currentPower,
      speed: currentSpeed,
      distance: currentDistance,
      consistencyScore: PowerCalculations.calculateConsistencyScore([...progressionData, {
        id: '',
        exerciseId,
        userId,
        timestamp: new Date(),
        powerOutput: currentPower,
        speed: currentSpeed,
        distance: currentDistance,
        consistencyScore: 0,
        explosiveIndex: 0,
        powerType,
        technique: techniqueMetrics
      }]),
      explosiveIndex,
      powerType,
      technique: techniqueMetrics
    };

    const newData = [...progressionData, newDataPoint];
    setProgressionData(newData);
    saveProgressData(newData);

    // Update consistency and records
    const newConsistency = PowerCalculations.calculateConsistencyScore(newData);
    setConsistencyScore(newConsistency);

    const newRecords = PowerCalculations.generatePowerRecords(newData);
    setPeakRecords(newRecords);

    // Check for new records
    const existingRecord = newRecords.find(r => r.exercise === exerciseName && r.powerOutput === currentPower);
    if (existingRecord && finalConfig.enableCelebrations) {
      setCelebration({
        type: 'record',
        title: 'New Power Record!',
        description: `You've achieved a new power output record`,
        achievement: `${currentPower.toFixed(1)} watts power generated`,
        unlocked: true,
        icon: 'zap',
        animation: ProgressionAnimations.generateCelebrationAnimation('record')
      });

      if (onRecordAchieved) {
        onRecordAchieved(existingRecord);
      }
    }

    // Update progression metrics
    const metrics = generateProgressionMetrics(newData);
    setProgressionMetrics(metrics);

    if (onDataUpdate) {
      onDataUpdate(newData);
    }
  }, [isMeasuring, currentPower, currentSpeed, currentDistance, explosiveIndex, powerType, techniqueMetrics, exerciseId, userId, exerciseName, progressionData, saveProgressData, finalConfig.enableCelebrations, onRecordAchieved, onDataUpdate]);

  const getPowerZone = (power: number) => {
    return POWER_ZONES.find(zone => power >= zone.min && power <= zone.max) || POWER_ZONES[0];
  };

  const getChartData = useMemo(() => {
    return progressionData.map(d => ({
      date: new Date(d.timestamp).toLocaleDateString(),
      power: d.powerOutput,
      speed: d.speed,
      distance: d.distance,
      explosiveIndex: d.explosiveIndex,
      consistency: d.consistencyScore
    }));
  }, [progressionData]);

  const getConsistencyData = useMemo(() => {
    return progressionMetrics?.consistencyTrend.map(c => ({
      session: c.sessionId.replace('session_', 'Session '),
      consistency: c.consistencyScore,
      variance: c.variance
    })) || [];
  }, [progressionMetrics]);

  const getPowerZoneData = useMemo(() => {
    return POWER_ZONES.map(zone => ({
      name: zone.name,
      power: getPowerZone(currentPower).name === zone.name ? currentPower : 0,
      max: zone.max,
      color: zone.color
    }));
  }, [currentPower]);

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
    <div className={`medicine-ball-power-tracker ${className}`} role="region" aria-label="Medicine Ball Power Tracker">
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
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{celebration.title}</h2>
                <p className="text-gray-600 mb-4">{celebration.description}</p>
                <div className="text-lg font-semibold text-red-600 mb-6">{celebration.achievement}</div>
                <button
                  onClick={() => setCelebration(null)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Power Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Power Output</h3>
            <Zap className="w-5 h-5 text-red-600" />
          </div>

          {/* Power Gauge Visualization */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center">
              <motion.div
                className="text-6xl font-bold mb-2"
                animate={{
                  color: getPowerZone(currentPower).color,
                  scale: isMeasuring ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 0.5 }}
              >
                {currentPower.toFixed(0)}
              </motion.div>
              <span className="text-2xl text-gray-600 ml-2">W</span>
            </div>
            <div className="text-gray-600 mb-4">Watts Generated</div>

            {/* Power Zone Indicator */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Current Zone: {getPowerZone(currentPower).name}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (currentPower / 1000) * 100)}%`,
                    backgroundColor: getPowerZone(currentPower).color
                  }}
                />
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">{currentSpeed.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Speed (m/s)</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">{currentDistance.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-600">Distance (m)</div>
            </div>
          </div>

          {/* Explosive Index */}
          <div className="text-center mb-6 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-xl font-bold text-orange-600">{explosiveIndex.toFixed(1)}</span>
            </div>
            <div className="text-sm text-gray-700">Explosive Index (Power/Weight Ratio)</div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={isMeasuring ? stopMeasurement : startMeasurement}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isMeasuring
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              aria-label={isMeasuring ? 'Stop power measurement' : 'Start power measurement'}
            >
              {isMeasuring ? (
                <>
                  <Stopwatch className="w-4 h-4" />
                  Stop Measurement
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Start Measurement
                </>
              )}
            </button>
          </div>
        </div>

        {/* Technique Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Technique Analysis</h3>
            <Gauge className="w-5 h-5 text-purple-600" />
          </div>

          <div className="space-y-4">
            {[
              { metric: 'Form Score', value: techniqueMetrics.formScore, icon: CheckCircle, color: 'green' },
              { metric: 'Accuracy', value: techniqueMetrics.accuracy, icon: Target, color: 'blue' },
              { metric: 'Follow Through', value: techniqueMetrics.followThrough, icon: TrendingUp, color: 'purple' },
              { metric: 'Synchronization', value: techniqueMetrics.synchronization, icon: Activity, color: 'orange' }
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

          {/* Consistency Score */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">Overall Consistency</span>
              <span className="text-lg font-bold text-blue-600">{consistencyScore}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${consistencyScore}%` }}
                transition={{ duration: 1 }}
                className="h-2 rounded-full bg-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Power Progress Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Power Development</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
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
                  dataKey="power"
                  stroke={finalVisualization.colorScheme[0]}
                  strokeWidth={2}
                  name="Power (W)"
                />
                <Line
                  type="monotone"
                  dataKey="explosiveIndex"
                  stroke={finalVisualization.colorScheme[1]}
                  strokeWidth={2}
                  name="Explosive Index"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No power data yet. Start measuring to see your progress!
            </div>
          )}
        </div>

        {/* Consistency Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Consistency Analysis</h3>
            <Battery className="w-5 h-5 text-yellow-600" />
          </div>
          {getConsistencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getConsistencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consistency" fill={finalVisualization.colorScheme[2]} name="Consistency %" />
                <Bar dataKey="variance" fill={finalVisualization.colorScheme[3]} name="Variance" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Complete multiple measurements to see consistency analysis.
            </div>
          )}
        </div>

        {/* Peak Records */}
        {peakRecords.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Peak Power Records</h3>
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peakRecords.slice(0, 6).map((record, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{record.exercise}</span>
                    {index === 0 && <Award className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {record.powerOutput.toFixed(1)} W
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineBallPowerTracker;
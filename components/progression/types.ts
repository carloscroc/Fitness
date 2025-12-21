/**
 * Progression Tracking Types
 *
 * Shared types for all Phase 4 progression tracking components
 */

export interface BaseProgressionData {
  id: string;
  exerciseId: string;
  userId: string;
  timestamp: Date;
  sessionId?: string;
}

// Flexibility Progression Types
export interface FlexibilityProgressionData extends BaseProgressionData {
  romPercentage: number; // Range of motion percentage (0-100)
  flexibilityType: 'static' | 'dynamic' | 'proprioceptive';
  milestone: FlexibilityMilestone;
  assessmentScore: number; // 0-100 flexibility score
  holdTime?: number; // seconds for static stretches
  repetitions?: number; // for dynamic stretches
  modificationSuggestions: string[];
}

export interface FlexibilityMilestone {
  level: 'beginner' | 'intermediate' | 'advanced';
  name: string;
  description: string;
  targetROM: number; // Target range of motion percentage
  achieved: boolean;
  achievedDate?: Date;
}

export interface FlexibilityAssessment {
  overallScore: number;
  staticScore: number;
  dynamicScore: number;
  proprioceptiveScore: number;
  recommendations: string[];
  nextMilestone: FlexibilityMilestone;
}

// Balance Progression Types
export interface BalanceProgressionData extends BaseProgressionData {
  difficultyLevel: number; // 1-10 scale
  balanceType: 'static' | 'dynamic';
  stabilityTime: number; // seconds maintained
  wobbleIndex: number; // 0-100 stability metric
  safetyModifications: string[];
  improvementMetrics: BalanceImprovementMetrics;
}

export interface BalanceImprovementMetrics {
  stabilityImprovement: number; // percentage improvement
  balanceConfidence: number; // 0-100 confidence score
  progressionPath: BalanceLevel[];
  skillLevel: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface BalanceLevel {
  level: number;
  name: string;
  description: string;
  requirements: string[];
  achieved: boolean;
  achievedDate?: Date;
}

export interface BalanceScaleVisualization {
  currentLevel: number;
  targetLevel: number;
  progressPercentage: number;
  instabilityZones: number[]; // zones where user struggles
  improvementRate: number; // rate of improvement per session
}

// Medicine Ball Power Types
export interface MedicineBallProgressionData extends BaseProgressionData {
  powerOutput: number; // watts
  speed: number; // km/h or mph
  distance: number; // meters
  consistencyScore: number; // 0-100 consistency metric
  explosiveIndex: number; // power/weight ratio
  powerType: 'rotational' | 'explosive' | 'plyometric';
  technique: PowerTechniqueMetrics;
}

export interface PowerTechniqueMetrics {
  formScore: number; // 0-100 technique quality
  accuracy: number; // 0-100 targeting accuracy
  followThrough: number; // 0-100 follow-through quality
  synchronization: number; // 0-100 movement synchronization
}

export interface PowerProgressionMetrics {
  powerDevelopment: PowerDevelopmentChart[];
  consistencyTrend: ConsistencyData[];
  explosiveProgress: ExplosiveProgressData[];
  peakPowerRecords: PowerRecord[];
}

export interface PowerDevelopmentChart {
  date: Date;
  powerOutput: number;
  speed: number;
  distance: number;
  explosiveIndex: number;
}

export interface ConsistencyData {
  sessionId: string;
  consistencyScore: number;
  variance: number; // power output variance
  improvementRate: number;
}

export interface ExplosiveProgressData {
  measurement: number; // power/weight ratio
  date: Date;
  bodyweight: number;
  powerGenerated: number;
  exercise: string;
}

export interface PowerRecord {
  exercise: string;
  powerOutput: number;
  date: Date;
  conditions: string; // environment conditions
  equipment: string; // ball weight, etc.
}

// Stability Ball Types
export interface StabilityBallProgressionData extends BaseProgressionData {
  stabilityIndex: number; // 1-100 stability scale
  coreEngagement: CoreEngagementMetrics;
  enduranceTime: number; // seconds maintained
  formQuality: FormQualityMetrics;
  engagementPattern: EngagementPattern;
}

export interface CoreEngagementMetrics {
  overallEngagement: number; // 0-100
  muscleActivation: MuscleActivationMap;
  stabilizerEngagement: number; // 0-100
  enduranceScore: number; // 0-100
}

export interface MuscleActivationMap {
  rectusAbdominis: number; // 0-100 activation
  obliques: number; // 0-100 activation
  transverseAbdominis: number; // 0-100 activation
  erectorSpinae: number; // 0-100 activation
  glutes: number; // 0-100 activation
  hipFlexors: number; // 0-100 activation
}

export interface FormQualityMetrics {
  overallScore: number; // 0-100
  spinalAlignment: number; // 0-100
  breathing: number; // 0-100
  control: number; // 0-100
  stability: number; // 0-100
  feedback: FormFeedback[];
}

export interface FormFeedback {
  type: 'positive' | 'improvement' | 'critical';
  category: string; // 'posture', 'breathing', 'control', etc.
  message: string;
  timestamp: Date;
}

export interface EngagementPattern {
  exercise: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stabilizationMuscles: string[];
  activationTimeline: ActivationPoint[];
}

export interface ActivationPoint {
  time: number; // milliseconds from start
  muscle: string;
  activationLevel: number; // 0-100
  duration: number; // milliseconds
}

export interface StabilityImprovementMetrics {
  stabilityGain: number; // percentage improvement
  enduranceImprovement: number; // seconds gained
  formProgression: FormProgressionData[];
  stabilityMilestones: StabilityMilestone[];
}

export interface FormProgressionData {
  date: Date;
  overallScore: number;
  specificMetrics: {
    spinalAlignment: number;
    breathing: number;
    control: number;
    stability: number;
  };
}

export interface StabilityMilestone {
  name: string;
  description: string;
  requiredScore: number;
  achieved: boolean;
  achievedDate?: Date;
  benefits: string[];
}

// Common Progression Types
export interface ProgressionVisualization {
  dataPoints: ProgressDataPoint[];
  trends: ProgressTrend[];
  predictions: ProgressPrediction[];
}

export interface ProgressDataPoint {
  date: Date;
  value: number;
  context?: string; // additional context
  metadata?: Record<string, any>;
}

export interface ProgressTrend {
  direction: 'improving' | 'declining' | 'stable';
  rate: number; // rate of change
  confidence: number; // 0-100 confidence in trend
  timeWindow: number; // days considered
}

export interface ProgressPrediction {
  targetDate: Date;
  predictedValue: number;
  confidence: number; // 0-100 confidence
  requirements: string[]; // what's needed to achieve
}

export interface ProgressCelebration {
  type: 'milestone' | 'record' | 'streak' | 'improvement';
  title: string;
  description: string;
  achievement: string;
  unlocked: boolean;
  icon?: string;
  animation?: string;
}

// Component Configuration Types
export interface ProgressionTrackerConfig {
  enableAnimations: boolean;
  enableCelebrations: boolean;
  enablePredictions: boolean;
  enableAISuggestions: boolean;
  dataRetentionDays: number;
  refreshInterval: number; // milliseconds
  autoSave: boolean;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'radar' | 'gauge' | 'heatmap';
  colorScheme: string[];
  showGridlines: boolean;
  showLabels: boolean;
  showLegend: boolean;
  interactive: boolean;
  animationDuration: number; // milliseconds
}

export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableScreenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// Error Handling Types
export interface ProgressionError {
  type: 'data_load' | 'calculation' | 'visualization' | 'storage';
  message: string;
  code: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ProgressionWarning {
  type: 'stagnation' | 'decline' | 'injury_risk' | 'form_issue';
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  timestamp: Date;
}

// Utility Types
export type ProgressionDataType = 'flexibility' | 'balance' | 'power' | 'stability';
export type ProgressionPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ProgressionFilter = {
  dateRange?: { start: Date; end: Date };
  exerciseTypes?: string[];
  difficultyLevels?: number[];
  minScore?: number;
  maxScore?: number;
};

// Export all types
export type {
  BaseProgressionData,
  FlexibilityProgressionData,
  FlexibilityMilestone,
  FlexibilityAssessment,
  BalanceProgressionData,
  BalanceImprovementMetrics,
  BalanceLevel,
  BalanceScaleVisualization,
  MedicineBallProgressionData,
  PowerTechniqueMetrics,
  PowerProgressionMetrics,
  PowerDevelopmentChart,
  ConsistencyData,
  ExplosiveProgressData,
  PowerRecord,
  StabilityBallProgressionData,
  CoreEngagementMetrics,
  MuscleActivationMap,
  FormQualityMetrics,
  FormFeedback,
  EngagementPattern,
  ActivationPoint,
  StabilityImprovementMetrics,
  FormProgressionData,
  StabilityMilestone,
  ProgressionVisualization,
  ProgressDataPoint,
  ProgressTrend,
  ProgressPrediction,
  ProgressCelebration,
  ProgressionTrackerConfig,
  VisualizationConfig,
  AccessibilityConfig,
  ProgressionError,
  ProgressionWarning,
  ProgressionDataType,
  ProgressionPeriod,
  ProgressionFilter
};
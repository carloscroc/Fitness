/**
 * Progression Tracking Utilities
 *
 * Shared utility functions for all progression tracking components
 */

import {
  FlexibilityProgressionData,
  BalanceProgressionData,
  MedicineBallProgressionData,
  StabilityBallProgressionData,
  ProgressDataPoint,
  ProgressTrend,
  ProgressPrediction,
  ProgressionFilter,
  ProgressionError,
  ProgressionWarning
} from './types';

// Storage utilities
export class ProgressionStorage {
  private static readonly STORAGE_PREFIX = 'fitness_progression_';
  private static readonly DEFAULT_RETENTION_DAYS = 365;

  static saveProgressData<T extends Record<string, any>>(
    dataType: string,
    data: T[],
    userId: string
  ): void {
    try {
      const key = `${this.STORAGE_PREFIX}${dataType}_${userId}`;
      const payload = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save progression data:', error);
      throw new ProgressionError(
        'storage',
        'Failed to save progression data to local storage',
        'STORAGE_SAVE_ERROR',
        new Date(),
        { dataType, error }
      );
    }
  }

  static loadProgressData<T>(
    dataType: string,
    userId: string,
    retentionDays: number = this.DEFAULT_RETENTION_DAYS
  ): T[] {
    try {
      const key = `${this.STORAGE_PREFIX}${dataType}_${userId}`;
      const stored = localStorage.getItem(key);

      if (!stored) return [];

      const payload = JSON.parse(stored);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Filter data by retention period
      return payload.data.filter((item: any) => {
        const itemDate = new Date(item.timestamp);
        return itemDate > cutoffDate;
      });
    } catch (error) {
      console.error('Failed to load progression data:', error);
      return [];
    }
  }

  static clearOldData(dataType: string, userId: string, retentionDays: number): void {
    const currentData = this.loadProgressData(dataType, userId, 0);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const filteredData = currentData.filter((item: any) => {
      const itemDate = new Date(item.timestamp);
      return itemDate > cutoffDate;
    });

    this.saveProgressData(dataType, filteredData, userId);
  }
}

// Data calculation utilities
export class ProgressionCalculations {
  static calculateTrend(dataPoints: ProgressDataPoint[], timeWindowDays: number = 30): ProgressTrend {
    if (dataPoints.length < 2) {
      return {
        direction: 'stable',
        rate: 0,
        confidence: 0,
        timeWindow: timeWindowDays
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

    const recentData = dataPoints.filter(point => new Date(point.date) > cutoffDate);

    if (recentData.length < 2) {
      return {
        direction: 'stable',
        rate: 0,
        confidence: 0,
        timeWindow: timeWindowDays
      };
    }

    // Simple linear regression for trend calculation
    const n = recentData.length;
    const x = recentData.map((_, index) => index);
    const y = recentData.map(point => point.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    // Calculate R-squared for confidence
    const yMean = avgY;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + (sumY - slope * sumX) / n;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);

    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    const confidence = Math.max(0, Math.min(100, rSquared * 100));

    let direction: 'improving' | 'declining' | 'stable';
    if (Math.abs(slope) < 0.1) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'improving';
    } else {
      direction = 'declining';
    }

    return {
      direction,
      rate: Math.abs(slope),
      confidence,
      timeWindow: timeWindowDays
    };
  }

  static generatePrediction(
    dataPoints: ProgressDataPoint[],
    targetDate: Date,
    confidence: number = 70
  ): ProgressPrediction | null {
    if (dataPoints.length < 5) return null;

    const trend = this.calculateTrend(dataPoints);
    const latestPoint = dataPoints[dataPoints.length - 1];

    if (trend.confidence < 50) return null;

    const daysDifference = Math.floor(
      (targetDate.getTime() - new Date(latestPoint.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const predictedValue = latestPoint.value + (trend.rate * daysDifference);

    // Generate requirements based on trend direction
    const requirements: string[] = [];
    if (trend.direction === 'improving') {
      requirements.push('Maintain current training consistency');
      requirements.push('Continue proper form and technique');
    } else if (trend.direction === 'declining') {
      requirements.push('Increase training frequency');
      requirements.push('Focus on fundamental techniques');
      requirements.push('Consider consulting with a trainer');
    } else {
      requirements.push('Add progressive overload');
      requirements.push('Introduce exercise variations');
    }

    return {
      targetDate,
      predictedValue,
      confidence: Math.min(confidence, trend.confidence),
      requirements
    };
  }

  static filterDataPoints(
    dataPoints: ProgressDataPoint[],
    filter: ProgressionFilter
  ): ProgressDataPoint[] {
    return dataPoints.filter(point => {
      const pointDate = new Date(point.date);

      // Date range filter
      if (filter.dateRange) {
        const { start, end } = filter.dateRange;
        if (pointDate < start || pointDate > end) return false;
      }

      // Value range filter
      if (filter.minScore !== undefined && point.value < filter.minScore) return false;
      if (filter.maxScore !== undefined && point.value > filter.maxScore) return false;

      return true;
    });
  }
}

// Flexibility-specific calculations
export class FlexibilityCalculations {
  static calculateAssessmentScore(data: FlexibilityProgressionData[]): number {
    if (data.length === 0) return 0;

    const recentData = data.slice(-10); // Last 10 sessions
    const romScores = recentData.map(d => d.romPercentage);
    const avgROM = romScores.reduce((a, b) => a + b, 0) / romScores.length;

    // Bonus for consistency
    const consistency = this.calculateConsistency(romScores);

    return Math.min(100, Math.round(avgROM + (consistency * 10)));
  }

  static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Consistency score: inverse of coefficient of variation
    const cv = (standardDeviation / mean) * 100;
    return Math.max(0, 100 - cv);
  }

  static generateModificationSuggestions(data: FlexibilityProgressionData[]): string[] {
    const suggestions: string[] = [];
    const recentData = data.slice(-5);

    if (recentData.length === 0) return suggestions;

    const avgROM = recentData.reduce((sum, d) => sum + d.romPercentage, 0) / recentData.length;
    const trend = ProgressionCalculations.calculateTrend(
      recentData.map(d => ({ date: d.timestamp, value: d.romPercentage }))
    );

    if (avgROM < 60) {
      suggestions.push('Focus on gentle, sustained stretches');
      suggestions.push('Consider warm-up exercises before stretching');
    }

    if (trend.direction === 'declining') {
      suggestions.push('Reduce stretch intensity temporarily');
      suggestions.push('Ensure proper hydration and nutrition');
    }

    if (trend.direction === 'stable' && avgROM > 80) {
      suggestions.push('Try advanced stretching variations');
      suggestions.push('Incorporate proprioceptive neuromuscular facilitation');
    }

    return suggestions;
  }
}

// Balance-specific calculations
export class BalanceCalculations {
  static calculateDifficultyLevel(data: BalanceProgressionData[]): number {
    if (data.length === 0) return 1;

    const recentData = data.slice(-10);
    const avgStabilityTime = recentData.reduce((sum, d) => sum + d.stabilityTime, 0) / recentData.length;
    const avgWobbleIndex = recentData.reduce((sum, d) => sum + d.wobbleIndex, 0) / recentData.length;

    // Calculate difficulty based on performance
    let difficulty = 1;

    if (avgStabilityTime > 30) difficulty += 2;
    if (avgStabilityTime > 60) difficulty += 2;
    if (avgWobbleIndex < 30) difficulty += 2;
    if (avgWobbleIndex < 15) difficulty += 2;

    return Math.min(10, difficulty);
  }

  static generateSafetyModifications(level: number): string[] {
    const modifications: string[] = [];

    if (level <= 3) {
      modifications.push('Use support (wall, chair) for stability');
      modifications.push('Keep eyes open and focus on a fixed point');
      modifications.push('Wear supportive, flat footwear');
    } else if (level <= 6) {
      modifications.push('Progress to unsupported balance');
      modifications.push('Try eyes-closed variations (with safety spotter)');
      modifications.push('Incorporate head movements');
    } else {
      modifications.push('Add dynamic movements and arm variations');
      modifications.push('Practice on unstable surfaces when ready');
      modifications.push('Include dual-task activities');
    }

    return modifications;
  }
}

// Power-specific calculations
export class PowerCalculations {
  static calculateConsistencyScore(data: MedicineBallProgressionData[]): number {
    if (data.length < 3) return 0;

    const recentData = data.slice(-10);
    const powerOutputs = recentData.map(d => d.powerOutput);

    return FlexibilityCalculations.calculateConsistency(powerOutputs);
  }

  static calculateExplosiveIndex(
    powerOutput: number,
    bodyweight: number,
    ballWeight: number = 0
  ): number {
    const totalWeight = bodyweight + ballWeight;
    return Math.round((powerOutput / totalWeight) * 100);
  }

  static generatePowerRecords(data: MedicineBallProgressionData[]): Array<{
    exercise: string;
    powerOutput: number;
    date: Date;
    conditions: string;
    equipment: string;
  }> {
    const records: Array<{
      exercise: string;
      powerOutput: number;
      date: Date;
      conditions: string;
      equipment: string;
    }> = [];

    const exerciseGroups = data.reduce((groups, item) => {
      const key = item.exerciseId;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, MedicineBallProgressionData[]>);

    Object.values(exerciseGroups).forEach(exercises => {
      const maxPower = Math.max(...exercises.map(e => e.powerOutput));
      const record = exercises.find(e => e.powerOutput === maxPower);

      if (record) {
        records.push({
          exercise: record.exerciseId,
          powerOutput: record.powerOutput,
          date: record.timestamp,
          conditions: 'Training session',
          equipment: 'Medicine ball'
        });
      }
    });

    return records.sort((a, b) => b.powerOutput - a.powerOutput);
  }
}

// Stability-specific calculations
export class StabilityCalculations {
  static calculateStabilityIndex(data: StabilityBallProgressionData[]): number {
    if (data.length === 0) return 1;

    const recentData = data.slice(-5);
    const avgEndurance = recentData.reduce((sum, d) => sum + d.enduranceTime, 0) / recentData.length;
    const avgEngagement = recentData.reduce((sum, d) => sum + d.coreEngagement.overallEngagement, 0) / recentData.length;
    const avgForm = recentData.reduce((sum, d) => sum + d.formQuality.overallScore, 0) / recentData.length;

    // Calculate composite stability index
    const enduranceScore = Math.min(100, (avgEndurance / 60) * 100); // 60 seconds = 100%
    const engagementScore = avgEngagement;
    const formScore = avgForm;

    return Math.round((enduranceScore + engagementScore + formScore) / 3);
  }

  static generateFormFeedback(data: StabilityBallProgressionData[]): Array<{
    type: 'positive' | 'improvement' | 'critical';
    category: string;
    message: string;
    timestamp: Date;
  }> {
    const feedback: Array<{
      type: 'positive' | 'improvement' | 'critical';
      category: string;
      message: string;
      timestamp: Date;
    }> = [];

    if (data.length === 0) return feedback;

    const latestData = data[data.length - 1];
    const { formQuality } = latestData;

    // Positive feedback
    if (formQuality.spinalAlignment > 80) {
      feedback.push({
        type: 'positive',
        category: 'posture',
        message: 'Excellent spinal alignment maintained throughout exercise',
        timestamp: new Date()
      });
    }

    if (formQuality.breathing > 80) {
      feedback.push({
        type: 'positive',
        category: 'breathing',
        message: 'Great breathing control - steady and rhythmic',
        timestamp: new Date()
      });
    }

    // Improvement feedback
    if (formQuality.control < 60) {
      feedback.push({
        type: 'improvement',
        category: 'control',
        message: 'Focus on smoother, more controlled movements',
        timestamp: new Date()
      });
    }

    if (formQuality.stability < 60) {
      feedback.push({
        type: 'improvement',
        category: 'stability',
        message: 'Engage core muscles more to improve stability',
        timestamp: new Date()
      });
    }

    // Critical feedback
    if (formQuality.spinalAlignment < 40) {
      feedback.push({
        type: 'critical',
        category: 'posture',
        message: 'Spinal alignment needs immediate attention - stop if experiencing pain',
        timestamp: new Date()
      });
    }

    return feedback;
  }
}

// Error handling utilities
export class ProgressionErrorHandler {
  private static errors: ProgressionError[] = [];
  private static warnings: ProgressionWarning[] = [];

  static logError(error: ProgressionError): void {
    this.errors.push(error);
    console.error('Progression Error:', error);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  static logWarning(warning: ProgressionWarning): void {
    this.warnings.push(warning);
    console.warn('Progression Warning:', warning);

    // Keep only last 100 warnings
    if (this.warnings.length > 100) {
      this.warnings = this.warnings.slice(-100);
    }
  }

  static getRecentErrors(count: number = 10): ProgressionError[] {
    return this.errors.slice(-count);
  }

  static getRecentWarnings(count: number = 10): ProgressionWarning[] {
    return this.warnings.slice(-count);
  }

  static clearLogs(): void {
    this.errors = [];
    this.warnings = [];
  }
}

// Animation utilities
export class ProgressionAnimations {
  static generateCelebrationAnimation(type: 'milestone' | 'record' | 'streak' | 'improvement'): string {
    switch (type) {
      case 'milestone':
        return 'celebrate-milestone';
      case 'record':
        return 'celebrate-record';
      case 'streak':
        return 'celebrate-streak';
      case 'improvement':
        return 'celebrate-improvement';
      default:
        return 'celebrate-default';
    }
  }

  static shouldAnimate(achievement: any, lastCelebration?: Date): boolean {
    if (!lastCelebration) return true;

    const timeDiff = new Date().getTime() - lastCelebration.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Don't animate if same achievement was celebrated in last hour
    return hoursDiff > 1;
  }
}

// Export all utilities
export {
  ProgressionStorage,
  ProgressionCalculations,
  FlexibilityCalculations,
  BalanceCalculations,
  PowerCalculations,
  StabilityCalculations,
  ProgressionErrorHandler,
  ProgressionAnimations
};
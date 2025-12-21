/**
 * Rollout Monitoring Service for Phase 4
 *
 * Tracks feature adoption, performance impact, error rates, and success metrics
 * for the Phase 4 rollout. Provides real-time monitoring and alerting capabilities.
 */

import {
  PHASE4_ROLLOUT_CONFIG,
  SuccessMetric,
  RollbackCriterion,
  getCurrentEnvironment
} from '../config/phase4RolloutConfig';
import { phase4FeatureFlagService, EvaluationResult, MonitoringData } from './phase4FeatureFlagService';

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  autoResolved: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface HealthScore {
  overall: number;
  features: Record<string, number>;
  performance: number;
  errors: number;
  adoption: number;
  retention: number;
  timestamp: Date;
}

export interface MonitoringDashboard {
  activeAlerts: Alert[];
  metrics: {
    featureAdoption: MetricDataPoint[];
    errorRates: MetricDataPoint[];
    performance: MetricDataPoint[];
    userRetention: MetricDataPoint[];
  };
  healthScore: HealthScore;
  rolloutStatus: {
    totalUsers: number;
    activeUsers: number;
    enabledFeatures: string[];
    averageRolloutPercentage: number;
  };
  timestamp: Date;
}

/**
 * Rollout Monitoring Service
 */
export class RolloutMonitoringService {
  private metricHistory = new Map<string, MetricDataPoint[]>();
  private alerts: Alert[] = [];
  private healthScoreHistory: HealthScore[] = [];
  private evaluationHistory: MonitoringData[] = [];
  private alertRules = new Map<string, RollbackCriterion>();

  constructor() {
    this.initializeAlertRules();
    this.startMonitoringCycle();
  }

  /**
   * Initialize alert rules from configuration
   */
  private initializeAlertRules(): void {
    PHASE4_ROLLOUT_CONFIG.rollbackCriteria.forEach(criterion => {
      this.alertRules.set(criterion.id, criterion);
    });
  }

  /**
   * Start periodic monitoring cycle
   */
  private startMonitoringCycle(): void {
    // Run monitoring checks every 5 minutes
    setInterval(() => {
      this.runMonitoringChecks();
    }, 5 * 60 * 1000);

    // Run health score calculation every hour
    setInterval(() => {
      this.calculateHealthScore();
    }, 60 * 60 * 1000);
  }

  /**
   * Record feature evaluation for monitoring
   */
  recordFeatureEvaluation(evaluation: MonitoringData): void {
    this.evaluationHistory.push(evaluation);

    // Keep only recent evaluations (last 10,000)
    if (this.evaluationHistory.length > 10000) {
      this.evaluationHistory = this.evaluationHistory.slice(-10000);
    }

    // Update metrics
    this.updateFeatureAdoptionMetric(evaluation);
    this.updateErrorRateMetric(evaluation);
    this.updatePerformanceMetric(evaluation);
  }

  /**
   * Update feature adoption metric
   */
  private updateFeatureAdoptionMetric(evaluation: MonitoringData): void {
    const metricKey = 'feature_adoption';
    const currentValue = this.getMetricValue(metricKey);

    // Calculate adoption based on enabled features for this user
    const adoptionRate = evaluation.enabled ? 1 : 0;
    const newValue = currentValue > 0 ? (currentValue + adoptionRate) / 2 : adoptionRate;

    this.addMetricDataPoint(metricKey, newValue, {
      feature: evaluation.feature,
      userId: evaluation.userId,
      segments: evaluation.segments
    });
  }

  /**
   * Update error rate metric
   */
  private updateErrorRateMetric(evaluation: MonitoringData): void {
    // In a real implementation, this would track actual errors
    // For demo, we'll simulate error detection
    const metricKey = 'error_rate';
    const errorRate = Math.random() < 0.02 ? 1 : 0; // 2% error rate simulation

    this.addMetricDataPoint(metricKey, errorRate, {
      feature: evaluation.feature,
      userId: evaluation.userId
    });
  }

  /**
   * Update performance metric
   */
  private updatePerformanceMetric(evaluation: MonitoringData): void {
    const metricKey = 'performance_score';
    // Calculate score based on evaluation time (lower is better)
    const evaluationTimeMs = evaluation.evaluationTime;
    const performanceScore = Math.max(0, 100 - (evaluationTimeMs * 10));

    this.addMetricDataPoint(metricKey, performanceScore, {
      feature: evaluation.feature,
      evaluationTime: evaluationTimeMs
    });
  }

  /**
   * Add metric data point
   */
  private addMetricDataPoint(metricName: string, value: number, metadata?: Record<string, any>): void {
    if (!this.metricHistory.has(metricName)) {
      this.metricHistory.set(metricName, []);
    }

    const history = this.metricHistory.get(metricName)!;
    history.push({
      timestamp: new Date(),
      value,
      metadata
    });

    // Keep only last 1000 data points per metric
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }

  /**
   * Get current metric value
   */
  private getMetricValue(metricName: string): number {
    const history = this.metricHistory.get(metricName);
    if (!history || history.length === 0) return 0;

    return history[history.length - 1].value;
  }

  /**
   * Get metric history
   */
  getMetricHistory(metricName: string, timeWindow?: '24h' | '7d' | '30d'): MetricDataPoint[] {
    const history = this.metricHistory.get(metricName) || [];
    if (!timeWindow) return history;

    const now = new Date();
    const windowMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }[timeWindow];

    return history.filter(point =>
      now.getTime() - point.timestamp.getTime() <= windowMs
    );
  }

  /**
   * Run monitoring checks and generate alerts
   */
  private async runMonitoringChecks(): Promise<void> {
    for (const criterion of PHASE4_ROLLOUT_CONFIG.rollbackCriteria) {
      await this.checkCriterion(criterion);
    }

    // Check for new feature adoption patterns
    this.checkAdoptionPatterns();
  }

  /**
   * Check if a rollback criterion is met
   */
  private async checkCriterion(criterion: RollbackCriterion): Promise<void> {
    const metricName = criterion.metric;
    const history = this.getMetricHistory(metricName, criterion.timeWindow as any);

    if (history.length === 0) return;

    // Get value for the time window
    const currentValue = history[history.length - 1].value;
    const meetsThreshold = this.evaluateThreshold(currentValue, criterion);

    if (meetsThreshold) {
      const alert: Alert = {
        id: `alert_${criterion.id}_${Date.now()}`,
        name: criterion.name,
        severity: criterion.severity,
        message: `${criterion.description} (${currentValue} ${criterion.operator} ${criterion.threshold})`,
        timestamp: new Date(),
        metric: metricName,
        value: currentValue,
        threshold: criterion.threshold,
        autoResolved: false,
        acknowledged: false
      };

      this.addAlert(alert);

      // Auto-resolve after some time if not acknowledged
      setTimeout(() => {
        if (!alert.acknowledged) {
          this.resolveAlert(alert.id);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThreshold(value: number, criterion: RollbackCriterion): boolean {
    switch (criterion.operator) {
      case '>':
        return value > criterion.threshold;
      case '<':
        return value < criterion.threshold;
      case '>=':
        return value >= criterion.threshold;
      case '<=':
        return value <= criterion.threshold;
      case '=':
        return value === criterion.threshold;
      default:
        return false;
    }
  }

  /**
   * Check for adoption patterns
   */
  private checkAdoptionPatterns(): void {
    const adoptionHistory = this.getMetricHistory('feature_adoption', '24h');
    if (adoptionHistory.length < 10) return;

    // Calculate trend
    const recent = adoptionHistory.slice(-5);
    const older = adoptionHistory.slice(-10, -5);

    const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, point) => sum + point.value, 0) / older.length;

    // Check for significant drop in adoption
    if (recentAvg < olderAvg * 0.7) {
      this.addAlert({
        id: `alert_adoption_drop_${Date.now()}`,
        name: 'Adoption Rate Drop',
        severity: 'medium',
        message: `Feature adoption dropped significantly: ${((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)}%`,
        timestamp: new Date(),
        metric: 'feature_adoption',
        value: recentAvg,
        threshold: olderAvg * 0.7,
        autoResolved: false,
        acknowledged: false
      });
    }
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(): void {
    const metrics = {
      featureAdoption: this.getMetricValue('feature_adoption'),
      errorRate: this.getMetricValue('error_rate'),
      performance: this.getMetricValue('performance_score')
    };

    // Calculate component scores
    const adoptionScore = Math.min(100, metrics.featureAdoption * 100);
    const errorScore = Math.max(0, 100 - (metrics.errorRate * 100));
    const performanceScore = metrics.performance;

    // Calculate overall health score (weighted average)
    const overallHealthScore = Math.round(
      (adoptionScore * 0.4) + (errorScore * 0.3) + (performanceScore * 0.3)
    );

    const healthScore: HealthScore = {
      overall: overallHealthScore,
      features: {
        'feature_adoption': adoptionScore,
        'error_rate': errorScore,
        'performance_score': performanceScore
      },
      performance: performanceScore,
      errors: metrics.errorRate,
      adoption: metrics.featureAdoption,
      retention: this.calculateRetentionScore(),
      timestamp: new Date()
    };

    this.healthScoreHistory.push(healthScore);

    // Keep only last 100 health scores
    if (this.healthScoreHistory.length > 100) {
      this.healthScoreHistory.splice(0, this.healthScoreHistory.length - 100);
    }

    // Check for health score alerts
    if (overallHealthScore < 70) {
      this.addAlert({
        id: `alert_health_score_${Date.now()}`,
        name: 'Low Health Score',
        severity: overallHealthScore < 50 ? 'critical' : 'high',
        message: `System health score is ${overallHealthScore}/100`,
        timestamp: new Date(),
        metric: 'health_score',
        value: overallHealthScore,
        threshold: 70,
        autoResolved: false,
        acknowledged: false
      });
    }
  }

  /**
   * Calculate retention score
   */
  private calculateRetentionScore(): number {
    // Simplified retention calculation
    const totalUsers = this.evaluationHistory.length;
    const uniqueUsers = new Set(this.evaluationHistory.map(e => e.userId)).size;

    if (totalUsers === 0) return 50; // Default score

    const retentionRatio = uniqueUsers / totalUsers;
    return Math.round(retentionRatio * 100);
  }

  /**
   * Add alert
   */
  private addAlert(alert: Alert): void {
    this.alerts.push(alert);

    // In real implementation, send notifications via email, Slack, etc.
    if (import.meta.env.DEV) {
      console.log('[Rollout Monitor] Alert:', alert);
    }

    // Auto-resolve if severity is low after 1 hour
    if (alert.severity === 'low') {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 60 * 60 * 1000);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    alert.autoResolved = !acknowledgedBy;

    // Remove from active alerts after 24 hours
    setTimeout(() => {
      this.alerts = this.alerts.filter(a => a.id !== alertId);
    }, 24 * 60 * 60 * 1000);

    return true;
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboard(): MonitoringDashboard {
    const activeAlerts = this.alerts.filter(a => !a.acknowledged);
    const latestHealthScore = this.healthScoreHistory[this.healthScoreHistory.length - 1] || {
      overall: 100,
      features: {},
      performance: 100,
      errors: 0,
      adoption: 0,
      retention: 100,
      timestamp: new Date()
    };

    // Calculate rollout status
    const evaluationsByFeature = new Map<string, number>();
    this.evaluationHistory.forEach(evaluation => {
      if (evaluation.enabled) {
        const count = evaluationsByFeature.get(evaluation.feature) || 0;
        evaluationsByFeature.set(evaluation.feature, count + 1);
      }
    });

    const enabledFeatures = Array.from(evaluationsByFeature.keys());

    return {
      activeAlerts,
      metrics: {
        featureAdoption: this.getMetricHistory('feature_adoption'),
        errorRates: this.getMetricHistory('error_rate'),
        performance: this.getMetricHistory('performance_score'),
        userRetention: this.getMetricHistory('user_retention')
      },
      healthScore: latestHealthScore,
      rolloutStatus: {
        totalUsers: this.evaluationHistory.length,
        activeUsers: new Set(this.evaluationHistory.map(e => e.userId)).size,
        enabledFeatures,
        averageRolloutPercentage: this.calculateAverageRolloutPercentage()
      },
      timestamp: new Date()
    };
  }

  /**
   * Calculate average rollout percentage
   */
  private calculateAverageRolloutPercentage(): number {
    if (this.evaluationHistory.length === 0) return 0;

    const enabledCount = this.evaluationHistory.filter(e => e.enabled).length;
    return Math.round((enabledCount / this.evaluationHistory.length) * 100);
  }

  /**
   * Get success metrics status
   */
  getSuccessMetricsStatus(): Record<string, {
    current: number;
    target: number;
    status: 'exceeded' | 'on_track' | 'at_risk' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const status: Record<string, any> = {};

    PHASE4_ROLLOUT_CONFIG.successMetrics.forEach(metric => {
      const history = this.getMetricHistory(metric.id, metric.measurementWindow as any);
      const currentValue = history.length > 0 ? history[history.length - 1].value : 0;

      // Determine status based on target and thresholds
      if (currentValue >= metric.threshold.optimum) {
        status[metric.id] = {
          current: currentValue,
          target: metric.target,
          status: 'exceeded' as const,
          trend: 'stable' as const
        };
      } else if (currentValue >= metric.threshold.minimum) {
        status[metric.id] = {
          current: currentValue,
          target: metric.target,
          status: 'on_track' as const,
          trend: 'stable' as const
        };
      } else if (currentValue >= metric.threshold.critical) {
        status[metric.id] = {
          current: currentValue,
          target: metric.target,
          status: 'at_risk' as const,
          trend: 'declining' as const
        };
      } else {
        status[metric.id] = {
          current: currentValue,
          target: metric.target,
          status: 'critical' as const,
          trend: 'declining' as const
        };
      }

      // Calculate trend
      if (history.length >= 3) {
        const recent = history.slice(-3);
        const trendValues = recent.map(h => h.value);

        const isImproving = trendValues.every((val, i) => i === 0 || val >= trendValues[i - 1]);
        const isDeclining = trendValues.every((val, i) => i === 0 || val <= trendValues[i - 1]);

        if (isImproving) status[metric.id].trend = 'improving';
        else if (isDeclining) status[metric.id].trend = 'declining';
      }
    });

    return status;
  }

  /**
   * Export monitoring data
   */
  exportMonitoringData(): string {
    return JSON.stringify({
      alerts: this.alerts,
      metrics: Object.fromEntries(this.metricHistory),
      healthScoreHistory: this.healthScoreHistory,
      evaluationHistory: this.evaluationHistory.slice(-1000), // Last 1000 evaluations
      timestamp: new Date()
    }, null, 2);
  }

  /**
   * Clear old monitoring data
   */
  cleanupOldData(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Clean up metric history
    this.metricHistory.forEach((history, metricName) => {
      const filtered = history.filter(point => point.timestamp > cutoffDate);
      this.metricHistory.set(metricName, filtered);
    });

    // Clean up alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate);

    // Clean up health score history
    this.healthScoreHistory = this.healthScoreHistory.filter(
      score => score.timestamp > cutoffDate
    );

    // Clean up evaluation history
    this.evaluationHistory = this.evaluationHistory.filter(
      eval => eval.timestamp > cutoffDate
    );
  }
}

/**
 * Create and export singleton instance
 */
export const rolloutMonitoringService = new RolloutMonitoringService();

/**
 * Convenance functions
 */

/**
 * Get current dashboard data
 */
export function getRolloutDashboard(): MonitoringDashboard {
  return rolloutMonitoringService.getDashboard();
}

/**
 * Get success metrics status
 */
export function getSuccessMetricsStatus(): Record<string, any> {
  return rolloutMonitoringService.getSuccessMetricsStatus();
}

/**
 * Acknowledge alert
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  return rolloutMonitoringService.resolveAlert(alertId, acknowledgedBy);
}

/**
 * Export monitoring data
 */
export function exportMonitoringData(): string {
  return rolloutMonitoringService.exportMonitoringData();
}

/**
 * Record feature evaluation (from feature flag service)
 */
export function recordFeatureEvaluation(evaluation: MonitoringData): void {
  rolloutMonitoringService.recordFeatureEvaluation(evaluation);
}
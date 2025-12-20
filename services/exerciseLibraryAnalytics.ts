/**
 * Exercise Library Analytics Service
 *
 * Comprehensive analytics tracking for the enhanced exercise library rollout.
 * Tracks user behavior, feature adoption, performance metrics, and engagement patterns.
 */

import { FeatureFlag } from './featureFlags';

interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  featureFlags?: Record<string, boolean>;
  rolloutPhase?: string;
  environment?: string;
}

interface FeatureUsageMetric {
  feature: string;
  userId: string;
  sessionId: string;
  action: 'view' | 'click' | 'interact' | 'complete' | 'error';
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'percentage' | 'count';
  category: 'load' | 'render' | 'api' | 'interaction' | 'error';
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

interface UserBehavior {
  userId: string;
  sessionId: string;
  event: string;
  page: string;
  element?: string;
  value?: any;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface EngagementMetric {
  userId: string;
  sessionId: string;
  featureGroup: string;
  actions: string[];
  timeSpent: number;
  completionRate?: number;
  satisfaction?: number;
  timestamp: Date;
}

class ExerciseLibraryAnalytics {
  private sessionId: string;
  private userId?: string;
  private environment: string;
  private isEnabled: boolean;
  private batchQueue: AnalyticsEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private performanceObserver?: PerformanceObserver;

  constructor(options: { userId?: string; environment?: string } = {}) {
    this.userId = options.userId;
    this.environment = options.environment || import.meta.env.NODE_ENV || 'development';
    this.isEnabled = this.environment !== 'development' || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.sessionId = this.generateSessionId();

    if (this.isEnabled) {
      this.initializePerformanceObserver();
      this.startBatchProcessing();
      this.trackPageLoad();
    }
  }

  private generateSessionId(): string {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  }

  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.trackPerformance({
              name: entry.name,
              value: entry.duration,
              unit: 'ms',
              category: 'render'
            });
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  private startBatchProcessing(): void {
    this.batchTimer = setInterval(() => {
      this.flushBatch();
    }, 10000); // Process batch every 10 seconds

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushBatch();
      });
    }
  }

  private flushBatch(): void {
    if (this.batchQueue.length === 0) return;

    const events = [...this.batchQueue];
    this.batchQueue = [];

    // In a real implementation, send to analytics backend
    this.sendEvents(events);
  }

  private sendEvents(events: AnalyticsEvent[]): void {
    if (!this.isEnabled) return;

    // Mock implementation - In production, send to your analytics service
    if (import.meta.env.DEV) {
      console.log('[Analytics] Batch events:', events);
    }

    // Example: Send to Google Analytics, Segment, Mixpanel, etc.
    if (typeof window !== 'undefined' && window.gtag) {
      events.forEach(event => {
        window.gtag('event', event.eventName, {
          user_id: event.userId,
          session_id: event.sessionId,
          custom_map: event.properties
        });
      });
    }
  }

  private trackPageLoad(): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackPerformance({
              name: 'page_load',
              value: navigation.loadEventEnd - navigation.startTime,
              unit: 'ms',
              category: 'load',
              context: {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                ssl: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
                ttfb: navigation.responseStart - navigation.requestStart,
                download: navigation.responseEnd - navigation.responseStart,
                dom_parse: navigation.domContentLoadedEventStart - navigation.responseEnd,
                dom_ready: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
              }
            });
          }
        }, 0);
      });
    }
  }

  // Public tracking methods

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties,
      environment: this.environment
    };

    this.batchQueue.push(event);
  }

  public trackFeatureUsage(feature: string, action: FeatureUsageMetric['action'], metadata?: Record<string, any>): void {
    const metric: FeatureUsageMetric = {
      feature,
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId,
      action,
      metadata,
      timestamp: new Date()
    };

    this.trackEvent('feature_usage', {
      feature,
      action,
      ...metadata
    });

    // Track feature-specific metrics
    if (action === 'complete' && metadata?.duration) {
      this.trackPerformance({
        name: `${feature}_completion_time`,
        value: metadata.duration,
        unit: 'ms',
        category: 'interaction',
        context: { feature }
      });
    }
  }

  public trackPerformance(metric: Omit<PerformanceMetric, 'timestamp' | 'userId' | 'sessionId'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.trackEvent('performance', {
      metric_name: metric.name,
      value: metric.value,
      unit: metric.unit,
      category: metric.category,
      ...metric.context
    });

    // Alert on performance issues
    if (metric.category === 'load' && metric.value > 3000) {
      console.warn(`[Analytics] Slow load time detected: ${metric.name} = ${metric.value}ms`);
    }
  }

  public trackUserBehavior(behavior: Omit<UserBehavior, 'timestamp' | 'userId' | 'sessionId'>): void {
    const fullBehavior: UserBehavior = {
      ...behavior,
      timestamp: new Date(),
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId
    };

    this.trackEvent('user_behavior', {
      event: behavior.event,
      page: behavior.page,
      element: behavior.element,
      value: behavior.value,
      ...behavior.metadata
    });
  }

  public trackEngagement(metric: Omit<EngagementMetric, 'timestamp' | 'userId' | 'sessionId'>): void {
    const fullMetric: EngagementMetric = {
      ...metric,
      timestamp: new Date(),
      userId: this.userId || 'anonymous',
      sessionId: this.sessionId
    };

    this.trackEvent('engagement', {
      feature_group: metric.featureGroup,
      actions: metric.actions,
      time_spent: metric.timeSpent,
      completion_rate: metric.completionRate,
      satisfaction: metric.satisfaction
    });
  }

  // Exercise library specific tracking

  public trackExerciseView(exerciseId: string, properties?: Record<string, any>): void {
    this.trackFeatureUsage('exercise_library', 'view', {
      exercise_id: exerciseId,
      ...properties
    });
  }

  public trackExerciseFilter(filters: Record<string, any>): void {
    this.trackFeatureUsage('advanced_filtering', 'interact', {
      filter_count: Object.keys(filters).length,
      filter_types: Object.keys(filters),
      filters
    });
  }

  public trackVideoPlayback(exerciseId: string, action: 'play' | 'pause' | 'complete' | 'error', metadata?: Record<string, any>): void {
    this.trackFeatureUsage('video_integration', action, {
      exercise_id: exerciseId,
      ...metadata
    });
  }

  public trackPersonalizedRecommendations(recommendations: string[], clicked?: string): void {
    this.trackFeatureUsage('personalized_recommendations', 'view', {
      recommendation_count: recommendations.length,
      recommendations,
      clicked_recommendation: clicked
    });

    if (clicked) {
      this.trackFeatureUsage('personalized_recommendations', 'click', {
        exercise_id: clicked
      });
    }
  }

  public trackProgressUpdate(exerciseId: string, type: string, value: number): void {
    this.trackFeatureUsage('progress_tracking', 'interact', {
      exercise_id: exerciseId,
      update_type: type,
      value
    });
  }

  public trackSocialAction(action: 'share' | 'comment' | 'like' | 'follow', targetId: string, metadata?: Record<string, any>): void {
    this.trackFeatureUsage('social_features', 'interact', {
      social_action: action,
      target_id: targetId,
      ...metadata
    });
  }

  public trackAICoachingInteraction(sessionId: string, query: string, response: string, rating?: number): void {
    this.trackFeatureUsage('ai_coaching', 'interact', {
      coaching_session_id: sessionId,
      query_length: query.length,
      response_length: response.length,
      rating
    });
  }

  // Rollout specific tracking

  public trackRolloutEvent(phase: string, event: 'entered' | 'exited' | 'feature_used', feature?: string): void {
    this.trackEvent('rollout', {
      phase,
      event,
      feature,
      user_segment: this.getUserSegment(),
      environment: this.environment
    });
  }

  public trackFeatureFlagChange(flag: FeatureFlag, oldValue: boolean, newValue: boolean, reason?: string): void {
    this.trackEvent('feature_flag_change', {
      flag,
      old_value: oldValue,
      new_value: newValue,
      reason
    });
  }

  // Performance monitoring

  public startPerformanceTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      this.trackPerformance({
        name,
        value: endTime - startTime,
        unit: 'ms',
        category: 'interaction'
      });
    };
  }

  // Error tracking

  public trackError(error: Error | string, context?: Record<string, any>): void {
    this.trackEvent('error', {
      error_message: error instanceof Error ? error.message : error,
      error_stack: error instanceof Error ? error.stack : undefined,
      context,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    });
  }

  // Utility methods

  private getUserSegment(): string {
    // This would typically check against a user segmentation service
    if (this.userId?.startsWith('dev_') || this.userId?.startsWith('admin_')) {
      return 'internal_team';
    }
    if (localStorage.getItem('beta_tester') === 'true') {
      return 'beta_tester';
    }
    const workoutCount = parseInt(localStorage.getItem('total_workouts') || '0', 10);
    if (workoutCount > 50) return 'power_user';
    return 'regular_user';
  }

  public getSessionMetrics(): {
    sessionId: string;
    userId?: string;
    startTime: Date;
    eventsTracked: number;
    featuresUsed: string[];
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date(parseInt(this.sessionId.split('_')[1])),
      eventsTracked: this.batchQueue.length,
      featuresUsed: [...new Set(this.batchQueue.map(e => e.properties.feature).filter(Boolean))]
    };
  }

  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.flushBatch();
  }
}

// Create singleton instance
let analyticsInstance: ExerciseLibraryAnalytics | null = null;

export function getExerciseLibraryAnalytics(options?: { userId?: string; environment?: string }): ExerciseLibraryAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new ExerciseLibraryAnalytics(options);
  } else if (options?.userId) {
    analyticsInstance.setUserId(options.userId);
  }
  return analyticsInstance;
}

export function destroyExerciseLibraryAnalytics(): void {
  if (analyticsInstance) {
    analyticsInstance.destroy();
    analyticsInstance = null;
  }
}

export default ExerciseLibraryAnalytics;
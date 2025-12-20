/**
 * Error Tracking and Reporting Service
 *
 * Comprehensive error tracking system for the enhanced exercise library rollout.
 * Captures, categorizes, and reports errors with detailed context for debugging.
 */

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  component?: string;
  action?: string;
  userAgent?: string;
  url?: string;
  timestamp?: Date;
  environment?: string;
  rolloutPhase?: string;
  featureFlags?: Record<string, boolean>;
  additionalData?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'api' | 'performance' | 'user' | 'feature';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags?: string[];
}

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByFeature: Record<string, number>;
  errorRate: number;
  topErrors: Array<{
    error: ErrorReport;
    count: number;
    percentage: number;
  }>;
}

class ErrorTracking {
  private errors: Map<string, ErrorReport> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private isEnabled: boolean;
  private errorCallbacks: ((error: ErrorReport) => void)[] = [];
  private userId?: string;
  private sessionId: string;
  private environment: string;

  constructor(options: { userId?: string; environment?: string; enabled?: boolean } = {}) {
    this.userId = options.userId;
    this.environment = options.environment || import.meta.env.NODE_ENV || 'development';
    this.isEnabled = options.enabled !== false && this.environment !== 'development';
    this.sessionId = this.generateSessionId();

    if (this.isEnabled) {
      this.setupGlobalHandlers();
    }
  }

  private generateSessionId(): string {
    const stored = sessionStorage.getItem('error_tracking_session_id');
    if (stored) return stored;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('error_tracking_session_id', sessionId);
    return sessionId;
  }

  private setupGlobalHandlers(): void {
    // Global JavaScript errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          type: 'javascript',
          severity: 'medium',
          component: 'global',
          url: event.filename,
          additionalData: {
            lineNumber: event.lineno,
            columnNumber: event.colno
          }
        });
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          new Error(`Unhandled promise rejection: ${event.reason}`),
          {
            type: 'javascript',
            severity: 'high',
            component: 'promises',
            additionalData: {
              reason: event.reason
            }
          }
        );
      });
    }
  }

  // Public API

  public captureError(error: Error | string, context?: Partial<ErrorContext>): string {
    if (!this.isEnabled) return '';

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorContext: ErrorContext = {
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date(),
      environment: this.environment,
      ...context
    };

    const fingerprint = this.generateFingerprint(errorObj, errorContext);
    const errorId = `error_${fingerprint}`;

    let errorReport: ErrorReport;

    if (this.errors.has(errorId)) {
      // Update existing error
      errorReport = this.errors.get(errorId)!;
      errorReport.count += 1;
      errorReport.lastSeen = new Date();
    } else {
      // Create new error report
      errorReport = {
        id: errorId,
        message: errorObj.message,
        stack: errorObj.stack,
        type: context?.type || 'javascript',
        severity: context?.severity || this.determineSeverity(errorObj, context),
        context: errorContext,
        fingerprint,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        tags: this.generateTags(errorObj, errorContext)
      };

      this.errors.set(errorId, errorReport);
    }

    // Update error counts
    this.errorCounts.set(errorId, errorReport.count);

    // Notify callbacks
    this.errorCallbacks.forEach(callback => callback(errorReport));

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Tracking]', errorReport);
    }

    // Send to external service in production
    if (this.environment === 'production') {
      this.sendErrorReport(errorReport);
    }

    return errorId;
  }

  public captureNetworkError(url: string, status: number, method?: string, responseText?: string): string {
    return this.captureError(
      new Error(`Network error: ${method || 'GET'} ${url} returned ${status}`),
      {
        type: 'network',
        severity: status >= 500 ? 'high' : 'medium',
        component: 'api_client',
        action: method || 'GET',
        additionalData: {
          url,
          status,
          method,
          responseText: responseText?.substring(0, 1000) // Limit size
        }
      }
    );
  }

  public captureApiError(endpoint: string, error: any, requestPayload?: any): string {
    return this.captureError(
      new Error(`API error: ${endpoint} - ${error?.message || 'Unknown error'}`),
      {
        type: 'api',
        severity: 'high',
        component: 'api_client',
        action: 'api_call',
        feature: this.extractFeatureFromEndpoint(endpoint),
        additionalData: {
          endpoint,
          errorType: error?.name || 'Unknown',
          requestPayload: requestPayload ? JSON.stringify(requestPayload).substring(0, 1000) : undefined
        }
      }
    );
  }

  public capturePerformanceError(metric: string, value: number, threshold: number): string {
    return this.captureError(
      new Error(`Performance threshold exceeded: ${metric} = ${value} (threshold: ${threshold})`),
      {
        type: 'performance',
        severity: value > threshold * 2 ? 'critical' : 'medium',
        component: 'performance_monitor',
        additionalData: {
          metric,
          value,
          threshold
        }
      }
    );
  }

  public captureFeatureError(feature: string, error: Error, action?: string): string {
    return this.captureError(error, {
      type: 'feature',
      severity: 'high',
      component: 'feature',
      feature,
      action,
      context: 'exercise_library_feature'
    });
  }

  public captureUserFeedback(feature: string, feedback: string, rating?: number): string {
    const severity = rating && rating < 3 ? 'medium' : 'low';
    return this.captureError(
      new Error(`User feedback: ${feedback}`),
      {
        type: 'user',
        severity,
        component: 'user_feedback',
        feature,
        additionalData: {
          feedback,
          rating
        }
      }
    );
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    // Create a unique fingerprint for the error based on message, stack trace, and context
    const fingerprintData = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
      type: context.type,
      component: context.component,
      feature: context.feature
    };

    return this.hashString(JSON.stringify(fingerprintData));
  }

  private generateTags(error: Error, context: ErrorContext): string[] {
    const tags: string[] = [];

    if (context.feature) tags.push(`feature:${context.feature}`);
    if (context.component) tags.push(`component:${context.component}`);
    if (context.type) tags.push(`type:${context.type}`);
    if (context.action) tags.push(`action:${context.action}`);

    // Add browser-specific tags
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      if (ua.includes('Chrome')) tags.push('browser:chrome');
      else if (ua.includes('Firefox')) tags.push('browser:firefox');
      else if (ua.includes('Safari')) tags.push('browser:safari');
      else if (ua.includes('Edge')) tags.push('browser:edge');
    }

    return tags;
  }

  private determineSeverity(error: Error, context?: Partial<ErrorContext>): ErrorReport['severity'] {
    // Critical errors
    if (error.message.includes('ChunkLoadError') || error.message.includes('Network error')) {
      return 'critical';
    }

    // High severity
    if (error.message.includes('Cannot read property') ||
        error.message.includes('TypeError') ||
        error.message.includes('ReferenceError')) {
      return 'high';
    }

    // Medium severity
    if (context?.type === 'api' || context?.type === 'network') {
      return 'medium';
    }

    // Default to low
    return 'low';
  }

  private extractFeatureFromEndpoint(endpoint: string): string {
    if (endpoint.includes('/exercises')) return 'exercise_library';
    if (endpoint.includes('/workouts')) return 'workouts';
    if (endpoint.includes('/progress')) return 'progress_tracking';
    if (endpoint.includes('/recommendations')) return 'personalization';
    if (endpoint.includes('/social')) return 'social_features';
    return 'unknown';
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private sendErrorReport(errorReport: ErrorReport): void {
    // In production, send to error tracking service (Sentry, Bugsnag, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: errorReport.message,
        fatal: errorReport.severity === 'critical',
        custom_map: {
          error_type: errorReport.type,
          error_severity: errorReport.severity,
          error_feature: errorReport.context.feature
        }
      });
    }

    // Example: Send to custom endpoint
    if (import.meta.env.VITE_ERROR_ENDPOINT) {
      fetch(import.meta.env.VITE_ERROR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(err => {
        console.error('[Error Tracking] Failed to send error report:', err);
      });
    }
  }

  // Utility methods

  public getErrorMetrics(): ErrorMetrics {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorsByFeature: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + error.count;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + error.count;
      if (error.context.feature) {
        errorsByFeature[error.context.feature] = (errorsByFeature[error.context.feature] || 0) + error.count;
      }
    });

    // Calculate top errors
    const sortedErrors = Array.from(this.errors.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10);

    const topErrors = sortedErrors.map(([_, error]) => ({
      error,
      count: error.count,
      percentage: totalErrors > 0 ? (error.count / totalErrors) * 100 : 0
    }));

    // Calculate error rate (errors per session)
    const sessionCount = parseInt(localStorage.getItem('session_count') || '1', 10);
    const errorRate = sessionCount > 0 ? totalErrors / sessionCount : 0;

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      errorsByFeature,
      errorRate,
      topErrors
    };
  }

  public getErrorsByFeature(feature: string): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(error => error.context.feature === feature)
      .sort((a, b) => b.count - a.count);
  }

  public resolveError(errorId: string, resolvedBy?: string): boolean {
    const error = this.errors.get(errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolvedAt = new Date();
    error.resolvedBy = resolvedBy;

    return true;
  }

  public onError(callback: (error: ErrorReport) => void): void {
    this.errorCallbacks.push(callback);
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public exportErrors(): string {
    return JSON.stringify({
      errors: Array.from(this.errors.values()),
      metrics: this.getErrorMetrics(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  public clearErrors(): void {
    this.errors.clear();
    this.errorCounts.clear();
  }

  public destroy(): void {
    this.errors.clear();
    this.errorCounts.clear();
    this.errorCallbacks = [];
  }
}

// Create singleton instance
let errorTracker: ErrorTracking | null = null;

export function getErrorTracker(options?: { userId?: string; environment?: string }): ErrorTracking {
  if (!errorTracker) {
    errorTracker = new ErrorTracking(options);
  } else if (options?.userId) {
    errorTracker.setUserId(options.userId);
  }
  return errorTracker;
}

export function destroyErrorTracker(): void {
  if (errorTracker) {
    errorTracker.destroy();
    errorTracker = null;
  }
}

// Utility functions for React components

export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  errorContext?: Partial<ErrorContext>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    const errorTracker = getErrorTracker();

    const handleError = (error: Error) => {
      errorTracker.captureError(error, {
        component: Component.displayName || Component.name,
        ...errorContext
      });
    };

    try {
      return <Component {...props} />;
    } catch (error) {
      handleError(error as Error);
      return null; // or render error boundary component
    }
  };
}

export default ErrorTracking;
/**
 * Performance Monitoring Service
 *
 * Real-time performance monitoring for enhanced exercise library features.
 * Tracks Core Web Vitals, API performance, render times, and user experience metrics.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'percentage' | 'count';
  threshold: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
  category: 'vital' | 'custom' | 'api' | 'render' | 'network';
  timestamp: Date;
  context?: Record<string, any>;
}

interface PerformanceAlert {
  id: string;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved?: boolean;
}

interface CoreWebVitals {
  LCP: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  FID: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  CLS: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  FCP: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  TTFB: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
}

class PerformanceMonitoring {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private apiMetrics: Map<string, number[]> = new Map();
  private renderMetrics: Map<string, number[]> = new Map();
  private isEnabled: boolean;
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];
  private vitalsThresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  constructor(options: { enabled?: boolean; alertThreshold?: number } = {}) {
    this.isEnabled = options.enabled !== false;

    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
      this.startMonitoring();
    }
  }

  private initializeObservers(): void {
    // Core Web Vitals
    this.observeWebVitals();

    // Long tasks
    this.observeLongTasks();

    // Resource timing
    this.observeResourceTiming();

    // Navigation timing
    this.observeNavigationTiming();
  }

  private observeWebVitals(): void {
    // LCP - Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.recordMetric('LCP', lastEntry.startTime, 'ms', {
          good: this.vitalsThresholds.LCP.good,
          needsImprovement: this.vitalsThresholds.LCP.needsImprovement,
          poor: Infinity
        }, 'vital');
      }
    });

    // FID - First Input Delay
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach((entry) => {
        if (entry instanceof PerformanceEventTiming) {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms', {
            good: this.vitalsThresholds.FID.good,
            needsImprovement: this.vitalsThresholds.FID.needsImprovement,
            poor: Infinity
          }, 'vital');
        }
      });
    });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.recordMetric('CLS', clsValue, 'percentage', {
        good: this.vitalsThresholds.CLS.good,
        needsImprovement: this.vitalsThresholds.CLS.needsImprovement,
        poor: Infinity
      }, 'vital');
    });
  }

  private observeLongTasks(): void {
    this.observePerformanceEntry('longtask', (entries) => {
      entries.forEach((entry) => {
        this.recordMetric('long_task', entry.duration, 'ms', {
          good: 50,
          needsImprovement: 100,
          poor: 200
        }, 'custom', {
          name: entry.name,
          startTime: entry.startTime
        });

        // Alert on very long tasks
        if (entry.duration > 100) {
          this.createAlert('long_task', 'medium', `Long task detected: ${entry.duration.toFixed(2)}ms`, entry.duration, 100);
        }
      });
    });
  }

  private observeResourceTiming(): void {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        if (entry instanceof PerformanceResourceTiming) {
          const duration = entry.responseEnd - entry.startTime;

          // Track specific resource types
          const resourceType = this.getResourceType(entry.name);
          if (resourceType) {
            this.recordMetric(`resource_${resourceType}`, duration, 'ms', {
              good: 500,
              needsImprovement: 1000,
              poor: 2000
            }, 'network', {
              url: entry.name,
              size: entry.transferSize,
              type: resourceType
            });
          }
        }
      });
    });
  }

  private observeNavigationTiming(): void {
    this.observePerformanceEntry('navigation', (entries) => {
      entries.forEach((entry) => {
        if (entry instanceof PerformanceNavigationTiming) {
          // FCP - First Contentful Paint
          const fcp = entry.responseStart - entry.requestStart;
          this.recordMetric('FCP', fcp, 'ms', {
            good: this.vitalsThresholds.FCP.good,
            needsImprovement: this.vitalsThresholds.FCP.needsImprovement,
            poor: Infinity
          }, 'vital');

          // TTFB - Time to First Byte
          const ttfb = entry.responseStart - entry.requestStart;
          this.recordMetric('TTFB', ttfb, 'ms', {
            good: this.vitalsThresholds.TTFB.good,
            needsImprovement: this.vitalsThresholds.TTFB.needsImprovement,
            poor: Infinity
          }, 'vital');

          // DOM processing time
          const domProcessing = entry.domContentLoadedEventStart - entry.responseEnd;
          this.recordMetric('dom_processing', domProcessing, 'ms', {
            good: 100,
            needsImprovement: 300,
            poor: 500
          }, 'render');
        }
      });
    });
  }

  private observePerformanceEntry(type: string, callback: (entries: any[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`[Performance Monitoring] Could not observe ${type}:`, error);
    }
  }

  private getResourceType(url: string): string | null {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    if (url.includes('/api/')) return 'api';
    return null;
  }

  private startMonitoring(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory_usage', memory.usedJSHeapSize, 'bytes', {
          good: 50 * 1024 * 1024, // 50MB
          needsImprovement: 100 * 1024 * 1024, // 100MB
          poor: 200 * 1024 * 1024 // 200MB
        }, 'custom', {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }, 30000); // Every 30 seconds
    }

    // Monitor frame rate
    this.monitorFrameRate();
  }

  private monitorFrameRate(): void {
    let lastTime = performance.now();
    let frames = 0;

    const measureFrameRate = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));

        this.recordMetric('fps', fps, 'count', {
          good: 55,
          needsImprovement: 30,
          poor: 15
        }, 'custom');

        if (fps < 30) {
          this.createAlert('fps', 'medium', `Low frame rate detected: ${fps} FPS`, fps, 30);
        }

        frames = 0;
        lastTime = currentTime;
      }

      if (this.isEnabled) {
        requestAnimationFrame(measureFrameRate);
      }
    };

    requestAnimationFrame(measureFrameRate);
  }

  // Public API

  public recordMetric(name: string, value: number, unit: PerformanceMetric['unit'], threshold: PerformanceMetric['threshold'], category: PerformanceMetric['category'], context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      threshold,
      category,
      timestamp: new Date(),
      context
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check thresholds and create alerts
    this.checkThreshold(metric);

    // Store in specific category maps
    if (category === 'api') {
      const apiName = context?.apiName || name;
      if (!this.apiMetrics.has(apiName)) {
        this.apiMetrics.set(apiName, []);
      }
      this.apiMetrics.get(apiName)!.push(value);
    } else if (category === 'render') {
      const componentName = context?.component || name;
      if (!this.renderMetrics.has(componentName)) {
        this.renderMetrics.set(componentName, []);
      }
      this.renderMetrics.get(componentName)!.push(value);
    }
  }

  private checkThreshold(metric: PerformanceMetric): void {
    let severity: PerformanceAlert['severity'] | null = null;
    let message = '';

    if (metric.value >= metric.threshold.poor) {
      severity = 'critical';
      message = `Critical: ${metric.name} is ${metric.value}${metric.unit} (threshold: ${metric.threshold.poor}${metric.unit})`;
    } else if (metric.value >= metric.threshold.needsImprovement) {
      severity = 'high';
      message = `Poor performance: ${metric.name} is ${metric.value}${metric.unit} (threshold: ${metric.threshold.needsImprovement}${metric.unit})`;
    } else if (metric.value >= metric.threshold.good) {
      severity = 'medium';
      message = `Needs improvement: ${metric.name} is ${metric.value}${metric.unit} (threshold: ${metric.threshold.good}${metric.unit})`;
    }

    if (severity) {
      this.createAlert(metric.name, severity, message, metric.value, metric.threshold.good);
    }
  }

  private createAlert(metric: string, severity: PerformanceAlert['severity'], message: string, value: number, threshold: number): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metric,
      severity,
      message,
      value,
      threshold,
      timestamp: new Date()
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  // API performance monitoring

  public startApiTimer(apiName: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(`api_${apiName}`, duration, 'ms', {
        good: 200,
        needsImprovement: 500,
        poor: 1000
      }, 'api', { apiName });

      return duration;
    };
  }

  public recordApiResponse(apiName: string, status: number, responseSize?: number): void {
    this.recordMetric(`api_${apiName}_status`, status, 'count', {
      good: 200,
      needsImprovement: 400,
      poor: 500
    }, 'api', { apiName, status });

    if (responseSize) {
      this.recordMetric(`api_${apiName}_size`, responseSize, 'bytes', {
        good: 1024 * 10, // 10KB
        needsImprovement: 1024 * 100, // 100KB
        poor: 1024 * 1024 // 1MB
      }, 'api', { apiName, size: responseSize });
    }
  }

  // Render performance monitoring

  public startRenderTimer(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(`render_${componentName}`, duration, 'ms', {
        good: 16,
        needsImprovement: 33,
        poor: 100
      }, 'render', { component: componentName });

      return duration;
    };
  }

  public measureRender(componentName: string, renderFn: () => void): number {
    const endTimer = this.startRenderTimer(componentName);
    renderFn();
    return endTimer();
  }

  // Exercise library specific monitoring

  public trackExerciseLoad(exerciseId: string, loadTime: number, videoLoadTime?: number): void {
    this.recordMetric('exercise_load', loadTime, 'ms', {
      good: 500,
      needsImprovement: 1000,
      poor: 2000
    }, 'custom', { exerciseId });

    if (videoLoadTime) {
      this.recordMetric('exercise_video_load', videoLoadTime, 'ms', {
        good: 1000,
        needsImprovement: 3000,
        poor: 5000
      }, 'custom', { exerciseId });
    }
  }

  public trackFilterPerformance(filterCount: number, resultCount: number, processingTime: number): void {
    this.recordMetric('filter_processing', processingTime, 'ms', {
      good: 50,
      needsImprovement: 100,
      poor: 300
    }, 'custom', { filterCount, resultCount });
  }

  public trackSearchPerformance(queryLength: number, resultCount: number, searchTime: number): void {
    this.recordMetric('search_processing', searchTime, 'ms', {
      good: 100,
      needsImprovement: 300,
      poor: 500
    }, 'custom', { queryLength, resultCount });
  }

  // Utility methods

  public getCoreWebVitals(): CoreWebVitals {
    const getRating = (value: number, thresholds: { good: number; needsImprovement: number }) => {
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.needsImprovement) return 'needs-improvement';
      return 'poor';
    };

    const lcp = this.metrics.find(m => m.name === 'LCP');
    const fid = this.metrics.find(m => m.name === 'FID');
    const cls = this.metrics.find(m => m.name === 'CLS');
    const fcp = this.metrics.find(m => m.name === 'FCP');
    const ttfb = this.metrics.find(m => m.name === 'TTFB');

    return {
      LCP: { value: lcp?.value || 0, rating: getRating(lcp?.value || 0, this.vitalsThresholds.LCP) as any },
      FID: { value: fid?.value || 0, rating: getRating(fid?.value || 0, this.vitalsThresholds.FID) as any },
      CLS: { value: cls?.value || 0, rating: getRating(cls?.value || 0, this.vitalsThresholds.CLS) as any },
      FCP: { value: fcp?.value || 0, rating: getRating(fcp?.value || 0, this.vitalsThresholds.FCP) as any },
      TTFB: { value: ttfb?.value || 0, rating: getRating(ttfb?.value || 0, this.vitalsThresholds.TTFB) as any }
    };
  }

  public getMetricsSummary(timeRange?: { start: Date; end: Date }): {
    totalMetrics: number;
    alertsBySeverity: Record<string, number>;
    averageMetrics: Record<string, { avg: number; min: number; max: number; count: number }>;
  } {
    const filteredMetrics = timeRange
      ? this.metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
      : this.metrics;

    const averageMetrics: Record<string, any> = {};
    const metricsByName = new Map<string, number[]>();

    filteredMetrics.forEach(metric => {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric.value);
    });

    metricsByName.forEach((values, name) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      averageMetrics[name] = { avg, min, max, count: values.length };
    });

    const alertsBySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMetrics: filteredMetrics.length,
      alertsBySeverity,
      averageMetrics
    };
  }

  public onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      alerts: this.alerts,
      coreWebVitals: this.getCoreWebVitals(),
      summary: this.getMetricsSummary(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isEnabled = false;
  }
}

// Create singleton instance
let performanceMonitor: PerformanceMonitoring | null = null;

export function getPerformanceMonitor(options?: { enabled?: boolean }): PerformanceMonitoring {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitoring(options);
  }
  return performanceMonitor;
}

export function destroyPerformanceMonitor(): void {
  if (performanceMonitor) {
    performanceMonitor.destroy();
    performanceMonitor = null;
  }
}

export default PerformanceMonitoring;
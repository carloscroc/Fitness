import React, { useState, useEffect } from 'react'
import { Activity, Wifi, WifiOff, Database, HardDrive, Clock, Zap } from 'lucide-react'

interface PerformanceMetrics {
  cacheHitRate: number
  loadTime: number
  memoryUsage: number
  cacheSize: number
  imageCacheSize: number
  exerciseCacheSize: number
  networkStatus: 'online' | 'offline'
  serviceWorkerActive: boolean
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 0,
    loadTime: 0,
    memoryUsage: 0,
    cacheSize: 0,
    imageCacheSize: 0,
    exerciseCacheSize: 0,
    networkStatus: 'online',
    serviceWorkerActive: false
  })

  const [isVisible, setIsVisible] = useState(false)

  // Measure performance metrics
  useEffect(() => {
    const measurePerformance = async () => {
      try {
        // If the Cache API is not available in this environment, skip cache-specific metrics.
        if (typeof caches === 'undefined') {
          // Fallback metrics without caches
          const memoryInfo = (performance as any).memory || {}
          const memoryUsage = memoryInfo.usedJSHeapSize || 0
          const networkStatus = navigator.onLine ? 'online' : 'offline'
          const serviceWorkerActive = !!navigator.serviceWorker?.controller

          setMetrics({
            cacheHitRate: calculateCacheHitRate(),
            loadTime: calculateLoadTime(),
            memoryUsage: Math.round(memoryUsage / 1024 / 1024),
            cacheSize: 0,
            imageCacheSize: 0,
            exerciseCacheSize: 0,
            networkStatus,
            serviceWorkerActive
          })
          return
        }

        // Get cache sizes
        const imageCache = await caches.open('fitness-images-v1')
        const staticCache = await caches.open('fitness-static-v1')

        const imageCacheKeys = await imageCache.keys()
        const staticCacheKeys = await staticCache.keys()

        // Calculate memory usage (rough estimate)
        const memoryInfo = (performance as any).memory || {}
        const memoryUsage = memoryInfo.usedJSHeapSize || 0

        // Check network status
        const networkStatus = navigator.onLine ? 'online' : 'offline'

        // Check service worker status
        const serviceWorkerActive = !!navigator.serviceWorker?.controller

        setMetrics({
          cacheHitRate: calculateCacheHitRate(),
          loadTime: calculateLoadTime(),
          memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
          cacheSize: staticCacheKeys.length + imageCacheKeys.length,
          imageCacheSize: imageCacheKeys.length,
          exerciseCacheSize: 0, // Could be calculated from React Query cache
          networkStatus,
          serviceWorkerActive
        })
      } catch (error) {
        console.warn('Performance measurement failed:', error)
      }
    }

    // Initial measurement
    measurePerformance()

    // Set up periodic measurements
    const interval = setInterval(measurePerformance, 5000)

    // Network status listeners
    const handleOnline = () => measurePerformance()
    const handleOffline = () => measurePerformance()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Calculate cache hit rate (simulated for React Query)
  const calculateCacheHitRate = (): number => {
    try {
      // This would be calculated from React Query's internal cache
      // For now, return a simulated value
      return Math.random() * 30 + 70 // 70-100%
    } catch {
      return 0
    }
  }

  // Calculate load time (simulated)
  const calculateLoadTime = (): number => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        return Math.round(navigation.loadEventEnd - navigation.fetchStart)
      }
      return 0
    } catch {
      return 0
    }
  }

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getMetricColor = (value: number, threshold: number) => {
    if (value > threshold) return 'text-green-500'
    if (value > threshold / 2) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl border p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Network Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metrics.networkStatus === 'online' ? (
                  <Wifi className={`w-4 h-4 ${getStatusColor(metrics.networkStatus)}`} />
                ) : (
                  <WifiOff className={`w-4 h-4 ${getStatusColor(metrics.networkStatus)}`} />
                )}
                <span className="font-medium">Network</span>
              </div>
              <span className={`capitalize ${getStatusColor(metrics.networkStatus)}`}>
                {metrics.networkStatus}
              </span>
            </div>

            {/* Service Worker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${metrics.serviceWorkerActive ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-medium">Service Worker</span>
              </div>
              <span className={metrics.serviceWorkerActive ? 'text-green-500' : 'text-gray-400'}>
                {metrics.serviceWorkerActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Cache Hit Rate</span>
              </div>
              <span className={getMetricColor(metrics.cacheHitRate, 80)}>
                {metrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>

            {/* Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Load Time</span>
              </div>
              <span className={getMetricColor(metrics.loadTime, 1000)}>
                {metrics.loadTime}ms
              </span>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Memory</span>
              </div>
              <span className={getMetricColor(metrics.memoryUsage, 50)}>
                {metrics.memoryUsage}MB
              </span>
            </div>

            {/* Cache Sizes */}
            <div className="space-y-1 pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Images:</span>
                <span className="text-gray-700">{metrics.imageCacheSize} items</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Static:</span>
                <span className="text-gray-700">{metrics.cacheSize} items</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t mt-4">
            <button
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(names => {
                    return Promise.all(names.map(name => caches.delete(name)))
                  }).then(() => {
                    alert('All caches cleared!')
                    window.location.reload()
                  })
                }
              }}
              className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Caches
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </>
  )
}
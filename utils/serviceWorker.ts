import React from 'react'

export interface ServiceWorkerConfig {
  enableImageCaching?: boolean
  enableBackgroundSync?: boolean
  cacheCleanupInterval?: number
  preloadImages?: string[]
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private config: Required<ServiceWorkerConfig>

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      enableImageCaching: true,
      enableBackgroundSync: true,
      cacheCleanupInterval: 1000 * 60 * 60, // 1 hour
      preloadImages: [],
      ...config
    }
  }

  /**
   * Register the service worker
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('✅ Service Worker registered:', this.registration.scope)

      // Set up periodic cache cleanup
      if (this.config.cacheCleanupInterval > 0) {
        setInterval(() => {
          this.cleanupCache()
        }, this.config.cacheCleanupInterval)
      }

      // Preload specified images
      if (this.config.preloadImages.length > 0) {
        setTimeout(() => this.preloadImages(this.config.preloadImages), 2000)
      }

      return true
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      return false
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (this.registration) {
      try {
        const success = await this.registration.unregister()
        console.log('🗑️ Service Worker unregistered:', success)
        this.registration = null
        return success
      } catch (error) {
        console.error('❌ Service Worker unregistration failed:', error)
        return false
      }
    }
    return true
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return !!this.registration && this.registration.active !== null
  }

  /**
   * Get current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  /**
   * Trigger background sync
   */
  async triggerSync(): Promise<boolean> {
    if (!this.registration || !this.registration.sync) {
      console.warn('Background sync not supported')
      return false
    }

    try {
      await this.registration.sync.register('background-sync')
      console.log('🔄 Background sync triggered')
      return true
    } catch (error) {
      console.error('❌ Background sync failed:', error)
      return false
    }
  }

  /**
   * Cache specific images
   */
  async cacheImages(imageUrls: string[]): Promise<void> {
    if (!this.isActive()) {
      console.warn('Service Worker not active, cannot cache images')
      return
    }

    const cachePromises = imageUrls.map(async (url) => {
      try {
        await fetch(url)
        console.log('🖼️ Cached image:', url)
      } catch (error) {
        console.warn('⚠️ Failed to cache image:', url, error)
      }
    })

    await Promise.all(cachePromises)
    console.log(`✅ Cached ${imageUrls.length} images`)
  }

  /**
   * Preload images specified in config
   */
  private preloadImages(imageUrls: string[]): void {
    if (!this.isActive()) return

    imageUrls.forEach((url, index) => {
      setTimeout(() => {
        this.cacheImages([url])
      }, index * 200) // Stagger requests
    })
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    if (!this.isActive()) return

    // Send cleanup message to service worker
    navigator.serviceWorker.controller?.postMessage({
      type: 'CACHE_CLEANUP'
    })
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    imageCache: number
    staticCache: number
    totalSize?: string
  }> {
    try {
      if (typeof caches === 'undefined') {
        // Cache API not available in this environment
        return { imageCache: 0, staticCache: 0 }
      }

      const imageCache = await caches.open('fitness-images-v1')
      const staticCache = await caches.open('fitness-static-v1')

      const imageCacheKeys = await imageCache.keys()
      const staticCacheKeys = await staticCache.keys()

      return {
        imageCache: imageCacheKeys.length,
        staticCache: staticCacheKeys.length
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return {
        imageCache: 0,
        staticCache: 0
      }
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(cacheName: string): Promise<boolean> {
    try {
      if (typeof caches === 'undefined') {
        console.warn('Cache API not available; cannot clear cache:', cacheName)
        return false
      }

      await caches.delete(cacheName)
      console.log(`🧹 Cleared cache: ${cacheName}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to clear cache ${cacheName}:`, error)
      return false
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<boolean> {
    try {
      if (typeof caches === 'undefined') {
        console.warn('Cache API not available; cannot clear caches')
        return false
      }

      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('🧹 Cleared all caches')
      return true
    } catch (error) {
      console.error('❌ Failed to clear caches:', error)
      return false
    }
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null

/**
 * Get or create the service worker manager instance
 */
export function getServiceWorkerManager(config?: ServiceWorkerConfig): ServiceWorkerManager {
  if (!swManager) {
    swManager = new ServiceWorkerManager(config)
  }
  return swManager
}

/**
 * Hook for using the service worker manager in React components
 */
export function useServiceWorker(config?: ServiceWorkerConfig) {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [stats, setStats] = React.useState({
    imageCache: 0,
    staticCache: 0
  })

  React.useEffect(() => {
    const manager = getServiceWorkerManager(config)

    // Register service worker
    manager.register().then(success => {
      setIsRegistered(success)
    })

    // Get initial stats
    manager.getCacheStats().then(setStats)

    // Set up periodic stats updates
    const statsInterval = setInterval(() => {
      manager.getCacheStats().then(setStats)
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(statsInterval)
    }
  }, [])

  const manager = getServiceWorkerManager()

  return {
    isRegistered,
    stats,
    manager,
    cacheImages: (urls: string[]) => manager.cacheImages(urls),
    clearCache: (name: string) => manager.clearCache(name),
    clearAllCaches: () => manager.clearAllCaches(),
    triggerSync: () => manager.triggerSync(),
    unregister: () => manager.unregister()
  }
}
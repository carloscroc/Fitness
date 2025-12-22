const CACHE_NAME = 'fitness-app-v1'
const IMAGE_CACHE_NAME = 'fitness-images-v1'
const STATIC_CACHE_NAME = 'fitness-static-v1'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/vite.svg'
]

// External image domains to cache
const IMAGE_DOMAINS = [
  'https://images.unsplash.com',
  'https://via.placeholder.com'
]

// Maximum cache sizes
const MAX_IMAGE_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_STATIC_CACHE_SIZE = 10 * 1024 * 1024 // 10MB

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('📦 Caching static assets...')
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Cache images from allowed domains
  if (IMAGE_DOMAINS.some(domain => url.origin === domain)) {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Network-first for static assets
  if (STATIC_ASSETS.some(asset => url.pathname === new URL(asset, self.location.origin).pathname)) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Network-first for API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }
})

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: IMAGE_CACHE_NAME })

    if (cachedResponse) {
      // Update cache in background
      fetch(request).then((response) => {
        if (response.ok) {
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(request, response.clone())
          })
        }
      }).catch(() => {
        // Ignore background update errors
      })

      return cachedResponse
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone)
      }).catch((error) => {
        console.warn('Failed to cache image:', error)
      })
    }

    return networkResponse
  } catch (error) {
    console.warn('Image request failed:', error)
    return new Response('Image not available', { status: 404 })
  }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: STATIC_CACHE_NAME })

    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone)
      })
    }

    return networkResponse
  } catch (error) {
    console.warn('Static asset request failed:', error)
    return new Response('Asset not available', { status: 404 })
  }
}

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone()
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseClone)
      })
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    console.warn('API request failed, trying cache:', error)
    const cachedResponse = await caches.match(request, { cacheName: CACHE_NAME })

    if (cachedResponse) {
      return cachedResponse
    }

    return new Response('API unavailable', { status: 503 })
  }
}

// Background sync for updating caches
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync())
  }
})

async function performBackgroundSync() {
  try {
    // Update image cache for frequently used images
    const imageCache = await caches.open(IMAGE_CACHE_NAME)
    const requests = await imageCache.keys()

    // Refresh first 10 images
    const refreshPromises = requests.slice(0, 10).map(async (request) => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await imageCache.put(request, response)
        }
      } catch (error) {
        console.warn('Failed to refresh image:', request.url, error)
      }
    })

    await Promise.all(refreshPromises)
    console.log('🔄 Background sync completed')
  } catch (error) {
    console.warn('Background sync failed:', error)
  }
}

// Cache cleanup to prevent storage quota issues
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches())
  }
})

async function cleanupCaches() {
  try {
    // Check image cache size
    const imageCache = await caches.open(IMAGE_CACHE_NAME)
    const imageRequests = await imageCache.keys()

    // Remove oldest images if cache is too large
    if (imageRequests.length > 100) {
      const toDelete = imageRequests.slice(50) // Keep first 50
      await Promise.all(toDelete.map(request => imageCache.delete(request)))
      console.log('🧹 Cleaned up image cache')
    }
  } catch (error) {
    console.warn('Cache cleanup failed:', error)
  }
}

// Periodic cache cleanup
setInterval(() => {
  self.postMessage({ type: 'CACHE_CLEANUP' })
}, 1000 * 60 * 60) // Every hour
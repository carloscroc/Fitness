import React, { Suspense, lazy, ComponentType } from 'react'
import { Loader } from './ui/Loader.tsx'

interface LazyModalProps {
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  delay?: number
}

interface LazyComponentProps extends LazyModalProps {
  componentPath: string
}

/**
 * Higher-order component for lazy loading heavy modal components
 * with smart fallbacks and delayed loading indicators
 */
export function createLazyModal<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: LazyModalProps = {}
) {
  const LazyComponent = lazy(() => {
    return importFunc().catch(error => {
      // Safe logging: avoid coercion errors when console tries to stringify exotic error objects
      try {
        let msg: string
        if (typeof error === 'string') {
          msg = error
        } else if (error && typeof error === 'object') {
          msg = (error as any).message || JSON.stringify(error)
        } else {
          msg = String(error)
        }
        // eslint-disable-next-line no-console
        console.error('Failed to load component:', msg)
      } catch (loggingError) {
        // eslint-disable-next-line no-console
        console.error('Failed to load component (unserializable error)')
      }

      // Return a simple error component as fallback
      return {
        default: () => (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load component</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-500 hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )
      }
    })
  })

  return function LazyModalWrapper(props: T) {
    const {
      fallback = <DefaultLoader />,
      errorFallback = <DefaultErrorFallback />,
      delay = 200
    } = options

    return (
      <Suspense fallback={<DelayedLoader delay={delay} fallback={fallback} />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Delayed loader to avoid flashing loaders for fast loads
 */
function DelayedLoader({ delay, fallback }: { delay: number; fallback: React.ReactNode }) {
  const [showLoader, setShowLoader] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!showLoader) return null
  return <>{fallback}</>
}

/**
 * Default loading spinner
 */
function DefaultLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader size="md" />
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Default error fallback
 */
function DefaultErrorFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 mb-2">Something went wrong</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

/**
 * Predefined lazy-loaded components
 */
export const LazyExerciseDetailModal = createLazyModal(
  () => import('./ExerciseDetailModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyExerciseLibraryModal = createLazyModal(
  () => import('./ExerciseLibraryModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyProgramDetailModal = createLazyModal(
  () => import('./ProgramDetailModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyMealDetailModal = createLazyModal(
  () => import('./MealDetailModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyProfileSettingsModal = createLazyModal(
  () => import('./ProfileSettingsModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyNotificationsModal = createLazyModal(
  () => import('./NotificationsModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazySubscriptionModal = createLazyModal(
  () => import('./SubscriptionModal.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

export const LazyHelpCenter = createLazyModal(
  () => import('./HelpCenter.tsx'),
  { fallback: <DefaultLoader />, delay: 150 }
)

/**
 * Hook for preloading modal components
 */
export function useModalPreloader() {
  // Only accept import functions to avoid Vite's dynamic-import-vars limitations in dev.
  const preloadModal = React.useCallback((component: () => Promise<any>) => {
    if (typeof component === 'function') {
      component().catch(() => {
        /* swallow preload failures */
      })
    } else {
      // Avoid attempting dynamic imports from string paths which trigger Vite warnings.
      // Keep a no-op for backward compatibility.
      // eslint-disable-next-line no-console
      console.warn('preloadModal expects an import function; string paths are ignored in this build.')
    }
  }, [])

  const preloadAllModals = React.useCallback(() => {
    // Only run preloads in development to avoid referencing source .tsx files
    if (!import.meta.env.DEV) return

    const importFuncs: Array<() => Promise<any>> = [
      () => import('./ExerciseDetailModal'),
      () => import('./ExerciseLibraryModal'),
      () => import('./ProgramDetailModal'),
      () => import('./MealDetailModal'),
      () => import('./ProfileSettingsModal'),
      () => import('./NotificationsModal'),
      () => import('./SubscriptionModal'),
      () => import('./HelpCenter')
    ]

    importFuncs.forEach(fn => {
      setTimeout(() => {
        fn().catch(() => {})
      }, Math.random() * 2000)
    })
  }, [])

  return { preloadModal, preloadAllModals }
}

/**
 * Progressive loading hook for modal images
 */
export function useProgressiveImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '')
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (!src) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
      setError(false)
    }

    img.onerror = () => {
      setError(true)
      setImageLoaded(true)
    }

    // Clean up
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { imageSrc, imageLoaded, error }
}
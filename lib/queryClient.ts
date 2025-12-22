import { QueryClient } from '@tanstack/react-query'

// Create a client with optimized caching defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Consider data fresh for 30 seconds to avoid unnecessary refetches
      gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status >= 400 && status < 500) return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Use exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once if they fail
      retry: 1,
    },
  },
})
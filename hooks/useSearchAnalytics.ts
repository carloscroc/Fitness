import { useCallback, useRef, useEffect } from 'react';
import { ExerciseSearchResult } from '../types/exercise';

interface SearchEvent {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  searchTime: number;
  sessionId: string;
  userId?: string;
  filters?: string;
  hasOperators?: boolean;
  clickThrough?: boolean;
  exerciseId?: string;
  timeToClick?: number;
}

interface SearchAnalytics {
  totalSearches: number;
  averageResultCount: number;
  averageSearchTime: number;
  clickThroughRate: number;
  topQueries: Array<{ query: string; count: number }>;
  emptySearchRate: number;
  operatorUsageRate: number;
}

// Generate session ID
const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Local storage key for analytics
const ANALYTICS_STORAGE_KEY = 'exercise-search-analytics';
const SESSION_STORAGE_KEY = 'exercise-search-session';

export const useSearchAnalytics = () => {
  const sessionId = useRef<string>(generateSessionId());
  const searchEvents = useRef<SearchEvent[]>([]);
  const currentSearch = useRef<SearchEvent | null>(null);

  // Load existing analytics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        searchEvents.current = parsed.events || [];
      }

      // Check for existing session
      const existingSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (existingSession) {
        sessionId.current = existingSession;
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId.current);
      }
    } catch (error) {
      console.warn('Failed to load search analytics:', error);
    }
  }, []);

  // Track search event
  const trackSearch = useCallback((
    query: string,
    searchResult: ExerciseSearchResult,
    filters?: string,
    hasOperators?: boolean
  ) => {
    const event: SearchEvent = {
      id: 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      query: query.trim(),
      timestamp: Date.now(),
      resultCount: searchResult.filteredCount,
      searchTime: searchResult.searchTime,
      sessionId: sessionId.current,
      filters,
      hasOperators
    };

    currentSearch.current = event;
    searchEvents.current.push(event);

    // Keep only last 1000 events to prevent storage bloat
    if (searchEvents.current.length > 1000) {
      searchEvents.current = searchEvents.current.slice(-1000);
    }

    // Save to localStorage
    saveAnalytics();

    // Optional: Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Google Analytics event
      (window as any).gtag('event', 'exercise_search', {
        search_term: query,
        result_count: searchResult.filteredCount,
        search_time: searchResult.searchTime
      });
    }
  }, []);

  // Track exercise click through
  const trackExerciseClick = useCallback((exerciseId: string) => {
    if (!currentSearch.current) return;

    const timeToClick = Date.now() - currentSearch.current.timestamp;

    // Update the current search event
    currentSearch.current.clickThrough = true;
    currentSearch.current.exerciseId = exerciseId;
    currentSearch.current.timeToClick = timeToClick;

    // Find and update in events array
    const eventIndex = searchEvents.current.findIndex(e => e.id === currentSearch.current?.id);
    if (eventIndex >= 0) {
      searchEvents.current[eventIndex] = { ...currentSearch.current };
    }

    saveAnalytics();

    // Optional: Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exercise_click', {
        exercise_id: exerciseId,
        search_term: currentSearch.current.query,
        time_to_click: timeToClick
      });
    }
  }, []);

  // Get analytics summary
  const getAnalytics = useCallback((): SearchAnalytics => {
    const events = searchEvents.current;
    const totalSearches = events.length;

    if (totalSearches === 0) {
      return {
        totalSearches: 0,
        averageResultCount: 0,
        averageSearchTime: 0,
        clickThroughRate: 0,
        topQueries: [],
        emptySearchRate: 0,
        operatorUsageRate: 0
      };
    }

    // Calculate averages
    const totalResultCount = events.reduce((sum, event) => sum + event.resultCount, 0);
    const totalSearchTime = events.reduce((sum, event) => sum + event.searchTime, 0);
    const averageResultCount = Math.round(totalResultCount / totalSearches);
    const averageSearchTime = Math.round(totalSearchTime / totalSearches);

    // Calculate click-through rate
    const clickThroughs = events.filter(event => event.clickThrough).length;
    const clickThroughRate = (clickThroughs / totalSearches) * 100;

    // Calculate empty search rate
    const emptySearches = events.filter(event => event.resultCount === 0).length;
    const emptySearchRate = (emptySearches / totalSearches) * 100;

    // Calculate operator usage rate
    const operatorSearches = events.filter(event => event.hasOperators).length;
    const operatorUsageRate = (operatorSearches / totalSearches) * 100;

    // Get top queries
    const queryCounts: Record<string, number> = {};
    events.forEach(event => {
      if (event.query) {
        queryCounts[event.query] = (queryCounts[event.query] || 0) + 1;
      }
    });

    const topQueries = Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    return {
      totalSearches,
      averageResultCount,
      averageSearchTime,
      clickThroughRate,
      topQueries,
      emptySearchRate,
      operatorUsageRate
    };
  }, []);

  // Save analytics to localStorage
  const saveAnalytics = useCallback(() => {
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify({
        events: searchEvents.current,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save search analytics:', error);
    }
  }, []);

  // Clear analytics
  const clearAnalytics = useCallback(() => {
    searchEvents.current = [];
    currentSearch.current = null;
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }, []);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const analytics = getAnalytics();
    const events = searchEvents.current;

    return {
      summary: analytics,
      events: events.slice(-100), // Last 100 events for detailed analysis
      sessionId: sessionId.current,
      exportDate: new Date().toISOString()
    };
  }, [getAnalytics]);

  // Get recent searches
  const getRecentSearches = useCallback((limit: number = 10): SearchEvent[] => {
    return searchEvents.current
      .filter(event => event.query)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, []);

  // Get search trends (last 7 days)
  const getSearchTrends = useCallback(() => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    const recentEvents = searchEvents.current.filter(
      event => event.timestamp >= sevenDaysAgo
    );

    const dailyStats: Record<string, { searches: number; averageResults: number }> = {};

    recentEvents.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];

      if (!dailyStats[date]) {
        dailyStats[date] = { searches: 0, averageResults: 0 };
      }

      dailyStats[date].searches++;
    });

    // Calculate average results per day
    Object.keys(dailyStats).forEach(date => {
      const dayEvents = recentEvents.filter(event =>
        new Date(event.timestamp).toISOString().split('T')[0] === date
      );

      if (dayEvents.length > 0) {
        const totalResults = dayEvents.reduce((sum, event) => sum + event.resultCount, 0);
        dailyStats[date].averageResults = Math.round(totalResults / dayEvents.length);
      }
    });

    return dailyStats;
  }, []);

  return {
    trackSearch,
    trackExerciseClick,
    getAnalytics,
    getRecentSearches,
    getSearchTrends,
    clearAnalytics,
    exportAnalytics
  };
};
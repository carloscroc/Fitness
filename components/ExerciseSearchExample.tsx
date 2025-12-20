import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Exercise } from '../data/exercises';
import { ExerciseWithSource, ExerciseSearchResult } from '../types/exercise';
import { ExerciseSearch } from './ExerciseSearch';
import { ExerciseSearchResults } from './ExerciseSearchResults';
import { useSearchAnalytics } from '../hooks/useSearchAnalytics';
import { Button } from './ui/Button';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface ExerciseSearchExampleProps {
  className?: string;
}

export const ExerciseSearchExample: React.FC<ExerciseSearchExampleProps> = ({
  className = ''
}) => {
  const [searchResult, setSearchResult] = useState<ExerciseSearchResult | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | ExerciseWithSource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const analytics = useSearchAnalytics();

  const handleSearchResults = useCallback((results: ExerciseSearchResult) => {
    setSearchResult(results);

    // Track search analytics
    analytics.trackSearch(
      '', // We'll need to pass the actual query from the search component
      results,
      JSON.stringify(results.exercises.slice(0, 5).map(e => e.name)) // Sample results as filter string
    );
  }, [analytics]);

  const handleExerciseSelect = useCallback((exercise: Exercise | ExerciseWithSource) => {
    setSelectedExercise(exercise);

    // Track exercise click
    analytics.trackExerciseClick(exercise.id);
  }, [analytics]);

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);

    // Simulate loading more results
    setTimeout(() => {
      setIsLoading(false);
      // In a real implementation, this would fetch the next page of results
    }, 1000);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResult(null);
  }, []);

  const analyticsData = analytics.getAnalytics();
  const recentSearches = analytics.getRecentSearches(5);

  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Exercise Library Search
              </h1>
              <p className="text-gray-400">
                Find the perfect exercises for your workout with advanced search and filtering
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </Button>
          </div>

          {/* Search Component */}
          <ExerciseSearch
            onResults={handleSearchResults}
            onExerciseSelect={handleExerciseSelect}
            placeholder="Search for exercises... Try 'chest', 'equipment:barbell', or 'difficulty:advanced'"
            showFilters={true}
            showHistory={true}
            showSavedSearches={true}
            allowAdvancedOperators={true}
            autoFocus={true}
          />
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-white/10 bg-[#1C1C1E]"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-xl font-semibold text-white mb-4">Search Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#2C2C2E] border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.totalSearches}
                </div>
                <div className="text-sm text-gray-400">Total Searches</div>
              </div>

              <div className="bg-[#2C2C2E] border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.averageResultCount}
                </div>
                <div className="text-sm text-gray-400">Avg. Results</div>
              </div>

              <div className="bg-[#2C2C2E] border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.clickThroughRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Click-through Rate</div>
              </div>

              <div className="bg-[#2C2C2E] border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.operatorUsageRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Advanced Search Usage</div>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={search.id}
                      className="px-3 py-1.5 bg-[#2C2C2E] border border-white/10 rounded-lg text-sm text-gray-300"
                    >
                      {search.query}
                      <span className="text-gray-500 ml-2">
                        ({search.resultCount} results)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Queries */}
            {analyticsData.topQueries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.topQueries.slice(0, 5).map((query, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-[#0A84FF]/20 border border-[#0A84FF]/30 rounded-lg text-sm text-blue-300"
                    >
                      {query.query}
                      <span className="text-blue-400 ml-2">
                        {query.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ExerciseSearchResults
          searchResult={searchResult}
          onExerciseSelect={handleExerciseSelect}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showQualityIndicators={true}
        />

        {/* No Search Yet State */}
        {!searchResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Start Your Exercise Search
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Use the search bar above to find exercises. You can search by name, muscle group,
                equipment, or use advanced operators like:
              </p>
            </div>

            {/* Search Examples */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-white font-semibold mb-4">Try these examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { query: 'chest', description: 'Chest exercises' },
                  { query: 'equipment:barbell', description: 'Barbell exercises' },
                  { query: 'difficulty:beginner', description: 'Beginner-friendly' },
                  { query: 'video:true', description: 'Exercises with videos' },
                  { query: 'muscle:legs equipment:none', description: 'Bodyweight leg exercises' },
                  { query: 'core abs', description: 'Core and abs workouts' }
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // This would typically update the search input
                      console.log('Search for:', example.query);
                    }}
                    className="p-4 bg-[#1C1C1E] border border-white/10 rounded-xl hover:border-white/20 transition-all text-left"
                  >
                    <code className="text-[#0A84FF] text-sm font-mono block mb-1">
                      {example.query}
                    </code>
                    <span className="text-gray-400 text-sm">{example.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
          autoPlayVideo={false}
        />
      )}
    </div>
  );
};
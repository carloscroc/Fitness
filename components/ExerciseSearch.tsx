import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  Bookmark,
  BookmarkBorder,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Command,
  ArrowUp,
  ArrowDown,
  Enter,
  Escape
} from 'lucide-react';
import { Exercise } from '../data/exercises';
import { ExerciseWithSource, ExerciseFilterOptions, ExerciseSortOptions, ExerciseSearchResult } from '../types/exercise';
import { searchExercises } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { SEARCH_DEBOUNCE_MS, PAGINATION_DEFAULTS } from '../constants/exerciseFilters';

// Search operators for advanced search
interface SearchOperator {
  field: string;
  value: string;
  operator: ':' | '=';
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: ExerciseFilterOptions;
  timestamp: number;
}

interface ExerciseSearchProps {
  onResults?: (results: ExerciseSearchResult) => void;
  onExerciseSelect?: (exercise: Exercise | ExerciseWithSource) => void;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showSavedSearches?: boolean;
  maxResults?: number;
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
  initialFilters?: ExerciseFilterOptions;
  allowAdvancedOperators?: boolean;
}

interface SearchSuggestion {
  text: string;
  type: 'history' | 'saved' | 'autocomplete' | 'operator';
  highlight?: string;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  onResults,
  onExerciseSelect,
  placeholder = "Search exercises by name, muscle, equipment...",
  showFilters = true,
  showHistory = true,
  showSavedSearches = true,
  maxResults = PAGINATION_DEFAULTS.PAGE_SIZE,
  className = '',
  autoFocus = false,
  initialQuery = '',
  initialFilters = {},
  allowAdvancedOperators = true
}) => {
  // Core search state
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExerciseSearchResult | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // UI state
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);

  // Search history and saved searches
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Advanced search
  const [parsedOperators, setParsedOperators] = useState<SearchOperator[]>([]);
  const [activeFilters, setActiveFilters] = useState<ExerciseFilterOptions>(initialFilters);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history and saved searches from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('exercise-search-history');
      if (history) {
        const parsed = JSON.parse(history);
        setSearchHistory(parsed.slice(0, 10)); // Keep only last 10 searches
      }

      const saved = localStorage.getItem('exercise-saved-searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Parse advanced search operators
  const parseSearchOperators = useCallback((searchQuery: string): { cleanQuery: string; operators: SearchOperator[] } => {
    if (!allowAdvancedOperators) {
      return { cleanQuery: searchQuery, operators: [] };
    }

    const operators: SearchOperator[] = [];
    let cleanQuery = searchQuery;

    // Match patterns like "equipment:barbell" or "muscle:chest"
    const operatorRegex = /(\w+):([^\s]+)/g;
    let match;

    while ((match = operatorRegex.exec(searchQuery)) !== null) {
      operators.push({
        field: match[1].toLowerCase(),
        value: match[2].toLowerCase(),
        operator: ':'
      });

      // Remove the operator from the clean query
      cleanQuery = cleanQuery.replace(match[0], '').trim();
    }

    return { cleanQuery, operators };
  }, [allowAdvancedOperators]);

  // Apply operators as filters
  const applyOperatorsAsFilters = useCallback((operators: SearchOperator[]): ExerciseFilterOptions => {
    const filters: ExerciseFilterOptions = { ...activeFilters };

    operators.forEach(op => {
      switch (op.field) {
        case 'muscle':
        case 'muscles':
          filters.muscles = [...(filters.muscles || []), op.value];
          break;
        case 'equipment':
          filters.equipment = [...(filters.equipment || []), op.value];
          break;
        case 'category':
        case 'categories':
          filters.categories = [...(filters.categories || []), op.value];
          break;
        case 'difficulty':
          filters.difficulty = [...(filters.difficulty || []), op.value as Exercise['difficulty']];
          break;
        case 'video':
          filters.hasVideo = op.value === 'true' || op.value === 'yes';
          break;
        case 'image':
          filters.hasImage = op.value === 'true' || op.value === 'yes';
          break;
      }
    });

    return filters;
  }, [activeFilters]);

  // Save search to history
  const saveToHistory = useCallback((searchQuery: string, resultCount: number) => {
    if (!searchQuery.trim()) return;

    const historyItem: SearchHistoryItem = {
      query: searchQuery,
      timestamp: Date.now(),
      resultCount
    };

    setSearchHistory(prev => {
      const updated = [historyItem, ...prev.filter(item => item.query !== searchQuery)];
      const sliced = updated.slice(0, 10); // Keep only last 10

      try {
        localStorage.setItem('exercise-search-history', JSON.stringify(sliced));
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }

      return sliced;
    });
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() && Object.keys(activeFilters).length === 0) {
      setSearchResults(null);
      onResults?.({ exercises: [], totalCount: 0, filteredCount: 0, searchTime: 0 });
      return;
    }

    setIsSearching(true);

    try {
      const { cleanQuery, operators } = parseSearchOperators(searchQuery);
      setParsedOperators(operators);

      const filters = operators.length > 0
        ? applyOperatorsAsFilters(operators)
        : activeFilters;

      const sortOptions: ExerciseSortOptions = { field: 'name', direction: 'asc' };

      const results = await searchExercises(
        cleanQuery,
        filters,
        sortOptions,
        maxResults,
        0
      );

      setSearchResults(results);
      onResults?.(results);

      if (searchQuery.trim()) {
        saveToHistory(searchQuery, results.filteredCount);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        exercises: [],
        totalCount: 0,
        filteredCount: 0,
        searchTime: 0
      });
    } finally {
      setIsSearching(false);
    }
  }, [activeFilters, parseSearchOperators, applyOperatorsAsFilters, maxResults, onResults, saveToHistory]);

  // Debounced search handler
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedSuggestionIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newQuery);
    }, SEARCH_DEBOUNCE_MS);
  }, [performSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setQuery('');
    setSearchResults(null);
    setSelectedSuggestionIndex(-1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchInputRef.current?.focus();
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (selectedSuggestionIndex >= 0) {
      // Handle suggestion selection
      const suggestions = generateSuggestions(query);
      if (selectedSuggestionIndex < suggestions.length) {
        const suggestion = suggestions[selectedSuggestionIndex];
        if (suggestion.type === 'history' || suggestion.type === 'saved') {
          setQuery(suggestion.text);
          performSearch(suggestion.text);
        }
      }
    } else {
      performSearch(query);
    }
    setShowSuggestions(false);
  }, [query, selectedSuggestionIndex, performSearch]);

  // Generate search suggestions
  const generateSuggestions = useMemo(() => {
    return (searchQuery: string): SearchSuggestion[] => {
      const suggestions: SearchSuggestion[] = [];
      const queryLower = searchQuery.toLowerCase();

      // Add history suggestions
      if (showHistory && searchQuery) {
        searchHistory
          .filter(item => item.query.toLowerCase().includes(queryLower))
          .slice(0, 3)
          .forEach(item => {
            suggestions.push({
              text: item.query,
              type: 'history',
              highlight: queryLower
            });
          });
      }

      // Add saved search suggestions
      if (showSavedSearches && searchQuery) {
        savedSearches
          .filter(saved => saved.name.toLowerCase().includes(queryLower) || saved.query.toLowerCase().includes(queryLower))
          .slice(0, 2)
          .forEach(saved => {
            suggestions.push({
              text: saved.query,
              type: 'saved',
              highlight: queryLower
            });
          });
      }

      // Add operator suggestions for advanced search
      if (allowAdvancedOperators && searchQuery.includes(':')) {
        const fieldMatch = searchQuery.match(/(\w+):$/);
        if (fieldMatch) {
          const field = fieldMatch[1].toLowerCase();
          let suggestionsList: string[] = [];

          switch (field) {
            case 'muscle':
            case 'muscles':
              suggestionsList = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
              break;
            case 'equipment':
              suggestionsList = ['barbell', 'dumbbell', 'none', 'cable', 'machine'];
              break;
            case 'difficulty':
              suggestionsList = ['beginner', 'intermediate', 'advanced'];
              break;
            case 'video':
            case 'image':
              suggestionsList = ['true', 'false', 'yes', 'no'];
              break;
          }

          suggestionsList.forEach(value => {
            suggestions.push({
              text: `${field}:${value}`,
              type: 'operator'
            });
          });
        }
      }

      return suggestions;
    };
  }, [showHistory, showSavedSearches, searchHistory, savedSearches, allowAdvancedOperators]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const suggestions = generateSuggestions(query);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        handleSearchSubmit();
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [query, generateSuggestions, handleSearchSubmit]);

  // Handle focus/blur
  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    }, 150);
  }, []);

  // Save current search
  const handleSaveSearch = useCallback(() => {
    if (!query.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName || query,
      query,
      filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
      timestamp: Date.now()
    };

    const updated = [...savedSearches, newSavedSearch];
    setSavedSearches(updated);

    try {
      localStorage.setItem('exercise-saved-searches', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save search:', error);
    }

    setShowSaveDialog(false);
    setSaveSearchName('');
  }, [query, saveSearchName, activeFilters, savedSearches]);

  // Get suggestion icon
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'saved':
        return <Bookmark className="w-4 h-4 text-blue-400" />;
      case 'operator':
        return <Command className="w-4 h-4 text-purple-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent"
          />

          {isSearching ? (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Advanced Search Help */}
        {allowAdvancedOperators && (
          <button
            type="button"
            onClick={() => setShowAdvancedHelp(!showAdvancedHelp)}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            title="Advanced Search Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (isFocused || selectedSuggestionIndex >= 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            {(() => {
              const suggestions = generateSuggestions(query);
              if (suggestions.length === 0 && query) {
                return (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No suggestions found
                  </div>
                );
              }

              return suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion.text);
                    performSearch(suggestion.text);
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-white/10' : ''
                  }`}
                >
                  {getSuggestionIcon(suggestion.type)}
                  <span className="text-white text-sm">
                    {suggestion.type === 'saved' && (
                      <span className="text-blue-400 mr-2">Saved:</span>
                    )}
                    {suggestion.text}
                  </span>
                </button>
              ));
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search Help */}
      <AnimatePresence>
        {showAdvancedHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-xl z-50 p-4"
          >
            <h4 className="text-white font-semibold mb-3">Advanced Search Operators</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-green-400">muscle:chest</code>
                <span className="text-gray-400">Search chest exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-green-400">equipment:barbell</code>
                <span className="text-gray-400">Barbell exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-green-400">difficulty:advanced</code>
                <span className="text-gray-400">Advanced difficulty</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-black/30 px-2 py-1 rounded text-green-400">video:true</code>
                <span className="text-gray-400">Exercises with videos</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-gray-400 text-xs">
                Combine operators: <code className="bg-black/30 px-1 rounded">chest equipment:barbell</code>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Actions */}
      {(searchHistory.length > 0 || query) && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {searchResults && (
              <span>
                {searchResults.filteredCount} results
                {searchResults.searchTime > 0 && (
                  <span className="ml-1">({searchResults.searchTime}ms)</span>
                )}
              </span>
            )}
            {parsedOperators.length > 0 && (
              <span className="text-purple-400">
                {parsedOperators.length} operator{parsedOperators.length !== 1 ? 's' : ''} applied
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <BookmarkBorder className="w-3 h-3" />
                Save Search
              </button>
            )}
            {searchHistory.length > 0 && (
              <button
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('exercise-search-history');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear History
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2C2C2E] border border-white/10 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold mb-4">Save Search</h3>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="Search name (optional)"
                className="w-full px-3 py-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] mb-4"
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleSaveSearch} className="flex-1">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveSearchName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
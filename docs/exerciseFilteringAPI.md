# Exercise Filtering API Documentation

This document describes the enhanced exercise filtering API that provides robust, well-typed functions for filtering complete exercises based on multiple criteria.

## Overview

The enhanced `services/supabaseClient.ts` now includes comprehensive filtering functions that leverage the existing database schema to provide efficient exercise filtering with proper TypeScript typing, error handling, and caching for performance.

## Database Schema

The API works with the following database fields:

- `video_url` (text): Exercise video URL
- `instructions` (jsonb): Exercise instructions array
- `benefits` (text[]): Exercise benefits array
- `category` (text): Exercise category
- `primary_muscle` (text): Primary muscle group
- `equipment` (text[]): Equipment types array
- `difficulty` (text): Difficulty level
- `image_url` (text): Exercise image URL

## Core Functions

### `fetchCompleteExercises()`

Fetches only exercises that have all required fields (video, instructions, and benefits).

```typescript
async function fetchCompleteExercises(): Promise<Exercise[]>
```

**Returns**: Array of complete Exercise objects

**Example**:
```typescript
const completeExercises = await fetchCompleteExercises();
console.log(`Found ${completeExercises.length} complete exercises`);
```

### `fetchExercisesByCategory(category)`

Filters exercises by their category.

```typescript
async function fetchExercisesByCategory(category: string): Promise<Exercise[]>
```

**Parameters**:
- `category`: The exercise category to filter by

**Example**:
```typescript
const strengthExercises = await fetchExercisesByCategory('strength');
```

### `fetchExercisesByEquipment(equipment)`

Filters exercises that require specific equipment.

```typescript
async function fetchExercisesByEquipment(equipment: string): Promise<Exercise[]>
```

**Parameters**:
- `equipment`: The equipment type to filter by

**Example**:
```typescript
const barbellExercises = await fetchExercisesByEquipment('Barbell');
```

### `fetchExercisesByMuscleGroup(muscle)`

Filters exercises that target a specific primary muscle group.

```typescript
async function fetchExercisesByMuscleGroup(muscle: string): Promise<Exercise[]>
```

**Parameters**:
- `muscle`: The muscle group to filter by

**Example**:
```typescript
const chestExercises = await fetchExercisesByMuscleGroup('Chest');
```

### `searchExercises(query, filters, sort, limit, offset)`

Advanced search with multiple filters and sorting options.

```typescript
async function searchExercises(
  query: string = '',
  filters: ExerciseFilterOptions = {},
  sort: ExerciseSortOptions = { field: 'name', direction: 'asc' },
  limit: number = 50,
  offset: number = 0
): Promise<ExerciseSearchResult>
```

**Parameters**:
- `query`: Text search query (searches name and overview)
- `filters`: Filter options (see below)
- `sort`: Sorting options (see below)
- `limit`: Maximum number of results to return
- `offset`: Number of results to skip (for pagination)

**Returns**: ExerciseSearchResult with exercises array, counts, and metadata

**Example**:
```typescript
const results = await searchExercises(
  'bench press',
  {
    muscles: ['Chest'],
    hasVideo: true,
    minCompleteness: 80
  },
  { field: 'name', direction: 'asc' },
  20,
  0
);
```

## Filter Options

The `ExerciseFilterOptions` interface supports these filters:

```typescript
interface ExerciseFilterOptions {
  dataSources?: DataSource[];           // Data source types
  categories?: string[];                // Exercise categories
  muscles?: string[];                   // Primary muscle groups
  equipment?: string[];                 // Equipment types
  difficulty?: Exercise['difficulty'][]; // Difficulty levels
  hasVideo?: boolean;                   // Filter by video availability
  hasImage?: boolean;                   // Filter by image availability
  minCompleteness?: number;             // Minimum completeness score (0-100)
}
```

**Usage Examples**:

```typescript
// Filter for chest exercises with videos
const chestWithVideo = {
  muscles: ['Chest'],
  hasVideo: true
};

// Filter for beginner bodyweight exercises
const beginnerBodyweight = {
  difficulty: ['Beginner'],
  equipment: ['Bodyweight'],
  minCompleteness: 100
};

// Filter for complete exercises in multiple categories
const multiCategory = {
  categories: ['strength', 'cardio'],
  minCompleteness: 80,
  hasVideo: true
};
```

## Sort Options

The `ExerciseSortOptions` interface supports sorting by these fields:

```typescript
interface ExerciseSortOptions {
  field: 'name' | 'difficulty' | 'calories' | 'bpm' | 'completeness';
  direction: 'asc' | 'desc';
}
```

**Usage Examples**:

```typescript
// Sort by name (default)
const sortByName = { field: 'name', direction: 'asc' };

// Sort by difficulty (hardest first)
const sortByDifficulty = { field: 'difficulty', direction: 'desc' };

// Sort by completeness (highest first)
const sortByQuality = { field: 'completeness', direction: 'desc' };
```

## Quality Scoring

The API includes a comprehensive quality scoring system that evaluates exercise completeness:

### `ExerciseQuality` Interface

```typescript
interface ExerciseQuality {
  hasVideo: boolean;        // Has video URL
  hasInstructions: boolean; // Has step-by-step instructions
  hasBenefits: boolean;     // Has benefits information
  hasImage: boolean;        // Has image URL
  hasMetadata: boolean;     // Has calories, BPM, and difficulty
  completeness: number;     // Overall completeness percentage (0-100)
}
```

### Quality Calculation

The completeness score is calculated based on the presence of:
- Video URL (20%)
- Instructions (20%)
- Benefits (20%)
- Image (20%)
- Metadata (calories, BPM, difficulty) (20%)

### Quality Functions

```typescript
// Get quality for a single exercise
async function getExerciseQuality(exerciseId: string): Promise<ExerciseQuality | null>

// Get quality for multiple exercises in batch
async function getExercisesQualityBatch(exerciseIds: string[]): Promise<Map<string, ExerciseQuality>>
```

## Caching

All API functions include intelligent caching to improve performance:

- **Cache TTL**: 5 minutes for most data
- **Stats Cache**: 10 minutes for statistics
- **Cache Keys**: Automatically generated based on query parameters
- **Cache Invalidation**: Manual with `clearExerciseCache()`

### Cache Management

```typescript
// Clear all cached exercise data
clearExerciseCache();

// Cache is automatically used and updated
const exercises = await fetchCompleteExercises(); // Uses cache if available
```

## Performance Features

### Optimized Database Queries

- Efficient use of PostgreSQL indexes
- Appropriate use of `IN`, `contains`, and `ilike` operators
- Pagination support with `limit` and `offset`
- Count queries for total result counts

### Batch Operations

- `getExercisesQualityBatch()` for efficient quality assessment
- Parallel fetching with Promise.all()
- Minimal database roundtrips

### Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const exercises = await fetchCompleteExercises();
  // Use exercises
} catch (error) {
  console.error('Error fetching exercises:', error);
  // Handle error gracefully
}
```

## Advanced Usage Examples

### Building a Workout Routine

```typescript
async function buildWorkoutRoutine() {
  const [chest, back, legs] = await Promise.all([
    searchExercises('', { muscles: ['Chest'], minCompleteness: 100 }),
    searchExercises('', { muscles: ['Back'], minCompleteness: 100 }),
    searchExercises('', { muscles: ['Legs'], minCompleteness: 100 })
  ]);

  return {
    chest: chest.exercises.slice(0, 3),
    back: back.exercises.slice(0, 3),
    legs: legs.exercises.slice(0, 3)
  };
}
```

### Progressive Filtering

```typescript
// Start with all complete exercises
let exercises = await fetchCompleteExercises();

// Then filter by user's equipment
if (userEquipment.length > 0) {
  const filtered = await searchExercises('', {
    equipment: userEquipment,
    minCompleteness: 100
  });
  exercises = filtered.exercises;
}
```

### Analytics Dashboard

```typescript
async function getDashboardStats() {
  const stats = await getExerciseStats();

  return {
    totalExercises: stats.total,
    completionRate: (stats.complete / stats.total) * 100,
    videoCoverage: (stats.withVideo / stats.total) * 100,
    qualityDistribution: calculateQualityDistribution(stats),
    categoryBreakdown: stats.byCategory
  };
}
```

## React Integration

All functions are designed to work seamlessly with React hooks:

```typescript
function useExerciseFilters() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    async function loadExercises() {
      setLoading(true);
      const results = await searchExercises('', filters);
      setExercises(results.exercises);
      setLoading(false);
    }

    loadExercises();
  }, [filters]);

  return { exercises, loading, setFilters };
}
```

## Error Recovery

The API includes robust error recovery:

- Automatic fallbacks for missing data
- Graceful degradation when Supabase is unavailable
- Detailed error logging for debugging
- Type-safe null handling

## Migration from Old API

The enhanced API is backward compatible. To migrate:

1. Replace `fetchRemoteExercises()` calls with more specific functions
2. Add quality filters to ensure high-quality content
3. Implement caching for better performance
4. Add error handling for robust user experience

## Best Practices

1. **Always check for null/undefined** when working with optional fields
2. **Use caching** for frequently accessed data
3. **Implement progressive loading** for large datasets
4. **Handle errors gracefully** and provide fallbacks
5. **Use batch operations** when processing multiple exercises
6. **Monitor performance** and optimize queries as needed

## Future Enhancements

Potential future improvements:
- Real-time updates with Supabase subscriptions
- More sophisticated ranking algorithms
- Machine learning-based exercise recommendations
- Advanced analytics and insights
- Offline support with service workers
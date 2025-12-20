# ExerciseCard Component

A highly customizable, performance-optimized exercise card component for displaying exercise information across different contexts in your fitness application.

## Features

- 🎯 **Multiple View Variants** - Grid, list, minimal, and selection modes
- ♿ **Full Accessibility** - Keyboard navigation, ARIA labels, screen reader support
- ⚡ **Performance Optimized** - Lazy loading, memoization, optimized re-renders
- 🎨 **Rich Visual Design** - Quality indicators, color coding, smooth animations
- 📱 **Responsive** - Adapts to all screen sizes and devices
- 🔧 **Customizable** - Extensive props for different use cases

## Installation

The component is already included in your project. Simply import it:

```typescript
import ExerciseCard from './components/ExerciseCard';
import type { ExerciseCardProps } from './components/ExerciseCard';
```

## Basic Usage

```typescript
import { ExerciseCard } from './components/ExerciseCard';
import { Exercise } from './data/exercises';

const MyExerciseList = ({ exercises }: { exercises: Exercise[] }) => {
  const handleSelect = (exercise: Exercise) => {
    console.log('Selected:', exercise.name);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};
```

## Props API

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exercise` | `Exercise \| ExerciseWithSource` | **Required** | The exercise data to display |
| `variant` | `'grid' \| 'list' \| 'minimal' \| 'selection'` | `'grid'` | Visual layout variant |
| `selected` | `boolean` | `false` | Whether the card is selected |
| `onClick` | `(exercise) => void` | `undefined` | Click handler function |
| `onSelect` | `(exercise) => void` | `undefined` | Selection handler function |

### Multi-Select Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiSelect` | `boolean` | `false` | Enable multi-select mode |
| `onMultiSelectToggle` | `(id, selected) => void` | `undefined` | Multi-select toggle handler |

### Display Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showQualityIndicator` | `boolean` | `true` | Show quality completion badge |
| `showDataSource` | `boolean` | `false` | Show data source indicator (dev only) |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `lazy` | `boolean` | `true` | Enable lazy image loading |
| `priority` | `'high' \| 'low'` | `'low'` | Loading priority |

### Accessibility & Testing

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabIndex` | `number` | `0` | Tab order index |
| `onKeyDown` | `(event, exercise) => void` | `undefined` | Keyboard event handler |
| `testId` | `string` | `undefined` | Test identifier |

### Styling & Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `animationDelay` | `number` | `0` | Stagger animation delay (seconds) |

## Variants

### Grid Variant (`variant="grid"`)
- Square aspect ratio
- Compact layout
- Ideal for exercise libraries and browsable lists
- Shows all exercise metadata

```typescript
<ExerciseCard
  exercise={exercise}
  variant="grid"
  onSelect={handleSelect}
/>
```

### List Variant (`variant="list"`)
- Horizontal card layout
- Larger image preview
- More space for text content
- Good for detailed search results

```typescript
<ExerciseCard
  exercise={exercise}
  variant="list"
  onSelect={handleSelect}
  showQualityIndicator
/>
```

### Minimal Variant (`variant="minimal"`)
- Compact horizontal layout
- Essential information only
- Perfect for dropdown selections or tight spaces

```typescript
<ExerciseCard
  exercise={exercise}
  variant="minimal"
  onClick={handleClick}
/>
```

### Selection Variant (`variant="selection"`)
- Multi-select checkbox
- Compact but informative
- Designed for workout builders and bulk operations

```typescript
<ExerciseCard
  exercise={exercise}
  variant="selection"
  multiSelect
  selected={isSelected}
  onMultiSelectToggle={handleMultiSelect}
/>
```

## Quality Indicators

The component automatically assesses exercise completeness and displays quality badges:

- **Complete (Green)**: Has video, image, instructions, benefits, and overview
- **Partial (Yellow)**: Has 2-4 of the required elements
- **Limited (Red)**: Has 0-1 of the required elements

```typescript
// Disable quality indicators
<ExerciseCard
  exercise={exercise}
  showQualityIndicator={false}
/>
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Enter/Space to activate
- **ARIA Labels**: Descriptive labels for screen readers
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper button roles and states

```typescript
<ExerciseCard
  exercise={exercise}
  tabIndex={0}
  onKeyDown={(event, exercise) => {
    if (event.key === 'Enter') {
      handleSelect(exercise);
    }
  }}
/>
```

## Performance Optimizations

### Lazy Loading
Images load only when visible in viewport:

```typescript
<ExerciseCard
  exercise={exercise}
  lazy={true} // Enabled by default
/>
```

### Memoization
Component is memoized to prevent unnecessary re-renders. Ensure stable function references:

```typescript
// Good: Stable callbacks
const handleSelect = useCallback((exercise) => {
  setSelectedExercise(exercise);
}, []);

// Bad: Inline functions cause re-renders
<ExerciseCard
  exercise={exercise}
  onSelect={(exercise) => setSelectedExercise(exercise)} // Creates new function each render
/>
```

### Loading States
Show skeleton loaders while data is loading:

```typescript
{isLoading ? (
  <ExerciseCard variant="grid" isLoading />
) : (
  <ExerciseCard exercise={exercise} variant="grid" />
)}
```

## Data Source Indicators (Development)

Enable data source indicators to see where exercises come from during development:

```typescript
// Enable via feature flag
isFeatureEnabled('SHOW_DATA_SOURCE_INDICATORS', true);

// Or enable per component
<ExerciseCard
  exercise={exercise}
  showDataSource={true}
/>
```

## Styling Customization

### Using Tailwind Classes

```typescript
<ExerciseCard
  exercise={exercise}
  className="border-2 border-blue-500 shadow-xl"
/>
```

### Custom Animations

```typescript
<ExerciseCard
  exercise={exercise}
  animationDelay={0.2} // 200ms delay
/>
```

## Test Support

### Test IDs

```typescript
<ExerciseCard
  exercise={exercise}
  testId="my-exercise-card"
/>

// In tests
screen.getByTestId('my-exercise-card');
```

### Data Attributes

The component includes comprehensive data attributes for testing:

```typescript
// Built-in data attributes
data-variant="grid"
data-selected="false"
data-muscle="Legs"
data-difficulty="Intermediate"
data-equipment="Barbell"
data-has-video="true"
```

## Examples

### Basic Exercise Library

```typescript
const ExerciseLibrary = ({ exercises }: { exercises: Exercise[] }) => {
  const [selected, setSelected] = useState<Exercise | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          variant="grid"
          selected={selected?.id === exercise.id}
          onSelect={setSelected}
          animationDelay={index * 0.05}
        />
      ))}
    </div>
  );
};
```

### Multi-Select Workout Builder

```typescript
const WorkoutBuilder = ({ exercises }: { exercises: Exercise[] }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (exerciseId: string, isSelected: boolean) => {
    setSelectedIds(prev =>
      isSelected
        ? [...prev, exerciseId]
        : prev.filter(id => id !== exerciseId)
    );
  };

  return (
    <div>
      <p className="text-white mb-4">
        Selected {selectedIds.length} exercises
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="selection"
            multiSelect
            selected={selectedIds.includes(exercise.id)}
            onMultiSelectToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};
```

### Search Results with Loading

```typescript
const SearchResults = ({ query, isLoading }: { query: string; isLoading: boolean }) => {
  const { data: results } = useExerciseSearch(query);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <ExerciseCard key={i} variant="list" isLoading />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results?.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          variant="list"
          onClick={(exercise) => navigate(`/exercise/${exercise.id}`)}
        />
      ))}
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if image URLs are accessible and CORS headers are set
2. **Performance issues**: Ensure callbacks are memoized with `useCallback`
3. **Accessibility warnings**: Make sure all cards have proper `tabIndex` values
4. **Animation issues**: Check if `animationDelay` is causing visual problems

### Debug Features

Enable debug mode to see component internals:

```typescript
// In development
localStorage.setItem('video-debug', '1');
```

## TypeScript Support

The component includes comprehensive TypeScript definitions:

```typescript
import type { ExerciseCardProps } from './components/ExerciseCard';

const MyCard = (props: ExerciseCardProps) => {
  return <ExerciseCard {...props} />;
};
```

## Contributing

When modifying the ExerciseCard component:

1. Maintain backward compatibility
2. Add new props to the interface
3. Update this documentation
4. Add examples to the demo file
5. Test all variants and accessibility features

## License

This component is part of your fitness application and follows the same license terms.
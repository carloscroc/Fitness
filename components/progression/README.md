# Phase 4 Progression Tracking Components

Advanced tracking and visualization components for the new Phase 4 exercise categories, providing comprehensive monitoring of flexibility, balance, power, and stability metrics.

## Components

### 1. FlexibilityProgressionTracker

Tracks range of motion improvements and flexibility milestones with AI-driven suggestions.

**Features:**
- Range of motion visualization with percentage-based progress bars
- Flexibility milestone tracking (beginner → intermediate → advanced)
- Progress animations and milestone celebrations
- AI-driven modification suggestions based on progress
- Personalized flexibility assessments with scoring
- Support for different flexibility types (static, dynamic, proprioceptive)

**Props:**
```typescript
interface FlexibilityProgressionTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: FlexibilityProgressionData[]) => void;
  onMilestoneAchieved?: (milestone: FlexibilityMilestone) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { FlexibilityProgressionTracker } from '@/components/progression';

<FlexibilityProgressionTracker
  userId="user123"
  exerciseId="hamstring-stretch"
  exerciseName="Hamstring Stretch"
  onDataUpdate={(data) => console.log('Progress updated:', data)}
  onMilestoneAchieved={(milestone) => console.log('Milestone:', milestone)}
/>
```

### 2. BalanceDifficultyIndicator

Visualizes balance exercise difficulty and progression with real-time monitoring.

**Features:**
- Real-time balance scale visualization (1-10 difficulty)
- Balance progression path with level indicators
- Safety modification recommendations for different skill levels
- Progress tracking with balance improvement metrics
- Visual indicators for static vs dynamic balance requirements
- Integration with device sensors if available

**Props:**
```typescript
interface BalanceDifficultyIndicatorProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  balanceType: 'static' | 'dynamic';
  bodyweight?: number;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: BalanceProgressionData[]) => void;
  onLevelAchieved?: (level: BalanceLevel) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { BalanceDifficultyIndicator } from '@/components/progression';

<BalanceDifficultyIndicator
  userId="user123"
  exerciseId="single-leg-stand"
  exerciseName="Single Leg Stand"
  balanceType="static"
  bodyweight={70}
  onLevelAchieved={(level) => console.log('Level achieved:', level)}
/>
```

### 3. MedicineBallPowerTracker

Tracks power output metrics for medicine ball exercises with advanced calculations.

**Features:**
- Real-time power output calculations (watts) visualization
- Speed and distance tracking metrics display
- Consistency scoring algorithms with historical data
- Explosive index calculations (power/weight ratio)
- Progress charts for power development over time
- Support for rotational, explosive, and plyometric power metrics

**Props:**
```typescript
interface MedicineBallPowerTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  ballWeight?: number; // kg
  bodyweight?: number; // kg
  powerType?: 'rotational' | 'explosive' | 'plyometric';
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: MedicineBallProgressionData[]) => void;
  onRecordAchieved?: (record: PowerRecord) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { MedicineBallPowerTracker } from '@/components/progression';

<MedicineBallPowerTracker
  userId="user123"
  exerciseId="rotational-throw"
  exerciseName="Rotational Medicine Ball Throw"
  ballWeight={3}
  bodyweight={70}
  powerType="rotational"
  onRecordAchieved={(record) => console.log('New record:', record)}
/>
```

### 4. StabilityBallEngagementTracker

Monitors core engagement and stability metrics for stability ball exercises.

**Features:**
- Stability index monitoring (1-100 scale) with visual feedback
- Muscle activation heat maps for core engagement visualization
- Form quality feedback system with real-time indicators
- Endurance time tracking with progress graphs
- Stability improvement metrics and milestone tracking
- Exercise-specific engagement patterns

**Props:**
```typescript
interface StabilityBallEngagementTrackerProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  difficultyLevel?: number;
  config?: Partial<ProgressionTrackerConfig>;
  visualization?: Partial<VisualizationConfig>;
  accessibility?: Partial<AccessibilityConfig>;
  onDataUpdate?: (data: StabilityBallProgressionData[]) => void;
  onMilestoneAchieved?: (milestone: StabilityMilestone) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { StabilityBallEngagementTracker } from '@/components/progression';

<StabilityBallEngagementTracker
  userId="user123"
  exerciseId="plank-on-ball"
  exerciseName="Plank on Stability Ball"
  difficultyLevel={3}
  onMilestoneAchieved={(milestone) => console.log('Stability milestone:', milestone)}
/>
```

## Shared Components and Utilities

### Types

All components use comprehensive TypeScript types defined in `types.ts`:

- `BaseProgressionData`: Common base interface for all progression data
- Specific data interfaces for each component type
- Configuration and visualization interfaces
- Error handling and warning types

### Utilities

Common utility functions in `utils.ts`:

- `ProgressionStorage`: Local storage management for progression data
- `ProgressionCalculations`: Common calculation functions for trends and predictions
- Specialized calculators for each component type
- `ProgressionErrorHandler`: Centralized error handling
- `ProgressionAnimations`: Celebration and animation utilities

## Configuration

### ProgressionTrackerConfig

```typescript
interface ProgressionTrackerConfig {
  enableAnimations: boolean;
  enableCelebrations: boolean;
  enablePredictions: boolean;
  enableAISuggestions: boolean;
  dataRetentionDays: number;
  refreshInterval: number; // milliseconds
  autoSave: boolean;
}
```

### VisualizationConfig

```typescript
interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'radar' | 'gauge' | 'heatmap';
  colorScheme: string[];
  showGridlines: boolean;
  showLabels: boolean;
  showLegend: boolean;
  interactive: boolean;
  animationDuration: number; // milliseconds
}
```

### AccessibilityConfig

```typescript
interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableScreenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}
```

## Data Persistence

All components automatically save data to local storage with the following structure:

```typescript
// Local storage key format: 'fitness_progression_{dataType}_{userId}'
interface StoredData {
  data: ProgressionData[];
  timestamp: number;
  version: string;
}
```

Data retention is configurable (default: 365 days), and automatic cleanup removes old data.

## Performance Considerations

- **Sub-100ms Updates**: Real-time tracking components use optimized intervals
- **Local Storage Caching**: Intelligent caching reduces redundant API calls
- **Progressive Loading**: Components load data progressively for better perceived performance
- **Memory Management**: Automatic cleanup of old data prevents memory leaks

## Accessibility Features

- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Mode**: Support for high contrast display
- **Reduced Motion**: Respects user's motion preferences
- **Color Blind Support**: Multiple color scheme options

## Integration Examples

### Complete Workout Session

```tsx
import React from 'react';
import {
  FlexibilityProgressionTracker,
  BalanceDifficultyIndicator,
  MedicineBallPowerTracker,
  StabilityBallEngagementTracker
} from '@/components/progression';

const WorkoutSession: React.FC = () => {
  const userId = 'user123';

  return (
    <div className="space-y-8">
      {/* Flexibility Tracking */}
      <FlexibilityProgressionTracker
        userId={userId}
        exerciseId="warmup-stretch"
        exerciseName="Full Body Stretch"
        config={{ enableCelebrations: true }}
      />

      {/* Balance Training */}
      <BalanceDifficultyIndicator
        userId={userId}
        exerciseId="balance-board"
        exerciseName="Balance Board Hold"
        balanceType="static"
        bodyweight={70}
      />

      {/* Power Development */}
      <MedicineBallPowerTracker
        userId={userId}
        exerciseId="med-ball-slam"
        exerciseName="Medicine Ball Slam"
        ballWeight={4}
        bodyweight={70}
        powerType="explosive"
      />

      {/* Core Stability */}
      <StabilityBallEngagementTracker
        userId={userId}
        exerciseId="ball-crunch"
        exerciseName="Stability Ball Crunch"
        difficultyLevel={2}
      />
    </div>
  );
};
```

### Custom Configuration

```tsx
import { StabilityBallEngagementTracker } from '@/components/progression';

const CustomTracker: React.FC = () => {
  const customConfig = {
    enableAnimations: true,
    enableCelebrations: false, // Disable celebrations
    enablePredictions: true,
    enableAISuggestions: true,
    dataRetentionDays: 180, // 6 months retention
    refreshInterval: 1000, // 1 second updates
    autoSave: true
  };

  const customVisualization = {
    chartType: 'radar' as const,
    colorScheme: ['#22c55e', '#3b82f6', '#f59e0b'],
    showGridlines: true,
    showLabels: true,
    showLegend: false,
    interactive: true,
    animationDuration: 500
  };

  return (
    <StabilityBallEngagementTracker
      userId="user123"
      exerciseId="custom-exercise"
      exerciseName="Custom Stability Exercise"
      config={customConfig}
      visualization={customVisualization}
      accessibility={{
        enableHighContrast: true,
        fontSize: 'large'
      }}
    />
  );
};
```

## Testing

Components are designed with comprehensive test coverage:

```typescript
// Example test structure
import { render, screen } from '@testing-library/react';
import { FlexibilityProgressionTracker } from '../FlexibilityProgressionTracker';

describe('FlexibilityProgressionTracker', () => {
  it('should render with default props', () => {
    render(
      <FlexibilityProgressionTracker
        userId="test-user"
        exerciseId="test-exercise"
        exerciseName="Test Exercise"
      />
    );

    expect(screen.getByText('Current Range of Motion')).toBeInTheDocument();
  });

  it('should handle data updates correctly', () => {
    const onDataUpdate = jest.fn();
    render(
      <FlexibilityProgressionTracker
        userId="test-user"
        exerciseId="test-exercise"
        exerciseName="Test Exercise"
        onDataUpdate={onDataUpdate}
      />
    );

    // Test data update logic
  });
});
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 19+
- TypeScript 5+
- Framer Motion (animations)
- Recharts (data visualization)
- Lucide React (icons)

## Contributing

When contributing to the progression components:

1. Follow existing TypeScript patterns and interfaces
2. Maintain WCAG 2.1 AA accessibility standards
3. Add comprehensive tests for new features
4. Update documentation for any API changes
5. Ensure performance optimization (sub-100ms updates)

## License

These components are part of the fitness tracking system and follow the project's license terms.
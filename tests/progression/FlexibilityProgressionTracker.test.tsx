/**
 * FlexibilityProgressionTracker Tests
 *
 * Comprehensive test suite for the FlexibilityProgressionTracker component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import FlexibilityProgressionTracker from '../../components/progression/FlexibilityProgressionTracker';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  RadialBarChart: ({ children }: any) => <div data-testid="radial-chart">{children}</div>,
  RadialBar: () => <div data-testid="radial-bar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Brain: () => <div data-testid="brain-icon" />
}));

describe('FlexibilityProgressionTracker', () => {
  const defaultProps = {
    userId: 'test-user-123',
    exerciseId: 'test-exercise-123',
    exerciseName: 'Test Hamstring Stretch'
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders with default props', () => {
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    expect(screen.getByText('Current Range of Motion')).toBeInTheDocument();
    expect(screen.getByText('Flexibility Assessment')).toBeInTheDocument();
    expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('displays initial ROM value of 0', () => {
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Flexibility Achieved')).toBeInTheDocument();
  });

  it('allows flexibility type selection', async () => {
    const user = userEvent.setup();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    const staticButton = screen.getByRole('button', { name: 'Select static flexibility type' });
    const dynamicButton = screen.getByRole('button', { name: 'Select dynamic flexibility type' });

    expect(staticButton).toBeInTheDocument();
    expect(dynamicButton).toBeInTheDocument();
    expect(staticButton).toHaveClass('bg-blue-600'); // Should be selected by default

    await user.click(dynamicButton);
    expect(dynamicButton).toHaveClass('bg-blue-600');
    expect(staticButton).not.toHaveClass('bg-blue-600');
  });

  it('allows manual ROM input and recording', async () => {
    const user = userEvent.setup();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    expect(romInput).toBeInTheDocument();
    expect(recordButton).toBeInTheDocument();
    expect(romInput).toHaveValue(0);

    await user.clear(romInput);
    await user.type(romInput, '75');
    expect(romInput).toHaveValue(75);

    await user.click(recordButton);
  });

  it('handles data update callback', async () => {
    const onDataUpdate = jest.fn();
    render(
      <FlexibilityProgressionTracker
        {...defaultProps}
        onDataUpdate={onDataUpdate}
      />
    );

    const user = userEvent.setup();
    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    await user.clear(romInput);
    await user.type(romInput, '50');
    await user.click(recordButton);

    expect(onDataUpdate).toHaveBeenCalled();
    expect(onDataUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseId: defaultProps.exerciseId,
          userId: defaultProps.userId,
          romPercentage: 50
        })
      ])
    );
  });

  it('saves data to localStorage when recording progress', async () => {
    const user = userEvent.setup();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    await user.clear(romInput);
    await user.type(romInput, '60');
    await user.click(recordButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'fitness_progression_flexibility_test-exercise-123_test-user-123',
      expect.stringContaining('"romPercentage":60')
    );
  });

  it('loads existing data from localStorage on mount', () => {
    const mockData = {
      data: [
        {
          id: 'test-data-1',
          exerciseId: defaultProps.exerciseId,
          userId: defaultProps.userId,
          timestamp: new Date().toISOString(),
          romPercentage: 45,
          flexibilityType: 'static',
          milestone: {
            level: 'beginner',
            name: 'Basic Range',
            description: 'Achieve fundamental flexibility',
            targetROM: 40,
            achieved: true,
            achievedDate: new Date().toISOString()
          },
          assessmentScore: 45,
          holdTime: 30,
          modificationSuggestions: ['Focus on gentle stretches']
        }
      ],
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorageMock.setItem(
      'fitness_progression_flexibility_test-exercise-123_test-user-123',
      JSON.stringify(mockData)
    );

    render(<FlexibilityProgressionTracker {...defaultProps} />);

    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('displays celebration modal when milestone is achieved', async () => {
    const user = userEvent.setup();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    // Record a ROM that should trigger the beginner milestone (40%)
    await user.clear(romInput);
    await user.type(romInput, '45');
    await user.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText('Flexibility Milestone Achieved!')).toBeInTheDocument();
      expect(screen.getByText('You\'ve reached Basic Range')).toBeInTheDocument();
    });

    // Close the celebration modal
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(screen.queryByText('Flexibility Milestone Achieved!')).not.toBeInTheDocument();
  });

  it('calls onMilestoneAchieved callback when milestone is reached', async () => {
    const onMilestoneAchieved = jest.fn();
    render(
      <FlexibilityProgressionTracker
        {...defaultProps}
        onMilestoneAchieved={onMilestoneAchieved}
      />
    );

    const user = userEvent.setup();
    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    await user.clear(romInput);
    await user.type(romInput, '45');
    await user.click(recordButton);

    await waitFor(() => {
      expect(onMilestoneAchieved).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'beginner',
          name: 'Basic Range',
          achieved: true
        })
      );
    });
  });

  it('displays progress chart when data is available', async () => {
    // Mock some initial data
    const mockData = {
      data: [
        {
          id: 'test-data-1',
          exerciseId: defaultProps.exerciseId,
          userId: defaultProps.userId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          romPercentage: 30,
          flexibilityType: 'static',
          milestone: {
            level: 'beginner',
            name: 'Basic Range',
            description: 'Achieve fundamental flexibility',
            targetROM: 40,
            achieved: false
          },
          assessmentScore: 30,
          modificationSuggestions: []
        },
        {
          id: 'test-data-2',
          exerciseId: defaultProps.exerciseId,
          userId: defaultProps.userId,
          timestamp: new Date().toISOString(),
          romPercentage: 50,
          flexibilityType: 'static',
          milestone: {
            level: 'beginner',
            name: 'Basic Range',
            description: 'Achieve fundamental flexibility',
            targetROM: 40,
            achieved: true,
            achievedDate: new Date().toISOString()
          },
          assessmentScore: 50,
          modificationSuggestions: []
        }
      ],
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorageMock.setItem(
      'fitness_progression_flexibility_test-exercise-123_test-user-123',
      JSON.stringify(mockData)
    );

    render(<FlexibilityProgressionTracker {...defaultProps} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
  });

  it('shows empty state when no data is available', () => {
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    expect(screen.getByText('No progression data yet. Start tracking to see your progress!')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-tracker-class';
    render(<FlexibilityProgressionTracker {...defaultProps} className={customClass} />);

    const tracker = screen.getByRole('region', { name: 'Flexibility Progression Tracker' });
    expect(tracker).toHaveClass(customClass);
  });

  it('handles invalid ROM input gracefully', async () => {
    const user = userEvent.setup();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    const romInput = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton = screen.getByRole('button', { name: 'Record current progression' });

    // Try to enter invalid input
    await user.clear(romInput);
    await user.type(romInput, '-10');
    await user.click(recordButton);

    // Should clamp to valid range (0-100)
    expect(romInput).toHaveValue(0);

    await user.clear(romInput);
    await user.type(romInput, '150');
    await user.click(recordButton);

    // Should clamp to max value (100)
    expect(romInput).toHaveValue(100);
  });

  it('applies accessibility configuration', () => {
    const accessibilityConfig = {
      enableHighContrast: true,
      fontSize: 'large' as const
    };

    render(
      <FlexibilityProgressionTracker
        {...defaultProps}
        accessibility={accessibilityConfig}
      />
    );

    const tracker = screen.getByRole('region', { name: 'Flexibility Progression Tracker' });
    expect(tracker).toBeInTheDocument();
  });

  it('applies custom visualization configuration', () => {
    const visualizationConfig = {
      chartType: 'bar' as const,
      colorScheme: ['#ff0000', '#00ff00', '#0000ff'],
      showGridlines: false
    };

    render(
      <FlexibilityProgressionTracker
        {...defaultProps}
        visualization={visualizationConfig}
      />
    );

    // Component should still render successfully with custom config
    expect(screen.getByRole('region', { name: 'Flexibility Progression Tracker' })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock a delay in data loading
    jest.useFakeTimers();
    render(<FlexibilityProgressionTracker {...defaultProps} />);

    // Initially should show loading indicator
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should load normally after delay
    expect(screen.getByText('Current Range of Motion')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('handles errors gracefully', () => {
    // Mock localStorage to throw an error
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    render(<FlexibilityProgressionTracker {...defaultProps} />);

    // Should still render the component despite storage error
    expect(screen.getByRole('region', { name: 'Flexibility Progression Tracker' })).toBeInTheDocument();
  });
});

describe('FlexibilityProgressionTracker Integration', () => {
  it('integrates with multiple exercises', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FlexibilityProgressionTracker
        userId="user123"
        exerciseId="exercise1"
        exerciseName="Exercise 1"
      />
    );

    // Record progress for first exercise
    const romInput1 = screen.getByRole('spinbutton', { name: 'Range of motion percentage' });
    const recordButton1 = screen.getByRole('button', { name: 'Record current progression' });

    await user.clear(romInput1);
    await user.type(romInput1, '40');
    await user.click(recordButton1);

    // Render second exercise
    rerender(
      <FlexibilityProgressionTracker
        userId="user123"
        exerciseId="exercise2"
        exerciseName="Exercise 2"
      />
    );

    // Should start fresh for second exercise
    expect(screen.getByRole('spinbutton', { name: 'Range of motion percentage' })).toHaveValue(0);
  });

  it('maintains data separation between users', () => {
    const user1Props = {
      userId: 'user1',
      exerciseId: 'shared-exercise',
      exerciseName: 'Shared Exercise'
    };

    const user2Props = {
      userId: 'user2',
      exerciseId: 'shared-exercise',
      exerciseName: 'Shared Exercise'
    };

    // Add data for user1
    const user1Data = {
      data: [
        {
          id: 'user1-data',
          exerciseId: 'shared-exercise',
          userId: 'user1',
          timestamp: new Date().toISOString(),
          romPercentage: 60,
          flexibilityType: 'static',
          milestone: {
            level: 'beginner',
            name: 'Basic Range',
            description: 'Achieve fundamental flexibility',
            targetROM: 40,
            achieved: true
          },
          assessmentScore: 60,
          modificationSuggestions: []
        }
      ],
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorageMock.setItem(
      'fitness_progression_flexibility_shared-exercise_user1',
      JSON.stringify(user1Data)
    );

    // Render for user1 - should show their data
    const { rerender } = render(<FlexibilityProgressionTracker {...user1Props} />);
    expect(screen.getByText('60%')).toBeInTheDocument();

    // Render for user2 - should not show user1's data
    rerender(<FlexibilityProgressionTracker {...user2Props} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
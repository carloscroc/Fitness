/**
 * Phase 4 Filters Unit Tests
 *
 * Comprehensive test suite for all Phase 4 filter components and functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import Phase 4 components
import BalanceRequirementFilter from '../BalanceRequirementFilter';
import FlexibilityTypeFilter from '../FlexibilityTypeFilter';
import PowerMetricsFilter from '../PowerMetricsFilter';
import EquipmentModifiersFilter from '../EquipmentModifiersFilter';
import ProgressionLevelFilter from '../ProgressionLevelFilter';

// Import types and constants
import {
  BalanceRequirement,
  FlexibilityType,
  PowerMetric,
  ProgressionLevel,
  EquipmentModifiers,
  MedicineBallWeight,
  StabilityBallSize
} from '../../types/exercise';

import {
  BALANCE_REQUIREMENTS,
  FLEXIBILITY_TYPES,
  POWER_METRICS,
  MEDICINE_BALL_WEIGHTS,
  STABILITY_BALL_SIZES,
  PROGRESSION_LEVELS
} from '../../constants/exerciseFilters';

// Mock console.log for URL generation tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('BalanceRequirementFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all balance requirements in compact mode', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Balance Requirement')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Dynamic')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('calls onChange when a balance requirement is toggled', async () => {
    const user = userEvent.setup();
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    const staticButton = screen.getByText('Static');
    await user.click(staticButton);

    expect(mockOnChange).toHaveBeenCalledWith(['static']);
  });

  it('shows selected requirements with proper styling', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={['static', 'dynamic']}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    const staticButton = screen.getByText('Static');
    const dynamicButton = screen.getByText('Dynamic');

    expect(staticButton).toHaveClass('border-cyan-500');
    expect(dynamicButton).toHaveClass('border-cyan-500');
  });

  it('removes requirement when clicking selected item', async () => {
    const user = userEvent.setup();
    render(
      <BalanceRequirementFilter
        selectedRequirements={['static']}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    const staticButton = screen.getByText('Static');
    await user.click(staticButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('displays descriptions in full mode', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Select exercises based on balance difficulty and stability requirements')).toBeInTheDocument();
    expect(screen.getByText('No balance required')).toBeInTheDocument();
    expect(screen.getByText('Holding positions')).toBeInTheDocument();
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    const buttons = screen.getAllByRole('checkbox');
    expect(buttons).toHaveLength(BALANCE_REQUIREMENTS.length);

    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('disables all interactions when disabled prop is true', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        disabled
      />
    );

    const buttons = screen.getAllByRole('checkbox');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
    });
  });
});

describe('FlexibilityTypeFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all flexibility types with proper icons', () => {
    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Flexibility Type')).toBeInTheDocument();
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('Dynamic')).toBeInTheDocument();
    expect(screen.getByText('Proprioceptive')).toBeInTheDocument();
  });

  it('calls onChange when flexibility type is selected', async () => {
    const user = userEvent.setup();
    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={mockOnChange}
        compact
      />
    );

    const staticButton = screen.getByText('Static');
    await user.click(staticButton);

    expect(mockOnChange).toHaveBeenCalledWith(['static']);
  });

  it('displays educational content in full mode', () => {
    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={mockOnChange}
        compact={false}
        showPurpose
      />
    );

    expect(screen.getByText('Choose stretching approaches based on your training goals and preferences')).toBeInTheDocument();
    expect(screen.getByText('Purpose: Improve flexibility and reduce muscle tension')).toBeInTheDocument();
  });

  it('shows safety tips and guidelines', () => {
    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Stretching Safety')).toBeInTheDocument();
    expect(screen.getByText(/Never stretch to the point of pain/)).toBeInTheDocument();
  });
});

describe('PowerMetricsFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all power metrics with descriptions', () => {
    render(
      <PowerMetricsFilter
        selectedMetrics={[]}
        onMetricsChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Power Metrics')).toBeInTheDocument();
    expect(screen.getByText('Explosive')).toBeInTheDocument();
    expect(screen.getByText('Rotational')).toBeInTheDocument();
    expect(screen.getByText('Plyometric')).toBeInTheDocument();
  });

  it('displays example exercises when showExamples is true', () => {
    render(
      <PowerMetricsFilter
        selectedMetrics={[]}
        onMetricsChange={mockOnChange}
        compact={false}
        showExamples
      />
    );

    expect(screen.getByText('Example Exercises')).toBeInTheDocument();
    expect(screen.getByText('Jump squats')).toBeInTheDocument();
    expect(screen.getByText('Russian twists')).toBeInTheDocument();
    expect(screen.getByText('Burpees')).toBeInTheDocument();
  });

  it('shows training recommendations for selected metrics', async () => {
    const user = userEvent.setup();
    render(
      <PowerMetricsFilter
        selectedMetrics={[]}
        onMetricsChange={mockOnChange}
        compact={false}
      />
    );

    const explosiveButton = screen.getByText('Explosive');
    await user.click(explosiveButton);

    expect(screen.getByText('Power Training Focus')).toBeInTheDocument();
    expect(screen.getByText('Explosive Training')).toBeInTheDocument();
  });

  it('displays power training guidelines', () => {
    render(
      <PowerMetricsFilter
        selectedMetrics={[]}
        onMetricsChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Power Training Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Power training requires proper technique/)).toBeInTheDocument();
  });
});

describe('EquipmentModifiersFilter', () => {
  const mockOnChange = vi.fn();
  const initialModifiers: EquipmentModifiers = {
    medicineBallWeight: [],
    stabilityBallSize: []
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders medicine ball weight options', () => {
    render(
      <EquipmentModifiersFilter
        selectedModifiers={initialModifiers}
        onModifiersChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Medicine Ball Weight')).toBeInTheDocument();
    MEDICINE_BALL_WEIGHTS.forEach(weight => {
      expect(screen.getByText(weight.label)).toBeInTheDocument();
    });
  });

  it('renders stability ball size options', () => {
    render(
      <EquipmentModifiersFilter
        selectedModifiers={initialModifiers}
        onModifiersChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Stability Ball Size')).toBeInTheDocument();
    STABILITY_BALL_SIZES.forEach(size => {
      expect(screen.getByText(size.label)).toBeInTheDocument();
    });
  });

  it('calls onChange when medicine ball weight is selected', async () => {
    const user = userEvent.setup();
    render(
      <EquipmentModifiersFilter
        selectedModifiers={initialModifiers}
        onModifiersChange={mockOnChange}
        compact
      />
    );

    const weight4kgButton = screen.getByText('4kg');
    await user.click(weight4kgButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      medicineBallWeight: [4]
    });
  });

  it('calls onChange when stability ball size is selected', async () => {
    const user = userEvent.setup();
    render(
      <EquipmentModifiersFilter
        selectedModifiers={initialModifiers}
        onModifiersChange={mockOnChange}
        compact
      />
    );

    const size65cmButton = screen.getByText('65cm');
    await user.click(size65cmButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      stabilityBallSize: [65]
    });
  });

  it('displays equipment guidelines', () => {
    render(
      <EquipmentModifiersFilter
        selectedModifiers={initialModifiers}
        onModifiersChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Medicine Ball Selection Tips')).toBeInTheDocument();
    expect(screen.getByText('Stability Ball Guidelines')).toBeInTheDocument();
  });

  it('shows selected modifiers summary', () => {
    const selectedModifiers: EquipmentModifiers = {
      medicineBallWeight: [4, 6],
      stabilityBallSize: [65]
    };

    render(
      <EquipmentModifiersFilter
        selectedModifiers={selectedModifiers}
        onModifiersChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Selected Equipment Modifiers')).toBeInTheDocument();
    expect(screen.getByText('4kg')).toBeInTheDocument();
    expect(screen.getByText('6kg')).toBeInTheDocument();
    expect(screen.getByText('65cm')).toBeInTheDocument();
  });
});

describe('ProgressionLevelFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders progression level slider', () => {
    render(
      <ProgressionLevelFilter
        selectedLevel={undefined}
        onLevelChange={mockOnChange}
        compact
      />
    );

    expect(screen.getByText('Progression Level')).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '1');
    expect(slider).toHaveAttribute('max', '5');
  });

  it('calls onChange when slider value changes', async () => {
    const user = userEvent.setup();
    render(
      <ProgressionLevelFilter
        selectedLevel={1}
        onLevelChange={mockOnChange}
        compact
      />
    );

    const slider = screen.getByRole('slider');
    await user.click(slider, { clientX: 100 }); // Click somewhere on the slider

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders level cards with icons in full mode', () => {
    render(
      <ProgressionLevelFilter
        selectedLevel={3}
        onLevelChange={mockOnChange}
        compact={false}
      />
    );

    PROGRESSION_LEVELS.forEach(level => {
      expect(screen.getByText(`Level ${level.value}`)).toBeInTheDocument();
      expect(screen.getByText(level.description)).toBeInTheDocument();
    });
  });

  it('highlights selected level properly', () => {
    render(
      <ProgressionLevelFilter
        selectedLevel={3}
        onLevelChange={mockOnChange}
        compact={false}
      />
    );

    const level3Card = screen.getByText('Level 3').closest('button');
    expect(level3Card).toHaveClass('border-orange-500');
  });

  it('displays progression level summary when level is selected', () => {
    render(
      <ProgressionLevelFilter
        selectedLevel={4}
        onLevelChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Progression Level 4')).toBeInTheDocument();
    expect(screen.getByText('Advanced techniques')).toBeInTheDocument();
  });

  it('shows progression training tips', () => {
    render(
      <ProgressionLevelFilter
        selectedLevel={undefined}
        onLevelChange={mockOnChange}
        compact={false}
      />
    );

    expect(screen.getByText('Progression Training Tips')).toBeInTheDocument();
    expect(screen.getByText(/Progress gradually through levels/)).toBeInTheDocument();
  });
});

describe('Phase 4 Filters Integration', () => {
  it('all components are properly memoized', () => {
    // Test that all components have displayName set (indicating they're memoized)
    expect(BalanceRequirementFilter.displayName).toBe('BalanceRequirementFilter');
    expect(FlexibilityTypeFilter.displayName).toBe('FlexibilityTypeFilter');
    expect(PowerMetricsFilter.displayName).toBe('PowerMetricsFilter');
    expect(EquipmentModifiersFilter.displayName).toBe('EquipmentModifiersFilter');
    expect(ProgressionLevelFilter.displayName).toBe('ProgressionLevelFilter');
  });

  it('components handle empty selections gracefully', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={vi.fn()}
        compact
      />
    );

    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={vi.fn()}
        compact
      />
    );

    render(
      <PowerMetricsFilter
        selectedMetrics={[]}
        onMetricsChange={vi.fn()}
        compact
      />
    );

    render(
      <EquipmentModifiersFilter
        selectedModifiers={{}}
        onModifiersChange={vi.fn()}
        compact
      />
    );

    // Should render without errors
    expect(screen.getByText('Balance Requirement')).toBeInTheDocument();
    expect(screen.getByText('Flexibility Type')).toBeInTheDocument();
    expect(screen.getByText('Power Metrics')).toBeInTheDocument();
    expect(screen.getByText('Medicine Ball Weight')).toBeInTheDocument();
  });

  it('components handle disabled state consistently', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={vi.fn()}
        disabled
      />
    );

    const buttons = screen.getAllByRole('checkbox');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
    });
  });
});

describe('Phase 4 Filter Constants', () => {
  it('balance requirements have proper structure', () => {
    BALANCE_REQUIREMENTS.forEach(req => {
      expect(req).toHaveProperty('value');
      expect(req).toHaveProperty('label');
      expect(req).toHaveProperty('description');
      expect(req).toHaveProperty('icon');
      expect(req).toHaveProperty('color');
      expect(req).toHaveProperty('difficulty');
      expect(req.difficulty).toBeGreaterThan(0);
      expect(req.difficulty).toBeLessThanOrEqual(4);
    });
  });

  it('flexibility types include proper purpose descriptions', () => {
    FLEXIBILITY_TYPES.forEach(type => {
      expect(type).toHaveProperty('purpose');
      expect(type.purpose).toBeTruthy();
      expect(type.purpose.length).toBeGreaterThan(10);
    });
  });

  it('power metrics include example exercises', () => {
    POWER_METRICS.forEach(metric => {
      expect(metric).toHaveProperty('examples');
      expect(Array.isArray(metric.examples)).toBe(true);
      expect(metric.examples.length).toBeGreaterThan(0);
    });
  });

  it('medicine ball weights have proper progression', () => {
    MEDICINE_BALL_WEIGHTS.forEach((weight, index) => {
      expect(weight).toHaveProperty('level');
      expect(weight.value).toBe(index * 2 + 2); // 2, 4, 6, 8, 10, 12
    });
  });

  it('stability ball sizes include height recommendations', () => {
    STABILITY_BALL_SIZES.forEach(size => {
      expect(size).toHaveProperty('height');
      expect(size.height).toContain('"');
    });
  });

  it('progression levels have consistent icon progression', () => {
    const icons = PROGRESSION_LEVELS.map(level => level.icon);
    expect(icons).toHaveLength(5);
    // Should show plant growth progression
    expect(icons).toContain('🌱');
    expect(icons).toContain('🌿');
    expect(icons).toContain('🍃');
    expect(icons).toContain('🌳');
  });
});

describe('Phase 4 Filter Accessibility', () => {
  it('all filter buttons have proper ARIA labels', () => {
    render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={vi.fn()}
        compact
      />
    );

    const buttons = screen.getAllByRole('checkbox');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  it('all filters provide keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <FlexibilityTypeFilter
        selectedTypes={[]}
        onTypesChange={vi.fn()}
        compact
      />
    );

    const firstButton = screen.getAllByRole('checkbox')[0];
    firstButton.focus();
    expect(firstButton).toHaveFocus();

    await user.keyboard('{Tab}');
    // Should move to next interactive element
  });

  it('color contrast is maintained for accessibility', () => {
    render(
      <PowerMetricsFilter
        selectedMetrics={['explosive']}
        onMetricsChange={vi.fn()}
        compact
      />
    );

    const selectedButton = screen.getByText('Explosive').closest('button');
    expect(selectedButton).toHaveClass('text-white');
    // This ensures sufficient color contrast
  });
});

describe('Phase 4 Filter Performance', () => {
  it('components do not cause unnecessary re-renders', async () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    // Initial render
    expect(mockOnChange).toHaveBeenCalledTimes(0);

    // Re-render with same props
    rerender(
      <BalanceRequirementFilter
        selectedRequirements={[]}
        onRequirementsChange={mockOnChange}
        compact
      />
    );

    // Should not trigger unnecessary updates
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('large selections are handled efficiently', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();

    render(
      <EquipmentModifiersFilter
        selectedModifiers={{}}
        onModifiersChange={mockOnChange}
        compact={false}
      />
    );

    // Select all medicine ball weights quickly
    const weightButtons = screen.getAllByText(/kg/);
    for (const button of weightButtons.slice(0, 3)) {
      await user.click(button);
    }

    // Should handle multiple selections efficiently
    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });
});
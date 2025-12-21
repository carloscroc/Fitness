import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExerciseCard } from './ExerciseCard';
import { Exercise } from '../data/exercises';
import { ExerciseWithSource } from '../types/exercise';
import { ExerciseWithPhase4, ExercisePowerMetrics, ExerciseEquipmentModifiers } from './ExerciseCard';

// Sample Phase 4 exercises for demonstration
const flexibilityExercise: ExerciseWithPhase4 = {
  id: 'pigeon-pose-001',
  name: 'Pigeon Pose',
  muscle: 'Hips',
  equipment: 'Mat',
  image: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=7-1y2Uehs_E',
  overview: 'Pigeon Pose is a powerful hip opener that stretches the hip flexors, glutes, and piriformis muscle.',
  steps: [
    'Start in downward dog position',
    'Bring your right knee forward toward your right wrist',
    'Slide your right foot toward your left wrist',
    'Lower your right hip toward the ground'
  ],
  benefits: ['Deep hip stretch', 'Improves hip mobility', 'Opens chest and shoulders'],
  bpm: 60,
  difficulty: 'Beginner',
  videoContext: 'Focus on keeping hips squared to the front',
  equipmentList: ['Mat'],
  calories: 15,
  // Phase 4 Features
  flexibility_type: 'static',
  balance_requirement: 'none',
  progression_level: 2,
  power_metrics: {
    explosive: false,
    rotational: false,
    plyometric: false
  },
  equipment_modifiers: {
    recommended_duration: 60,
    target_area: 'hip_flexors'
  }
};

const balanceExercise: ExerciseWithPhase4 = {
  id: 'single-leg-deadlift-009',
  name: 'Single Leg Deadlift',
  muscle: 'Legs',
  equipment: 'Dumbbell',
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  overview: 'Single Leg Deadlift challenges balance while strengthening hamstrings and glutes.',
  steps: [
    'Stand with feet hip-width apart',
    'Shift weight to one leg',
    'Hinge at hips while extending other leg back',
    'Return to starting position with control'
  ],
  benefits: ['Improves balance', 'Strengthens posterior chain', 'Enhances stability'],
  bpm: 110,
  difficulty: 'Intermediate',
  videoContext: 'Keep core engaged and hips level throughout movement',
  equipmentList: ['Dumbbell'],
  calories: 35,
  // Phase 4 Features
  balance_requirement: 'advanced',
  progression_level: 4,
  power_metrics: {
    explosive: false,
    rotational: false,
    plyometric: false
  },
  equipment_modifiers: {
    recommended_sets: 3,
    recommended_reps: '8-12 each leg'
  }
};

const medicineBallExercise: ExerciseWithPhase4 = {
  id: 'russian-twist-016',
  name: 'Russian Twist with Medicine Ball',
  muscle: 'Core',
  equipment: 'Medicine Ball',
  image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  overview: 'Russian Twist with medicine ball targets core rotation while building rotational power.',
  steps: [
    'Sit on floor with knees bent and feet flat',
    'Lean back slightly with straight spine',
    'Hold medicine ball at chest level',
    'Rotate torso side to side',
    'Keep core engaged throughout movement'
  ],
  benefits: ['Builds core strength', 'Improves rotational power', 'Enhances obliques'],
  bpm: 120,
  difficulty: 'Intermediate',
  videoContext: 'Focus on controlled rotation rather than momentum',
  equipmentList: ['Medicine Ball'],
  calories: 25,
  // Phase 4 Features
  power_metrics: {
    explosive: false,
    rotational: true,
    plyometric: false
  },
  progression_level: 3,
  balance_requirement: 'static',
  equipment_modifiers: {
    medicine_ball_weight: '6kg',
    recommended_sets: 3,
    recommended_reps: '15-20 each side'
  }
};

const explosiveExercise: ExerciseWithPhase4 = {
  id: 'wall-ball-throws-017',
  name: 'Wall Ball Throws',
  muscle: 'Legs',
  equipment: 'Medicine Ball',
  image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
  overview: 'Wall Ball Throws develop explosive power through a full-body movement pattern.',
  steps: [
    'Stand facing wall with feet shoulder-width apart',
    'Hold medicine ball at chest level',
    'Lower into squat position',
    'Explode upward throwing ball against wall',
    'Catch ball and immediately go into next rep'
  ],
  benefits: ['Develops explosive power', 'Full body conditioning', 'Improves coordination'],
  bpm: 145,
  difficulty: 'Advanced',
  videoContext: 'Focus on explosive hip extension and arm follow-through',
  equipmentList: ['Medicine Ball', 'Wall'],
  calories: 50,
  // Phase 4 Features
  power_metrics: {
    explosive: true,
    rotational: false,
    plyometric: true
  },
  progression_level: 5,
  balance_requirement: 'dynamic',
  equipment_modifiers: {
    medicine_ball_weight: '8kg',
    recommended_sets: 4,
    recommended_reps: '10-15'
  }
};

const stabilityBallExercise: ExerciseWithPhase4 = {
  id: 'stability-ball-crunches-025',
  name: 'Stability Ball Crunches',
  muscle: 'Core',
  equipment: 'Stability Ball',
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  overview: 'Stability Ball Crunches challenge core stability while targeting abdominal muscles.',
  steps: [
    'Sit on stability ball and walk forward',
    'Position ball under lower back',
    'Place hands behind head or across chest',
    'Crunch upward lifting shoulders off ball',
    'Lower with control and repeat'
  ],
  benefits: ['Enhances core stability', 'Greater range of motion', 'Improves balance'],
  bpm: 100,
  difficulty: 'Beginner',
  videoContext: 'Maintain control throughout movement, avoid using momentum',
  equipmentList: ['Stability Ball'],
  calories: 20,
  // Phase 4 Features
  balance_requirement: 'dynamic',
  progression_level: 2,
  power_metrics: {
    explosive: false,
    rotational: false,
    plyometric: false
  },
  equipment_modifiers: {
    stability_ball_size: '65cm',
    recommended_sets: 3,
    recommended_reps: '15-20'
  }
};

const sampleExercise: Exercise = {
  id: 'sample-1',
  name: 'Barbell Squat',
  muscle: 'Legs',
  equipment: 'Barbell',
  image: 'https://images.unsplash.com/photo-1567598508481-65985588e295?q=80&w=400&auto=format&fit=crop',
  video: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
  overview: 'The Barbell Squat is the definitive lower-body compound exercise for building strength and mass.',
  steps: [
    'Stand with feet shoulder-width apart',
    'Position barbell across upper back',
    'Lower hips until thighs are parallel to floor',
    'Drive through heels to return to starting position'
  ],
  benefits: [
    'Builds lower body strength',
    'Increases muscle mass',
    'Improves core stability'
  ],
  bpm: 140,
  difficulty: 'Intermediate',
  videoContext: 'Focus on maintaining proper form throughout the movement',
  equipmentList: ['Barbell', 'Squat rack'],
  calories: 8
};

const sampleExerciseWithSource: ExerciseWithSource = {
  ...sampleExercise,
  id: 'sample-2',
  name: 'Deadlift',
  dataSource: 'backend',
  quality: {
    hasVideo: true,
    hasInstructions: true,
    hasBenefits: true,
    hasImage: true,
    hasMetadata: true,
    completeness: 100
  },
  isOriginal: false,
  muscle: 'Back',
  image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
};

// Basic Grid View Example
export const ExerciseCardGridExample = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    console.log('Selected exercise:', exercise.name);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Grid View Example</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[sampleExercise, sampleExerciseWithSource].map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="grid"
            selected={selectedExercise?.id === exercise.id}
            onSelect={handleExerciseSelect}
            animationDelay={index * 0.1}
            testId={`grid-exercise-${exercise.id}`}
          />
        ))}
      </div>
      {selectedExercise && (
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
          <p className="text-white">Selected: {selectedExercise.name}</p>
        </div>
      )}
    </div>
  );
};

// List View Example
export const ExerciseCardListExample = () => {
  const exercises = [sampleExercise, sampleExerciseWithSource];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">List View Example</h2>
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="list"
            showQualityIndicator
            showDataSource={true}
            lazy={false}
            testId={`list-exercise-${exercise.id}`}
          />
        ))}
      </div>
    </div>
  );
};

// Multi-Select Example
export const ExerciseCardMultiSelectExample = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleMultiSelectToggle = (exerciseId: string, isSelected: boolean) => {
    setSelectedIds(prev =>
      isSelected
        ? [...prev, exerciseId]
        : prev.filter(id => id !== exerciseId)
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Multi-Select Example</h2>
      <div className="mb-4">
        <p className="text-zinc-400">
          Selected {selectedIds.length} exercise{selectedIds.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[sampleExercise, sampleExerciseWithSource].map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="selection"
            multiSelect
            selected={selectedIds.includes(exercise.id)}
            onMultiSelectToggle={handleMultiSelectToggle}
            showQualityIndicator
            testId={`multiselect-exercise-${exercise.id}`}
          />
        ))}
      </div>
    </div>
  );
};

// Minimal View Example
export const ExerciseCardMinimalExample = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Minimal View Example</h2>
      <div className="space-y-2 max-w-md">
        {[sampleExercise, sampleExerciseWithSource].map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="minimal"
            onClick={(exercise) => console.log('Minimal click:', exercise.name)}
            testId={`minimal-exercise-${exercise.id}`}
          />
        ))}
      </div>
    </div>
  );
};

// Loading States Example
export const ExerciseCardLoadingExample = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Loading States Example</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Grid skeleton */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Grid Skeleton</h3>
          <ExerciseCard variant="grid" isLoading />
        </div>

        {/* List skeleton */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">List Skeleton</h3>
          <ExerciseCard variant="list" isLoading />
        </div>

        {/* Selection skeleton */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Selection Skeleton</h3>
          <ExerciseCard variant="selection" isLoading />
        </div>
      </div>
    </div>
  );
};

// Comprehensive Demo Component
export const ExerciseCardDemo = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'multiselect' | 'minimal' | 'loading'>('grid');

  const tabs = [
    { id: 'grid', label: 'Grid View', component: ExerciseCardGridExample },
    { id: 'list', label: 'List View', component: ExerciseCardListExample },
    { id: 'multiselect', label: 'Multi-Select', component: ExerciseCardMultiSelectExample },
    { id: 'minimal', label: 'Minimal', component: ExerciseCardMinimalExample },
    { id: 'loading', label: 'Loading', component: ExerciseCardLoadingExample }
  ] as const;

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ExerciseCardGridExample;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white mb-4">ExerciseCard Component Demo</h1>
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <ActiveComponent />

      {/* Feature showcase */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Features & Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Multiple View Variants</h3>
            <p className="text-zinc-400 text-sm">
              Grid, list, minimal, and selection modes for different use cases
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Accessibility</h3>
            <p className="text-zinc-400 text-sm">
              Full keyboard navigation, ARIA labels, and screen reader support
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Performance Optimized</h3>
            <p className="text-zinc-400 text-sm">
              Lazy loading, memoization, and optimized re-renders
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Quality Indicators</h3>
            <p className="text-zinc-400 text-sm">
              Visual badges showing exercise completeness and data quality
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Responsive Design</h3>
            <p className="text-zinc-400 text-sm">
              Adapts seamlessly to all screen sizes and devices
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Rich Interactions</h3>
            <p className="text-zinc-400 text-sm">
              Hover effects, smooth animations, and visual feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Phase 4 Specific Examples
/**
 * Phase 4 Exercise Card Examples - Demonstrates all new Phase 4 features
 */
export const Phase4ExerciseCardExamples = () => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [multiSelect, setMultiSelect] = useState(false);

  const handleExerciseSelect = (exercise: ExerciseWithPhase4) => {
    if (!multiSelect) {
      setSelectedExercise(exercise.id);
      console.log('Selected exercise:', exercise.name, {
        progression_level: exercise.progression_level,
        balance_requirement: exercise.balance_requirement,
        flexibility_type: exercise.flexibility_type,
        power_metrics: exercise.power_metrics
      });
    }
  };

  const handleMultiSelectToggle = (exerciseId: string, selected: boolean) => {
    console.log('Multi-select toggle:', exerciseId, selected);
  };

  const phase4Exercises = [
    flexibilityExercise,
    balanceExercise,
    medicineBallExercise,
    explosiveExercise,
    stabilityBallExercise
  ];

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Phase 4 Exercise Cards</h2>
        <p className="text-zinc-400 mb-4">
          Demonstrating new Phase 4 features: progression levels, balance requirements,
          power metrics, flexibility types, and enhanced equipment displays.
        </p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMultiSelect(!multiSelect)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              multiSelect
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {multiSelect ? 'Multi-Select ON' : 'Multi-Select OFF'}
          </button>
        </div>
      </div>

      {/* Grid View with Phase 4 Features */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Grid View - Phase 4 Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {phase4Exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              variant="grid"
              selected={selectedExercise === exercise.id}
              onSelect={handleExerciseSelect}
              onMultiSelectToggle={handleMultiSelectToggle}
              multiSelect={multiSelect}
              showPhase4Indicators={true}
              animationDelay={parseInt(exercise.id.split('-')[1]) * 0.1}
            />
          ))}
        </div>
      </div>

      {/* List View with Phase 4 Features */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">List View - Phase 4 Features</h3>
        <div className="space-y-4">
          {phase4Exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              variant="list"
              selected={selectedExercise === exercise.id}
              onSelect={handleExerciseSelect}
              showPhase4Indicators={true}
              animationDelay={parseInt(exercise.id.split('-')[1]) * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Minimal View with Phase 4 Features */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Minimal View - Phase 4 Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phase4Exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              variant="minimal"
              selected={selectedExercise === exercise.id}
              onSelect={handleExerciseSelect}
              showPhase4Indicators={true}
              animationDelay={parseInt(exercise.id.split('-')[1]) * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Selection View with Phase 4 Features */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Selection View - Phase 4 Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phase4Exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              variant="selection"
              selected={selectedExercise === exercise.id}
              onSelect={handleExerciseSelect}
              multiSelect={true}
              onMultiSelectToggle={handleMultiSelectToggle}
              showPhase4Indicators={true}
              animationDelay={parseInt(exercise.id.split('-')[1]) * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Phase 4 Feature Toggle Example - Shows how to control Phase 4 visibility
 */
export const Phase4FeatureToggleExample = () => {
  const [showPhase4Indicators, setShowPhase4Indicators] = useState(true);
  const [variant, setVariant] = useState<'grid' | 'list' | 'minimal'>('grid');

  const toggleVariant = () => {
    setVariant((prev) => {
      const variants: Array<'grid' | 'list' | 'minimal'> = ['grid', 'list', 'minimal'];
      const currentIndex = variants.indexOf(prev);
      return variants[(currentIndex + 1) % variants.length];
    });
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Phase 4 Feature Toggle Example</h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowPhase4Indicators(!showPhase4Indicators)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPhase4Indicators
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Phase 4 Indicators: {showPhase4Indicators ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={toggleVariant}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Variant: {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </button>
        </div>
      </div>

      <div className={`grid ${variant === 'list' ? 'grid-cols-1 space-y-4' : variant === 'minimal' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
        {[
          flexibilityExercise,
          balanceExercise,
          medicineBallExercise,
          explosiveExercise,
          stabilityBallExercise
        ].map((exercise) => (
          <ExerciseCard
            key={`${exercise.id}-${variant}`}
            exercise={exercise}
            variant={variant}
            showPhase4Indicators={showPhase4Indicators}
            animationDelay={parseInt(exercise.id.split('-')[1]) * 0.05}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Phase 4 Features Demonstrated:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-zinc-300">Progression Level Indicators (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-zinc-300">Balance Requirement Badges</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-zinc-300">Power Metrics Display</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-zinc-300">Flexibility Type Indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-zinc-300">Enhanced Equipment Tooltips</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-zinc-300">Responsive Design Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
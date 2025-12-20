import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExerciseCard } from './ExerciseCard';
import { Exercise } from '../data/exercises';
import { ExerciseWithSource } from '../types/exercise';

// Sample exercises for demonstration
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
/**
 * Exercise Filter Constants
 *
 * Comprehensive constants for advanced exercise filtering including
 * muscle groups, equipment types, categories, and visual filter data.
 */

// Exercise Categories with enhanced metadata
export const EXERCISE_CATEGORIES = [
  { value: 'All', label: 'All', color: 'gray', icon: '🏋️' },
  { value: 'Strength', label: 'Strength', color: 'red', icon: '💪' },
  { value: 'Cardio', label: 'Cardio', color: 'blue', icon: '❤️' },
  { value: 'Flexibility', label: 'Flexibility', color: 'green', icon: '🧘' },
  { value: 'Balance', label: 'Balance', color: 'purple', icon: '⚖️' },
  { value: 'Functional', label: 'Functional', color: 'orange', icon: '🔧' },
  { value: 'Sports', label: 'Sports', color: 'yellow', icon: '⚽' },
  { value: 'Rehabilitation', label: 'Rehabilitation', color: 'teal', icon: '🏥' }
] as const;

// Equipment Types with categories and availability
export const EQUIPMENT_TYPES = [
  // No Equipment
  { value: 'bodyweight', label: 'Bodyweight', category: 'none', icon: '🙎', availability: 'home', color: '#2ECC71' },
  { value: 'none', label: 'No Equipment', category: 'none', icon: '✋', availability: 'home', color: '#95A5A6' },

  // Free Weights
  { value: 'dumbbells', label: 'Dumbbells', category: 'free-weights', icon: '🏋️', availability: 'home', color: '#E74C3C' },
  { value: 'barbell', label: 'Barbell', category: 'free-weights', icon: '🏋️', availability: 'gym', color: '#C0392B' },
  { value: 'kettlebells', label: 'Kettlebells', category: 'free-weights', icon: '🔔', availability: 'home', color: '#D35400' },
  { value: 'resistance-bands', label: 'Resistance Bands', category: 'free-weights', icon: '🎽', availability: 'home', color: '#8E44AD' },
  { value: 'medicine-ball', label: 'Medicine Ball', category: 'free-weights', icon: '⚪', availability: 'home', color: '#16A085' },
  { value: 'weight-plates', label: 'Weight Plates', category: 'free-weights', icon: '🟫', availability: 'gym', color: '#7F8C8D' },
  { value: 'ez-bar', label: 'EZ Bar', category: 'free-weights', icon: '🏋️', availability: 'gym', color: '#95A5A6' },

  // Machines
  { value: 'leg-press', label: 'Leg Press', category: 'machines', icon: '🦵', availability: 'gym', color: '#2980B9' },
  { value: 'cable-machine', label: 'Cable Machine', category: 'machines', icon: '🎚️', availability: 'gym', color: '#8E44AD' },
  { value: 'smith-machine', label: 'Smith Machine', category: 'machines', icon: '🏗️', availability: 'gym', color: '#34495E' },
  { value: 'leg-curl', label: 'Leg Curl', category: 'machines', icon: '🔄', availability: 'gym', color: '#E67E22' },
  { value: 'leg-extension', label: 'Leg Extension', category: 'machines', icon: '⬆️', availability: 'gym', color: '#F39C12' },
  { value: 'chest-press', label: 'Chest Press', category: 'machines', icon: '📏', availability: 'gym', color: '#E74C3C' },
  { value: 'shoulder-press', label: 'Shoulder Press', category: 'machines', icon: '⬆️', availability: 'gym', color: '#5DADE2' },
  { value: 'lat-pulldown', label: 'Lat Pulldown', category: 'machines', icon: '⬇️', availability: 'gym', color: '#27AE60' },
  { value: 'chest-fly', label: 'Chest Fly', category: 'machines', icon: '🦋', availability: 'gym', color: '#E91E63' },
  { value: 'row-machine', label: 'Row Machine', category: 'machines', icon: '🚣', availability: 'gym', color: '#00BCD4' },
  { value: 'dip-station', label: 'Dip Station', category: 'machines', icon: '⬇️', availability: 'gym', color: '#795548' },

  // Cardio Equipment
  { value: 'treadmill', label: 'Treadmill', category: 'cardio', icon: '🏃', availability: 'gym', color: '#E74C3C' },
  { value: 'stationary-bike', label: 'Stationary Bike', category: 'cardio', icon: '🚴', availability: 'home', color: '#3498DB' },
  { value: 'elliptical', label: 'Elliptical', category: 'cardio', icon: '🔄', availability: 'gym', color: '#9B59B6' },
  { value: 'rowing-machine', label: 'Rowing Machine', category: 'cardio', icon: '🚣', availability: 'gym', color: '#1ABC9C' },
  { value: 'stair-climber', label: 'Stair Climber', category: 'cardio', icon: '⬆️', availability: 'gym', color: '#E67E22' },
  { value: 'jump-rope', label: 'Jump Rope', category: 'cardio', icon: '🪢', availability: 'home', color: '#F39C12' },

  // Benches and Racks
  { value: 'bench', label: 'Bench', category: 'benches', icon: '🪑', availability: 'gym', color: '#607D8B' },
  { value: 'squat-rack', label: 'Squat Rack', category: 'benches', icon: '🏗️', availability: 'gym', color: '#455A64' },
  { value: 'pull-up-bar', label: 'Pull-up Bar', category: 'benches', icon: '🔗', availability: 'home', color: '#5499C7' },

  // Accessories
  { value: 'foam-roller', label: 'Foam Roller', category: 'accessories', icon: '🥖', availability: 'home', color: '#EC7063' },
  { value: 'yoga-mat', label: 'Yoga Mat', category: 'accessories', icon: '🧘', availability: 'home', color: '#AF7AC5' },
  { value: 'stability-ball', label: 'Stability Ball', category: 'accessories', icon: '⚪', availability: 'home', color: '#48C9B0' },
  { value: 'boxing-gloves', label: 'Boxing Gloves', category: 'accessories', icon: '🥊', availability: 'home', color: '#E59866' },
  { value: 'plyometric-box', label: 'Plyometric Box', category: 'accessories', icon: '📦', availability: 'home', color: '#F4D03F' },
  { value: 'battle-ropes', label: 'Battle Ropes', category: 'accessories', icon: '🪢', availability: 'gym', color: '#E74C3C' },
  { value: 'mat', label: 'Exercise Mat', category: 'accessories', icon: '🧘', availability: 'home', color: '#F8B739' },
  { value: 'rings', label: 'Gymnastic Rings', category: 'accessories', icon: '⭕', availability: 'gym', color: '#F39C12' },
  { value: 'heavy-bag', label: 'Heavy Bag', category: 'accessories', icon: '🥊', availability: 'gym', color: '#E67E22' },
  { value: 'agility-ladder', label: 'Agility Ladder', category: 'accessories', icon: '🪜', availability: 'home', color: '#3498DB' },
  { value: 'pole', label: 'Pole', category: 'accessories', icon: '🚧', availability: 'gym', color: '#7F8C8D' },

  // Other
  { value: 'other', label: 'Other', category: 'other', icon: '🔧', availability: 'both', color: '#7F8C8D' }
] as const;

// Muscle Groups with detailed mapping and colors
export const MUSCLE_GROUPS = [
  // Upper Body
  { value: 'chest', label: 'Chest', region: 'upper', icon: '🏋️', color: '#FF6B6B' },
  { value: 'back', label: 'Back', region: 'upper', icon: '💪', color: '#4ECDC4' },
  { value: 'shoulders', label: 'Shoulders', region: 'upper', icon: '肩', color: '#45B7D1' },
  { value: 'biceps', label: 'Biceps', region: 'upper', icon: '💪', color: '#96CEB4' },
  { value: 'triceps', label: 'Triceps', region: 'upper', icon: '💪', color: '#FFEAA7' },
  { value: 'forearms', label: 'Forearms', region: 'upper', icon: '🦾', color: '#DDA0DD' },

  // Core
  { value: 'abs', label: 'Abs', region: 'core', icon: '🎯', color: '#FF8C42' },
  { value: 'obliques', label: 'Obliques', region: 'core', icon: '🔄', color: '#6C5CE7' },
  { value: 'abdominals', label: 'Abdominals', region: 'core', icon: '🎯', color: '#FF8C42' },
  { value: 'lower-back', label: 'Lower Back', region: 'core', icon: '🦴', color: '#A29BFE' },

  // Lower Body
  { value: 'quadriceps', label: 'Quadriceps', region: 'lower', icon: '🦵', color: '#FD79A8' },
  { value: 'hamstrings', label: 'Hamstrings', region: 'lower', icon: '🦵', color: '#FDCB6E' },
  { value: 'glutes', label: 'Glutes', region: 'lower', icon: '🍑', color: '#E17055' },
  { value: 'calves', label: 'Calves', region: 'lower', icon: '💪', color: '#74B9FF' },
  { value: 'hip-flexors', label: 'Hip Flexors', region: 'lower', icon: '🦴', color: '#81ECEC' },

  // Compound & Full Body
  { value: 'full-body', label: 'Full Body', region: 'full', icon: '🏃', color: '#00B894' },
  { value: 'cardio', label: 'Cardio', region: 'full', icon: '❤️', color: '#E74C3C' }
] as const;

// Common Muscle Group Combinations
export const MUSCLE_GROUP_COMBINATIONS = [
  {
    id: 'upper-body',
    name: 'Upper Body',
    muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms'],
    icon: '💪',
    color: '#3498DB'
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'hip-flexors'],
    icon: '🦵',
    color: '#E74C3C'
  },
  {
    id: 'core',
    name: 'Core',
    muscles: ['abs', 'obliques', 'abdominals', 'lower-back'],
    icon: '🎯',
    color: '#F39C12'
  },
  {
    id: 'full-body',
    name: 'Full Body',
    muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'abs'],
    icon: '🏃',
    color: '#2ECC71'
  },
  {
    id: 'push',
    name: 'Push (Chest/Shoulders/Triceps)',
    muscles: ['chest', 'shoulders', 'triceps'],
    icon: '⬆️',
    color: '#E74C3C'
  },
  {
    id: 'pull',
    name: 'Pull (Back/Biceps)',
    muscles: ['back', 'biceps', 'forearms'],
    icon: '⬇️',
    color: '#3498DB'
  },
  {
    id: 'legs',
    name: 'Legs Focus',
    muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    icon: '🦵',
    color: '#9B59B6'
  }
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'Beginner', label: 'Beginner', color: '#2ECC71', icon: '🌱' },
  { value: 'Intermediate', label: 'Intermediate', color: '#F39C12', icon: '🌿' },
  { value: 'Advanced', label: 'Advanced', color: '#E74C3C', icon: '🔥' }
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: 'name', label: 'Name', direction: 'asc' },
  { value: 'difficulty', label: 'Difficulty', direction: 'asc' },
  { value: 'calories', label: 'Calories', direction: 'desc' },
  { value: 'bpm', label: 'Intensity (BPM)', direction: 'desc' },
  { value: 'completeness', label: 'Quality', direction: 'desc' }
] as const;

// Quality Levels for filtering
export const QUALITY_LEVELS = [
  { value: 0, label: 'All', color: 'gray' },
  { value: 40, label: '40%+', color: 'red' },
  { value: 60, label: '60%+', color: 'orange' },
  { value: 80, label: '80%+', color: 'blue' },
  { value: 100, label: '100%', color: 'green' }
] as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  INITIAL_PAGE: 1
} as const;

// Search debounce time (ms)
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

// Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  { value: 'none', label: 'No Equipment', icon: '✋', color: '#2ECC71' },
  { value: 'free-weights', label: 'Free Weights', icon: '🏋️', color: '#E74C3C' },
  { value: 'machines', label: 'Machines', icon: '⚙️', color: '#3498DB' },
  { value: 'cardio', label: 'Cardio', icon: '🏃', color: '#E67E22' },
  { value: 'benches', label: 'Benches & Racks', icon: '🪑', color: '#607D8B' },
  { value: 'accessories', label: 'Accessories', icon: '🎯', color: '#9B59B6' },
  { value: 'other', label: 'Other', icon: '🔧', color: '#7F8C8D' }
] as const;

// Equipment Availability Types
export const EQUIPMENT_AVAILABILITY = [
  { value: 'home', label: 'Home Friendly', icon: '🏠', color: '#2ECC71' },
  { value: 'gym', label: 'Gym Only', icon: '🏋️', color: '#E74C3C' },
  { value: 'both', label: 'Both', icon: '🔄', color: '#3498DB' }
] as const;

// Filter Presets
export const FILTER_PRESETS = [
  {
    id: 'beginner-home',
    name: 'Beginner Home Workout',
    description: 'Bodyweight exercises perfect for beginners',
    filters: {
      difficulty: ['Beginner'],
      equipment: ['bodyweight', 'none'],
      categories: ['Strength']
    },
    icon: '🏠',
    color: '#2ECC71'
  },
  {
    id: 'gym-strength',
    name: 'Gym Strength Training',
    description: 'Advanced exercises with gym equipment',
    filters: {
      difficulty: ['Intermediate', 'Advanced'],
      equipment: ['barbell', 'dumbbells'],
      categories: ['Strength']
    },
    icon: '🏋️',
    color: '#E74C3C'
  },
  {
    id: 'cardio-blast',
    name: 'Cardio Blast',
    description: 'High-intensity cardio exercises',
    filters: {
      categories: ['Cardio'],
      equipment: ['treadmill', 'stationary-bike', 'jump-rope', 'bodyweight']
    },
    icon: '🏃',
    color: '#E67E22'
  },
  {
    id: 'full-body',
    name: 'Full Body Workout',
    description: 'Comprehensive full-body exercises',
    filters: {
      muscles: ['chest', 'back', 'quadriceps', 'glutes', 'abs'],
      categories: ['Strength', 'Functional']
    },
    icon: '💪',
    color: '#9B59B6'
  },
  {
    id: 'recovery',
    name: 'Recovery & Mobility',
    description: 'Low intensity exercises for recovery',
    filters: {
      categories: ['Flexibility', 'Rehabilitation'],
      difficulty: ['Beginner'],
      equipment: ['foam-roller', 'yoga-mat', 'bodyweight']
    },
    icon: '🧘',
    color: '#16A085'
  },
  // Phase 4 Advanced Presets
  {
    id: 'beginner-balance',
    name: 'Beginner Balance',
    description: 'Foundation balance training exercises',
    filters: {
      categories: ['Balance', 'Functional'],
      difficulty: ['Beginner'],
      balanceRequirements: ['none', 'static']
    },
    icon: '⚖️',
    color: '#3498DB'
  },
  {
    id: 'power-training',
    name: 'Power Training',
    description: 'Explosive and rotational power movements',
    filters: {
      categories: ['Strength', 'Functional'],
      difficulty: ['Intermediate', 'Advanced'],
      powerMetrics: ['explosive', 'rotational'],
      equipment: ['medicine-ball', 'plyometric-box']
    },
    icon: '💥',
    color: '#E74C3C'
  },
  {
    id: 'flexibility-focus',
    name: 'Flexibility Focus',
    description: 'Comprehensive stretching and mobility',
    filters: {
      categories: ['Flexibility', 'Rehabilitation'],
      flexibilityTypes: ['static', 'dynamic'],
      equipment: ['yoga-mat', 'foam-roller', 'stability-ball']
    },
    icon: '🧘',
    color: '#9B59B6'
  },
  {
    id: 'advanced-balance',
    name: 'Advanced Balance',
    description: 'Challenging balance and stability exercises',
    filters: {
      categories: ['Balance', 'Functional'],
      difficulty: ['Advanced'],
      balanceRequirements: ['dynamic', 'advanced'],
      equipment: ['stability-ball']
    },
    icon: '🎯',
    color: '#E67E22'
  },
  {
    id: 'plyometric-intensity',
    name: 'Plyometric Intensity',
    description: 'High-intensity explosive movements',
    filters: {
      categories: ['Cardio', 'Functional'],
      difficulty: ['Intermediate', 'Advanced'],
      powerMetrics: ['plyometric', 'explosive'],
      equipment: ['plyometric-box', 'jump-rope', 'medicine-ball']
    },
    icon: '⚡',
    color: '#3498DB'
  }
] as const;

// Body Diagram Data for Visual Muscle Selection
export const BODY_MUSCLE_REGIONS = {
  front: [
    { id: 'chest', group: 'chest', path: 'M150,80 L180,80 L190,120 L160,130 Z', label: 'Chest' },
    { id: 'abs', group: 'abs', path: 'M160,130 L190,120 L190,180 L160,190 Z', label: 'Abs' },
    { id: 'quadriceps', group: 'quadriceps', path: 'M160,190 L190,180 L190,250 L160,260 Z', label: 'Quads' },
    { id: 'shoulders', group: 'shoulders', path: 'M130,80 L150,80 L160,120 L140,120 Z', label: 'Shoulders' },
    { id: 'biceps', group: 'biceps', path: 'M140,120 L160,120 L160,160 L140,160 Z', label: 'Biceps' },
    { id: 'forearms', group: 'forearms', path: 'M140,160 L160,160 L160,180 L140,180 Z', label: 'Forearms' },
    { id: 'calves', group: 'calves', path: 'M160,260 L190,250 L190,300 L160,310 Z', label: 'Calves' }
  ],
  back: [
    { id: 'back', group: 'back', path: 'M150,80 L180,80 L190,160 L160,170 Z', label: 'Back' },
    { id: 'lower-back', group: 'lower-back', path: 'M160,170 L190,160 L190,190 L160,200 Z', label: 'Lower Back' },
    { id: 'glutes', group: 'glutes', path: 'M160,200 L190,190 L190,220 L160,230 Z', label: 'Glutes' },
    { id: 'hamstrings', group: 'hamstrings', path: 'M160,230 L190,220 L190,280 L160,290 Z', label: 'Hamstrings' },
    { id: 'shoulders', group: 'shoulders', path: 'M130,80 L150,80 L160,130 L140,130 Z', label: 'Shoulders' },
    { id: 'triceps', group: 'triceps', path: 'M140,130 L160,130 L160,170 L140,170 Z', label: 'Triceps' },
    { id: 'calves', group: 'calves', path: 'M160,290 L190,280 L190,320 L160,330 Z', label: 'Calves' }
  ]
} as const;

// Utility functions for equipment substitution suggestions
export const EQUIPMENT_SUBSTITUTIONS = {
  'barbell': ['dumbbells', 'resistance-bands', 'bodyweight'],
  'dumbbells': ['resistance-bands', 'bodyweight', 'kettlebells'],
  'kettlebells': ['dumbbells', 'medicine-ball', 'bodyweight'],
  'cable-machine': ['resistance-bands', 'dumbbells'],
  'leg-press': ['bodyweight-squats', 'dumbbell-squats'],
  'treadmill': ['jump-rope', 'high-knees', 'burpees'],
  'stationary-bike': ['jumping-jacks', 'high-knees'],
  'pull-up-bar': ['resistance-bands', 'dumbbell-rows'],
  'bench-press': ['push-ups', 'dumbbell-press']
} as const;

// Phase 4 Advanced Filter Constants

// Balance Requirement Levels with visual indicators
export const BALANCE_REQUIREMENTS = [
  {
    value: 'none',
    label: 'None',
    description: 'No balance required',
    icon: '🚶',
    color: '#2ECC71',
    difficulty: 1
  },
  {
    value: 'static',
    label: 'Static',
    description: 'Holding positions',
    icon: '⚖️',
    color: '#3498DB',
    difficulty: 2
  },
  {
    value: 'dynamic',
    label: 'Dynamic',
    description: 'Moving balance',
    icon: '🤸',
    color: '#F39C12',
    difficulty: 3
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Complex movements',
    icon: '🎯',
    color: '#E74C3C',
    difficulty: 4
  }
] as const;

// Flexibility Types with clear descriptions
export const FLEXIBILITY_TYPES = [
  {
    value: 'static',
    label: 'Static',
    description: 'Hold stretches for 15-60 seconds',
    icon: '🧘',
    color: '#3498DB',
    purpose: 'Improve flexibility and reduce muscle tension'
  },
  {
    value: 'dynamic',
    label: 'Dynamic',
    description: 'Controlled movements through full range',
    icon: '🔄',
    color: '#E67E22',
    purpose: 'Enhance mobility and prepare for activity'
  },
  {
    value: 'proprioceptive',
    label: 'Proprioceptive',
    description: 'Proprioceptive neuromuscular facilitation',
    icon: '🧠',
    color: '#9B59B6',
    purpose: 'Advanced flexibility and neuromuscular control'
  }
] as const;

// Power Metrics for specialized training
export const POWER_METRICS = [
  {
    value: 'explosive',
    label: 'Explosive',
    description: 'Maximum force in minimum time',
    icon: '💥',
    color: '#E74C3C',
    examples: ['Jump squats', 'Medicine ball throws', 'Box jumps']
  },
  {
    value: 'rotational',
    label: 'Rotational',
    description: 'Twisting and turning power',
    icon: '🌀',
    color: '#F39C12',
    examples: ['Russian twists', 'Wood chops', 'Rotational throws']
  },
  {
    value: 'plyometric',
    label: 'Plyometric',
    description: 'Stretch-shortening cycle movements',
    icon: '⚡',
    color: '#3498DB',
    examples: ['Burpees', 'Plyometric push-ups', 'Bounding']
  }
] as const;

// Medicine Ball Weight Options
export const MEDICINE_BALL_WEIGHTS = [
  {
    value: 2,
    label: '2kg',
    color: '#2ECC71',
    level: 'Beginner'
  },
  {
    value: 4,
    label: '4kg',
    color: '#3498DB',
    level: 'Beginner-Intermediate'
  },
  {
    value: 6,
    label: '6kg',
    color: '#F39C12',
    level: 'Intermediate'
  },
  {
    value: 8,
    label: '8kg',
    color: '#E67E22',
    level: 'Intermediate-Advanced'
  },
  {
    value: 10,
    label: '10kg',
    color: '#E74C3C',
    level: 'Advanced'
  },
  {
    value: 12,
    label: '12kg',
    color: '#8E44AD',
    level: 'Expert'
  }
] as const;

// Stability Ball Size Options
export const STABILITY_BALL_SIZES = [
  {
    value: 55,
    label: '55cm',
    height: 'Under 5\'0"',
    color: '#2ECC71'
  },
  {
    value: 65,
    label: '65cm',
    height: '5\'0" - 5\'7"',
    color: '#3498DB'
  },
  {
    value: 75,
    label: '75cm',
    height: '5\'8" - 6\'3"',
    color: '#F39C12'
  }
] as const;

// Progression Levels with visual indicators
export const PROGRESSION_LEVELS = [
  {
    value: 1,
    label: 'Level 1',
    description: 'Foundation building',
    icon: '🌱',
    color: '#2ECC71'
  },
  {
    value: 2,
    label: 'Level 2',
    description: 'Basic movements',
    icon: '🌿',
    color: '#52D681'
  },
  {
    value: 3,
    label: 'Level 3',
    description: 'Intermediate skills',
    icon: '🍃',
    color: '#F39C12'
  },
  {
    value: 4,
    label: 'Level 4',
    description: 'Advanced techniques',
    icon: '🌳',
    color: '#E67E22'
  },
  {
    value: 5,
    label: 'Level 5',
    description: 'Expert mastery',
    icon: '🌲',
    color: '#E74C3C'
  }
] as const;

// Type exports for TypeScript
export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number]['value'];
export type MuscleGroup = typeof MUSCLE_GROUPS[number]['value'];
export type EquipmentType = typeof EQUIPMENT_TYPES[number]['value'];
export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number]['value'];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value'];
export type SortField = typeof SORT_OPTIONS[number]['value'];
export type EquipmentAvailability = typeof EQUIPMENT_AVAILABILITY[number]['value'];
export type FilterPresetId = typeof FILTER_PRESETS[number]['id'];
export type MuscleRegion = 'upper' | 'core' | 'lower' | 'full';

// Phase 4 Type Exports
export type BalanceRequirement = typeof BALANCE_REQUIREMENTS[number]['value'];
export type FlexibilityType = typeof FLEXIBILITY_TYPES[number]['value'];
export type PowerMetric = typeof POWER_METRICS[number]['value'];
export type MedicineBallWeight = typeof MEDICINE_BALL_WEIGHTS[number]['value'];
export type StabilityBallSize = typeof STABILITY_BALL_SIZES[number]['value'];
export type ProgressionLevel = typeof PROGRESSION_LEVELS[number]['value'];

// Helper functions
export const getMuscleGroupsByRegion = (region: MuscleRegion) => {
  return MUSCLE_GROUPS.filter(muscle => muscle.region === region);
};

export const getEquipmentByCategory = (category: EquipmentCategory) => {
  return EQUIPMENT_TYPES.filter(equipment => equipment.category === category);
};

export const getEquipmentByAvailability = (availability: EquipmentAvailability) => {
  return EQUIPMENT_TYPES.filter(equipment => equipment.availability === availability);
};

export const getMuscleGroupColor = (muscle: MuscleGroup) => {
  const muscleGroup = MUSCLE_GROUPS.find(m => m.value === muscle);
  return muscleGroup?.color || '#95A5A6';
};

export const getEquipmentColor = (equipment: EquipmentType) => {
  const equipmentType = EQUIPMENT_TYPES.find(e => e.value === equipment);
  return equipmentType?.color || '#95A5A6';
};

export const getMuscleGroupByValue = (value: string) => {
  return MUSCLE_GROUPS.find(m => m.value.toLowerCase() === value.toLowerCase());
};

export const getEquipmentByValue = (value: string) => {
  return EQUIPMENT_TYPES.find(e => e.value.toLowerCase() === value.toLowerCase());
};
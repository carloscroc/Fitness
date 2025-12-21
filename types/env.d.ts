/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: string
  readonly VITE_ERROR_ENDPOINT?: string
  readonly VITE_FF_ENABLE_ENHANCED_EXERCISE_LIBRARY?: string
  readonly VITE_FF_ENABLE_PERCENTAGE_ROLLOUT?: string
  readonly VITE_FF_ENABLE_PROGRESS_TRACKING?: string
  readonly VITE_FF_ENABLE_ADVANCED_FILTERING?: string
  readonly VITE_FF_ENABLE_PERSONALIZED_WORKOUTS?: string
  readonly VITE_FF_ENABLE_SOCIAL_FEATURES?: string
  readonly VITE_FF_ENABLE_PREMIUM_CONTENT?: string
  readonly VITE_FF_ENABLE_DARK_MODE?: string
  readonly VITE_FF_ENABLE_OFFLINE_MODE?: string
  readonly VITE_FF_ENABLE_VOICE_COMMANDS?: string
  readonly VITE_FF_ENABLE_AI_COACH?: string
  readonly VITE_FF_ENABLE_WORKOUT_SCHEDULES?: string
  readonly VITE_FF_ENABLE_NUTRITION_TRACKING?: string
  readonly VITE_FF_ENABLE_HABIT_TRACKING?: string
  readonly VITE_FF_ENABLE_GOAL_TRACKING?: string
  readonly VITE_FF_ENABLE_ACHIEVEMENTS?: string
  readonly VITE_FF_ENABLE_CHALLENGES?: string
  readonly VITE_FF_ENABLE_LEADERBOARD?: string
  readonly VITE_FF_ENABLE_TEAM_FEATURES?: string
  readonly VITE_FF_ENABLE_ENHANCED_UI_COMPONENTS?: string
  readonly VITE_FF_ENABLE_FLEXIBILITY_EXERCISES?: string
  readonly VITE_FF_ENABLE_BALANCE_EXERCISES?: string
  readonly VITE_FF_ENABLE_MEDICINE_BALL_EXERCISES?: string
  readonly VITE_FF_ENABLE_STABILITY_BALL_EXERCISES?: string
  readonly VITE_FF_ENABLE_ADVANCED_CARDIO_EXERCISES?: string
  readonly VITE_FF_ENABLE_POWER_METRICS?: string
  readonly VITE_FF_ENABLE_BALANCE_REQUIREMENTS?: string
  readonly VITE_FF_ENABLE_FLEXIBILITY_TYPES?: string
  readonly VITE_FF_ENABLE_EXERCISE_CARD_INDICATORS?: string
  readonly VITE_FF_ENABLE_FILTER_PANEL_ENHANCEMENTS?: string
  readonly VITE_FF_ENABLE_FLEXIBILITY_PROGRESSION?: string
  readonly VITE_FF_ENABLE_POWER_METRICS_DASHBOARD?: string
  readonly VITE_FF_ENHANCED_LIBRARY_ROLLOUT_PERCENTAGE?: string
  readonly VITE_EXERCISE_LIBRARY_PHASE?: string
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  gtag?: (event: string, action: string, params?: Record<string, any>) => void;
}
-- 0006_create_activity_types.sql
BEGIN;

-- Create activity type enum for user activities
CREATE TYPE activity_type_enum AS ENUM (
  'EXERCISE_COMPLETED',
  'WORKOUT_COMPLETED',
  'MEAL_LOGGED',
  'GOAL_ACHIEVED',
  'PERSONAL_RECORD',
  'STREAK_MAINTAINED'
);

COMMIT;
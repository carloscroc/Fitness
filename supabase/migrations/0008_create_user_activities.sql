-- 0008_create_user_activities.sql
BEGIN;

-- Create user activity logs table
CREATE TABLE user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  activity_type activity_type_enum not null,
  exercise_id uuid references exercises(id) ON DELETE SET NULL,
  meal_id text, -- Future meal tracking
  workout_session_id uuid references workout_sessions(id) ON DELETE SET NULL,
  duration_minutes integer,
  calories_burned integer,
  sets_completed integer,
  reps_completed integer,
  weight_used text, -- JSON for multiple exercises
  notes text,
  activity_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create performance indexes
CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, activity_date DESC);
CREATE INDEX idx_user_activities_type_date ON user_activities(activity_type, activity_date DESC);
CREATE INDEX idx_user_activities_exercise ON user_activities(exercise_id) WHERE exercise_id IS NOT NULL;
CREATE INDEX idx_user_activities_session ON user_activities(workout_session_id) WHERE workout_session_id IS NOT NULL;

-- Add comment to clarify user_id field (will be updated when auth is implemented)
COMMENT ON COLUMN user_activities.user_id IS 'TODO: Update to reference auth.users(id) when authentication is implemented';
COMMENT ON COLUMN workout_sessions.user_id IS 'TODO: Update to reference auth.users(id) when authentication is implemented';

COMMIT;
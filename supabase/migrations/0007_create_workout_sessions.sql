-- 0007_create_workout_sessions.sql
BEGIN;

-- Create workout sessions table (for grouping exercises)
CREATE TABLE workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_duration_minutes integer,
  total_calories integer,
  exercises_count integer default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create performance indexes
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, started_at DESC);
CREATE INDEX idx_workout_sessions_user_active ON workout_sessions(user_id, ended_at) WHERE ended_at IS NULL;

COMMIT;
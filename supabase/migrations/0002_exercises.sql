-- 0002_exercises.sql
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  library_id text unique,
  name text not null,
  category text,
  primary_muscle text,
  secondary_muscles text[] default ARRAY[]::text[],
  equipment text[] default ARRAY[]::text[],
  overview text,
  instructions jsonb default '[]'::jsonb,
  benefits text[] default ARRAY[]::text[],
  video_url text,
  image_url text,
  difficulty text,
  bpm integer,
  calories integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full-text index will be created in a later migration after ensuring `overview` exists.
create index if not exists idx_exercises_name_trgm on exercises using gin (name gin_trgm_ops);

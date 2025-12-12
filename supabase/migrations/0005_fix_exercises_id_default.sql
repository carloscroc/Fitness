BEGIN;

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set a safe default for `id` (text) and backfill NULL ids
ALTER TABLE public.exercises ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
UPDATE public.exercises SET id = gen_random_uuid()::text WHERE id IS NULL;

-- Recreate primary key on id (drop if exists then add)
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_pkey;
ALTER TABLE public.exercises ADD PRIMARY KEY (id);

COMMIT;

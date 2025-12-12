BEGIN;

-- Add remaining columns expected by the seeder
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS primary_muscle text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS secondary_muscles text[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS equipment text[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS bpm integer;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS calories integer;

-- If the table still uses older 'muscles' column, keep it but do not modify it here.

COMMIT;

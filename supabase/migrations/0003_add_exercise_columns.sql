BEGIN;

-- Add columns expected by the seed scripts
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS library_id text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS overview text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS instructions jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill sensible defaults from existing columns where possible
UPDATE public.exercises SET library_id = id WHERE library_id IS NULL AND id IS NOT NULL;
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name='exercises' AND column_name='description'
	) THEN
		UPDATE public.exercises SET overview = description WHERE overview IS NULL AND description IS NOT NULL;
	END IF;
END
$$ LANGUAGE plpgsql;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_library_id ON public.exercises(library_id);

COMMIT;

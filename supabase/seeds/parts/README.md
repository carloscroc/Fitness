Split SQL seed parts

This folder contains smaller SQL files generated from insert_exercises.sql to allow running in the Supabase SQL editor or via sequential psql runs.

Usage:
- Use `psql $DATABASE_URL -f part-000.sql` sequentially for each part.

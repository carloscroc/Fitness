# SQL seed instructions

This folder holds generated SQL seeds for direct `psql` execution against your Supabase Postgres instance (bypasses PostgREST schema cache).

Usage:

1. Generate `insert_exercises.sql` from the local exercises JSON:

```bash
node scripts/generate_sql_seed.js
```

2. Run the generated SQL against your database (you need a `DATABASE_URL`):

```bash
export DATABASE_URL="postgres://<user>:<pass>@<host>:<port>/<db>"
psql "$DATABASE_URL" -f supabase/seeds/insert_exercises.sql
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL = 'postgres://<user>:<pass>@<host>:<port>/<db>'
psql $env:DATABASE_URL -f supabase/seeds/insert_exercises.sql
```

Notes:
- The generator produces idempotent `INSERT ... ON CONFLICT` statements keyed on `library_id`.
- Do not commit credentials. Set `DATABASE_URL` in your environment or CI secrets.

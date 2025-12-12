Seeding instructions

1. Locally run migrations and seed (recommended):

PowerShell:
```powershell
$env:DATABASE_URL='postgres://<user>:<pass>@<host>:5432/<db>'
.\scripts\run_migrations_then_seed_with_fallback.ps1
```

2. GitHub Actions (CI):
- Add `DATABASE_URL` as a repository secret.
- Trigger the `Migrations and Seed` workflow (Actions → Migrations and Seed → Run workflow) or push to `main`.

Notes:
- The workflow applies SQL migrations from `supabase/migrations` and then applies generated SQL seed parts in `supabase/seeds/parts`.
- If you prefer REST-based seeding, run `node scripts/seed_exercises.js` locally with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

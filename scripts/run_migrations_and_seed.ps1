param()

# run_migrations_and_seed.ps1
# Applies SQL migration files (in lexical order) using psql and then runs the Node seeder.

Set-StrictMode -Version Latest

function Abort([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not $env:DATABASE_URL) {
    Abort "DATABASE_URL is not set. Get the Postgres connection URI from Supabase Dashboard → Settings → Database → Connection string. Example: postgres://user:pass@host:5432/db"
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Abort "psql was not found in PATH. Install PostgreSQL client or add psql to PATH and retry."
}

$migrationsPath = Join-Path $PSScriptRoot '..\supabase\migrations'
if (-not (Test-Path $migrationsPath)) {
    Abort "Migrations folder not found at $migrationsPath"
}

Write-Host "Applying migrations from: $migrationsPath"

$files = Get-ChildItem -Path $migrationsPath -Filter '*.sql' | Sort-Object Name
if ($files.Count -eq 0) {
    Write-Host "No migration files found. Skipping migrations."
} else {
    foreach ($f in $files) {
        Write-Host "Applying $($f.Name) ..."
        $exit = & psql $env:DATABASE_URL -f $f.FullName
        if ($LASTEXITCODE -ne 0) {
            Abort "psql failed applying $($f.Name). See psql output above."
        }
    }
    Write-Host "Migrations applied successfully."
}

# Wait briefly for any hosted schema caches (if using Supabase hosted)
Write-Host "Waiting 5 seconds for schema to settle..."
Start-Sleep -Seconds 5

# Run the Node seeder
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Abort "Node.js is not installed or not on PATH." }

Write-Host "Running Node seeder: scripts/seed_exercises.js"
& node (Join-Path $PSScriptRoot 'seed_exercises.js')
if ($LASTEXITCODE -ne 0) { Abort "Node seeder failed (exit code $LASTEXITCODE)" }

Write-Host "Migrations + seed complete. Verify the `exercises` table in your database." 

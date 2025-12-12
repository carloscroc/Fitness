param()

# run_migrations_only.ps1
# Applies SQL migration files (in lexical order) using psql.

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
    Write-Host "No migration files found. Nothing to do."
    exit 0
}

foreach ($f in $files) {
    Write-Host "Applying $($f.Name) ..."
    & psql $env:DATABASE_URL -f $f.FullName
    if ($LASTEXITCODE -ne 0) {
        Abort "psql failed applying $($f.Name). See psql output above."
    }
}

Write-Host "Migrations applied successfully."

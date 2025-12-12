param()

# run_sql_parts.ps1
# Applies SQL files under supabase/seeds/parts in lexical order using psql and the env var DATABASE_URL.

Set-StrictMode -Version Latest

function Abort([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not $env:DATABASE_URL) {
    Abort "DATABASE_URL is not set. Export the Postgres connection string from Supabase Dashboard → Settings → Database → Connection string. Example: postgres://user:pass@host:5432/db"
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Abort "psql was not found in PATH. Install PostgreSQL client or add psql to PATH and retry."
}

$partsDir = Join-Path $PSScriptRoot '..\supabase\seeds\parts'
if (-not (Test-Path $partsDir)) {
    Abort "Parts directory not found: $partsDir. Generate parts with: node scripts/split_sql_seed.js"
}

$files = Get-ChildItem -Path $partsDir -Filter '*.sql' | Sort-Object Name
if ($files.Count -eq 0) { Abort "No .sql part files found in $partsDir" }

Write-Host "Applying $($files.Count) SQL part files to DB..."

foreach ($f in $files) {
    Write-Host "Applying $($f.Name) ..."
    & psql $env:DATABASE_URL -f $f.FullName
    if ($LASTEXITCODE -ne 0) {
        Abort "psql failed applying $($f.Name). See psql output above."
    }
}

Write-Host "All parts applied successfully."

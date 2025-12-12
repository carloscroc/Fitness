param()

# Applies migrations, tries the Node REST seeder, and on REST/schema-cache failure
# falls back to applying the generated SQL parts via psql.

Set-StrictMode -Version Latest

function Abort([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { Abort "psql not found in PATH." }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Abort "node not found in PATH." }

if (-not $env:DATABASE_URL) {
    Write-Warning "DATABASE_URL not set. Migrations will still run if Supabase CLI is configured, but psql calls require DATABASE_URL."
}

Write-Host "1) Applying migrations..."
& $PSScriptRoot\run_migrations_only.ps1
if ($LASTEXITCODE -ne 0) { Abort "Migrations failed. See output above." }

Write-Host "Waiting 20 seconds for schema caches to settle..."
Start-Sleep -Seconds 20

Write-Host "2) Attempting Node REST seeder (scripts/seed_exercises.js)"
$seederOutput = & node (Join-Path $PSScriptRoot '..\scripts\seed_exercises.js') 2>&1
$seederExit = $LASTEXITCODE
Write-Host $seederOutput

if ($seederExit -eq 0) {
    Write-Host "Seeder succeeded via REST. Done."
    exit 0
}

Write-Warning "Seeder failed (exit code $seederExit). Inspecting output for schema-cache or PGRST errors..."

$outStr = $seederOutput -join "`n"
if ($outStr -match 'PGRST204' -or $outStr -match "schema cache" -or $outStr -match "Could not find the '.*' column") {
    Write-Host "Detected PostgREST schema-cache issue; falling back to SQL parts."
} else {
    Write-Host "Seeder failed for other reason; will still attempt SQL parts fallback to ensure DB is populated."
}

Write-Host "3) Generating SQL parts (if not present)"
& node (Join-Path $PSScriptRoot '..\scripts\split_sql_seed.js')

Write-Host "4) Applying SQL part files via psql"
if (-not $env:DATABASE_URL) { Abort "DATABASE_URL is required to apply SQL parts via psql. Set it and re-run this script." }

$partsDir = Join-Path $PSScriptRoot '..\supabase\seeds\parts'
if (-not (Test-Path $partsDir)) { Abort "Parts directory not found: $partsDir" }

$files = Get-ChildItem -Path $partsDir -Filter '*.sql' | Sort-Object Name
foreach ($f in $files) {
    Write-Host "Applying part: $($f.Name)"
    & psql $env:DATABASE_URL -f $f.FullName
    if ($LASTEXITCODE -ne 0) { Abort "psql failed on $($f.Name)." }
}

Write-Host "All SQL parts applied. Verify table contents with psql or re-run the REST seeder if desired."
exit 0

param(
  [string]$Sub2ApiRoot = 'D:\midstation-relay-analysis\worktrees\A\sub2api',
  [string]$AdminEmail = $env:MEXION_ADMIN_EMAIL,
  [string]$AdminPassword = $env:MEXION_ADMIN_PASSWORD,
  [string]$DatabasePassword = $env:SUB2API_DB_PASSWORD,
  [string]$LocalSettingsPath,
  [int]$WebPort = 5515,
  [int]$ApiPort = 8080,
  [int]$PostgresPort = 5432,
  [int]$RedisPort = 6379,
  [switch]$NoWeb
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$RuntimeRoot = Join-Path $RepoRoot '.runtime'
$LogRoot = Join-Path $RepoRoot 'logs'
$PgRoot = Join-Path $RuntimeRoot 'postgres\pgsql'
$PgData = Join-Path $RuntimeRoot 'pgdata'
$RedisRoot = Join-Path $RuntimeRoot 'redis'
$DatabaseName = 'sub2api'
$DatabaseUser = 'postgres'

if ([string]::IsNullOrWhiteSpace($LocalSettingsPath)) {
  $LocalSettingsPath = Join-Path $RuntimeRoot 'local-runtime.settings.json'
}

if (Test-Path -LiteralPath $LocalSettingsPath) {
  try {
    $localSettings = Get-Content -LiteralPath $LocalSettingsPath -Raw | ConvertFrom-Json
  } catch {
    throw "Failed to read local runtime settings at ${LocalSettingsPath}: $($_.Exception.Message)"
  }

  if ([string]::IsNullOrWhiteSpace($AdminEmail)) { $AdminEmail = [string]$localSettings.admin_email }
  if ([string]::IsNullOrWhiteSpace($AdminPassword)) { $AdminPassword = [string]$localSettings.admin_password }
  if ([string]::IsNullOrWhiteSpace($DatabasePassword)) { $DatabasePassword = [string]$localSettings.database_password }
}

$missingSettings = @(
  if ([string]::IsNullOrWhiteSpace($AdminEmail)) { 'MEXION_ADMIN_EMAIL / admin_email' }
  if ([string]::IsNullOrWhiteSpace($AdminPassword)) { 'MEXION_ADMIN_PASSWORD / admin_password' }
  if ([string]::IsNullOrWhiteSpace($DatabasePassword)) { 'SUB2API_DB_PASSWORD / database_password' }
)
if ($missingSettings.Count -gt 0) {
  throw "Missing local runtime settings: $($missingSettings -join ', '). Supply parameters/environment variables or create the gitignored file ${LocalSettingsPath}."
}

New-Item -ItemType Directory -Force -Path $RuntimeRoot, $LogRoot | Out-Null

function Test-PortListening([int]$PortNumber) {
  # A wildcard listener (0.0.0.0 / ::) is also reachable through 127.0.0.1.
  # Requiring LocalAddress=127.0.0.1 misdetects Windows services such as Redis
  # and causes a second process to fail while binding the already-used port.
  return [bool](Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port([int]$PortNumber, [string]$Name, [int]$Seconds = 30) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListening $PortNumber) { return }
    Start-Sleep -Milliseconds 500
  }
  throw "$Name did not start on 127.0.0.1:$PortNumber within $Seconds seconds"
}

function Start-HiddenProcess([string]$FilePath, [string[]]$ArgumentList, [string]$WorkingDirectory, [string]$OutLog, [string]$ErrLog) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutLog), (Split-Path -Parent $ErrLog) | Out-Null
  return Start-Process -FilePath $FilePath `
    -ArgumentList $ArgumentList `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru
}

function Start-Postgres {
  if (Test-PortListening $PostgresPort) {
    Write-Host "PostgreSQL already listening on 127.0.0.1:$PostgresPort"
    return
  }

  $pgCtl = Join-Path $PgRoot 'bin\pg_ctl.exe'
  $initDb = Join-Path $PgRoot 'bin\initdb.exe'
  if (!(Test-Path $pgCtl)) {
    throw "Portable PostgreSQL was not found at $PgRoot. Keep it under .runtime\postgres\pgsql or start PostgreSQL manually."
  }

  if (!(Test-Path (Join-Path $PgData 'PG_VERSION'))) {
    New-Item -ItemType Directory -Force -Path $PgData | Out-Null
    $pwFile = Join-Path $RuntimeRoot 'pgpass.tmp'
    Set-Content -LiteralPath $pwFile -Value $DatabasePassword -NoNewline -Encoding ASCII
    try {
      & $initDb -D $PgData -U $DatabaseUser --pwfile=$pwFile -A scram-sha-256 -E UTF8 | Write-Host
    } finally {
      Remove-Item -LiteralPath $pwFile -Force -ErrorAction SilentlyContinue
    }
  }

  $pgLog = Join-Path $LogRoot 'postgres.log'
  & $pgCtl -D $PgData -o "-p $PostgresPort -h 127.0.0.1" -l $pgLog start | Write-Host
  Wait-Port $PostgresPort 'PostgreSQL'
}

function Ensure-Database {
  $psql = Join-Path $PgRoot 'bin\psql.exe'
  $createdb = Join-Path $PgRoot 'bin\createdb.exe'
  if (!(Test-Path $psql)) { throw "psql.exe not found under $PgRoot" }
  $env:PGPASSWORD = $DatabasePassword
  $exists = (& $psql -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser -d postgres -tAc "select 1 from pg_database where datname='$DatabaseName'").Trim()
  if ($exists -ne '1') {
    & $createdb -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser $DatabaseName | Write-Host
  }
}

function Start-Redis {
  if (Test-PortListening $RedisPort) {
    Write-Host "Redis already listening on 127.0.0.1:$RedisPort"
    return
  }

  $redis = Join-Path $RedisRoot 'redis-server.exe'
  if (!(Test-Path $redis)) {
    throw "Portable Redis was not found at $redis. Keep it under .runtime\redis or start Redis manually."
  }

  Start-HiddenProcess `
    -FilePath $redis `
    -ArgumentList @('--bind', '127.0.0.1', '--port', [string]$RedisPort, '--dir', $RedisRoot) `
    -WorkingDirectory $RedisRoot `
    -OutLog (Join-Path $LogRoot 'redis.log') `
    -ErrLog (Join-Path $LogRoot 'redis.err.log') | Out-Null
  Wait-Port $RedisPort 'Redis'
}

function New-BcryptHash([string]$Password) {
  $backend = Join-Path $Sub2ApiRoot 'backend'
  $tmp = Join-Path $backend ("mexion_hash_tmp_{0}.go" -f ([guid]::NewGuid().ToString('N')))
  @'
package main

import (
  "fmt"
  "os"

  "golang.org/x/crypto/bcrypt"
)

func main() {
  password := os.Getenv("MEXION_BOOTSTRAP_PASSWORD")
  if password == "" { panic("MEXION_BOOTSTRAP_PASSWORD is empty") }
  hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
  if err != nil { panic(err) }
  fmt.Print(string(hash))
}
'@ | Set-Content -LiteralPath $tmp -Encoding UTF8

  $hadPreviousPassword = Test-Path Env:MEXION_BOOTSTRAP_PASSWORD
  $previousPassword = $env:MEXION_BOOTSTRAP_PASSWORD
  $env:MEXION_BOOTSTRAP_PASSWORD = $Password
  try {
    Push-Location $backend
    try {
      $hash = (& go run $tmp)
      if ($LASTEXITCODE -ne 0 -or !$hash) { throw 'failed to generate bcrypt hash with go run' }
      return ($hash | Out-String).Trim()
    } finally {
      Pop-Location
    }
  } finally {
    if ($hadPreviousPassword) {
      $env:MEXION_BOOTSTRAP_PASSWORD = $previousPassword
    } else {
      Remove-Item Env:MEXION_BOOTSTRAP_PASSWORD -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-AdminUser {
  $psql = Join-Path $PgRoot 'bin\psql.exe'
  $backend = Join-Path $Sub2ApiRoot 'backend'
  if (!(Test-Path $backend)) { throw "sub2api backend not found: $backend" }
  if (!(Get-Command go -ErrorAction SilentlyContinue)) { throw 'go.exe is required to generate the local admin password hash.' }

  $hash = New-BcryptHash $AdminPassword
  $emailSql = $AdminEmail.Replace("'", "''")
  $hashSql = $hash.Replace("'", "''")
  $usernameSql = ($AdminEmail.Split('@')[0]).Replace("'", "''")
  $env:PGPASSWORD = $DatabasePassword
  $sql = @"
insert into users (email, password_hash, role, balance, concurrency, status, username, notes, created_at, updated_at)
values ('$emailSql', '$hashSql', 'admin', 1000000, 50, 'active', '$usernameSql', 'Local bootstrap administrator', now(), now())
on conflict do nothing;

update users
set password_hash = '$hashSql',
    role = 'admin',
    status = 'active',
    username = case when username is null or username = '' then '$usernameSql' else username end,
    updated_at = now()
where email = '$emailSql' and deleted_at is null;

-- This local bootstrap intentionally maintains one effective administrator.
update users
set role = 'user',
    status = 'disabled',
    updated_at = now()
where email <> '$emailSql'
  and role = 'admin'
  and deleted_at is null;
"@
  & $psql -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser -d $DatabaseName -v ON_ERROR_STOP=1 -c $sql | Write-Host
}

function Assert-SingleAdmin {
  $psql = Join-Path $PgRoot 'bin\psql.exe'
  $emailSql = $AdminEmail.Replace("'", "''")
  $env:PGPASSWORD = $DatabasePassword
  $sql = @"
select
  count(*) filter (where role = 'admin' and deleted_at is null),
  count(*) filter (where role = 'admin' and status = 'active' and deleted_at is null),
  count(*) filter (where email = '$emailSql' and role = 'admin' and status = 'active' and deleted_at is null)
from users;
"@
  $state = ((& $psql -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser -d $DatabaseName -v ON_ERROR_STOP=1 -tAc $sql) | Out-String).Trim()
  if ($LASTEXITCODE -ne 0 -or $state -ne '1|1|1') {
    throw "Local administrator invariant failed (expected exactly one active admin matching $AdminEmail)."
  }
}

function Ensure-AdminCompliance {
  $psql = Join-Path $PgRoot 'bin\psql.exe'
  $emailSql = $AdminEmail.Replace("'", "''")
  $env:PGPASSWORD = $DatabasePassword
  $sql = @"
with admin_user as (
  select id
  from users
  where email = '$emailSql' and role = 'admin' and deleted_at is null
  order by id
  limit 1
),
ack as (
  select
    'admin_compliance_acknowledgement:' || id::text as key,
    jsonb_build_object(
      'version', 'v2026.06.10',
      'document_zh', 'docs/legal/admin-compliance.zh.md',
      'document_en', 'docs/legal/admin-compliance.en.md',
      'admin_user_id', id,
      'ip_address', '127.0.0.1',
      'user_agent', 'Mexion local runtime bootstrap',
      'accepted_at', now()
    )::text as value
  from admin_user
)
insert into settings (key, value, updated_at)
select key, value, now() from ack
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;
"@
  & $psql -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser -d $DatabaseName -v ON_ERROR_STOP=1 -c $sql | Write-Host
}

function Start-Sub2Api {
  if (Test-PortListening $ApiPort) {
    Write-Host "sub2api already listening on 127.0.0.1:$ApiPort"
    return
  }

  $backend = Join-Path $Sub2ApiRoot 'backend'
  if (!(Test-Path $backend)) { throw "sub2api backend not found: $backend" }
  if (!(Get-Command go -ErrorAction SilentlyContinue)) { throw 'go.exe was not found in PATH.' }

  $command = "Set-Location -LiteralPath '$backend'; go run ./cmd/server"
  Start-HiddenProcess `
    -FilePath 'powershell.exe' `
    -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $command) `
    -WorkingDirectory $backend `
    -OutLog (Join-Path $LogRoot 'sub2api.log') `
    -ErrLog (Join-Path $LogRoot 'sub2api.err.log') | Out-Null
  Wait-Port $ApiPort 'sub2api' 60
}

function Start-Web {
  if ($NoWeb) { return }
  if (Test-PortListening $WebPort) {
    Write-Host "Mexion web already listening on 127.0.0.1:$WebPort"
    return
  }
  if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm was not found in PATH.' }

  # The all-in-one launcher uses normal authenticated mode by default.
  # Local auto-login remains an explicit opt-in through start-mexion-vue-preview.ps1.
  $escapedRepoRoot = $RepoRoot.Replace("'", "''")
  $escapedBackendUrl = "http://127.0.0.1:$ApiPort".Replace("'", "''")
  $command = "Set-Location -LiteralPath '$escapedRepoRoot'; " +
    "Remove-Item Env:VITE_MEXION_LOCAL_PREVIEW -ErrorAction SilentlyContinue; " +
    "Remove-Item Env:MEXION_PREVIEW_ADMIN_EMAIL -ErrorAction SilentlyContinue; " +
    "Remove-Item Env:MEXION_PREVIEW_ADMIN_PASSWORD -ErrorAction SilentlyContinue; " +
    "`$env:NODE_OPTIONS='--max-old-space-size=1024'; " +
    "`$env:SUB2API_BACKEND_URL='$escapedBackendUrl'; " +
    "pnpm --dir '$escapedRepoRoot\apps\web' exec vite --host 127.0.0.1 --port $WebPort"
  Start-HiddenProcess `
    -FilePath 'powershell.exe' `
    -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $command) `
    -WorkingDirectory $RepoRoot `
    -OutLog (Join-Path $LogRoot 'web-dev.log') `
    -ErrLog (Join-Path $LogRoot 'web-dev.err.log') | Out-Null
  Wait-Port $WebPort 'Mexion web' 45
}

Start-Postgres
Ensure-Database
Start-Redis
Ensure-AdminUser
Assert-SingleAdmin
Ensure-AdminCompliance
Start-Sub2Api
Start-Web

Write-Host ''
Write-Host "Mexion 首页:     http://127.0.0.1:$WebPort/"
Write-Host "Mexion 登录入口: http://127.0.0.1:$WebPort/login"
Write-Host "sub2api API:     http://127.0.0.1:$ApiPort"
Write-Host "Admin account:   $AdminEmail"

param(
  [string]$Sub2ApiRoot = 'D:\midstation-relay-analysis\worktrees\A\sub2api',
  [string]$AdminEmail = 'admin@example.com',
  [string]$AdminPassword = 'admin123',
  [int]$WebPort = 5173,
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
$DatabasePassword = 'sub2api_dev'

New-Item -ItemType Directory -Force -Path $RuntimeRoot, $LogRoot | Out-Null

function Test-PortListening([int]$PortNumber) {
  return [bool](Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue)
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
  $tmp = Join-Path $backend 'mexion_hash_tmp.go'
  $escaped = $Password.Replace('\', '\\').Replace('"', '\"')
  @"
package main

import (
  "fmt"
  "golang.org/x/crypto/bcrypt"
)

func main() {
  hash, err := bcrypt.GenerateFromPassword([]byte("$escaped"), bcrypt.DefaultCost)
  if err != nil { panic(err) }
  fmt.Print(string(hash))
}
"@ | Set-Content -LiteralPath $tmp -Encoding UTF8
  try {
    Push-Location $backend
    try {
      $hash = (& go run .\mexion_hash_tmp.go)
      if ($LASTEXITCODE -ne 0 -or !$hash) { throw 'failed to generate bcrypt hash with go run' }
      return ($hash | Out-String).Trim()
    } finally {
      Pop-Location
    }
  } finally {
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
"@
  & $psql -h 127.0.0.1 -p $PostgresPort -U $DatabaseUser -d $DatabaseName -v ON_ERROR_STOP=1 -c $sql | Write-Host
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

  $command = "Set-Location -LiteralPath '$RepoRoot'; pnpm --filter @mexion/web dev"
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
Ensure-AdminCompliance
Start-Sub2Api
Start-Web

Write-Host ''
Write-Host "Mexion web:  http://127.0.0.1:$WebPort"
Write-Host "sub2api API: http://127.0.0.1:$ApiPort"
Write-Host "Admin:       $AdminEmail / $AdminPassword"

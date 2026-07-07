param(
  [string]$Sub2ApiRoot = 'D:\midstation-relay-analysis\worktrees\A\sub2api',
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

function Test-PortListening([int]$PortNumber) {
  return [bool](Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue)
}

if (Test-PortListening $Port) {
  Write-Host "sub2api already listening on :$Port"
  exit 0
}

$backend = Join-Path $Sub2ApiRoot 'backend'
if (!(Test-Path $backend)) {
  throw "sub2api backend not found: $backend"
}

$go = Get-Command go -ErrorAction SilentlyContinue
if (!$go) {
  throw 'Go is required to run sub2api backend, but go.exe was not found in PATH.'
}

if (!(Test-PortListening 5432)) {
  Write-Warning 'PostgreSQL :5432 is not listening. sub2api requires PostgreSQL; start it before this command can complete.'
}
if (!(Test-PortListening 6379)) {
  Write-Warning 'Redis :6379 is not listening. sub2api requires Redis; start it before this command can complete.'
}

$config = Join-Path $backend 'config.yaml'
$example = Join-Path $Sub2ApiRoot 'deploy\config.example.yaml'
if (!(Test-Path $config) -and (Test-Path $example)) {
  Copy-Item -LiteralPath $example -Destination $config
  Write-Host "Created $config from deploy example. Edit database/redis credentials if needed."
}

Push-Location $backend
try {
  Write-Host "Starting sub2api backend from $backend on :$Port"
  go run ./cmd/server
} finally {
  Pop-Location
}

param(
  [string]$Sub2ApiRoot = 'D:\midstation-relay-analysis\worktrees\A\sub2api',
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$launcher = Join-Path $PSScriptRoot 'start-local-runtime.ps1'
if (!(Test-Path -LiteralPath $launcher)) { throw "Runtime launcher not found: $launcher" }

& $launcher -Sub2ApiRoot $Sub2ApiRoot -ApiPort $Port -NoWeb

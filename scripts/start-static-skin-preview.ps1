param(
  [string]$StaticRoot = 'D:\Mexion\apps\web-static-backup-20260707-2030\dist',
  [int]$Port = 5602,
  [string]$HostAddress = '127.0.0.1',
  [ValidateSet('preview', 'hybrid', 'reference')]
  [string]$Mode = 'preview',
  [switch]$Restart
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ServerScript = Join-Path $PSScriptRoot 'serve-static-reference.mjs'
$LogRoot = Join-Path $RepoRoot 'logs'
$OutLog = Join-Path $LogRoot "static-skin-$Mode-$Port.log"
$ErrLog = Join-Path $LogRoot "static-skin-$Mode-$Port.err.log"

function Get-ListeningOwner([int]$PortNumber) {
  return Get-NetTCPConnection -State Listen -LocalPort $PortNumber -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Select-Object -First 1
}

function Test-StaticServer([int]$PortNumber, [string]$ExpectedMode) {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$PortNumber/dashboard/" -UseBasicParsing -TimeoutSec 3
    $actualMode = [string]$response.Headers['X-Mexion-Static-Mode']
    $previewHeader = [string]$response.Headers['X-Mexion-Static-Preview']
    if ($actualMode -ne $ExpectedMode) { return $false }
    if ($ExpectedMode -eq 'reference') { return $previewHeader -ne '1' }
    return $previewHeader -eq '1'
  } catch {
    return $false
  }
}

function Wait-StaticServer([int]$PortNumber, [string]$ExpectedMode, [int]$Seconds = 20) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-StaticServer $PortNumber $ExpectedMode) { return }
    Start-Sleep -Milliseconds 300
  }
  throw "Static server did not start in '$ExpectedMode' mode at http://127.0.0.1:$PortNumber/dashboard/. See $ErrLog"
}

if (!(Test-Path -LiteralPath $StaticRoot)) { throw "Static skin directory does not exist: $StaticRoot" }
if (!(Test-Path -LiteralPath $ServerScript)) { throw "Static server script does not exist: $ServerScript" }

$owner = Get-ListeningOwner $Port
if ($owner) {
  if ((Test-StaticServer $Port $Mode) -and !$Restart) {
    Write-Host "Static skin server is already running ($Mode): http://127.0.0.1:$Port/"
    exit 0
  }

  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$owner" -ErrorAction SilentlyContinue
  if (!$Restart) {
    throw "Port $Port is occupied by PID $owner and is not a confirmed '$Mode' static server. Use -Restart only for this project's static server."
  }
  if (!$process -or $process.CommandLine -notlike "*$ServerScript*") {
    throw "Port $Port is occupied by non-project process PID $owner; refusing to terminate it."
  }
  Stop-Process -Id $owner -Force
  $deadline = (Get-Date).AddSeconds(8)
  while ((Get-Date) -lt $deadline -and (Get-ListeningOwner $Port)) { Start-Sleep -Milliseconds 200 }
  if (Get-ListeningOwner $Port) { throw "Port $Port was not released after stopping PID $owner." }
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (!$node) { $node = Get-Command node -ErrorAction Stop }
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
Start-Process -FilePath $node.Source `
  -ArgumentList @($ServerScript, $StaticRoot, [string]$Port, $HostAddress, "--mode=$Mode") `
  -WorkingDirectory $RepoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog `
  -RedirectStandardError $ErrLog | Out-Null

Wait-StaticServer $Port $Mode
Write-Host "Static skin server started ($Mode): http://127.0.0.1:$Port/"
if ($Mode -eq 'hybrid') {
  Write-Host "Public/auth visual reference: http://127.0.0.1:$Port/sign-in/"
  Write-Host "No-login application preview: http://127.0.0.1:$Port/dashboard/"
} elseif ($Mode -eq 'preview') {
  Write-Host "Auto-login dashboard: http://127.0.0.1:$Port/dashboard/"
  Write-Host "Auto-login admin: http://127.0.0.1:$Port/admin/dashboard/"
}

param(
  [int]$Port = 5515,
  [int]$ApiPort = 8080,
  [string]$AdminEmail = $env:MEXION_ADMIN_EMAIL,
  [string]$AdminPassword = $env:MEXION_ADMIN_PASSWORD,
  [string]$LocalSettingsPath
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$WebRoot = Join-Path $RepoRoot 'apps\web'
$LogRoot = Join-Path $RepoRoot 'logs'
$RuntimeRoot = Join-Path $RepoRoot '.runtime'
$SecurityHelpers = Join-Path $PSScriptRoot 'lib\local-runtime-security.ps1'
if (!(Test-Path -LiteralPath $SecurityHelpers)) { throw "Security helpers not found: $SecurityHelpers" }
. $SecurityHelpers

if ([string]::IsNullOrWhiteSpace($LocalSettingsPath)) {
  $LocalSettingsPath = Join-Path $RuntimeRoot 'local-runtime.settings.json'
}
$resolvedSettings = Get-MexionLocalRuntimeSettings `
  -Path $LocalSettingsPath `
  -AdminEmail $AdminEmail `
  -AdminPassword $AdminPassword `
  -RequireAdmin
$AdminEmail = $resolvedSettings.AdminEmail
$AdminPassword = $resolvedSettings.AdminPassword
foreach ($name in @('MEXION_ADMIN_EMAIL', 'MEXION_ADMIN_PASSWORD', 'SUB2API_DB_PASSWORD')) {
  [Environment]::SetEnvironmentVariable($name, $null, 'Process')
}
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

# Stop only the existing Vite process owned by this repository and this port.
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
  if ($process -and $process.CommandLine -match [regex]::Escape($WebRoot) -and $process.CommandLine -match 'vite') {
    Stop-Process -Id $listener.OwningProcess -Force
    Start-Sleep -Milliseconds 500
  } else {
    throw "Port $Port is occupied by a process outside $WebRoot; refusing to stop it."
  }
}

if (!(Get-NetTCPConnection -LocalPort $ApiPort -State Listen -ErrorAction SilentlyContinue)) {
  throw "Sub2API backend is not listening on 127.0.0.1:$ApiPort. Start it before the preview launcher."
}
[void](Assert-MexionLoopbackListener -Port $ApiPort -Name 'Sub2API backend')

$stdout = Join-Path $LogRoot 'mexion-vue-preview.out.log'
$stderr = Join-Path $LogRoot 'mexion-vue-preview.err.log'
$vite = Invoke-MexionWithProcessEnvironment -EnvironmentVariables @{
  VITE_MEXION_LOCAL_PREVIEW = 'true'
  MEXION_PREVIEW_ADMIN_EMAIL = $AdminEmail
  MEXION_PREVIEW_ADMIN_PASSWORD = $AdminPassword
  SUB2API_BACKEND_URL = "http://127.0.0.1:$ApiPort"
} -ScriptBlock {
  Start-Process -FilePath 'pnpm.cmd' `
    -ArgumentList @('--dir', $WebRoot, 'exec', 'vite', '--host', '127.0.0.1', '--port', [string]$Port) `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -PassThru
}

$deadline = (Get-Date).AddSeconds(45)
while ((Get-Date) -lt $deadline) {
  if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    [void](Assert-MexionLoopbackListener -Port $Port -Name 'Mexion Vue preview')
    Write-Host "当前 Vue 免登录：http://127.0.0.1:$Port/"
    Write-Host "Vue Public/Auth 调试：http://127.0.0.1:$Port/login?mexion-public=1"
    Write-Host "旧静态免登录：http://127.0.0.1:5602/dashboard/"
    Write-Host "旧静态 Public/Auth：http://127.0.0.1:5603/"
    exit 0
  }
  if ($vite.HasExited) { throw "Vite exited with code $($vite.ExitCode). See $stderr" }
  Start-Sleep -Milliseconds 500
}
throw "Mexion Vue did not start on port $Port within 45 seconds. See $stderr"

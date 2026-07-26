param(
  [switch]$Restart
)

$ErrorActionPreference = 'Stop'
$starter = Join-Path $PSScriptRoot 'start-static-skin-preview.ps1'

$common = @{}
if ($Restart) { $common.Restart = $true }

& $starter -Port 5602 -Mode preview @common
& $starter -Port 5603 -Mode hybrid @common

Write-Host ''
Write-Host 'Mexion static skin workbench is ready:'
Write-Host '  No-login application preview: http://127.0.0.1:5602/dashboard/'
Write-Host '  No-login admin preview:       http://127.0.0.1:5602/admin/dashboard/'
Write-Host '  Public/auth visual reference: http://127.0.0.1:5603/'
Write-Host '  Sign-in visual reference:     http://127.0.0.1:5603/sign-in/'

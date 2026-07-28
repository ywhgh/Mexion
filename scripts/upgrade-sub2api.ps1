[CmdletBinding()]
param(
  [string]$TargetRef,
  [switch]$Apply,
  [switch]$Activate,
  [switch]$SkipDatabaseBackup,
  [string]$Sub2ApiRoot = 'D:\midstation-relay-analysis\worktrees\A\sub2api',
  [string]$LocalSettingsPath,
  [int]$ApiPort = 8080,
  [int]$PostgresPort = 5432
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ManifestPath = Join-Path $RepoRoot 'overlays\sub2api\upstream-baseline.json'
$SecurityPlanPath = Join-Path $RepoRoot 'docs\SECURITY_OPTIMIZATION_PLAN.md'
$OverlayDocumentPath = Join-Path $RepoRoot 'docs\UPSTREAM_UPGRADE_SECURITY_OVERLAY.md'
$SecurityHelperPath = Join-Path $PSScriptRoot 'lib\local-runtime-security.ps1'
$UpdateRoot = Join-Path $RepoRoot '.update'
$BackupRoot = Join-Path $RepoRoot 'backups'
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

if ($Activate -and !$Apply) { throw '-Activate requires -Apply.' }

if (!(Test-Path -LiteralPath $SecurityHelperPath)) {
  throw "Security helper is missing: $SecurityHelperPath"
}
. $SecurityHelperPath

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Content
  )
  [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Get-LowerSha256 {
  param([Parameter(Mandatory)][string]$Path)
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-StringSha256 {
  param([Parameter(Mandatory)][string]$Value)
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Invoke-CheckedNative {
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [string[]]$ArgumentList = @(),
    [string]$WorkingDirectory,
    [string]$Label = $FilePath,
    [int[]]$AllowedExitCodes = @(0),
    [switch]$Quiet
  )

  if ($WorkingDirectory) { Push-Location -LiteralPath $WorkingDirectory }
  try {
    $output = @(& $FilePath @ArgumentList 2>&1)
    $exitCode = $LASTEXITCODE
  } finally {
    if ($WorkingDirectory) { Pop-Location }
  }
  if ($exitCode -notin $AllowedExitCodes) {
    $summary = (@($output | Select-Object -Last 8) -join [Environment]::NewLine).Trim()
    if ($summary) { throw "$Label failed with exit code ${exitCode}: $summary" }
    throw "$Label failed with exit code $exitCode"
  }
  if (!$Quiet) { @($output) | ForEach-Object { Write-Host $_ } }
  return @($output)
}

function Invoke-Git {
  param(
    [Parameter(Mandatory)][string]$Root,
    [Parameter(Mandatory)][string[]]$Arguments,
    [string]$Label = 'git command',
    [switch]$Quiet
  )
  return Invoke-CheckedNative -FilePath 'git' -ArgumentList (@('-C', $Root) + $Arguments) -Label $Label -Quiet:$Quiet
}

function Get-GitValue {
  param(
    [Parameter(Mandatory)][string]$Root,
    [Parameter(Mandatory)][string[]]$Arguments,
    [string]$Label = 'git query'
  )
  return ((Invoke-Git -Root $Root -Arguments $Arguments -Label $Label -Quiet) -join "`n").Trim()
}

function Get-DirtyPaths {
  param([Parameter(Mandatory)][string]$Root)
  $lines = @(Invoke-Git -Root $Root -Arguments @('status', '--porcelain=v1', '--untracked-files=all') -Label 'git status' -Quiet)
  return @(
    $lines |
      Where-Object { $_ } |
      ForEach-Object {
        $path = ([string]$_).Substring(3)
        if ($path -match ' -> ') { $path = ($path -split ' -> ', 2)[1] }
        $path.Replace('\', '/')
      } |
      Sort-Object -Unique
  )
}

function Assert-SameStringSet {
  param(
    [Parameter(Mandatory)][string[]]$Expected,
    [Parameter(Mandatory)][string[]]$Actual,
    [Parameter(Mandatory)][string]$Label
  )
  $expectedJson = @($Expected | Sort-Object -Unique) | ConvertTo-Json -Compress
  $actualJson = @($Actual | Sort-Object -Unique) | ConvertTo-Json -Compress
  if ($expectedJson -ne $actualJson) {
    throw "$Label does not match the security manifest."
  }
}

function Get-MigrationInventory {
  param(
    [Parameter(Mandatory)][string]$Root,
    [Parameter(Mandatory)][string]$Directory
  )
  $migrationRoot = Join-Path $Root ($Directory.Replace('/', '\'))
  if (!(Test-Path -LiteralPath $migrationRoot -PathType Container)) {
    throw "Migration directory is missing: $migrationRoot"
  }
  [string[]]$names = @(
    Get-ChildItem -LiteralPath $migrationRoot -File |
      ForEach-Object { "$Directory/$($_.Name)" }
  )
  [Array]::Sort($names, [System.StringComparer]::Ordinal)
  $inventoryText = if ($names.Count -gt 0) { ($names -join "`n") + "`n" } else { '' }
  return [pscustomobject]@{
    Names = $names
    Count = $names.Count
    Sha256 = Get-StringSha256 -Value $inventoryText
  }
}

function Read-AndValidateManifest {
  foreach ($path in @($ManifestPath, $SecurityPlanPath, $OverlayDocumentPath)) {
    if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw "Required upgrade file is missing: $path" }
  }

  $securityPlan = Get-Content -LiteralPath $SecurityPlanPath -Raw
  $overlayDocument = Get-Content -LiteralPath $OverlayDocumentPath -Raw
  if (!$securityPlan.Contains('MEXION-SECURITY-PLAN:1')) { throw 'Security plan marker is missing.' }
  if (!$overlayDocument.Contains('MEXION-UPGRADE-OVERLAY:1')) { throw 'Upgrade overlay marker is missing.' }

  $manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
  foreach ($document in @($manifest.documents)) {
    $path = Join-Path $RepoRoot ([string]$document.path).Replace('/', '\')
    if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw "Manifest document is missing: $($document.path)" }
    $text = Get-Content -LiteralPath $path -Raw
    if (!$text.Contains([string]$document.marker)) { throw "Manifest document marker is missing: $($document.path)" }
    if ((Get-LowerSha256 -Path $path) -ne [string]$document.sha256) {
      throw "Manifest document hash mismatch: $($document.path)"
    }
  }
  foreach ($entry in @($manifest.patches)) {
    $path = Join-Path $RepoRoot ([string]$entry.path).Replace('/', '\')
    if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw "Overlay patch is missing: $($entry.path)" }
    if ((Get-LowerSha256 -Path $path) -ne [string]$entry.sha256) {
      throw "Overlay patch hash mismatch: $($entry.path)"
    }
  }
  return $manifest
}

function Get-ExpectedDirtyPaths {
  param([Parameter(Mandatory)]$Manifest)
  return @(
    @($Manifest.patches) |
      ForEach-Object { @($_.dirty_paths) } |
      ForEach-Object { [string]$_ } |
      Sort-Object -Unique
  )
}

function Assert-OverlayWorktree {
  param(
    [Parameter(Mandatory)]$Manifest,
    [Parameter(Mandatory)][string]$Root,
    [switch]$RequirePinnedBranch
  )

  if (!(Test-Path -LiteralPath (Join-Path $Root '.git'))) { throw "Sub2API worktree is unavailable: $Root" }
  $remote = Get-GitValue -Root $Root -Arguments @('remote', 'get-url', 'origin') -Label 'read upstream remote'
  if ($remote -ne [string]$Manifest.upstream.repository) { throw 'Sub2API origin does not match the pinned upstream repository.' }
  $head = Get-GitValue -Root $Root -Arguments @('rev-parse', 'HEAD') -Label 'read upstream HEAD'
  if ($head -ne [string]$Manifest.upstream.commit) { throw 'Sub2API HEAD does not match the pinned security baseline.' }
  if ($RequirePinnedBranch) {
    $branch = Get-GitValue -Root $Root -Arguments @('branch', '--show-current') -Label 'read upstream branch'
    if ($branch -ne [string]$Manifest.upstream.branch) { throw 'Sub2API branch does not match the pinned security baseline.' }
  }

  $expectedDirty = @(Get-ExpectedDirtyPaths -Manifest $Manifest)
  $actualDirty = @(Get-DirtyPaths -Root $Root)
  Assert-SameStringSet -Expected $expectedDirty -Actual $actualDirty -Label 'Sub2API dirty paths'

  foreach ($entry in @($Manifest.patches | Sort-Object order)) {
    $patchPath = Join-Path $RepoRoot ([string]$entry.path).Replace('/', '\')
    Invoke-Git -Root $Root -Arguments @('apply', '--reverse', '--check', $patchPath) -Label "reverse-check $($entry.path)" -Quiet | Out-Null
  }

  $migration = Get-MigrationInventory -Root $Root -Directory ([string]$Manifest.migrations.directory)
  if ($migration.Count -ne [int]$Manifest.migrations.file_count -or $migration.Sha256 -ne [string]$Manifest.migrations.inventory_sha256) {
    throw 'Sub2API migration inventory does not match the pinned baseline.'
  }
}

function Invoke-SecurityAudit {
  param(
    [Parameter(Mandatory)][ValidateSet('pre-upgrade', 'post-upgrade', 'full')][string]$Mode,
    [string]$ExternalRoot = $Sub2ApiRoot
  )
  $pnpm = if ($env:OS -eq 'Windows_NT') { 'pnpm.cmd' } else { 'pnpm' }
  Invoke-MexionWithProcessEnvironment -EnvironmentVariables @{ SUB2API_ROOT = $ExternalRoot } -ScriptBlock {
    Invoke-CheckedNative -FilePath $pnpm -ArgumentList @('security:audit', '--', '--mode', $Mode) -WorkingDirectory $RepoRoot -Label "$Mode security audit" | Out-Null
  }
}

function Export-TrackedPatch {
  param(
    [Parameter(Mandatory)][string]$Root,
    [Parameter(Mandatory)]$Entry
  )
  if ($Entry.creates_paths) { return }
  $arguments = @('diff', '--full-index', '--binary', '--') + @($Entry.dirty_paths | ForEach-Object { [string]$_ })
  $lines = @(Invoke-Git -Root $Root -Arguments $arguments -Label "export $($Entry.path)" -Quiet)
  if ($lines.Count -eq 0) { throw "Overlay patch became empty: $($Entry.path)" }
  $path = Join-Path $RepoRoot ([string]$Entry.path).Replace('/', '\')
  Write-Utf8NoBom -Path $path -Content (($lines -join "`n") + "`n")
}

function Update-ManifestForCandidate {
  param(
    [Parameter(Mandatory)]$Manifest,
    [Parameter(Mandatory)][string]$CandidateRoot,
    [Parameter(Mandatory)][string]$Commit,
    [Parameter(Mandatory)][string]$Branch,
    [Parameter(Mandatory)][string]$Release
  )
  $Manifest.upstream.commit = $Commit
  $Manifest.upstream.branch = $Branch
  $Manifest.upstream.release = $Release
  $versionPath = Join-Path $CandidateRoot ([string]$Manifest.upstream.version_file).Replace('/', '\')
  $Manifest.upstream.observed_version_file_value = (Get-Content -LiteralPath $versionPath -Raw).Trim()

  foreach ($document in @($Manifest.documents)) {
    $path = Join-Path $RepoRoot ([string]$document.path).Replace('/', '\')
    $document.sha256 = Get-LowerSha256 -Path $path
  }
  foreach ($entry in @($Manifest.patches)) {
    $path = Join-Path $RepoRoot ([string]$entry.path).Replace('/', '\')
    $entry.sha256 = Get-LowerSha256 -Path $path
  }
  $migration = Get-MigrationInventory -Root $CandidateRoot -Directory ([string]$Manifest.migrations.directory)
  $Manifest.migrations.file_count = $migration.Count
  $Manifest.migrations.inventory_sha256 = $migration.Sha256
  Write-Utf8NoBom -Path $ManifestPath -Content (($Manifest | ConvertTo-Json -Depth 20) + "`n")
}

function Wait-HttpHealth {
  param([int]$Port, [int]$TimeoutSeconds = 120)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 3
      if ($response.StatusCode -eq 200) { return }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  throw "Sub2API health check did not return 200 on port $Port."
}

$manifest = Read-AndValidateManifest
Assert-OverlayWorktree -Manifest $manifest -Root $Sub2ApiRoot -RequirePinnedBranch
Invoke-SecurityAudit -Mode 'pre-upgrade'

if (!$Apply) {
  if (![string]::IsNullOrWhiteSpace($TargetRef)) {
    $resolved = Get-GitValue -Root $Sub2ApiRoot -Arguments @('rev-parse', '--verify', "$TargetRef^{commit}") -Label 'resolve local target ref'
    Write-Host "Local target ref resolves to $resolved"
  }
  Write-Host 'Sub2API upgrade preflight PASS (dry-run; no files, refs, services, or databases changed).'
  exit 0
}

if ([string]::IsNullOrWhiteSpace($TargetRef)) { throw '-TargetRef is required with -Apply.' }
if (!(Get-Command go -ErrorAction SilentlyContinue)) { throw 'go is required for an applied upgrade.' }
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw 'git is required for an applied upgrade.' }

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $BackupRoot "upstream-upgrade-$timestamp"
$candidateRoot = Join-Path $UpdateRoot "sub2api-upgrade-$timestamp"
New-Item -ItemType Directory -Force -Path $backup, $UpdateRoot | Out-Null
Protect-MexionSecretPath -Path $backup

$originalBranch = Get-GitValue -Root $Sub2ApiRoot -Arguments @('branch', '--show-current')
$originalCommit = Get-GitValue -Root $Sub2ApiRoot -Arguments @('rev-parse', 'HEAD')
$originalMigration = Get-MigrationInventory -Root $Sub2ApiRoot -Directory ([string]$manifest.migrations.directory)

Copy-Item -LiteralPath $ManifestPath -Destination (Join-Path $backup 'upstream-baseline.json')
Copy-Item -LiteralPath $SecurityPlanPath -Destination (Join-Path $backup 'SECURITY_OPTIMIZATION_PLAN.md')
Copy-Item -LiteralPath $OverlayDocumentPath -Destination (Join-Path $backup 'UPSTREAM_UPGRADE_SECURITY_OVERLAY.md')
Copy-Item -LiteralPath (Join-Path $RepoRoot 'overlays\sub2api\patches') -Destination (Join-Path $backup 'patches') -Recurse

$externalBackend = Join-Path $Sub2ApiRoot 'backend'
$activeConfig = Join-Path $externalBackend 'config.yaml'
$activeBinary = Join-Path $externalBackend 'bin\server'
if (Test-Path -LiteralPath $activeConfig) { Copy-Item -LiteralPath $activeConfig -Destination (Join-Path $backup 'config.yaml') }
if (Test-Path -LiteralPath $activeBinary) { Copy-Item -LiteralPath $activeBinary -Destination (Join-Path $backup 'server') }
foreach ($dirtyPath in @(Get-ExpectedDirtyPaths -Manifest $manifest)) {
  $source = Join-Path $Sub2ApiRoot $dirtyPath.Replace('/', '\')
  if (Test-Path -LiteralPath $source -PathType Leaf) {
    $destination = Join-Path $backup (Join-Path 'dirty-files' $dirtyPath.Replace('/', '\'))
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination
  }
}

if ([string]::IsNullOrWhiteSpace($LocalSettingsPath)) {
  $LocalSettingsPath = Join-Path $RepoRoot '.runtime\local-runtime.settings.json'
}
$settings = Get-MexionLocalRuntimeSettings -Path $LocalSettingsPath -RequireDatabase
if (!$SkipDatabaseBackup) {
  $pgDump = Join-Path $RepoRoot '.runtime\postgres\pgsql\bin\pg_dump.exe'
  if (!(Test-Path -LiteralPath $pgDump)) { throw "pg_dump is required before upgrade: $pgDump" }
  Invoke-MexionNativeWithEnvironment `
    -FilePath $pgDump `
    -ArgumentList @('-h', '127.0.0.1', '-p', [string]$PostgresPort, '-U', 'postgres', '-d', 'sub2api', '-Fc', '-f', (Join-Path $backup 'sub2api.dump')) `
    -EnvironmentVariables @{ PGPASSWORD = $settings.DatabasePassword } | Out-Null
}
$settings = $null

Invoke-Git -Root $Sub2ApiRoot -Arguments @('fetch', 'origin', '--tags', '--prune') -Label 'fetch upstream refs' | Out-Null
$targetCommit = Get-GitValue -Root $Sub2ApiRoot -Arguments @('rev-parse', '--verify', "$TargetRef^{commit}") -Label 'resolve target ref'
$release = $TargetRef.Trim()
if ($release -notmatch '^v\d+\.\d+\.\d+(?:[-+].+)?$') {
  $pointingTags = @(Invoke-Git -Root $Sub2ApiRoot -Arguments @('tag', '--points-at', $targetCommit) -Quiet)
  $release = [string](@($pointingTags | Where-Object { $_ -match '^v\d+\.\d+\.\d+(?:[-+].+)?$' } | Select-Object -First 1)[0])
}
if ([string]::IsNullOrWhiteSpace($release)) { $release = "commit-$($targetCommit.Substring(0, 12))" }
$upgradeBranch = "upgrade/$release"
if ((Get-GitValue -Root $Sub2ApiRoot -Arguments @('branch', '--list', $upgradeBranch))) {
  throw "Target branch already exists; inspect it before retrying: $upgradeBranch"
}
if (Test-Path -LiteralPath $candidateRoot) { throw "Candidate path already exists: $candidateRoot" }

$candidateAdded = $false
try {
  Invoke-Git -Root $Sub2ApiRoot -Arguments @('worktree', 'add', '-b', $upgradeBranch, $candidateRoot, $targetCommit) -Label 'create candidate worktree' | Out-Null
  $candidateAdded = $true

  $candidateMigration = Get-MigrationInventory -Root $candidateRoot -Directory ([string]$manifest.migrations.directory)
  $missingMigrations = @($originalMigration.Names | Where-Object { $_ -notin $candidateMigration.Names })
  if ($missingMigrations.Count -gt 0) { throw "$($missingMigrations.Count) existing migration file(s) disappeared in the target." }

  foreach ($entry in @($manifest.patches | Sort-Object order)) {
    $patchPath = Join-Path $RepoRoot ([string]$entry.path).Replace('/', '\')
    Invoke-Git -Root $candidateRoot -Arguments @('apply', '--check', $patchPath) -Label "check patch $($entry.path)" -Quiet | Out-Null
    Invoke-Git -Root $candidateRoot -Arguments @('apply', $patchPath) -Label "apply patch $($entry.path)" -Quiet | Out-Null
  }

  $candidateBackend = Join-Path $candidateRoot 'backend'
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './internal/config') -WorkingDirectory $candidateBackend -Label 'config tests' | Out-Null
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './internal/server/middleware') -WorkingDirectory $candidateBackend -Label 'middleware tests' | Out-Null
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './internal/service', '-run', 'WebSearch') -WorkingDirectory $candidateBackend -Label 'web-search tests' | Out-Null
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './internal/handler', '-run', 'RefreshTokenCookie|OAuthCallbackDirectlyLogsInNewUser|OIDCOAuthCallbackVerifiedEmailFastPath') -WorkingDirectory $candidateBackend -Label 'refresh-cookie tests' | Out-Null
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './migrations') -WorkingDirectory $candidateBackend -Label 'migration package tests' | Out-Null
  Invoke-CheckedNative -FilePath 'go' -ArgumentList @('test', './internal/repository', '-run', 'Migration|Checksum') -WorkingDirectory $candidateBackend -Label 'migration checksum tests' | Out-Null

  foreach ($entry in @($manifest.patches | Sort-Object order)) {
    Export-TrackedPatch -Root $candidateRoot -Entry $entry
  }

  $version = $release.TrimStart('v')
  $candidateBinary = Join-Path $candidateBackend 'bin\server.candidate'
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $candidateBinary) | Out-Null
  Invoke-MexionNativeWithEnvironment `
    -FilePath 'go' `
    -ArgumentList @('build', '-tags', 'timetzdata', "-ldflags=-s -w -X main.Version=$version", '-trimpath', '-o', $candidateBinary, './cmd/server') `
    -EnvironmentVariables @{ CGO_ENABLED = '0' } | Out-Null

  Update-ManifestForCandidate -Manifest $manifest -CandidateRoot $candidateRoot -Commit $targetCommit -Branch $upgradeBranch -Release $release
  Invoke-SecurityAudit -Mode 'post-upgrade' -ExternalRoot $candidateRoot

  $stagedBinary = Join-Path $backup 'server.candidate'
  Copy-Item -LiteralPath $candidateBinary -Destination $stagedBinary

  Invoke-Git -Root $Sub2ApiRoot -Arguments @('worktree', 'remove', '--force', $candidateRoot) -Label 'remove validated candidate worktree' | Out-Null
  $candidateAdded = $false

  foreach ($entry in @($manifest.patches | Sort-Object order -Descending)) {
    $oldPatchPath = Join-Path (Join-Path $backup 'patches') ([System.IO.Path]::GetFileName([string]$entry.path))
    if (!(Test-Path -LiteralPath $oldPatchPath -PathType Leaf)) { throw "Backed-up overlay patch is missing: $oldPatchPath" }
    Invoke-Git -Root $Sub2ApiRoot -Arguments @('apply', '--reverse', $oldPatchPath) -Label "remove old patch $($entry.path)" -Quiet | Out-Null
  }
  if (@(Get-DirtyPaths -Root $Sub2ApiRoot).Count -ne 0) { throw 'Old worktree did not become clean after removing the overlay.' }
  Invoke-Git -Root $Sub2ApiRoot -Arguments @('switch', $upgradeBranch) -Label 'switch active source branch' | Out-Null
  foreach ($entry in @($manifest.patches | Sort-Object order)) {
    $patchPath = Join-Path $RepoRoot ([string]$entry.path).Replace('/', '\')
    Invoke-Git -Root $Sub2ApiRoot -Arguments @('apply', $patchPath) -Label "replay patch $($entry.path)" -Quiet | Out-Null
  }
  Invoke-SecurityAudit -Mode 'post-upgrade' -ExternalRoot $Sub2ApiRoot

  if ($Activate) {
    $listener = Get-NetTCPConnection -LocalPort $ApiPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
      [void](Assert-MexionLoopbackListener -Port $ApiPort -Name 'Sub2API backend')
      $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
      if (!$process -or $process.CommandLine -notmatch [regex]::Escape($Sub2ApiRoot)) {
        throw "Port $ApiPort is owned by a process outside the Sub2API worktree; refusing to stop it."
      }
      Stop-Process -Id $listener.OwningProcess -Force
      Start-Sleep -Milliseconds 750
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $activeBinary) | Out-Null
    Copy-Item -LiteralPath $stagedBinary -Destination $activeBinary -Force
    & (Join-Path $PSScriptRoot 'start-sub2api.ps1') -Sub2ApiRoot $Sub2ApiRoot -Port $ApiPort
    Wait-HttpHealth -Port $ApiPort
  }
  Invoke-SecurityAudit -Mode 'full' -ExternalRoot $Sub2ApiRoot

  $report = [ordered]@{
    schema_version = 1
    completed_at = (Get-Date).ToUniversalTime().ToString('o')
    original_branch = $originalBranch
    original_commit = $originalCommit
    target_ref = $TargetRef
    target_commit = $targetCommit
    target_branch = $upgradeBranch
    release = $release
    database_backup_skipped = [bool]$SkipDatabaseBackup
    activated = [bool]$Activate
    status = 'pass'
  }
  Write-Utf8NoBom -Path (Join-Path $backup 'upgrade-report.json') -Content (($report | ConvertTo-Json -Depth 5) + "`n")
  Write-Host "Sub2API upgrade PASS: $release ($targetCommit)"
  Write-Host "Runtime activated: $([bool]$Activate)"
  if (!$Activate) { Write-Host "Validated candidate retained at: $stagedBinary" }
  Write-Host "Rollback evidence: $backup"
} catch {
  if ($candidateAdded) {
    try { Invoke-Git -Root $Sub2ApiRoot -Arguments @('worktree', 'remove', '--force', $candidateRoot) -Label 'remove failed candidate' -Quiet | Out-Null } catch {}
  }
  throw "Upgrade stopped before completion. Preserve and inspect rollback evidence at ${backup}: $($_.Exception.Message)"
}

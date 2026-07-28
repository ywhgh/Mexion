function Protect-MexionSecretPath {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$Path
  )

  if (!(Test-Path -LiteralPath $Path)) { return }
  if ($env:OS -ne 'Windows_NT') { return }

  $resolved = (Resolve-Path -LiteralPath $Path).Path
  $item = Get-Item -LiteralPath $resolved -Force
  $currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
  $systemSid = [System.Security.Principal.SecurityIdentifier]::new('S-1-5-18')
  $administratorsSid = [System.Security.Principal.SecurityIdentifier]::new('S-1-5-32-544')

  if ($item.PSIsContainer) {
    $acl = [System.Security.AccessControl.DirectorySecurity]::new()
    $inheritance = [System.Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit'
    $propagation = [System.Security.AccessControl.PropagationFlags]::None
  } else {
    $acl = [System.Security.AccessControl.FileSecurity]::new()
    $inheritance = [System.Security.AccessControl.InheritanceFlags]::None
    $propagation = [System.Security.AccessControl.PropagationFlags]::None
  }

  $acl.SetOwner($currentSid)
  $acl.SetAccessRuleProtection($true, $false)
  foreach ($sid in @($currentSid, $systemSid, $administratorsSid)) {
    $rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
      $sid,
      [System.Security.AccessControl.FileSystemRights]::FullControl,
      $inheritance,
      $propagation,
      [System.Security.AccessControl.AccessControlType]::Allow
    )
    [void]$acl.AddAccessRule($rule)
  }

  Set-Acl -LiteralPath $resolved -AclObject $acl
}

function Get-MexionLocalRuntimeSettings {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$Path,
    [string]$AdminEmail,
    [string]$AdminPassword,
    [string]$DatabasePassword,
    [switch]$RequireAdmin,
    [switch]$RequireDatabase
  )

  $settings = $null
  if (Test-Path -LiteralPath $Path) {
    Protect-MexionSecretPath -Path $Path
    try {
      $settings = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    } catch {
      throw "Failed to parse local runtime settings at ${Path}: $($_.Exception.Message)"
    }
  }

  if ([string]::IsNullOrWhiteSpace($AdminEmail) -and $settings) {
    $AdminEmail = [string]$settings.admin_email
  }
  if ([string]::IsNullOrWhiteSpace($AdminPassword) -and $settings) {
    $AdminPassword = [string]$settings.admin_password
  }
  if ([string]::IsNullOrWhiteSpace($DatabasePassword) -and $settings) {
    $DatabasePassword = [string]$settings.database_password
  }

  $missing = @(
    if ($RequireAdmin -and [string]::IsNullOrWhiteSpace($AdminEmail)) { 'MEXION_ADMIN_EMAIL / admin_email' }
    if ($RequireAdmin -and [string]::IsNullOrWhiteSpace($AdminPassword)) { 'MEXION_ADMIN_PASSWORD / admin_password' }
    if ($RequireDatabase -and [string]::IsNullOrWhiteSpace($DatabasePassword)) { 'SUB2API_DB_PASSWORD / database_password' }
  )
  if ($missing.Count -gt 0) {
    throw "Missing local runtime settings: $($missing -join ', '). Use environment variables or the gitignored settings file at $Path."
  }
  if ($RequireAdmin -and $AdminEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
    throw 'The configured local administrator email is invalid.'
  }

  return [pscustomobject]@{
    AdminEmail = $AdminEmail
    AdminPassword = $AdminPassword
    DatabasePassword = $DatabasePassword
  }
}

function Invoke-MexionWithProcessEnvironment {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [hashtable]$EnvironmentVariables,
    [Parameter(Mandatory)]
    [scriptblock]$ScriptBlock
  )

  $previous = @{}
  try {
    foreach ($name in $EnvironmentVariables.Keys) {
      $previous[$name] = [pscustomobject]@{
        Exists = Test-Path -LiteralPath "Env:$name"
        Value = [Environment]::GetEnvironmentVariable($name, 'Process')
      }
      [Environment]::SetEnvironmentVariable($name, [string]$EnvironmentVariables[$name], 'Process')
    }
    return & $ScriptBlock
  } finally {
    foreach ($name in $EnvironmentVariables.Keys) {
      if ($previous[$name].Exists) {
        [Environment]::SetEnvironmentVariable($name, [string]$previous[$name].Value, 'Process')
      } else {
        [Environment]::SetEnvironmentVariable($name, $null, 'Process')
      }
    }
  }
}

function Invoke-MexionNativeWithEnvironment {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$FilePath,
    [string[]]$ArgumentList = @(),
    [hashtable]$EnvironmentVariables = @{}
  )

  $result = Invoke-MexionWithProcessEnvironment -EnvironmentVariables $EnvironmentVariables -ScriptBlock {
    $output = & $FilePath @ArgumentList
    [pscustomobject]@{
      ExitCode = $LASTEXITCODE
      Output = @($output)
    }
  }
  if ($result.ExitCode -ne 0) {
    throw "Native command failed with exit code $($result.ExitCode): $FilePath"
  }
  return $result.Output
}

function Assert-MexionLoopbackListener {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [int]$Port,
    [Parameter(Mandatory)]
    [string]$Name
  )

  $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
  if ($listeners.Count -eq 0) { return $false }

  $unsafe = @($listeners | Where-Object { $_.LocalAddress -notin @('127.0.0.1', '::1') })
  if ($unsafe.Count -gt 0) {
    throw "$Name port $Port has a non-loopback listener; refusing to use it for the local runtime."
  }
  return $true
}

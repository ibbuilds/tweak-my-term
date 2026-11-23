---
capability: env
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (docs, about_Environment_Variables; session-level behavior standard across 5.1 and 7)
sources: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables, https://learn.microsoft.com/en-us/dotnet/api/system.environment.setenvironmentvariable
---
# Environment variables and PATH in PowerShell
`$env:NAME = 'value'` sets a variable for the current session and child processes. Persist per user with `[Environment]::SetEnvironmentVariable(..., 'User')` (Windows) or by setting it in `$PROFILE`.

## Config
In `$PROFILE` (every session):
```powershell
$env:EDITOR = 'nvim'
$env:LESS   = '-R -F'

function Add-PathEntry([string]$Dir, [switch]$Append) {       # idempotent, ignores missing dirs
  if (-not (Test-Path -LiteralPath $Dir)) { return }
  $sep = [IO.Path]::PathSeparator                              # ';' on Windows, ':' on Linux/macOS
  $parts = $env:PATH -split [regex]::Escape($sep)
  if ($parts -contains $Dir) { return }
  $env:PATH = if ($Append) { "$env:PATH$sep$Dir" } else { "$Dir$sep$env:PATH" }
}
Add-PathEntry "$HOME\.local\bin"                              # use "$HOME/.local/bin" on Linux/macOS
```
Persistent, outside the shell (Windows; new processes only):
```powershell
[Environment]::SetEnvironmentVariable('MY_VAR', 'value', 'User')
$user = [Environment]::GetEnvironmentVariable('Path', 'User')
[Environment]::SetEnvironmentVariable('Path', "$user;C:\tools\bin", 'User')   # read-modify-write; do not use setx for PATH (1024-char truncation)
```

## Notes
- Windows variable names are case-insensitive (`$env:Path` = `$env:PATH`); Linux/macOS are case-sensitive.
- `Env:` is a drive: `Get-ChildItem Env:`, `Remove-Item Env:FOO`, `Test-Path Env:FOO`.
- Scope: session-level changes die with the process; `User`/`Machine` writes (Windows only) persist and broadcast a change to new processes. Machine scope needs admin.
- The profile runs only for interactive hosts; scripts run with `-NoProfile` will not see profile-set variables.
- Windows PowerShell 5.1 and PowerShell 7 share the same Windows user/machine environment; only session values differ.
- Reload PATH after an installer changed it: `$env:PATH = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`.
- Secrets: read from a file that is not in git, or use `Microsoft.PowerShell.SecretManagement`; never put tokens in `$PROFILE`.

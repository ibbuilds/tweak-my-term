---
capability: startup-speed
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine, Windows PowerShell 5.1 on Windows 11; single timings from this machine)
sources: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles, https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pwsh
---
# Make PowerShell start fast
A bare PowerShell start is a few hundred milliseconds on Windows; your profile adds the rest. Measure with and without the profile, then defer or cache the expensive lines.

## Config
Measure:
```powershell
# Windows PowerShell 5.1 (machine: 208 ms without profile, 531 ms with a rich profile)
Measure-Command { powershell -NoLogo -NoProfile -Command exit }   # baseline
Measure-Command { powershell -NoLogo -Command exit }              # with profile
Measure-Command { pwsh -NoLogo -Command exit }                    # PowerShell 7
# time the profile itself, line by line
Measure-Command { . $PROFILE }
$sw = [Diagnostics.Stopwatch]::StartNew(); Import-Module PSReadLine; "psrl $($sw.ElapsedMilliseconds) ms"
```
Defer non-essential setup until the first idle moment (the prompt appears first):
```powershell
$null = Register-EngineEvent -SourceIdentifier PowerShell.OnIdle -MaxTriggerCount 1 -Action {
  # e.g. zoxide: cache its init script and dot-source it
  $zx = Get-Command zoxide -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $zx) { return }
  $f = Join-Path $HOME '.cache\zoxide.ps1'
  if (-not (Test-Path $f) -or (Get-Item $zx.Source).LastWriteTime -gt (Get-Item $f).LastWriteTime) {
    New-Item -ItemType Directory -Force (Split-Path $f) | Out-Null
    (& $zx.Source init powershell | Out-String) | Set-Content -Encoding UTF8 $f
  }
  . $f
}
```

## Notes
- Measured (Windows PowerShell 5.1, one run each): `-NoProfile` 208 ms; with a profile that imports PSReadLine 2.4, defines a git-aware prompt and a deferred zoxide 531 ms. Roughly +300 ms came from the profile.
- Typical culprits: `Import-Module` of large modules (posh-git, Az, Terminal-Icons: 100-500 ms each), `oh-my-posh init` / `starship init` run each start, `Get-Command`/`Get-Module -ListAvailable` calls, spawning native tools (10-60 ms each), network calls, `Install-Module` checks.
- Use `-NoLogo`; for scripts use `-NoProfile`. PowerShell 7: `$env:POWERSHELL_UPDATECHECK = 'Off'` and `POWERSHELL_TELEMETRY_OPTOUT=1` (set as user env vars) avoid update and telemetry work (docs).
- Module auto-loading makes explicit `Import-Module` unnecessary for most modules in `$env:PSModulePath`; only import what the profile needs.
- Cache generated init scripts (see above) and rebuild only when the tool binary is newer.
- Skip interactive-only setup (PSReadLine options, prompt) when `[Console]::IsOutputRedirected` or the host is not `ConsoleHost`.

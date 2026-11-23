---
capability: install-init
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (machine: Windows PowerShell 5.1 with PSReadLine 2.0.0 and 2.4.5; docs)
sources: https://learn.microsoft.com/powershell/module/psreadline/about/about_psreadline
---
# Get a current PSReadLine and configure it in the profile
Windows PowerShell 5.1 ships PSReadLine 2.0.0, which has no predictions colours or list view. Install a current one from PowerShell Gallery for the current user, then put all `Set-PSReadLine*` calls in the profile.

## Config
Check first:
```powershell
(Get-Module PSReadLine).Version                         # in a running session
Get-Module PSReadLine -ListAvailable | Select Version, ModuleBase
```
Install/update (Windows PowerShell 5.1; no admin needed):
```powershell
Install-Module PSReadLine -Scope CurrentUser -Force
# if PowerShellGet complains about the built-in module's publisher:  -SkipPublisherCheck
```
Profile (`{ps-profile}` for 5.1, `{pwsh-profile}` for PowerShell 7; create with `New-Item -Path $PROFILE -Type File -Force`):
```powershell
if (Get-Module -ListAvailable PSReadLine | Where-Object Version -ge '2.2.0') {
  Import-Module PSReadLine
  Set-PSReadLineOption -PredictionSource HistoryAndPlugin -PredictionViewStyle InlineView
}
```
Restart the shell; the host loads the newest installed PSReadLine on its own. Confirm with `(Get-Module PSReadLine).Version`.

## Notes
- Verified on this machine: with 2.4.5 under `Documents\WindowsPowerShell\Modules` and 2.0.0 under `Program Files`, `Import-Module PSReadLine` loads 2.4.5 (user path precedes system path). PSGallery latest is 2.4.5 (2025-10-22).
- Bundled versions: 5.1 = 2.0.0; PowerShell 7.0.11+ = 2.0.4; 7.2.5 = 2.1.0; 7.3 = 2.2.6; 7.4 = 2.3.4-2.3.6; 7.6 = 2.4.5. PowerShell 7 usually needs no install.
- Predictions need a VT-capable interactive console: `Set-PSReadLineOption -PredictionSource ...` throws "console output doesn't support virtual terminal processing or it's redirected" when run from a non-interactive host (seen when scripting this check). Keep the call in the profile, guarded by a version check.
- PSReadLine does not work in the Windows PowerShell ISE.
- Do not create the profile as a sourced copy over a managed one; guard with `Get-Module` so older machines still start.
- Uninstall: `Uninstall-Module PSReadLine -AllVersions`.

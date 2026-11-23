---
capability: startup-file
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine, Windows PowerShell 5.1.26100; PowerShell 7 paths from Microsoft Learn about_Profiles)
sources: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles
---
# Where interactive PowerShell config goes
`$PROFILE` is the "current user, current host" profile script, run at the start of every interactive console. Windows PowerShell 5.1 and PowerShell 7 have separate profiles; configure both if you use both.

## Config
Paths (token in tool.json): `{ps-profile}` = 5.1, `{pwsh-profile}` = 7.
```text
Windows PowerShell 5.1 : %USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
PowerShell 7 (Windows) : %USERPROFILE%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
PowerShell 7 (mac/Linux): ~/.config/powershell/Microsoft.PowerShell_profile.ps1
All hosts, current user : ...\profile.ps1 in the same folders ($PROFILE.CurrentUserAllHosts)
```
Create and keep the profile tiny; dot-source a real config file:
```powershell
if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Force $PROFILE | Out-Null }
# $PROFILE content:
if ($Host.Name -ne 'ConsoleHost') { return }         # skip ISE/VS Code/integrated hosts if you want
. "$HOME\.config\mytheme\theme.ps1"                  # use $HOME/.config/... on mac/Linux
```
All profile paths of the running host: `$PROFILE | Select-Object *`.

## Notes
- Machine check: this host reports `CurrentUserCurrentHost = C:\Users\<user>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`; with OneDrive "known folder" redirection Documents can move, so always resolve with `$PROFILE`.
- Encoding: Windows PowerShell 5.1 reads a BOM-less script as ANSI, so non-ASCII characters (arrows, box drawing, `✘`) break the parse (verified: a UTF-8 file without BOM containing U+2192 fails with "string is missing the terminator"). Save 5.1 profile files as UTF-8 WITH BOM. PowerShell 7 defaults to UTF-8 without BOM.
- Execution policy must allow local scripts: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` (5.1 client default is Restricted unless already set; this machine had CurrentUser = RemoteSigned).
- Run order: AllUsersAllHosts, AllUsersCurrentHost, CurrentUserAllHosts, CurrentUserCurrentHost (last wins).
- `powershell -NoProfile` / `pwsh -NoProfile` skip profiles (use it for scripts and for timing a baseline).
- VS Code uses its own host profile (`Microsoft.VSCode_profile.ps1`).
- Syntax-check without running: `[System.Management.Automation.Language.Parser]::ParseFile(path, [ref]$null, [ref]$errors)`.

---
capability: line-editing
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine: PSReadLine 2.0.0 and 2.4.5 installed side by side on Windows PowerShell 5.1; docs for versions)
sources: https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline, https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlineoption, https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/using-predictors, https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_release_notes
---
# Line editing in PowerShell (PSReadLine)
PSReadLine provides editing, syntax coloring, history search and Predictive IntelliSense. What you get depends on the version, and Windows PowerShell 5.1 ships an old one.

## Config
Check the version first (do this before using prediction options):
```powershell
(Get-Module PSReadLine).Version          # in the running session
Get-Module PSReadLine -ListAvailable | Select-Object Version, Path
```
Windows PowerShell 5.1 (ships 2.0.0; upgrade for predictions):
```powershell
Install-Module PSReadLine -Scope CurrentUser -Force      # needs NuGet provider + PSGallery; run once, elevated not required
```
In `$PROFILE`:
```powershell
Import-Module PSReadLine -MinimumVersion 2.2 -ErrorAction SilentlyContinue   # picks the newer side-by-side copy
$psrl = Get-Module PSReadLine
if ($psrl -and $psrl.Version -ge [version]'2.2' -and -not [Console]::IsOutputRedirected) {
  Set-PSReadLineOption -PredictionSource History -PredictionViewStyle InlineView   # ListView for a dropdown
}
Set-PSReadLineOption -EditMode Windows -BellStyle None -HistoryNoDuplicates -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key UpArrow   -Function HistorySearchBackward   # prefix search like bash
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Tab       -Function MenuComplete
if ($psrl.Version -ge [version]'2.2') { Set-PSReadLineKeyHandler -Key F2 -Function SwitchPredictionView }
```

## Notes
- Versions shipped with PowerShell (Microsoft Learn): 5.1 = 2.0.0; 7.0.11 = 2.0.4; 7.2.5 = 2.1.0; 7.3.0 = 2.2.6; 7.4.0 = 2.3.4; 7.4.7 and 7.5 = 2.3.6; 7.6 = 2.4.5.
- Feature floor (docs): `-PredictionSource History` needs 2.1.0; `Plugin`/`HistoryAndPlugin` and `-PredictionViewStyle ListView` need 2.2.0 (plugins also need PowerShell 7.2+); `SwitchPredictionView` (F2) needs 2.2.0+. Predictions are on by default from 2.2.6 when the terminal supports VT.
- Machine: on Windows PowerShell 5.1 with PSReadLine 2.0.0, `Get-PSReadLineOption` has no `PredictionSource`, `PredictionViewStyle`, `InlinePredictionColor` members; setting them errors. With 2.4.5 installed side by side, `Import-Module PSReadLine -MinimumVersion 2.2` loads 2.4.5.
- Predictions need a real console: guard with `[Console]::IsOutputRedirected` (non-interactive hosts throw otherwise).
- `Set-PSReadLineOption -EditMode Emacs|Vi|Windows`; Emacs gives readline-like keys (Ctrl-A/E/W/R/T).
- Accept a prediction: Right arrow/End accepts all, Ctrl-Right (`ForwardWord`) one word.
- Options persist only for the session; put them in `$PROFILE`.

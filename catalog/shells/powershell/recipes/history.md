---
capability: history
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine for the Windows 5.1 path and option names; docs for PowerShell 7 / non-Windows paths)
sources: https://learn.microsoft.com/en-us/powershell/module/psreadline/get-psreadlineoption, https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlineoption, https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline
---
# History in PowerShell (PSReadLine)
PSReadLine keeps its own persistent history file (more complete than `Get-History`), shared by every session of that host.

## Config
```powershell
Set-PSReadLineOption -MaximumHistoryCount 20000 -HistoryNoDuplicates -HistorySaveStyle SaveIncrementally
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
# never record obvious secrets (return $false = not saved; the line stays recallable for the session)
Set-PSReadLineOption -AddToHistoryHandler {
  param($line) -not ($line -match '(?i)(--token|TOKEN=|PASSWORD=|SECRET=|API_KEY=)' -or $line.StartsWith(' '))
}
(Get-PSReadLineOption).HistorySavePath        # where the file lives
Get-Content (Get-PSReadLineOption).HistorySavePath | Select-String docker
```

## Notes
- File (machine, Windows PowerShell 5.1): `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`. PowerShell 7 uses the same folder on Windows and `~/.local/share/powershell/PSReadLine/ConsoleHost_history.txt` on Linux/macOS (docs; confirm with `HistorySavePath`).
- `HistorySaveStyle`: `SaveIncrementally` (default, shared across windows on next start), `SaveAtExit`, `SaveNothing`. Clear: delete the file or `Clear-History` plus removing the file.
- PSReadLine by default skips lines containing sensitive-looking words (password, secret, token, apikey...) from the saved file (release notes: sensitive-word filter); add your own with `-AddToHistoryHandler`.
- `-HistoryNoDuplicates` is on by default since PSReadLine 2.0.
- `Get-History` / `Invoke-History` (session history) are separate and per-process.
- Searching: Up/Down with `HistorySearchBackward`/`Forward` (prefix), `Ctrl-R` reverse incremental search, predictions (PSReadLine >= 2.1.0, see line-editing).

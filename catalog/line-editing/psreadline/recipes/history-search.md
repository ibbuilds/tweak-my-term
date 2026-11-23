---
capability: history-search
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (docs, PSReadLine 2.4.5)
sources: https://learn.microsoft.com/powershell/module/psreadline/set-psreadlinekeyhandler, https://learn.microsoft.com/powershell/module/psreadline/set-psreadlineoption
---
# History search
PSReadLine has incremental search (Ctrl+R backward, Ctrl+S forward) and prefix search bound to the arrow keys if you choose. History is saved to a file and shared across sessions.

## Config
```powershell
# type a prefix, press Up/Down to cycle matching history entries (like zsh history-search)
Set-PSReadLineKeyHandler -Chord UpArrow   -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Chord DownArrow -Function HistorySearchForward
Set-PSReadLineOption -HistorySearchCursorMovesToEnd        # cursor to end of the recalled line

Set-PSReadLineOption -HistoryNoDuplicates                  # default true; use -HistoryNoDuplicates:$false to allow
Set-PSReadLineOption -MaximumHistoryCount 20000
Set-PSReadLineOption -HistorySearchCaseSensitive:$false
Set-PSReadLineOption -HistorySaveStyle SaveIncrementally   # SaveIncrementally | SaveAtExit | SaveNothing
# Set-PSReadLineOption -HistorySavePath "$HOME\.ps_history.txt"
Set-PSReadLineOption -AddToHistoryHandler { param($line) $line -notmatch 'password|secret|token' }
```
Default history file: Windows `$Env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`; Linux/macOS `$XDG_DATA_HOME/powershell/PSReadLine/` or `~/.local/share/powershell/PSReadLine/`.

## Notes
- PSReadLine history is separate from PowerShell's `Get-History`.
- Fuzzy search UI: PSReadLine has none; install `PSFzf` (requires fzf) or use Atuin's PowerShell integration (`atuin init powershell`), which rebinds Ctrl+R/Up.
- `-AddToHistoryHandler` can return `$false` (skip), `$true`, or `MemoryOnly`/`SkipAdding`; `HistorySaveStyle SaveNothing` plus later `SaveIncrementally` saves the whole session.
- Predictions (suggestions recipe) read the same history.

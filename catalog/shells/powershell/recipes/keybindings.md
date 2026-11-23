---
capability: keybindings
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine for the handler patterns used on Windows PowerShell 5.1 + PSReadLine 2.4.5; docs for the rest)
sources: https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlinekeyhandler, https://learn.microsoft.com/en-us/powershell/module/psreadline/get-psreadlinekeyhandler
---
# Key bindings in PowerShell (PSReadLine)
`Set-PSReadLineKeyHandler` binds a key chord to a PSReadLine function or to a script block. Bindings last for the session, so set them in `$PROFILE`.

## Config
```powershell
Set-PSReadLineKeyHandler -Key UpArrow   -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Tab       -Function MenuComplete
Set-PSReadLineKeyHandler -Chord 'Ctrl+RightArrow' -Function ForwardWord
Set-PSReadLineKeyHandler -Chord 'Ctrl+Backspace'  -Function BackwardKillWord
Set-PSReadLineKeyHandler -Chord 'Ctrl+Delete'     -Function KillWord
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+e'   -Function ViEditVisually         # two-key chord: edit line in $EDITOR

# run PowerShell code with the current line
Set-PSReadLineKeyHandler -Chord 'Alt+s' -BriefDescription 'sudo' -ScriptBlock {
  $line = $null; $cursor = $null
  [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
  [Microsoft.PowerShell.PSConsoleReadLine]::Replace(0, $line.Length, "sudo $line")
}
```
Discover and inspect:
```powershell
Get-PSReadLineKeyHandler                         # all bound keys
Get-PSReadLineKeyHandler -Bound -Unbound         # include unbound functions
Get-PSReadLineKeyHandler -Chord 'Ctrl+r'
Remove-PSReadLineKeyHandler -Chord 'Ctrl+r'
```

## Notes
- Chord names: `Ctrl+`, `Alt+`, `Shift+` plus key names (`UpArrow`, `RightArrow`, `Backspace`, `F2`, letters); use `Ctrl+x,Ctrl+e` for sequences. List edit functions with `Get-PSReadLineKeyHandler -Bound -Unbound | Select Function`.
- Preset example: `F2` -> `SwitchPredictionView` (PSReadLine >= 2.2.0 only; guard on the version), `Enter` script block for transient prompts.
- `-ViMode Insert|Command` limits a binding in Vi edit mode.
- `Set-PSReadLineOption -EditMode Emacs` gives readline defaults (Ctrl-A, Ctrl-E, Ctrl-K, Ctrl-R, Alt-F...); Windows mode keeps Windows editing keys.
- Key detection: run `[Console]::ReadKey($true)` and press the key to see `Key`/`Modifiers`; some terminals do not deliver every chord, so confirm with ReadKey.
- 5.1 / PSReadLine 2.0.0 has the same handler cmdlets but fewer functions (no prediction-related ones).

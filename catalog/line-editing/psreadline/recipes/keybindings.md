---
capability: keybindings
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (docs, PSReadLine 2.4.5)
sources: https://learn.microsoft.com/powershell/module/psreadline/set-psreadlinekeyhandler, https://learn.microsoft.com/powershell/module/psreadline/set-psreadlineoption
---
# Key bindings and edit mode
Pick an edit mode, then bind chords to PSReadLine functions or script blocks with `Set-PSReadLineKeyHandler`. Changing `-EditMode` resets earlier bindings, so set it first.

## Config
```powershell
Set-PSReadLineOption -EditMode Emacs        # Windows (default on Windows) | Emacs | Vi
Set-PSReadLineKeyHandler -Chord Tab -Function MenuComplete          # bash-like completion menu
Set-PSReadLineKeyHandler -Chord Ctrl+d -Function DeleteCharOrExit
Set-PSReadLineKeyHandler -Chord Ctrl+Backspace -Function BackwardKillWord
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+l' -ScriptBlock { [Microsoft.PowerShell.PSConsoleReadLine]::Insert('Get-ChildItem') }   # chord sequence
Set-PSReadLineKeyHandler -Chord Ctrl+b -ScriptBlock {
  [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
  [Microsoft.PowerShell.PSConsoleReadLine]::Insert('build')
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
}
Get-PSReadLineKeyHandler            # list current bindings
Remove-PSReadLineKeyHandler -Chord Ctrl+b
```
Vi mode cursor feedback: `-ViModeIndicator Cursor` or `Script` with `-ViModeChangeHandler`. Letter keys in chords are lowercase; an uppercase letter needs `Shift` (`Ctrl+Shift+x` is a different chord from `Ctrl+x`).

## Notes
- Windows default edit mode emulates PowerShell/cmd/Visual Studio; Emacs and Vi are the alternatives. Non-Windows defaults to Emacs.
- Function names are listed by tab-completion on `-Function` and in the module's about_PSReadLine_Functions help; `SamplePSReadLineProfile.ps1` in the module folder has many examples.
- Bind in the profile (they do not persist). Terminal-reserved keys (Ctrl+Shift+...) may never reach PowerShell.
- Atuin's PowerShell init and PSFzf also bind Ctrl+R; load them after your own bindings or they will be overwritten.

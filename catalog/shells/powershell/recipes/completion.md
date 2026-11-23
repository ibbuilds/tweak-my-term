---
capability: completion
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (docs; PSReadLine key handler names verified against Set-PSReadLineKeyHandler reference)
sources: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/register-argumentcompleter, https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlinekeyhandler, https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/using-predictors
---
# Completion in PowerShell
Tab completes commands, parameters, paths and values natively. PSReadLine changes how matches display (cycle vs menu). Third-party tools add argument completers.

## Config
```powershell
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete      # list + arrow selection (like zsh menu-select)
Set-PSReadLineKeyHandler -Key Shift+Tab -Function TabCompletePrevious   # without a menu
Set-PSReadLineOption -ShowToolTips -CompletionQueryItems 100
```
Native-tool completions:
```powershell
# many CLIs print a PowerShell completion script; cache it, do not run it every start
kubectl completion powershell | Out-String | Invoke-Expression
gh completion -s powershell | Out-String | Invoke-Expression
# own completer for a native command
Register-ArgumentCompleter -Native -CommandName mytool -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  'build', 'test', 'deploy' | Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}
```

## Notes
- Default Tab in Windows edit mode is `TabCompleteNext` (cycles). `MenuComplete` shows a menu, `Complete` (Emacs mode) lists like bash.
- Case-insensitive by default; wildcards complete too (`cd *proj<Tab>`).
- Predictive IntelliSense can add history/plugin suggestions after the cursor, see line-editing (PSReadLine 2.1.0+/2.2.0+; plugin predictors need PowerShell 7.2+).
- `Register-ArgumentCompleter` is available in Windows PowerShell 5.1 as well; `-Native` for external programs.
- Each `tool completion powershell | Invoke-Expression` spawns a process (10-60 ms on Windows); load lazily or cache to a file in `$env:LOCALAPPDATA` and dot-source it.
- `Get-Command *foo*` and `Get-Help -Full` are the discoverability tools; completion text for `-ErrorAction` etc. comes from the parameter's enum/ValidateSet.

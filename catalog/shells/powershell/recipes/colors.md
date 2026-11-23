---
capability: colors
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine: option names listed from PSReadLine 2.0.0 in 5.1, `$PSStyle` absent in 5.1; docs for 7.2+ and PSReadLine 2.2+)
sources: https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlineoption, https://learn.microsoft.com/en-us/powershell/module/psreadline/get-psreadlineoption, https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/using-predictors
---
# Colors in PowerShell: typing, predictions, streams, output
Typing colors are PSReadLine tokens (`-Colors`), host stream colors are `$Host.PrivateData` (5.1) or `$PSStyle` (7.2+), file/table colors in 7.2+ use `$PSStyle`.

## Config
```powershell
$E = [char]27
$colors = @{
  Command = "$E[38;2;242;238;234m"; Parameter = "$E[38;2;154;142;143m"; Operator = "$E[38;2;110;98;100m"
  Variable = "$E[38;2;194;146;74m"; String = "$E[38;2;127;145;114m"; Number = "$E[38;2;194;146;74m"
  Type = "$E[38;2;133;151;173m"; Member = "$E[38;2;216;210;207m"; Keyword = "$E[38;2;224;32;30m"
  Comment = "$E[38;2;110;98;100m"; Default = "$E[38;2;216;210;207m"; Error = "$E[4;38;2;224;32;30m"
  Emphasis = "$E[1;38;2;224;32;30m"; Selection = "$E[48;2;77;18;22m"
}
if ((Get-Module PSReadLine).Version -ge [version]'2.2') {     # prediction colors only exist in newer PSReadLine
  $colors += @{ InlinePrediction = "$E[38;2;90;78;80m"; ListPrediction = "$E[38;2;154;142;143m"; ListPredictionSelected = "$E[48;2;77;18;22m" }
}
Set-PSReadLineOption -Colors $colors

# Windows PowerShell 5.1 and 7: stream colors (ConsoleColor names)
$Host.PrivateData.ErrorForegroundColor   = 'Red'
$Host.PrivateData.WarningForegroundColor = 'Yellow'
$Host.PrivateData.VerboseForegroundColor = 'DarkGray'
# PowerShell 7.2+: $PSStyle.Formatting.Error = $PSStyle.Foreground.BrightRed; $PSStyle.FileInfo.Directory = "$E[1;34m"
```

## Notes
- Token keys (machine, `Get-PSReadLineOption` on 2.0.0): `Command, Comment, ContinuationPrompt, Default, Emphasis, Error, Keyword, Member, Number, Operator, Parameter, Selection, String, Type, Variable`. `InlinePrediction` arrived with PSReadLine 2.1.0 (old name `PredictionColor` before that); `ListPrediction`, `ListPredictionSelected`, `ListPredictionTooltip` need 2.2.0+.
- Values are ANSI escape strings; plain `"$E[91m"` style works in 5.1. In PowerShell 7 use `` "`e[91m" `` or `$PSStyle`.
- `$PSStyle` does not exist in Windows PowerShell 5.1 (verified). In 7.2+ it also controls `$PSStyle.OutputRendering` (`Host`/`Ansi`/`PlainText`) and formatting for errors, tables, `Select-String`, and directory listings (`$PSStyle.FileInfo.*`).
- Background of Windows PowerShell's console is the terminal's; palette comes from the terminal scheme, so 16 ConsoleColor names follow it.
- PowerShell ignores `LS_COLORS` for `Get-ChildItem`; external tools like eza read it (`$env:LS_COLORS`, `$env:EZA_COLORS`).

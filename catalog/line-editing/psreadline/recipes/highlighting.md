---
capability: highlighting
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (docs, PSReadLine 2.4.5)
sources: https://learn.microsoft.com/powershell/module/psreadline/about/about_psreadline, https://learn.microsoft.com/powershell/module/psreadline/set-psreadlineoption
---
# Syntax highlighting
PSReadLine colours the command line by PowerShell token type and marks syntax errors. It is on by default in every version; what changes is the palette (see the colors recipe) and the error indicator in the prompt.

## Config
```powershell
# Token classes you can recolour with -Colors
#   Command Parameter Variable Operator Number Member Type String Keyword Comment Default
#   Emphasis (search match) Error Selection ContinuationPrompt
#   InlinePrediction ListPrediction ListPredictionSelected   (2.2+)
Set-PSReadLineOption -Colors @{ Command = 'Yellow'; String = 'DarkGreen'; Comment = 'DarkGray' }
Set-PSReadLineOption -ContinuationPrompt '>> '
```
The "Error" colour is used by the prompt-change indicator: PSReadLine inspects your `prompt` function and recolours part of it when the line has a syntax error; override detection with `-PromptText '> '`.

## Notes
- PSReadLine analyses the PowerShell AST, not other languages; native commands' arguments are plain strings.
- If a custom prompt (oh-my-posh, starship) is not recoloured on errors, pass `-PromptText` including trailing whitespace, or ignore: both prompt tools handle their own status colours.
- Windows PowerShell 5.1 with 2.0.0 colours tokens but lacks the prediction colour keys (`InlinePrediction`, `ListPrediction*`).
- Highlighting costs nothing noticeable; there is no switch to turn it off short of setting every colour to `Default`.

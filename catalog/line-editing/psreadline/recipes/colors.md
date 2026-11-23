---
capability: colors
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (docs; Colors key list from Microsoft Learn, PSReadLine 2.4.5)
sources: https://learn.microsoft.com/powershell/module/psreadline/set-psreadlineoption
---
# Colours
`Set-PSReadLineOption -Colors @{ Key = value }` recolours token classes. A value is a `ConsoleColor` name (follows the terminal's ANSI palette), or an ANSI escape for 256-colour or 24-bit colour.

## Config
```powershell
# PowerShell 7 : `e is the escape character.  Windows PowerShell 5.1 : "$([char]0x1b)[...m"
$e = [char]27
Set-PSReadLineOption -Colors @{
  Command            = "$e[38;2;137;180;250m"     # {palette.ansi.blue} as 24-bit RGB
  Parameter          = "$e[38;2;148;226;213m"     # cyan
  String             = "$e[38;2;166;227;161m"     # green
  Number             = "$e[38;2;250;179;135m"
  Variable           = "$e[38;2;203;166;247m"     # magenta
  Operator           = "$e[38;2;186;194;222m"
  Keyword            = "$e[38;2;203;166;247m"
  Type               = "$e[38;2;249;226;175m"     # yellow
  Member             = "$e[38;2;137;220;235m"
  Comment            = "$e[38;2;108;112;134m"     # {palette.ansi.brightBlack}
  Error              = "$e[38;2;243;139;168m"     # red
  Emphasis           = "$e[38;2;249;226;175m"
  Selection          = "$e[48;2;69;71;90m"        # background only
  Default            = 'White'
  ContinuationPrompt = 'DarkGray'
  InlinePrediction   = "$e[38;2;108;112;134m"     # 2.2+
  ListPrediction     = 'DarkYellow'               # 2.2+
  ListPredictionSelected = "$e[48;2;69;71;90m"    # 2.2+
}
```
Valid keys: `ContinuationPrompt Emphasis Error Selection Default Comment Keyword String Operator Variable Command Parameter Type Number Member InlinePrediction ListPrediction ListPredictionSelected`.

## Notes
- ConsoleColor names (`Red`, `DarkGray`...) go through the terminal's palette, so a terminal that already carries the look's ANSI colours recolours PSReadLine with no hex. Use RGB escapes only for non-ANSI shades.
- Windows PowerShell 5.1's built-in PSReadLine 2.0.0 does not know `InlinePrediction`/`ListPrediction*`: the call throws. Install >= 2.2 first (install-init recipe) or guard with a version check.
- Escapes: `5.1` cannot use `` `e `` (introduced in PowerShell 6); build the escape with `[char]27`/`[char]0x1b` for both editions as above.
- Set `Error` and prediction colours so they stay readable on the look's background; the default prediction colour is a dim grey that can vanish on some themes.

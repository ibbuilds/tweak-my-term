---
capability: performance
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (machine: Windows PowerShell 5.1.26100, median of 5; docs)
sources: https://learn.microsoft.com/powershell/module/psreadline/about/about_psreadline
---
# Performance
PSReadLine is compiled .NET running in-process: typing, highlighting and predictions add no per-keystroke process cost, unlike bash-based editors (ble.sh costs 24-60 ms per key on Windows Git Bash). The measurable cost is module import at shell start.

## Config
Measured on this machine (Windows PowerShell 5.1, `powershell -NoProfile -Command ...`, median of 5 runs, ms):

| command | median |
|---|---|
| `-Command 1` (baseline) | ~170 |
| `Import-Module PSReadLine -RequiredVersion 2.0.0` | 221 (+~50) |
| `Import-Module PSReadLine -RequiredVersion 2.4.5` | 236 (+~67) |

Take-aways: upgrading from 2.0.0 to 2.4.5 costs about 15 ms more at shell start; everything else is user-profile work. Keep the profile lean:
```powershell
# profile: load predictions only when a capable version exists, one conditional, no external processes
if ((Get-Module PSReadLine).Version -ge [version]'2.2.0') {
  Set-PSReadLineOption -PredictionSource History -PredictionViewStyle InlineView
}
```

## Notes
- Prefer `PredictionSource History` over `HistoryAndPlugin` unless you need plugin predictors: plugins load extra assemblies and can add latency to list view.
- A very large history file (`MaximumHistoryCount` in the tens of thousands) lengthens start-up slightly and prediction lookups; trim with `-MaximumHistoryCount` or by editing the history file.
- Prompt tools matter more than PSReadLine: oh-my-posh's generated init script adds seconds on cold start in some setups; see the prompt recipes.
- Numbers are one machine's noisy medians (profile excluded); re-measure with `Measure-Command { powershell -NoProfile -Command "..." }`.

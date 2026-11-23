---
capability: suggestions
tool: psreadline
os: windows, macos, linux
verified: 2026-11-23 (docs; failure mode machine-observed; PSReadLine 2.4.5)
sources: https://learn.microsoft.com/powershell/module/psreadline/set-psreadlineoption, https://learn.microsoft.com/powershell/module/psreadline/about/about_psreadline
---
# Predictive IntelliSense (history suggestions)
Predictions show a suggestion from history (and from prediction plugins) while you type: grey inline text, or a drop-down list. Disabled by default (`PredictionSource None`).

## Config
```powershell
# profile; needs PSReadLine >= 2.1 (History) / >= 2.2 (Plugin, HistoryAndPlugin, ListView)
Set-PSReadLineOption -PredictionSource History            # History | Plugin | HistoryAndPlugin | None
Set-PSReadLineOption -PredictionViewStyle InlineView      # InlineView (default) | ListView
# toggle live:  F2  switches between inline and list view
Set-PSReadLineKeyHandler -Chord RightArrow -Function ForwardChar     # accept whole inline suggestion at end of line
Set-PSReadLineKeyHandler -Chord Ctrl+RightArrow -Function ForwardWord # accept next word
```
Accepting: Right arrow or End takes the whole inline suggestion; Ctrl+Right takes one word (default key handlers in the Windows edit mode). ListView: Up/Down select, Enter accepts.

## Notes
- Windows PowerShell 5.1's built-in 2.0.0 has none of this: install a newer PSReadLine first (install-init recipe).
- Plugin predictors (for example Az.Tools.Predictor, CommandPrediction) feed `Plugin`/`HistoryAndPlugin`; they load when `PredictionSource` includes Plugin.
- Setting a prediction source from a non-interactive or redirected host throws "predictive suggestion feature cannot be enabled because the console output doesn't support virtual terminal processing or it's redirected" (observed here): only call it inside the interactive profile.
- Suggestion colour: `-Colors @{ InlinePrediction = ... }` (colors recipe).
- Sensitive lines are not added to history by default in 2.2+; add more with `-AddToHistoryHandler`.

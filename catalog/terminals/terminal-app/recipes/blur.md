---
capability: blur
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac, https://stackoverflow.com/questions/79814720/change-macos-terminal-theme-background-colour-programatically
---
# Background blur in Terminal
The User Guide (Text settings > Background > Color & Effects) has a blur slider next to opacity, with a second pair for inactive windows. In profile dumps the active-window value is a `BackgroundBlur` real; the exact range (assumed 0.0 to 1.0) and the inactive-window key names were not seen.

## Config
```sh
f="{look.name}.terminal"
plutil -insert BackgroundBlur -float 0.5 "$f"
```
Blur only shows when the background color has opacity below 1 (see the opacity recipe).

## Notes
- `BackgroundBlur` appears in an `defaults read` dump of the Pro profile in a community post (value 0). Its scale is inferred, so adjust in the UI once and read the number back from the exported file.
- Not scriptable through AppleScript as far as the sources read show.

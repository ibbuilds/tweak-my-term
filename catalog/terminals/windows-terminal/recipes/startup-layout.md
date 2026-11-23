---
capability: startup-layout
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/startup, https://learn.microsoft.com/windows/terminal/command-line-arguments
---
# Startup layout in Windows Terminal
Set `startupActions` to a string in `wt` command-line syntax: commands separated by `;`. It applies only when the terminal is launched without command-line arguments. Alternatively, restore the previous layout with `firstWindowPreference`.

## Config
Top-level keys:
```jsonc
"startupActions": "new-tab ; split-pane -V -s 0.3 ; focus-tab -t 0",
"firstWindowPreference": "defaultProfile",
"launchMode": "default",
"initialCols": 150,
"initialRows": 40,
"centerOnLaunch": true
```
Remember the previous windows instead: `"firstWindowPreference": "persistedWindowLayout"`.

## Notes
- `split-pane` flags: `-V` / `-H` direction, `-s` size as a fraction (`.4` = 40%), `-p` profile, `-d` directory. `new-tab` takes `-p`, `-d`, `--title`, `--tabColor`, `--colorScheme`, and a trailing command line.
- `firstWindowPreference` accepts `defaultProfile` (default) and `persistedWindowLayout`. The saved layout holds window position/size/name and tabs/panes with profiles, not pane contents.
- `launchMode`: `default`, `maximized`, `fullscreen`, `focus`, `maximizedFocus`. `initialCols`/`initialRows` are ignored when maximized; `initialPosition` is `"x,y"` pixels.
- `windowingBehavior`: `useNew` (default), `useExisting`, `useAnyExisting` controls whether new launches add tabs to an existing window.
- Verify the string by running `wt` with the same commands on the command line first.

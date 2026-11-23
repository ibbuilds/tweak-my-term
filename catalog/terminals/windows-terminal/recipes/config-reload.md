---
capability: config-reload
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/color-schemes, https://learn.microsoft.com/windows/terminal/install
---
# Config reload in Windows Terminal
Saving `settings.json` updates all open windows without a restart. There is no reload command to run. A broken file shows a warning and keeps the last good settings or defaults.

## Config
Nothing to set. Edit and save:
```text
{wt-settings}   (packaged stable: %LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json)
```
Open it from the app: `Ctrl+Shift+,` (action `openSettings` with `"target": "settingsFile"`).

## Notes
- The Settings UI rewrites the whole file and drops formatting; edit by merging into the parsed JSONC, then write it back, and keep a backup copy.
- Some keys need a new window or instance: `showTabsInTitlebar`, `useAcrylicInTabRow`, `showTerminalTitleInTitlebar`, `antialiasingMode`.
- A changed shader or background image is re-read on save; a rebuilt image at the same path may keep showing the cached picture, so use a new file name.
- Validation is manual: strip comments/trailing commas and parse, then check keys against the schema (https://aka.ms/terminal-profiles-schema).
- Detect the installed channel before choosing a path: packaged stable, packaged Preview, or unpackaged (see `{wt-settings}` resolution).

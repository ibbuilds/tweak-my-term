---
capability: startup-layout
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/command-line-options.html, https://docs.kde.org/stable_kf6/en/konsole/konsole/commandreference.html, https://blogs.kde.org/2024/06/11/konsole-layout-automation-part-1
---
# Startup layout in Konsole
Two launch-time mechanisms; call them from a desktop launcher or alias.

## Config
1. Saved JSON layout: arrange tabs and splits, choose View > Save tab layout to file, then
```sh
konsole --layout ~/.config/konsole-layouts/dev.json
```
The handbook also lists built-in 2x2, 2x1 and 1x2 layouts on the toolbar. The JSON schema is not documented in the pages read, so generate it with the Save command rather than by hand.
2. Tabs from a file, one tab per line, fields separated by `;;`:
```
title: build ;; workdir: ~/src ;; profile: {look.name} ;; command: make watch
```
```sh
konsole --tabs-from-file ~/.config/konsole-tabs.txt
```
`title:`, `workdir:`, `profile:` and `command:` are the documented fields.

## Notes
- `--new-tab` adds a tab to an existing window; `--workdir DIR` sets the start folder; `--hold` keeps a failed first session open.
- Tab files cannot describe splits; use a JSON layout for those.
- Konsole does not restore a layout on plain launch; the launcher has to pass the flag.

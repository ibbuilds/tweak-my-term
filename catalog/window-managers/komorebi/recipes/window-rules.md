---
capability: window-rules
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/common-workflows/floating-applications.html, https://lgug2z.github.io/komorebi/common-workflows/ignore-windows.html, https://lgug2z.github.io/komorebi/common-workflows/force-manage-windows.html, https://raw.githubusercontent.com/LGUG2Z/komorebi/v0.1.41/schema.json
---
# Window rules in komorebi
Rules in komorebi.json match a window by `kind` (`Exe`, `Class`, `Title`, `Path`) and `id`, with a `matching_strategy` (`Equals`, `StartsWith`, `EndsWith`, `Contains`, `Regex`, `DoesNotEqual`, ...). An array of identifiers is a composite rule where all must match.

## Config
```json
{
  "floating_applications": [
    { "kind": "Exe", "id": "alacritty.exe", "matching_strategy": "Equals" }
  ],
  "float_rule_placement": "CenterAndResize",
  "floating_window_aspect_ratio": [16, 9],
  "ignore_rules": [
    { "kind": "Title", "id": "scratch", "matching_strategy": "Equals" }
  ],
  "manage_rules": [
    [
      { "kind": "Exe", "id": "wezterm-gui.exe", "matching_strategy": "Equals" },
      { "kind": "Title", "id": "term", "matching_strategy": "StartsWith" }
    ]
  ],
  "monitors": [ { "workspaces": [ {
    "name": "term",
    "layout": "VerticalStack",
    "initial_workspace_rules": [
      { "kind": "Exe", "id": "WindowsTerminal.exe", "matching_strategy": "Equals" }
    ]
  } ] } ]
}
```

## Notes
- Meaning: `floating_applications` float (centered and resized by aspect ratio), `ignore_rules` leave the window alone entirely, `manage_rules` force-tile a window komorebi skipped, `initial_workspace_rules` send the window to that workspace when it opens (`workspace_rules` pins it there permanently).
- No per-window pixel size or position rule exists; `float_rule_placement` is `None`, `Center` or `CenterAndResize`.
- Likely exe names: Windows Terminal `WindowsTerminal.exe`, WezTerm `wezterm-gui.exe`, Alacritty `alacritty.exe`. Confirm in Task Manager or with `komorebic visible-windows`.
- The community applications.json lists Windows Terminal under `tray_and_multi_window` (so closing a window does not leave a blank tile). Keep `app_specific_configuration_path` pointed at it; `komorebic fetch-asc` updates it.
- A window can also be floated live with `komorebic toggle-float`, or ruled for the session only with `komorebic session-float-rule`.

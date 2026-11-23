---
capability: keybindings
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/example-configurations.html, https://lgug2z.github.io/komorebi/cli/start.html
---
# Keybindings in komorebi
komorebi has no hotkeys of its own. `whkd` reads `~/.config/whkdrc` (or `$Env:WHKD_CONFIG_HOME`): key combo left of the colon, shell command right. AutoHotkey (`--ahk`) is the alternative. Start whkd with `komorebic start --whkd`.

## Config
```text
.shell pwsh                        # powershell | pwsh | cmd, must match your shell

alt + o                 : taskkill /f /im whkd.exe; Start-Process whkd -WindowStyle hidden   # reload whkd
alt + enter             : wt                                                                  # launch a terminal
alt + q                 : komorebic close
alt + h                 : komorebic focus left
alt + l                 : komorebic focus right
alt + shift + h         : komorebic move left
alt + shift + l         : komorebic move right
alt + shift + return    : komorebic promote
alt + oem_plus          : komorebic resize-axis horizontal increase
alt + oem_minus         : komorebic resize-axis horizontal decrease
alt + t                 : komorebic toggle-float
alt + shift + f         : komorebic toggle-monocle
alt + x                 : komorebic flip-layout horizontal
alt + shift + r         : komorebic retile
alt + 1                 : komorebic focus-workspace 0
alt + shift + 1         : komorebic move-to-workspace 0
```

## Notes
- Edits to whkdrc need whkd restarted (the `alt + o` line above). `komorebic reload-configuration` does not reload whkdrc.
- Key names: letters, digits and arrows as expected; punctuation uses Windows virtual key names lowercased without `VK_` (`oem_plus`, `oem_1`, `oem_4`).
- whkd can override Windows limits on `win` bindings, but `win + l` still needs a registry change to stop locking the PC.
- Per-app bindings: `alt + n [ Firefox : echo "hello" ]` blocks, keyed by process name.
- `alt + i` shows an overlay of the example shortcuts (`komorebic toggle-shortcuts`).
- Workspace indexes are zero-based in komorebic (`focus-workspace 0` is the first).

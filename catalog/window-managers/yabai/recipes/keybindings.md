---
capability: keybindings
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25, skhd)
sources: https://github.com/asmvik/skhd, https://github.com/asmvik/yabai/wiki/Commands
---
# Keybindings for yabai (via skhd)
yabai has no hotkeys of its own. skhd, a separate daemon, runs `yabai -m ...` commands from `~/.config/skhd/skhdrc`. Syntax is `<modifiers> - <key> : <command>`; modifiers are `alt`, `cmd`, `ctrl`, `shift` joined with `+`.

## Config (`~/.config/skhd/skhdrc`)
```sh
alt - return : open -na Ghostty          # new terminal window; use the app name
alt - h : yabai -m window --focus west
alt - j : yabai -m window --focus south
alt - k : yabai -m window --focus north
alt - l : yabai -m window --focus east
shift + alt - h : yabai -m window --swap west
shift + alt - j : yabai -m window --swap south
shift + alt - k : yabai -m window --swap north
shift + alt - l : yabai -m window --swap east
alt - e : yabai -m space --layout bsp
alt - s : yabai -m space --layout stack
alt - f : yabai -m window --toggle float
alt - b : yabai -m space --balance
```

## Notes
- skhd hot-reloads the file on save; `skhd -r` forces it. Find a key's code with `skhd -o`.
- skhd needs the Accessibility permission (restart it after allowing) and Secure Keyboard Entry off in the terminal.
- Keys that switch Spaces (`yabai -m space --focus N`) are not in the docs' SIP-gated list, but if they fail on the user's macOS, use the native shortcuts (System Settings, Keyboard, Mission Control) rather than disabling SIP.
- `alt` clashes with Meta in shells and tmux; `ctrl + alt` or `cmd + alt` is a safe pair. Process-specific bindings and `.blacklist [ "kitty" ]` are in the skhd README.

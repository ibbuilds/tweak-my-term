---
capability: window-rules
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Commands, https://github.com/asmvik/yabai/blob/master/doc/yabai.asciidoc
---
# Window rules in yabai
`yabai -m rule --add` matches by application name (`app=`, a POSIX extended regex) and optionally `title=`, `role=`, `subrole=`. Rules apply to windows that open after the rule is added. Works with SIP on, except `sticky`, `sub-layer`, `opacity` and `scratchpad` keys, which do not (do not use them).

Find the exact app name of a running terminal: `yabai -m query --windows | jq '.[].app'`. Usual names: `iTerm2`, `Ghostty`, `kitty`, `WezTerm`, `Alacritty`, `Terminal`.

## Config (`~/.config/yabai/yabairc`)
```sh
# tile these terminals (the default for managed apps in a bsp Space)
yabai -m rule --add app="^(iTerm2|Ghostty|WezTerm|Alacritty)$" manage=on

# keep kitty floating, 2/3 of the screen, centered-left (rows:cols:x:y:w:h)
yabai -m rule --add app="^kitty$" manage=off grid=1:3:0:0:2:1

# send Ghostty windows to Space 2
yabai -m rule --add app="^Ghostty$" space=2
```

## Notes
- `manage=off` floats, `manage=on` tiles. `grid=` sizes and places a floating window and respects the Space padding.
- `space=N` sends the window to Space N; `space=^N` also follows it. Moving a window to another Space is not in the docs' SIP-gated list, but the wiki states only `window --space N --focus` works either way; if it fails on the user's macOS, drop `space=` rather than disabling SIP.
- Match one window with `title="^scratch$"`; invert with `app!=`.
- Apply rules to open windows with `yabai -m rule --apply`. Re-running yabairc by hand adds duplicate rules; restart the service instead (see config-reload).
- Label a rule (`label=terms`) to remove it later with `yabai -m rule --remove terms`.

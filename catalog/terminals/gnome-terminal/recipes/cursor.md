---
capability: cursor
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Cursor in GNOME Terminal
Shape and blinking are profile keys. Cursor colors are in the palette recipe (`cursor-colors-set`, `cursor-background-color`, `cursor-foreground-color`).

## Config
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
# look cursorShape: block -> 'block', bar -> 'ibeam', underline -> 'underline'
gsettings set "$PROFILE" cursor-shape "'block'"
# look cursorBlink: true -> 'on', false -> 'off' (default 'system' follows the desktop setting)
gsettings set "$PROFILE" cursor-blink-mode "'off'"
```

## Notes
- `hollow-block` has no key; use `'block'`.
- `text-blink-mode` (`never`, `focused`, `unfocused`, `always`; default `always`) controls blinking text, not the cursor.
- Applications can override the shape with escape sequences.

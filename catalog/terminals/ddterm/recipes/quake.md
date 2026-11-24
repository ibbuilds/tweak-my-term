---
capability: quake
tool: ddterm
os: linux
verified: 2026-11-23 (docs, ddterm 64.1.0)
sources: https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/schemas/org.gnome.shell.extensions.ddterm.gschema.xml, https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/docs/CommandLine.md
---
# Drop-down (quake) terminal in ddterm
ddterm is itself a drop-down terminal: it slides in from a screen edge on a hotkey. Position, size, focus-loss behavior and the hotkey are dconf keys.

## Config
```sh
S=org.gnome.shell.extensions.ddterm   # see the tool notes if gsettings says No such schema
gsettings set $S window-position 'top'
gsettings set $S window-size 0.45
gsettings set $S window-maximize false
gsettings set $S hide-when-focus-lost false
gsettings set $S window-above true
gsettings set $S ddterm-toggle-hotkey "['F12']"
```

## Notes
- `window-position` is `top`, `bottom`, `left` or `right`; `window-size` is a fraction 0.0 to 1.0 of the work area (default 0.6); `workarea-size` (default 1.0) and `workarea-alignment` (`start`, `center`, `end`) shrink and place the window along the edge.
- `window-monitor` is `current` (default), `primary`, `focus` or `connector` (then set `window-monitor-connector`).
- Defaults: `hide-when-focus-lost` true, `ddterm-toggle-hotkey` `['F12']`, `toggle-focus` false. `ddterm-activate-hotkey` (default empty) shows and focuses without toggling. Hotkeys are lists of GTK accelerator strings, e.g. `['<Super>grave']`.
- Animation: `show-animation` / `hide-animation` (mode names such as `linear`, `ease-out-cubic`, `disable`) and `show-animation-duration` / `hide-animation-duration` (seconds, 0.001 to 1.0, default 0.15).
- `panel-icon-type` (`none`, `menu-button`, `toggle-button`, `toggle-and-menu-button`) controls the top-bar icon.
- Toggle from a script or a custom key binding: `gapplication action com.github.amezin.ddterm toggle`.

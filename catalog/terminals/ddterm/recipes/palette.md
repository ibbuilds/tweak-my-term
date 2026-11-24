---
capability: palette
tool: ddterm
os: linux
verified: 2026-11-23 (docs, ddterm 64.1.0)
sources: https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/schemas/org.gnome.shell.extensions.ddterm.gschema.xml
---
# Palette in ddterm
Colors are dconf keys. Turn off `use-theme-colors`, then set foreground, background and the 16-color `palette` (type `as`, order: 8 normal then 8 bright, i.e. black..white, brightBlack..brightWhite). Values are `#rrggbb` strings.

## Config
```sh
S=org.gnome.shell.extensions.ddterm   # see the tool notes if gsettings says No such schema
gsettings set $S use-theme-colors false
gsettings set $S foreground-color "'{palette.foreground}'"
gsettings set $S background-color "'{palette.background}'"
gsettings set $S palette "['{palette.ansi.black}', '{palette.ansi.red}', '{palette.ansi.green}', '{palette.ansi.yellow}', '{palette.ansi.blue}', '{palette.ansi.magenta}', '{palette.ansi.cyan}', '{palette.ansi.white}', '{palette.ansi.brightBlack}', '{palette.ansi.brightRed}', '{palette.ansi.brightGreen}', '{palette.ansi.brightYellow}', '{palette.ansi.brightBlue}', '{palette.ansi.brightMagenta}', '{palette.ansi.brightCyan}', '{palette.ansi.brightWhite}']"
# cursor and selection colors (only used when the *-colors-set key is true)
gsettings set $S cursor-colors-set true
gsettings set $S cursor-background-color "'{palette.cursor}'"
gsettings set $S cursor-foreground-color "'{palette.cursorText}'"
gsettings set $S highlight-colors-set true
gsettings set $S highlight-background-color "'{palette.selectionBackground}'"
gsettings set $S highlight-foreground-color "'{palette.selectionForeground}'"
gsettings set $S bold-color-same-as-fg true
```

## Notes
- String values need inner single quotes (GVariant syntax), hence the `"'...'"` quoting. Omit the cursor and highlight lines when the look spec leaves those tokens unset.
- With `use-theme-colors` true (the default) the colors follow the GTK theme and the color keys are ignored.
- `bold-is-bright` defaults to false; leave it false to keep a tuned palette. `bold-color` only applies when `bold-color-same-as-fg` is false.
- `theme-variant` (`system`, `light`, `dark`) only affects the window chrome, not the palette.
- Schema defaults for reference: foreground `#171421`, background `#ffffff`.

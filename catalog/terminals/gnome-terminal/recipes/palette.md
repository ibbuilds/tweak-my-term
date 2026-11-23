---
capability: palette
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml, https://wiki.gnome.org/Apps/Terminal/FAQ
---
# Palette in GNOME Terminal
Colors are profile keys in dconf (no file). Turn off `use-theme-colors`, then set foreground, background and the 16-color `palette` (order: 8 normal then 8 bright, i.e. black..white, brightBlack..brightWhite). Values are hex strings.

## Config
Set `PROFILE` once (see the profiles recipe), then:
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$PROFILE" use-theme-colors false
gsettings set "$PROFILE" foreground-color "'{palette.foreground}'"
gsettings set "$PROFILE" background-color "'{palette.background}'"
gsettings set "$PROFILE" palette "['{palette.ansi.black}', '{palette.ansi.red}', '{palette.ansi.green}', '{palette.ansi.yellow}', '{palette.ansi.blue}', '{palette.ansi.magenta}', '{palette.ansi.cyan}', '{palette.ansi.white}', '{palette.ansi.brightBlack}', '{palette.ansi.brightRed}', '{palette.ansi.brightGreen}', '{palette.ansi.brightYellow}', '{palette.ansi.brightBlue}', '{palette.ansi.brightMagenta}', '{palette.ansi.brightCyan}', '{palette.ansi.brightWhite}']"
# cursor and selection colors (only used when the *-colors-set key is true)
gsettings set "$PROFILE" cursor-colors-set true
gsettings set "$PROFILE" cursor-background-color "'{palette.cursor}'"
gsettings set "$PROFILE" cursor-foreground-color "'{palette.cursorText}'"
gsettings set "$PROFILE" highlight-colors-set true
gsettings set "$PROFILE" highlight-background-color "'{palette.selectionBackground}'"
gsettings set "$PROFILE" highlight-foreground-color "'{palette.selectionForeground}'"
gsettings set "$PROFILE" bold-color-same-as-fg true
```

## Notes
- String values need inner single quotes (GVariant syntax), hence the `"'...'"` quoting. Omit the cursor/highlight lines when the look spec leaves those tokens unset.
- With `use-theme-colors=true` (the default) foreground and background follow the GTK theme and the two color keys are ignored.
- `bold-is-bright` (default false) switches bold on the first 8 colors to their bright variants; leave false to keep a tuned palette.
- The same keys can be loaded in one go with `dconf load` (see the profiles recipe).
- Light/dark: global `org.gnome.Terminal.Legacy.Settings theme-variant` (`system`, `light`, `dark`) only affects the window chrome, not the palette.

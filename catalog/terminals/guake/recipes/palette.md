---
capability: palette
tool: guake
os: linux
verified: 2026-11-23 (docs, Guake 3.10.1)
sources: https://github.com/Guake/guake/blob/master/guake/data/org.guake.gschema.xml, https://github.com/Guake/guake/blob/master/guake/guake_app.py
---
# Palette in Guake
One string key, `guake.style.font palette`: colon-separated colors, 18 entries in this order: the 16 ANSI colors (black..white, brightBlack..brightWhite), then the foreground (index 16), then the background (index 17). Guake loads each entry with `Gdk.RGBA.parse`, so `#RRGGBB` works (the built-in themes use the 12-digit `#RRRRGGGGBBBB` form, which also parses).

## Config
```sh
gsettings set guake.style.font palette "'{palette.ansi.black}:{palette.ansi.red}:{palette.ansi.green}:{palette.ansi.yellow}:{palette.ansi.blue}:{palette.ansi.magenta}:{palette.ansi.cyan}:{palette.ansi.white}:{palette.ansi.brightBlack}:{palette.ansi.brightRed}:{palette.ansi.brightGreen}:{palette.ansi.brightYellow}:{palette.ansi.brightBlue}:{palette.ansi.brightMagenta}:{palette.ansi.brightCyan}:{palette.ansi.brightWhite}:{palette.foreground}:{palette.background}'"
gsettings set guake.style.font palette-name "'Custom'"
gsettings set guake.style.font bold-is-bright false
```

## Notes
- The value is one GVariant string, so keep the outer `"'...'"` quoting. All 18 entries are required; with 16 or fewer Guake falls back to a transparent-black foreground and a default dark background (guake_app.py).
- `palette-name` only labels the choice in the Preferences dialog; the Preferences code uses `Custom` for hand-set palettes.
- No separate cursor or selection color keys exist in the schema (`guake.style` has only `cursor-shape` and `cursor-blink-mode`).
- Background alpha comes from `guake.style.background transparency`, not from the palette; see the opacity recipe.
- `guake.style.font allow-bold` (default true) can disable bold rendering; `bold-is-bright` defaults to false.
- Defaults: `palette-name` `'Tango'`.

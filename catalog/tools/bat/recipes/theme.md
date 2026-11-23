---
capability: theme
tool: bat
os: windows, macos, linux
verified: 2026-11-23 (bat 0.26.1 on Windows 11: custom .tmTheme built with `bat cache --build`, listed and rendered with 24-bit colors)
sources: https://github.com/sharkdp/bat#highlighting-theme, https://github.com/sharkdp/bat#8-bit-themes, https://github.com/sharkdp/bat#adding-new-themes
---
# Theme bat from the look-spec palette

Three options, cheapest first: (1) `ansi`/`base16` themes that use the terminal's own 16 colors (zero conversion, palette changes apply instantly), (2) an existing named theme, (3) a generated `.tmTheme` file with exact hex colors.

## Config
1. Follow the terminal palette (config file `--theme="ansi"`, or env):
```sh
export BAT_THEME=ansi          # or base16 (uses 4-bit colors per the base16 styling guide)
```
```powershell
[Environment]::SetEnvironmentVariable('BAT_THEME','ansi','User')
```
`bat --list-themes` shows what is built in: `1337, Catppuccin Frappe/Latte/Macchiato/Mocha, Coldark-Cold, Coldark-Dark, DarkNeon, Dracula, GitHub, Monokai Extended (+Bright/Light/Origin), Nord, OneHalfDark, OneHalfLight, Solarized (dark/light), Sublime Snazzy, TwoDark, Visual Studio Dark+, ansi, base16, base16-256, gruvbox-dark, gruvbox-light, zenburn` (0.26.1). `base16-256` is only for tinted-shell, do not use it otherwise.

2. Dark/light switching: `--theme-dark=<name>` / `--theme-light=<name>` or `BAT_THEME_DARK` / `BAT_THEME_LIGHT`, with `--theme=auto:system` where the OS reports it.

3. Exact palette. Save as `<bat config dir>/themes/<name>.tmTheme` (`bat --config-dir`; the file name is the theme name), then `bat cache --build`, then `--theme=<name>`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>name</key><string>tmt</string>
<key>settings</key><array>
 <dict><key>settings</key><dict>
  <key>background</key><string>{palette.background}</string>
  <key>foreground</key><string>{palette.foreground}</string>
  <key>caret</key><string>{palette.cursor}</string>
  <key>selection</key><string>{palette.selectionBackground}</string>
  <key>lineHighlight</key><string>{palette.selectionBackground}</string>
  <key>gutterForeground</key><string>{palette.ansi.brightBlack}</string>
 </dict></dict>
 <dict><key>name</key><string>Comment</string><key>scope</key><string>comment, punctuation.definition.comment</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.brightBlack}</string><key>fontStyle</key><string>italic</string></dict></dict>
 <dict><key>name</key><string>String</string><key>scope</key><string>string</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.green}</string></dict></dict>
 <dict><key>name</key><string>Constant</string><key>scope</key><string>constant.numeric, constant.language, constant.character, constant.other</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.yellow}</string></dict></dict>
 <dict><key>name</key><string>Keyword</string><key>scope</key><string>keyword, storage</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.red}</string></dict></dict>
 <dict><key>name</key><string>Function</string><key>scope</key><string>entity.name.function, support.function, meta.function-call</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.blue}</string></dict></dict>
 <dict><key>name</key><string>Type</string><key>scope</key><string>entity.name.type, entity.name.class, support.type, support.class</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.cyan}</string></dict></dict>
 <dict><key>name</key><string>Variable</string><key>scope</key><string>variable.parameter, variable.other</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.foreground}</string></dict></dict>
 <dict><key>name</key><string>Invalid</string><key>scope</key><string>invalid</string>
  <key>settings</key><dict><key>foreground</key><string>{palette.ansi.brightRed}</string></dict></dict>
</array></dict></plist>
```
Replace each `{palette.*}` with the resolved hex.

Set it for every shell via the config file (see `config.md`): `--theme="tmt"`.

## Notes
- Truecolor: the tmTheme renders in 24-bit only when `COLORTERM=truecolor` is set; otherwise bat quantizes to the 256-color cube (observed: 38;5;N instead of 38;2;R;G;B). Windows Terminal, WezTerm, kitty, iTerm2 and Ghostty set it or accept it; add `export COLORTERM=truecolor` where the terminal does not.
- A theme's `background` is only used for bat's own padding/line-highlight decisions; bat does not repaint the terminal background (tested: output had no background SGR).
- Only `.tmTheme` is supported, not `.sublime-color-scheme` (README). Existing themes in tmTheme form: https://github.com/catppuccin/bat and the Sublime Text ecosystem. Delta and yazi accept the same files (see their entries).
- The `ansi` theme only uses the 8 basic colors; `base16` adds the bright variants. They honor the palette, so contrast is as good as the palette's `ansi.*` on `background`.
- Check: `bat --list-themes --color=never | grep tmt`; `bat --theme=tmt --color=always --style=plain file.rs`.

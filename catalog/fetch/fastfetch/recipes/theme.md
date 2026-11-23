---
capability: theme
tool: fastfetch
os: windows, macos, linux
verified: 2026-11-23 (Color-Format-Specification wiki; hex, @N and named colors rendered on fastfetch 2.71.0, Windows 11; display section matches a working config)
sources: https://github.com/fastfetch-cli/fastfetch/wiki/Color-Format-Specification, https://github.com/fastfetch-cli/fastfetch/wiki/Configuration
---
# Theme fastfetch from the look-spec palette

Colors appear in `display.color` (keys, title, output, separator), `display.bar`, `display.percent`, `logo.color` and in `{#...}` format placeholders. A color is a hex string, a name, an `@N` 256-color index or raw SGR.

## Config
Accepted color formats (wiki): `#RRGGBB` / `#RGB` (v2.42.0+), `@0`-`@255` (v2.57.0+), names (`red`, `light_red`, prefixes `bold_ dim_ italic_ underline_ bright_ ...`, e.g. `bold_underline_red`), raw SGR (`38;2;255;0;0`, `1;35`). In format strings `{#...}` takes the same value, and hex needs two `#`: `{##FF0000}`.
```jsonc
{
  "display": {
    "separator": "  ",
    "color": {
      "keys": "{palette.ansi.brightBlack}",
      "title": "{palette.foreground}",
      "output": "{palette.foreground}",
      "separator": "{palette.ansi.brightBlack}"
    },
    "bar": {
      "width": 12,
      "char": { "elapsed": "━", "total": "━" },
      "border": { "left": "", "right": "" },
      "color": { "elapsed": "{palette.ansi.red}", "total": "{palette.selectionBackground}" }
    },
    "percent": {
      "type": ["num"],
      "color": { "green": "{palette.ansi.green}", "yellow": "{palette.ansi.yellow}", "red": "{palette.ansi.red}" }
    }
  },
  "logo": { "color": { "1": "{palette.ansi.red}", "2": "{palette.ansi.brightBlack}" } }
}
```
Terminal-following (palette changes apply automatically): use names: `"keys": "light_black"`, `"title": "white"`, `"separator": "light_black"`, logo `"1": "red"`.
Inline: `{ "type": "custom", "format": "{#red}error{#}  {#green}ok{#}  {#light_black}dim{#}" }`. Per-module key color: `"keyColor": "{palette.ansi.blue}"`.
Palette strip module for showing the active theme: `{ "type": "colors", "symbol": "circle" }` (options in the JSON schema).

## Notes
- `bright_` is an alias for `bold_` (wiki), so `bright_black` is bold black, not gray: use `light_black` for dim gray text.
- Verified output: `"keys": "#9A8E8F"` produced `38;2;154;142;143`, `"@244"` produced `38;5;244`, `bold_white` produced `1;37`.
- Raw SGR also works and is also valid (`38;2;R;G;B`), at the cost of readability; prefer hex.
- Hex in terminals without truecolor degrades per the terminal; use names there.
- `display.percent.type` is a bitmask or array of flags (`num`, `bar`, `hide-others`, `num-color`, `bar-monochrome`); `["num"]` shows only a number, `9` is the default (colored number).
- Check contrast of `keys` (`ansi.brightBlack`) on `background` (at least 3:1), keys are labels not body text.
- Keys and titles can be recolored per run: `fastfetch --color-keys '#9A8E8F'`; config values win over defaults only when the CLI option is absent.

---
capability: ligatures
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/font-shaping.html, https://wezterm.org/config/lua/wezterm/font_with_fallback.html
---
# Ligatures in WezTerm
Ligatures are on by default whenever the font provides them (HarfBuzz shaping). Turn them off with `harfbuzz_features`.

## Config
Ligatures on (default, nothing to set), or state it explicitly:
```lua
config.harfbuzz_features = { 'calt=1', 'clig=1', 'liga=1' }
```
Ligatures off, all fonts:
```lua
config.harfbuzz_features = { 'calt=0', 'clig=0', 'liga=0' }
```
Off for one font only (since 20220101-133340-7edc5b5a):
```lua
config.font = wezterm.font_with_fallback {
  { family = '{font.family}', harfbuzz_features = { 'calt=0', 'clig=0', 'liga=0' } },
  'Symbols Nerd Font Mono',
}
```

## Notes
- Map `font.ligatures: true` to the first form (or no setting), `false` to the second.
- The font itself must ship ligature tables (JetBrains Mono, Fira Code, Cascadia Code do; many fonts do not).
- Stylistic sets use the same list, for example `'ss01'` or `'zero'`; names depend on the font.

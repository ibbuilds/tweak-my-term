---
capability: keybindings
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/keys.html, https://wezterm.org/config/default-keys.html
---
# Keybindings in WezTerm
`config.keys` is a list of `{ key, mods, action }` tables; `action` is a `wezterm.action.*` value. Mods: `SUPER`/`CMD`/`WIN`, `CTRL`, `SHIFT`, `ALT`/`OPT`/`META`, `LEADER`, joined with `|`.

## Config
```lua
local act = wezterm.action
config.keys = {
  { key = 't', mods = 'CTRL|SHIFT', action = act.SpawnTab 'CurrentPaneDomain' },
  { key = 'd', mods = 'CTRL|SHIFT', action = act.SplitHorizontal { domain = 'CurrentPaneDomain' } },
  { key = 'f', mods = 'CTRL|SHIFT', action = act.ToggleFullScreen },
  { key = 'm', mods = 'CMD', action = act.DisableDefaultAssignment },   -- unbind a default
  { key = 'y', mods = 'CMD', action = act.SpawnCommandInNewTab { args = { 'top' } } },
}
-- Optional leader key: CTRL-a, active for 1 second; bindings with LEADER in mods fire only while it is active
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }
```
Look spec `keybindings: [{ keys, action, scope }]`: translate `keys` to `key` + `mods` (for example `ctrl+shift+d` -> `key = 'd', mods = 'CTRL|SHIFT'`) and `action` to the nearest `wezterm.action`.

## Notes
- Default bindings stay active; replace all of them with `config.disable_default_key_bindings = true` (documented on the default-keys page) or unbind single ones with `DisableDefaultAssignment`.
- Bare `key = 'N'` with `CMD` can match differently since 20220624: use `'mapped:N'` or `'phys:N'` prefixes, or `key_map_preference`, when layouts matter.
- Defaults to know (default-keys page): `CTRL+SHIFT+R` reload config, `CTRL+SHIFT+T` new tab, `CTRL+Tab` next tab, `CTRL+SHIFT+ALT+%` / `"` split, `ALT+Enter` fullscreen.
- Keep one `config.keys` table: a second assignment replaces the first.

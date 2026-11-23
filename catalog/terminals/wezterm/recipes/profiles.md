---
capability: profiles
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/launch_menu.html, https://wezterm.org/config/lua/config/default_domain.html, https://wezterm.org/config/launch.html
---
# Profiles in WezTerm
WezTerm has no profile object. The equivalent is `launch_menu` (entries shown in the launcher, `SpawnCommand` tables) plus domains (`WslDomain`, SSH domains) and key bindings that spawn a given program.

## Config
```lua
config.launch_menu = {
  { label = 'PowerShell', args = { 'powershell.exe', '-NoLogo' } },
  { label = 'Git Bash', args = { 'C:/Program Files/Git/usr/bin/bash.exe', '-i', '-l' } },   -- Windows example path
  { label = 'Bash', args = { 'bash', '-l' }, cwd = '~' },
}
-- open the launcher with a key
config.keys = {
  { key = 'l', mods = 'ALT', action = wezterm.action.ShowLauncher },
}
-- spawn one specific entry directly
-- { key = 'p', mods = 'CTRL|SHIFT|ALT', action = wezterm.action.SpawnCommandInNewTab { args = { 'powershell.exe' } } }
```

## Notes
- `launch_menu` since 20200503-171512-b13ef15f. Per-entry `cwd` and `set_environment_variables` are supported.
- Per-profile appearance is not built in; use `wezterm.action_callback` plus `window:set_config_overrides` or the `format-tab-title` event if one shell needs different colors.
- WSL: WezTerm builds `WslDomain` entries automatically on Windows; set `config.default_domain = 'WSL:Ubuntu'` (use the name from `wsl -l -v`) to launch into WSL by default (since 20220319-142410-0fcdea07).
- `ShowLauncher` is a documented key assignment (opens the launcher menu).
